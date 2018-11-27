import * as Manage from '@/js/Manage';
import {marker, infoWindow} from '@/js/GoogleMarkers';
import geolocation from '@/js/geolocation';
import PublicDatas from '@/js/PublicDatas';
import {CustomOverlays, CustomMarkers} from '@/js/OverlayViews';
import Trek from '@/js/Trekking';

const mng = Manage.mng;
const infosMng = Manage.infosMng;
const _ = mng._;
const $ = mng.$;

const gMap = (function(){
  let publicObj = {infos:{}};
  publicObj.mapId = "map";
  publicObj.minZoom = 1;
  publicObj.directions ={
    service : "",
    display : ""
  };

  const geocode = function() {
    return Ajax.getPromise({url:"https://maps.googleapis.com/maps/api/geocode/json?"+mng.getScriptGoogleParams("address","language","region","key")});
  };

  const geocodeKorea = function() {
    return Ajax.getPromise({url:"https://maps.googleapis.com/maps/api/geocode/json?"+mng.getScriptGoogleParams("koAddress","language","region","key")});
  };

  publicObj.init = function(center) {
    return mng.promise(function(resolve, reject){
      mng.fnRecursive(50,
        function() {return !!window.google;},
        function(){
          const mapOptions = {
            fullscreenControl: false, // fullscreen
            mapTypeControl: false,
            //disableDoubleClickZoom: true,
            gestureHandling: "greedy",
            backgroundColor: "#FFFFFF",
            scaleControl: true,
            zoomControl: false,
            streetViewControl:false, // 거리뷰
            maxZoom : 20, // 16이 반경 1KM 쯤 나옴.
            minZoom : 7,
            zoom: 12,
            //styles: style.test // 스타일은 한국만 적용안됨.
          };

          publicObj.directions.service = new google.maps.DirectionsService();
          publicObj.directions.display = new google.maps.DirectionsRenderer();

          Ajax.promiseAll([geocode()]).then(function(datas){
            // const geometry = datas[0].data.results[0].geometry;
                  // mapBounds = geometry.bounds;
            // let location = geometry.location;
            publicObj.center = mng.getCenterGps();

            // 한국 bounds
            publicObj.strictBounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(33.0041, 124.1718463),  // sw
              new google.maps.LatLng(43.01159, 131.1603)   // ne
            );

            // 지역
            // publicObj.strictBounds_map = new google.maps.LatLngBounds(
            //   new google.maps.LatLng(mapBounds.southwest.lat, mapBounds.southwest.lng),  // sw
            //   new google.maps.LatLng(mapBounds.northeast.lat, mapBounds.northeast.lng)   // ne
            // );

            publicObj.map = new google.maps.Map(document.getElementById(publicObj.mapId), mng.merge(mapOptions, {
              center : publicObj.center
            }));

            publicObj.geoCoder = new google.maps.Geocoder;

            mng.fnRecursive(50, () => _.keys(NoblMap.map.mapTypes).length > 0 && NoblMap.map.mapTypes.roadmap, () => {
              NoblMap.map.mapTypes.roadmap.minZoom = 7;
              NoblMap.map.mapTypes.roadmap.maxZoom = 20;
            });
            _setHeaderBounds();

            publicObj.directions.display.setMap(publicObj.map);


            mng.fnRecursive(50, () => NoblMap.infos.imaps, () => {
              let imapsMinZoom = 20;
              let area;
              NoblMap.infos.imaps.filter((imap) => {
                const temp = _.keys(JSON.parse(imap.tile_info)).map((key)=>Number(key));
              	imap.minZoom = Math.min(...temp);
                imap.maxZoom = Math.max(...temp);

              	if(imapsMinZoom > imap.minZoom) {
              		imapsMinZoom = imap.minZoom;
              		area = imap;
                }
              });

              let details = NoblMap.infos.imaps.filter((imap) => imap.mid !== area.mid);

              infosMng.set("imapData.areaKey", "mid"+area.mid+"Type");
              infosMng.set("imapData.area", area);
              infosMng.set("imapData.details", details);
              // if(Manage.lang.isLang() === "ko") {
              //   CustomMarkers.addMinimapGroupMarker(details);
              //   publicObj.setAreaMap(area.zoom);
              // }
              CustomMarkers.addMinimapGroupMarker(details);
              publicObj.setAreaMap(area.zoom);
            });

            mng.fnRecursive(50, () => NoblMap.infos.places&&NoblMap.infos.spots&&NoblMap.map.getBounds(), () => {
              initPictograms();
            });

            publicObj.onMapEvents();
            
            // NoblMap.PublicDatas.CultureEvent.setCultureEvent(); // 지역 문화 축제 아이콘.
            NoblMap.PublicDatas.Metro.init();
            geolocation.initCurrentPosition();
            polygon.init();
            return resolve();
          });
        });
    });
  };

  const initPictograms = function() {
    const pictos = makePictogramDatas();

    if(pictos.datas.length > 0) {
      CustomMarkers.addPictoSymbolGroupMarker("pictograms", pictos.datas, pictos.zoom);
    }
  };

  const makePictogramDatas = function() {
    const places = NoblMap.infos.places || [];
    const spots = NoblMap.infos.spots;
    const map = NoblMap.map;
    const zoom = map.getZoom();
    const mapTypeId = map.getMapTypeId();

    let mapBounds = map.getBounds();
    let mapZoom;

    if(mapTypeId !== "roadmap" && mapTypeId !== infosMng.get("imapData.areaKey")) {
      const key = mapTypeId.split("Type")[0];
      const headerData = NoblMap.infos.headers.filter((head) => head.key === key)[0];
      const headerBounds = headerData.bounds;
      // new google.maps.Marker({map:NoblMap.map, position:headerBounds.getSouthWest()});
      // new google.maps.Marker({map:NoblMap.map, position:headerBounds.getNorthEast()});
      // viewport를 작은 값을
      const ne = {};
      ne.lat = Math.min(headerBounds.getNorthEast().toJSON().lat, mapBounds.getNorthEast().toJSON().lat);
      ne.lng = Math.min(headerBounds.getNorthEast().toJSON().lng, mapBounds.getNorthEast().toJSON().lng);

      const sw = {};
      sw.lat = Math.max(headerBounds.getSouthWest().toJSON().lat, mapBounds.getSouthWest().toJSON().lat);
      sw.lng = Math.max(headerBounds.getSouthWest().toJSON().lng, mapBounds.getSouthWest().toJSON().lng);

      mapBounds = new google.maps.LatLngBounds(sw, ne);
      mapZoom = headerData.zoom;
    }

    let placeDatas = places.filter((place) => place.display_zoom <= zoom && (!place.display_zoom_max || place.display_zoom_max >= zoom) && mapBounds.contains(new google.maps.LatLng(place.lat, place.lng)) );
    let spotDatas = [];
    if(/[\d]+/.test(mapTypeId)) {
      const mid = /[\d]+/.exec(mapTypeId)[0].toNum();
      spotDatas = spots["spot_"+mid].filter((spot) => spot.display_zoom <= zoom && mapBounds.contains(new google.maps.LatLng(spot.lat, spot.lng))) || [];
    }else{
      _.each(infosMng.get("spots"), (spot_mid) => {
        // map_type이 1인 것만..
        // spotDatas = spotDatas.concat(spot_mid.filter((spot) => spot.map_type <= 1 && spot.display_zoom <= zoom && mapBounds.contains(new google.maps.LatLng(spot.lat, spot.lng))));
        spotDatas = spotDatas.concat(spot_mid.filter((spot) => spot.display_zoom <= zoom && mapBounds.contains(new google.maps.LatLng(spot.lat, spot.lng))));
      });
    }

    return {datas: makeOverlaidPictos(placeDatas.concat(spotDatas)), zoom: mapZoom||zoom};
    // return {datas: placeDatas.concat(spotDatas), zoom: mapZoom||zoom};
  };

  // 픽토그램이 겹쳐지는 것들을 합치는 함수.
  const makeOverlaidPictos = function(datas) {
    const mapOver = NoblMap.CustomOverlays.MapOverlay({map:NoblMap.map});
    const newDatas = [];
    const removeKeys = []; // 이건 나중에 지우려고 겹쳐지는 key 이름을 모으는 곳.
    const pictosDatas = datas.filter((data) => data.map_type === 1);

    _.each(pictosDatas, (data) => {
      if(!data.key) {
        if (data.mid) {
          data.key = "pictos_spots_" + data.pid;
        } else {
          data.key = "pictos_places_" + data.pid;
        }
      }
    });

    _.each(pictosDatas, (data, idx) => {
      const children = [];

      if(_.indexOf(removeKeys, data.key) === -1) {
        for(let i=(idx + 1), n=pictosDatas.length; i<n; i++) {
          const data2 = pictosDatas[i];

          if(_.indexOf(removeKeys, data2.key) === -1 && mng.calcDistance(data.lat, data.lng, data2.lat, data2.lng) < 0.003) {
            children.push(data2);
            removeKeys.push(data2.key);
          }
        }

        if(children.length === 0) {
          newDatas.push(data);
        }else{
          children.unshift(data);
          newDatas.push({
            key: "overliadPictos_" + children[0].key,
            lat: children[0].lat,
            lng: children[0].lng,
            map_type: 1,
            isOverlaidPictos: true,
            children
          });
        }
      }
    });
    mapOver.onRemove();
    return newDatas.concat(datas.filter((data) => data.map_type !== 1)); // map_type이 1이 아닌 것과 합치기.
  };

  const addPictograms = function() {
    const pictos = makePictogramDatas(),
          datas = infosMng.get("markers.groupMarkers.complex.pictograms.datas"),
          PictoFn = NoblMap.CustomOverlays.PictoSymbolComplexGroupFn;

    let newDatas = [],
        removeDatas = _.assign([], datas);

    if(datas) {
      _.each(pictos.datas, (newData) => {
        let data,
          checkFlag = true;

        for(let i=0, n=datas.length; i<n; i++) {
          data = datas[i];
          if(!newData.key) {
            newDatas.push(newData);
            checkFlag = false;
            break;
          }

          if(newData.key === data.key) {
            removeDatas = removeDatas.filter((removeData) => removeData.key !== data.key );
            checkFlag = false;
            break;
          }
        }
        if(checkFlag) {
          newDatas.push(newData);
        }
      });

      PictoFn.removePictos(removeDatas);
      PictoFn.addPictos(newDatas);
    }else{
      if(pictos.datas && pictos.datas.length > 0) {
        CustomMarkers.addPictoSymbolGroupMarker("pictograms", pictos.datas, pictos.zoom);
      }
    }
  };
  const addPictograms_debounce = _.debounce(addPictograms, 50);
  publicObj.addPictograms_debounce = addPictograms_debounce;

  const updateSearchMarker = function() {
    const list = ["search", "action"];
    let mapBounds = NoblMap.map.getBounds();
    const mapTypeId = NoblMap.map.getMapTypeId();
    if(mapTypeId !== "roadmap" && mapTypeId !== infosMng.get("imapData.areaKey")) {
      const key = mapTypeId.split("Type")[0];
      mapBounds = NoblMap.infos.headers.filter((head) => head.key === key)[0].bounds;
    }

    list.map((type) => {
      if(infosMng.has(type)) {
        const boundsDatas = _.sampleSize(infosMng.get(type + ".allDatas").filter((data) => mapBounds.contains(data.latLng || new google.maps.LatLng(data.lat, data.lng))), infosMng.get(type+".limit")),
          datas = infosMng.get("markers.groupMarkers.markers."+type+".datas"),
          MarkerFn = NoblMap.CustomOverlays.MarkerGroupFn;
        let newDatas = [],
          removeDatas = _.assign([], datas);

        _.each(boundsDatas, (newData) => {
          let data,
            checkFlag = true;
          for(let i=0, n=datas.length; i<n; i++) {
            data = datas[i];
            if(!newData.key) {
              newDatas.push(newData);
              checkFlag = false;
              break;
            }

            if(newData.key === data.key) {
              removeDatas = removeDatas.filter((removeData) => removeData.key !== data.key );
              checkFlag = false;
              break;
            }
          }
          if(checkFlag) {
            newDatas.push(newData);
          }
        });

        MarkerFn.removeDatas(removeDatas, type);
        MarkerFn.addDatas(newDatas, type);
      }
    });

  };
  const updateSearchMarker_debounce = _.debounce(updateSearchMarker, 500);

  const removeMarkers = function() {
    if(infosMng.has("search")) {
      const searchTypeMarkerKey = "markers.groupMarkers.markers."+infosMng.get("search.type");
      infosMng.get(searchTypeMarkerKey).onRemove();
      infosMng.del(searchTypeMarkerKey);
      infosMng.del("search");
    }

    const detailMarkerKey = "markers.groupMarkers.markers.detail";
    if(infosMng.has(detailMarkerKey)) {
      infosMng.get(detailMarkerKey).onRemove();
      infosMng.del(detailMarkerKey);
    }
  };

  publicObj.setAreaMap = function(zoom) {
    const area = infosMng.get("imapData.area");
    const areaKey = infosMng.get("imapData.areaKey");
    const map = publicObj.map;
    const isKo = Manage.lang.isLang() === "ko";
    // if(isKo) {
    //   if(!map.mapTypes.hasOwnProperty(areaKey)) {
    //     imageMapType.setMapType(areaKey, area.minZoom-1, area.maxZoom+1, area.mid);
    //   }
    //   map.setMapTypeId(areaKey);
    // }
    if(!map.mapTypes.hasOwnProperty(areaKey)) {
      imageMapType.setMapType(areaKey, area.minZoom-1, area.maxZoom+1, area.mid);
    }
    map.setMapTypeId(areaKey);
    publicObj.setCenterZoom(area.lat, area.lng, typeof zoom === "number"&&zoom || area.minZoom);
  };

  const changeMap = function(zoom, zoomType) {
    if(zoom > infosMng.get("imapData.area.minZoom") - 2) { // minZoom 보다 1작은 곳에서 이벤트가 있어서 -2 함.
      const mapTypeId = publicObj.map.getMapTypeId();
      const areaKey = infosMng.get("imapData.areaKey");
      let mid = /[\d]+/.exec(mapTypeId); // mapTypeId가 roadmap 이면 null
      if(mid) {
        mid = mid[0].toNum();
        const data = NoblMap.infos.imaps.filter((imap) => imap.mid === mid)[0];
        if(zoom < data.minZoom) { //zoom이 minZoom보다 더 작을 때.
          let nextMapTypeId = (mapTypeId !== areaKey && mapTypeId !== "roadmap")?areaKey:"roadmap";
          if(nextMapTypeId !== "roadmap") { // 상세지도 -> 지자체 전도로 이동인데
            if(zoom > infosMng.get("imapData.area.maxZoom")) { // zoom이 지자체 전도의 maxZoom보다 크면.
              delete NoblMap.infos.detailMapTypeId;
              nextMapTypeId = "roadmap";
            }
          }
          if(nextMapTypeId === "roadmap") { //축소시. 이미지 지도에서 roadmap으로 바뀔 때
            NoblMap.map.setMapTypeId(nextMapTypeId);
            if(infosMng.get("imapData.area.minZoom") < zoom) { //
              CustomMarkers.setTitle(Manage.mng.getGName());
              CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
            }
          }else{ // 축소시 이미지 지도에서 이미지 지도로 바뀔 때.
            NoblMap.map.setMapTypeId(nextMapTypeId);
            CustomMarkers.setTitle(Manage.mng.getGName());
            CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
          }
        }else if(zoom > data.maxZoom) {
          if(mapTypeId !== "roadmap" ) {
            NoblMap.map.setMapTypeId("roadmap");
            if(infosMng.has("changeZoom")) {
              NoblMap.map.setZoom(infosMng.get("changeZoom"));
              infosMng.del("changeZoom");
            }
            if(mapTypeId !== areaKey) {
              NoblMap.infos.detailMapTypeId = mapTypeId;
            }
          }
        }
      }else{ // mapTypeId가 roadmap일 때.
        // 상세이미지 -> 구글맵 -> 지자체 전도 이미지 오는 경우
        // zoom이 지자체 전도 이미지 최소 zoom과 최대 zoom 사이 일때 -> 지자체 이미지 최소 zoom 보다 작았다가 확대했을 때.
        // if(zoom <= infosMng.get("imapData.area.maxZoom") || (zoom >= infosMng.get("imapData.area.minZoom") && zoom <= infosMng.get("imapData.area.maxZoom"))) {
        if((zoom >= infosMng.get("imapData.area.minZoom") && zoom <= infosMng.get("imapData.area.maxZoom"))) {
          NoblMap.map.setMapTypeId(areaKey);
          CustomMarkers.setTitle(mng.getGName());
          CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
        }else if(infosMng.has("detailMapTypeId")) { // 상세지도를 확대로 벗어났다가 다시 돌아올때
          let detailMid = /[\d]+/.exec(infosMng.get("detailMapTypeId"))[0].toNum();
          const detailData = infosMng.get("imapData.details").filter((imap) => imap.mid === detailMid)[0];
          detailMid = "mid" + detailMid;
          const bounds = infosMng.get("headers").filter(head => head.key === detailMid)[0].bounds;

          if(detailData.maxZoom >= zoom && zoomType === "zoomOut" && NoblMap.map.getBounds().intersects(bounds)) {
            NoblMap.map.setMapTypeId(infosMng.get("detailMapTypeId"));
            CustomMarkers.setTitle(mng.getGName());
          }
          infosMng.del("detailMapTypeId");
        }
      }

      const zoomEvent = infosMng.get("zoomEvent");
      if(zoomEvent && (zoomEvent.indexOf("wheel") > -1 || zoomEvent.indexOf("touch") > -1 )) {
        infosMng.del("zoomEvent");
        changeMap_nearDetailMap(zoom, zoomType, areaKey, mapTypeId);
      }
    }
  };

  // 일정거리 내에서 확대/축소하면 mapType을 교체하도록.
  const changeMap_nearDetailMap = function(zoom, zoomType, areaKey, mapTypeId) {
    if(zoom > infosMng.get("imapData.area.maxZoom") && (mapTypeId === areaKey || mapTypeId === "roadmap") && zoomType === "zoomIn") {
      const allowDistance = 0.2;
      const mapBounds = NoblMap.map.getBounds();
      const headers = NoblMap.infos.headers.filter((head)=>head.key !== areaKey.split("Type").join(""));
      const details = headers.filter((head) => mapBounds.intersects(head.bounds));
      const mapCenter = mapBounds.getCenter();
      let key;
      if(infosMng.has("touch.start")) {
        const move = infosMng.get("touch.move");
        let minX, maxX, minY, maxY;
        if(move[0].clientX < move[1].clientX) {
          minX = move[0].clientX;
          maxX = move[1].clientX;
        }else{
          minX = move[1].clientX;
          maxX = move[0].clientX;
        }

        if(move[0].clientY < move[1].clientY) {
          minY = move[0].clientY;
          maxY = move[1].clientY;
        }else{
          minY = move[1].clientY;
          maxY = move[0].clientY;
        }

        let sw = Manage.mng.fromPixelToGps(minX, maxY);
        let ne = Manage.mng.fromPixelToGps(maxX, minY);

        const touchBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(sw.lat(), sw.lng()),  // sw
          new google.maps.LatLng(ne.lat(), ne.lng())   // ne
        );

        key = headers.filter((head) => touchBounds.intersects(head.bounds))[0].key;
      }else{
        if(details.length === 1) {
          const center = details[0].bounds.getCenter();
          const distance = mng.calcDistance(center.lat(), center.lng(), mapCenter.lat(), mapCenter.lng());
          if(distance < allowDistance) {
            key = details[0].key;
          }
        }else if(details.length > 1) {
          let distanceMap =[];
          let distances = details.map((de) => {
            const center = de.bounds.getCenter();
            const distance = mng.calcDistance(center.lat(), center.lng(), mapCenter.lat(), mapCenter.lng());
            distanceMap[distance] = de;
            return distance;
          });
          const minDistance = Math.min(...distances);
          if(minDistance < allowDistance) {
            key = distanceMap[minDistance].key;
          }
        }
      }

      if(key) {
        // setTimeout(()=>{
        //   $$("#"+key+" .minimapImageMarker").click();
        // }, 300);
        const data = infosMng.get("markers.groupMarkers.minimap").datasMap[key];

        CustomMarkers.setTitle(Manage.mng.getGName() +" "+ data.name);
        console.log(data);
        const zoom = NoblMap.map.getZoom();
        if(!NoblMap.map.mapTypes.hasOwnProperty(key+"Type")) { // 맵타입 없으면 생성
          NoblMap.imageMapType.setMapType(key+"Type", data.minZoom-1, (data.maxZoom+1 <= 20)?20:data.maxZoom+1, data.mid);
        }
        if(zoom <= data.maxZoom ) {
          NoblMap.map.setMapTypeId(key+"Type");
          NoblMap.setCenterZoom(data.lat, data.lng, (zoom > data.zoom)?zoom:data.zoom);
        }else{
          NoblMap.infos.detailMapTypeId = key+"Type";
        }

        // NoblMap.map.setZoom((zoom > data.zoom)?zoom:data.zoom);
        infosMng.get("markers.groupMarkers.minimap").onRemove();
      }
    }
  };

  const _setHeaderBounds = function() {
    _.each(NoblMap.infos.headers, (data) => {
      data.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(data.sw.lat, data.sw.lng),
        new google.maps.LatLng(data.ne.lat, data.ne.lng)
      );
    });
  };

  publicObj.event = {};
  publicObj.event.addListener = function(event, func){
    publicObj.map.addListener(event, func);
  };

  publicObj.onMapEvents = function() {
    publicObj.event.zoom();
    publicObj.event.dragend();
    publicObj.event.rightclick();
    publicObj.event.click();
    publicObj.event.bounds_changed();
    publicObj.event.maptypeid_changed();
  };

  publicObj.event.bounds_changed = function(){
    publicObj.event.addListener('bounds_changed', (e) => {

    });
  };

  publicObj.event.maptypeid_changed = function(){
    publicObj.event.addListener('maptypeid_changed', function(e){
      // console.log("maptypeid_changed", NoblMap.map.mapTypeId);
    });
  };

  publicObj.event.zoom = function(){
    publicObj.event.addListener('zoom_changed', _.debounce(function(){
      const zoom = publicObj.map.getZoom();
      const beforeZoom = NoblMap.infos.beforeZoom || infosMng.get("imapData.area.minZoom");
      let zoomType;
      if(zoom - beforeZoom > 0) {
        zoomType = "zoomIn";
      }else{
        zoomType = "zoomOut";
      }

      clearClickMarker();
      if(zoom !== beforeZoom) {
        if(zoom >= 18) {
          PublicDatas.BusStation.around_debounce();
          PublicDatas.Toilet.toiletInfos();
        }else if(infosMng.has("markers.groupMarkers.icon.toilet") && zoom < 17) {
          infosMng.get("markers.groupMarkers.icon.toilet").onRemove();
        }
        const isKo = Manage.lang.isLang() === "ko";
        // if(isKo) {
        //   changeMap(zoom, zoomType);
        // }
        changeMap(zoom, zoomType);
        if(zoom === infosMng.get("imapData.area.minZoom")) {
        // if(isKo && zoom === infosMng.get("imapData.area.minZoom")) {
          CustomMarkers.addMinimapGroupMarker(infosMng.get("imapData.details"));
        }

        if(zoom > infosMng.get("imapData.area.minZoom") - 1) {
          addPictograms_debounce();
          updateSearchMarker_debounce();
        }else{
          // removeMarkers();
        }

        NoblMap.infos.beforeZoom = zoom;
      }
    }, 200));
  };

  const clearClickMarker = function() {
    const clickKey = "markers.groupMarkers.markers.click";
    if(infosMng.has(clickKey)) {
      infosMng.get(clickKey).onRemove();
      infosMng.del(clickKey);
    }

    // if(NoblMap.infos.markers.clickMarker) {
    //   const clickMarker = NoblMap.infos.markers.clickMarker;
    //   clickMarker.rings.setMap(null);
    //   clickMarker.circle.setMap(null);
    //   delete NoblMap.infos.markers.clickMarker;
    // }
  };

  publicObj.event.dragend = function(){
    publicObj.event.addListener('dragend', function(e){
      const zoom = NoblMap.map.getZoom();
      if(NoblMap.map.getMapTypeId() !== "roadmap") {
        CustomMarkers.debounceRestrictMovement();
      }

      if(zoom > infosMng.get("imapData.area.minZoom") - 1) {
        addPictograms_debounce();
        updateSearchMarker_debounce();
      }

      if(!infosMng.has("clickCancel")) {
        infosMng.set("clickCancel", true);
        setTimeout(()=>{
          infosMng.del("clickCancel");
        }, 100);
      }
    });
  };

  publicObj.event.rightclick = function(){
    publicObj.event.addListener('rightclick', function(e){
      console.log("insertNewSector(new google.maps.LatLng({lat:"+ e.latLng.lat()+", lng:"+e.latLng.lng() + "}))");
      // console.log((e.latLng.toJSON()));
    });
  };

  publicObj.event.click = function(){
    publicObj.event.addListener('click', function(e){
      const latLng = e.latLng;
      setTimeout(()=>{
        if(!NoblMap.stopCircle){
          // marker.addClickMarker({lat:latLng.lat(), lng:latLng.lng()});
          NoblMap.CustomMarkers.addClickGroupMarker([{lat:latLng.lat(), lng:latLng.lng()}]);
        }
        NoblMap.stopCircle = false;
      }, 200);

    });
  };

  // 이동할 영역을 제한하기.
  const _restrictMovement = function(mapTypeId, center){
    if(mapTypeId === "roadmap") {
      if (publicObj.strictBounds.contains(center)) return;

      const strictBounds = publicObj.strictBounds,
            maxX = strictBounds.getNorthEast().lng(),
            maxY = strictBounds.getNorthEast().lat(),
            minX = strictBounds.getSouthWest().lng(),
            minY = strictBounds.getSouthWest().lat();
      let x = center.lng(),
          y = center.lat();

      if (x < minX) x = minX;
      if (x > maxX) x = maxX;
      if (y < minY) y = minY;
      if (y > maxY) y = maxY;

      publicObj.map.setCenter(new google.maps.LatLng(y, x));
    }
  };

  publicObj.zoomChange = function(num) {
    publicObj.map.setZoom(publicObj.map.getZoom() + num)
  };

  publicObj.panToMarker = function(position) {
    setTimeout(function(){
      publicObj.map.panTo(position);
      publicObj.map.setZoom(16);
    }, 500);
  };

  publicObj.setCenter = function(lat, lng) {
    publicObj.map.panTo(new google.maps.LatLng(lat, lng));
    marker.addCenterMarker(lat, lng);
  };

  publicObj.setCenterZoom = function(lat, lng, zoom) {
    publicObj.map.setCenter(new google.maps.LatLng(lat, lng));
    publicObj.map.setZoom(zoom);
  };

  // 현재 보는 영역에 포함여부 판별.
  publicObj.isContainsMapBounds = function(lat, lng) {
    return publicObj.map.getBounds().contains(new google.maps.LatLng(lat, lng));
  };

  publicObj.LatLng = function(lat, lng) {
    return new google.maps.LatLng({lat, lng});
  };

  publicObj.publicTransportationDirections = function(lat, lng) {
    const request = {
      origin: NoblMap.geolocation.nowLocation.lat + "," + NoblMap.geolocation.nowLocation.lng,
      destination: lat + "," + lng,
      travelMode: 'TRANSIT'
    };
    Manage.toast.clickPrevToast("directionsToast");
    const directions = NoblMap.directions,
          display = directions.display;

    if(!display.map) {
      display.setMap(NoblMap.map);
    }

    directions.service.route(request, function (result, status) {
      if (status === 'OK') {
        display.setDirections(result);
        Manage.toast.clickClose(Manage.lang.trans("DEFINE_PUBLIC_TRANSPORT"), "success", {id:"directionsToast", onclick:()=>NoblMap.clearDirections()});
      }
    });
  };

  publicObj.clearDirections = function() {
    NoblMap.directions.display.setMap(null);
  };


  publicObj.kakaoNavi = function (name, lat, lng, closeFn) {
    let hasKakao = false;
    if(!window.Kakao) {
      Manage.mng.getScriptKakao();
      hasKakao = true;
    }
    Manage.mng.fnRecursive(50, () => !!window.Kakao, () => {
      if(hasKakao) {
        Kakao.init(Manage.mng.getApiKey("KAKAO").clientId);
      }

      Kakao.Navi.start({
        name: name,
        x: lng,
        y: lat,
        coordType: 'wgs84'
      });
      if(closeFn) {
        closeFn();
      }
    });
  };


  publicObj.hidePictos = function() {
    const pictoName = "popup.pictos",
          pictogramsName="markers.groupMarkers.complex.pictograms";

    if(!infosMng.has(pictoName) && infosMng.has(pictogramsName)){
      const pictos = infosMng.get(pictogramsName);
      infosMng.set(pictoName, {datas:pictos.datas, minZoom: pictos.minZoom});
      pictos.onRemove();
    }
  };

  publicObj.showPictos = function() {
    const pictoName = "popup.pictos";
    if(infosMng.has(pictoName)){
      const pictos = infosMng.get(pictoName);
      CustomMarkers.addPictoSymbolGroupMarker("pictograms", pictos.datas, pictos.zoom);
      infosMng.del(pictoName);
    }
  };

  publicObj.hideMimimap = function() {
    const minimapName = "popup.minimap",
      minimapDatasName="markers.groupMarkers.minimap.datas";

    if(!infosMng.has(minimapName) && infosMng.has(minimapDatasName)) {
      const minimapShowDatas = infosMng.get(minimapDatasName).filter((data) => data.visibility === "");
      infosMng.set(minimapName, minimapShowDatas);
      minimapShowDatas.map((minimap) => $$("#"+minimap.key).css("visibility", "hidden"));
    }
  };

  publicObj.showMimimap = function() {
    const minimapName = "popup.minimap";
    if(infosMng.has(minimapName)){
      infosMng.get(minimapName).map((minimap) => $$("#"+minimap.key).css("visibility", ""));
      infosMng.del(minimapName);
    }
  };

  publicObj.hideMarkers = function() {
    publicObj.hidePictos();
    publicObj.hideMimimap();
  };

  publicObj.showMarkers = function() {
    publicObj.showPictos();
    publicObj.showMimimap();
  };

  return publicObj;
}());


const overlayMapType = (function(){
  let publicObj = {};
  publicObj.tileDataMap = {};
  publicObj.setTileInfo = function() {
    _.each(NoblMap.infos.tileInfos, (mapInfo, key) => {
      _.each(mapInfo, (data, zoom) => {
        for(let i=0, n=data.xRange; i<n; i++){
          for(let ii=0, nn=data.yRange; ii<nn; ii++){
            _.set(publicObj.tileDataMap, (key+".z"+zoom + ".x" + (data.x + i) + ".y" + (data.y + ii)), key);
          }
        }
      });
    });
  };

  const _addMapType = function(mapType) {
    gMap.map.overlayMapTypes.insertAt(0, mapType);
  };

  const _getMapTypeIdx = function(name) {
    for(let i=0, n=gMap.map.overlayMapTypes.length; i<n; i++){
      if(gMap.map.overlayMapTypes.getAt(i).constructor.name === name){
        return i;
      }
    }
  };

  const _removeMapType = function(name) {
    gMap.map.overlayMapTypes.removeAt(_getMapTypeIdx(name));
  };

  const _addStyleCoordMap = function(that, noBorder) {
    let style = 'style="'
      +'width:'+that.tileSize.width+'px; '
      +'height:'+that.tileSize.height+'px; ';
    if(!noBorder) {
      style += 'font-size:10; ';
      style += 'border:1px solid #AAAAAA; ';
    }
    style += '"';
    return $$('<div '+style+'></div>');
  };

  // 맵위에 border 와 이미지 넘버를 적을 때
  function CoordMapTypeBorder(tileSize) {
    this.tileSize = tileSize;
  }

  CoordMapTypeBorder.prototype.getTile = function(coord, zoom, ownerDocument) {
    const fragment = ownerDocument.createDocumentFragment();
    const div = _addStyleCoordMap(this, false);
    div.append( coord.toString() );
    fragment.appendChild( div[0] );
    return fragment;
  };

  publicObj.setCoordMapTypeBorder = function() {
    _addMapType(new CoordMapTypeBorder(new google.maps.Size(256, 256)));
  };

  publicObj.removeCoordMapTypeBorder = function() {
    _removeMapType("CoordMapTypeBorder");
  };

  // 맵위에 image를 타일로 올릴 때
  function CoordImageMap(tileSize) {
    this.tileSize = tileSize;
  }

  const getBgImage = function() {
    const mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(37.331550, 127.016297), new google.maps.LatLng(37.477190, 127.201019)),
          mapMinZoom = 7,
          mapMaxZoom = 20,
          proj = map.getProjection(),
          z2 = Math.pow(2, zoom),
          tileXSize = 256 / z2,
          tileYSize = 256 / z2,
          tileBounds = new google.maps.LatLngBounds(
            proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
            proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
          ),
          x = coord.x >= 0 ? coord.x : z2 + coord.x,
          y = coord.y;

    if (mapBounds.intersects(tileBounds) && (mapMinZoom <= zoom) && (zoom <= mapMaxZoom))
      return mng.getImgPath() + "bg_region/"+ zoom + "/" + x + "/" + y + ".png";
    else
      return mng.getImgPath() +"images/none.png";
  };


  CoordImageMap.prototype.getTile = function(coord, zoom, ownerDocument) {
    const fragment = ownerDocument.createDocumentFragment();
    const div = $$('<div></div>'); //라인을 그리고 싶으면 true를 false로 바꾸면 끝.
    div.css("background-image", "url("+ mng.getImgPath() + getBgImage() +")");
    div.css("background-size", "256px 256px");
    fragment.appendChild( div[0] );
    return fragment;
  };

  publicObj.setCoordImageMap = function() {
    if(!publicObj.coordImageMapOn) {
      publicObj.coordImageMapOn = true;
      _addMapType(new CoordImageMap(new google.maps.Size(256, 256)));
    }
  };

  publicObj.removeCoordImageMap = function() {
    if(publicObj.coordImageMapOn) {
      _removeMapType("CoordImageMap");
      publicObj.coordImageMapOn = false;
    }
  };

  publicObj.getImageMapData = function(zoom) {
    return publicObj.tileDataMap["mid1"]["z"+zoom];
  };

  return publicObj;
}());
gMap.overlayMapType = overlayMapType;

const imageMapType = (function(){
  const publicObj = {};
  publicObj.makeImageMapType = function(name, minZoom, maxZoom, mid) {
    return new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        const z = overlayMapType.tileDataMap["mid"+mid]["z"+zoom];
        if(z && z["x"+coord.x] && z["x"+coord.x]["y"+coord.y]){
          return mng.getImgPath() + "google/mid"+mid+"/"+zoom+"/"+ coord.x +"/"+ coord.y +".png";
        }else{
          return null;
        }
      },
      tileSize: new google.maps.Size(256, 256),
      minZoom,
      maxZoom,
      name
    });
  };

  publicObj.setMapType = function(name, minZoom, maxZoom, mid) {
    NoblMap.map.mapTypes.set(name, publicObj.makeImageMapType(name, minZoom, maxZoom, mid));
  };

  return publicObj;
}());
gMap.imageMapType = imageMapType;


const tile = (function(){
  let publicObj = {};

  publicObj.convert = function(zoom, x, y, noMarker) {
    const latlng = {lng:_tile2long(x, zoom), lat: _tile2lat(y, zoom)};
    if(!noMarker) {
      google.maps.Marker({position:latlng, map:NoblMap.map});
    }
    return latlng;
  };

  const _tile2long = function(x, z){
    return (x/Math.pow(2,z)*360-180);
  };

  const _tile2lat = function (y, z) {
    var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
   };
   // 위 변환 함수2개는 저기서 퍼옴. https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_numbers_to_lon..2Flat

  return publicObj;
}());
gMap.tile = tile;


// 국내지도엔 안되서 접었음.
// const style = (function(){
//   let publicObj = {};

//   publicObj.test = [
//   {
//     "featureType": "road.highway",
//     "elementType": "geometry.fill",
//     "stylers": [
//       {
//         "color": "#55c5e6"
//       }
//     ]
//   },{
//     "featureType": "road.arterial",
//     "elementType": "geometry.fill",
//     "stylers": [
//       {
//         "color": "#d349f1"
//       }
//     ]
//   },{
//     "featureType": "road.local",
//     "elementType": "geometry.fill",
//     "stylers": [
//       {
//         "color": "#5280e9"
//       }
//     ]
//   }];

//   return publicObj;
// }());
// gMap.style = style;

const polygon = (function(){
  let publicObj = {polygons : {}};

  publicObj.init = function() {
    gMap.map.addListener('zoom_changed', _changeEvent);
  };

  publicObj.makePaths = function() {
    let paths = [];

    _.each(GLOBAL_CONSTS["coordinates"].split(" "), function(str){
      str = str.split(",");
      paths.push(new google.maps.LatLng({lng:Number(str[0]), lat:Number(str[1])}));
    });

    return paths;
  };

  publicObj.setPolygon = function() {
    const polygon = new google.maps.Polygon({
      paths: publicObj.makePaths(),
      strokeColor: '#AACC66',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#AACC66',
      fillOpacity: 0.35
    });
    polygon.setMap(gMap.map);

    google.maps.event.addListener(polygon, 'click', gMap.setAreaMap);

    infosMng.set("polygon.area", polygon);

    let area = infosMng.get("imapData.area");
    // publicObj.marker = new google.maps.Marker({
    //   map:NoblMap.map,
    //   position:{lat:area.lat, lng:area.lng},
    //   icon:{url: mng.getImgPath() + "map_icon/puff.svg",
    //     origin: new google.maps.Point(0, 0),
    //     anchor: new google.maps.Point(50, 50),
    //     scale: 1
    //   }
    // });

    CustomMarkers.addPolygonSymbolMarker([{key:"polygonMarker", lat:area.lat, lng:area.lng}], area.minZoom);
  };

  const _changeEvent = function(){
    const zoom = gMap.map.getZoom(),
          hasPoly = publicObj.hasPolygon(),
          minZoom = infosMng.get("imapData.area.minZoom");

    if(zoom < minZoom && !hasPoly) {
      publicObj.setPolygon();
    }else if(zoom > (minZoom - 1) && hasPoly) {
      publicObj.removePolygon();
    }
  };

  publicObj.removePolygon = function(name){
    const polygonKey = "polygon.area";
    const polygon = infosMng.get(polygonKey);
    google.maps.event.clearListeners(polygon, "click");
    polygon.setMap(null);
    infosMng.del(polygonKey);
    // google.maps.event.clearListeners(publicObj.marker, "click");
    // publicObj.marker.setMap(null);
  };

  publicObj.hasPolygon = function(){
    return infosMng.get("polygon.area");
  };

  return publicObj;
}());
gMap.polygon = polygon;


const polyline = (function() {
  const publicObj = {};
  publicObj.makeMarkers = function(datas) {
    // position: {lat: data.lat, lng: data.lng},
    const markerOption = {
      map: gMap.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        strokeColor: '#000',
        strokeWeight: 0,
        fillColor : "red",
        fillOpacity: 1,
        scale: 4
      },
      zIndex: 300
    };

    const checkPointMarkers = [];
    _.each(datas, (data) => {
      const marker = new google.maps.Marker(mng.merge(markerOption, {position: {lat:data.lat, lng:data.lng}}));
      checkPointMarkers.push(marker);
    });
    infosMng.set("polyline.checkPointMarkers", checkPointMarkers);
  };

  publicObj.makePolyline = function(path){
    const polyline = new google.maps.Polyline({
      strokeColor: '#4B8ECB',
      strokeOpacity: 0.7,
      strokeWeight: 6,
      map : gMap.map,
      path
    });

    infosMng.set("polyline.line", polyline);
  };

  publicObj.removePolyline = function(){
    const lineName = "polyline.line";
    if(infosMng.has(lineName)) {
      infosMng.get(lineName).setMap(null);
      infosMng.del(lineName);
    }

    const checkMarkersName = "polyline.checkPointMarkers";
    if(infosMng.has(checkMarkersName)) {
      _.each(infosMng.get(checkMarkersName), (marker) => {
        marker.setMap(null);
      });
      infosMng.del(checkMarkersName);
    }
  };

  publicObj.setPolyline = function(datas){
    publicObj.removePolyline();
    publicObj.makePolyline(datas);
    publicObj.makeMarkers(datas.filter((data)=> data.tcs_type === 2));
    // gMap.map.addListener('zoom_changed', _changeEvent);
  };

  const _changeEvent = function() {
    const zoom = gMap.map.getZoom();

    if(infosMng.has("polyline.line") && zoom < (infosMng.get("imapData.area.minZoom")) ) {
      publicObj.removePolyline();
    }
  };
  return publicObj;
}());
gMap.polyline = polyline;

gMap.marker = marker;
gMap.infoWindow = infoWindow;
gMap.geolocation = geolocation;
gMap.PublicDatas = PublicDatas;
gMap.CustomOverlays = CustomOverlays;
gMap.CustomMarkers = CustomMarkers;
gMap.Trek = Trek;
export default gMap;

document.addEventListener('gesturestart', function (e) {e.preventdefault()} );
