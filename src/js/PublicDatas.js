import * as Manage from '@/js/Manage';
import gMap from "./GoogleMap";

const mng = Manage.mng;
const _ = mng._;
const $ = mng.$;
const infosMng = Manage.infosMng;

const publicServiceKey = "tFLBK6NrPdOoZBzKqLBlztbdgOCZ%2Bjw36ELN4A01rKtgYR3MXWg0SRfaYunSPPP0F85Y4Q4HVPWUJpU0mYHVeA%3D%3D";

const openApiPromise = function(url) {
  return Ajax.getPromise2({url:"/etc/getOpenAPI", method:"POST", data:{url}});
};

const _makeQuerystring = function(datas, sigun_nm) {
  let queryString = [];
  _.each(datas.params, (value, key) => {
    queryString.push(key+"="+value);
  });
  if(sigun_nm)
    queryString.push("SIGUN_NM="+encodeURI(sigun_nm));
  return datas.url + "?" + queryString.join("&");
};

const _makeQuerystringParams = function(datas, keyArr, ...values) {
  let queryString = [];
  _.each(datas.params, (value, key) => {
    queryString.push(key+"="+value);
  });
  _.each(keyArr, (key, idx)  => {
    queryString.push(key+"="+values[idx]);
  });

  return datas.url + "?" + queryString.join("&");
};

const _getPublicData = function(datas, sigun_nm) {
  return mng.promise(function(resolve, reject){
    Ajax.getPromise({url:_makeQuerystring(datas, sigun_nm)}).then((result) => {
      return resolve(result.data[datas.name][1].row);
    });
  });
};

let PublicDatas = (function(){
  let publicObj = {};

  return publicObj;
}());

let CultureEvent = (function(){
    let publicObj = {};
    publicObj.prev_begin_de = 10; // 축제 시작 10일전

    const _dateToNum = function(str) {
      return new Date(str).format("yyyyMMdd").toNum();
    };

    // 경기데이터 문화축제 현황
    const _CultureFestival = {
      // url : "https://openapi.gg.go.kr/Ggculturevent",
      name : "CultureFestival",
      url : "https://openapi.gg.go.kr/CultureFestival",
      params: {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        Type: "json",
        pIndex:1,
        pSize:10
      }
    };

    // 경기데이터 공연행사정보 현황 // 성남시 데이터 안보임 1000개 받아서 봐도 안나옴.
    const _PerformanceEvent = {
      name: "PerformanceEvent",
      url : "https://openapi.gg.go.kr/PerformanceEvent",
      params: {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        Type: "json",
        pIndex:1,
        pSize:10
      }
    };

    // 경기도 문화 행사 현황
    const _Ggculturevent = {
      name: "Ggculturevent",
      url : "https://openapi.gg.go.kr/Ggculturevent",
      params: {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        Type: "json",
        pIndex:1,
        pSize:10
      }
    };


    const dataFilter_RANGE = function(datas) {
      const toDay = _dateToNum(new Date().format("yyyy-MM-dd"));

      // 축제기간 필터
      return datas.filter((data) => {
        if((_dateToNum(data.FASTVL_BEGIN_DE) -publicObj.prev_begin_de) < toDay && (_dateToNum(data.FASTVL_END_DE)) >= toDay) {
          return true;
        }
      });
    };

    const dataFilter_RANGE_Ggculturevent = function(datas) {
      const toDay = _dateToNum(new Date().format("yyyy-MM-dd"));

      // 축제기간 필터
      return datas.filter((data) => {
        let event_perd = data.EVENT_PERD.split(" ~ ");
        if((_dateToNum(event_perd[0]) - publicObj.prev_begin_de) < toDay && (_dateToNum(event_perd[1])) >= toDay) {
          return true;
        }
      });
    };

    const _setLatlng = function(address, data) {
      return mng.promise(function(resolve, reject){
        address = address.split(/[\d]층|\(/)[0];
        Ajax.run({url:"http://maps.googleapis.com/maps/api/geocode/json?language=ko&address=" + encodeURI(address)}, (result) => {
          if(result.results[0].geometry) {
            const location = result.results[0].geometry.location;
            data.lat = location.lat;
            data.lng = location.lng;
            resolve();
          }else{
            reject();
          }
        });
      });
    };

    // _Ggculturevent 여기선 위경도 정보가 없어서 주소를 기반으로 위경도를 가져온다.
    const _setLatlngWrap = function(datas, func) {
      const promises = [];
      _.each(datas, (data) => {
        promises.push(_setLatlng(data.EVENT_PLC, data));
      });

      return Ajax.promiseAll(promises);
    };

    const _markerData_CultureFestival = function(datas) {
      const newDatas = [];
      _.each(datas, (data, idx) => {
        newDatas.push({
          ...data,
          type:"cultureFestival",
          lat: data.REFINE_WGS84_LAT.toNum(),
          lng: data.REFINE_WGS84_LOGT.toNum(),
          key: "CF_" + idx,
          // key: "CF_" + data.REFINE_WGS84_LAT,
          text: data.TMP01,
        });
      });
      return newDatas;
    };

    const _markerData_PerformanceEvent = function(datas) {
      const newDatas = [];
      _.each(datas, (data, idx) => {
        newDatas.push({
          ...data,
          type:"culturePerformance",
          lat: data.REFINE_WGS84_LAT.toNum(),
          lng: data.REFINE_WGS84_LOGT.toNum(),
          key: "CP_" + idx,
          // key: "CP_" + data.REFINE_WGS84_LAT,
          text: data.EVENT_TITLE,
        });
      });
      return newDatas;
    };

    const _markerData_GgEvent = function(datas) {
      const newDatas = [];
      _.each(datas, (data, idx) => {
        newDatas.push({
          ...data,
          type:"culturGgEvent",
          key: "CE_" + idx,
          // key: "CE_" + data.lat,
          text: data.TITLE,
        });
      });
      return newDatas;
    };


    const _setCultureMarkers = function(datas) {
      let cultureList = [];
      _.each(datas, (data) => {
        cultureList.push({
          ...data,
          text_direction: "bottom",
          icon_label: "map-icon-travel-agency",
          fill_color: "#55ee77"});
      });

      const groupMarker = NoblMap.CustomMarkers.addIconGroupMarker(cultureList, "culture", 12);
      groupMarker.markerLayer.on("click", ".iconMarker", (e) => {
        // (e.stopPropagation) && e.stopPropagation();
        NoblMap.stopCircle = true;
        const key = $$(e.target).parent().attr("id");
        const options = groupMarker.datas.filter((data) => data.key === key)[0];
        NoblMap.cultureData = options;
        NoblMap.PublicDatas.CultureEvent.openSheetDetail();
      });
    };


    publicObj.getCultureFestival = function(sigun_nm) {
      _getPublicData(_CultureFestival, sigun_nm).then((datas) => {
        // 축제 지역 필터
        datas = dataFilter_RANGE(datas);
        if(datas.length > 0) {
          _setCultureMarkers(_markerData_CultureFestival(datas));
        }
      });

      _getPublicData(_PerformanceEvent, sigun_nm).then((datas) => {
        datas = dataFilter_RANGE(datas);
        if(datas.length > 0) {
          _setCultureMarkers(_markerData_PerformanceEvent(datas));
        }
      });

      _getPublicData(_Ggculturevent, sigun_nm).then((datas) => {
        datas = dataFilter_RANGE_Ggculturevent(datas);
        if(datas.length > 0) {
          _setLatlngWrap(datas).then(function(){
            _setCultureMarkers(_markerData_GgEvent(datas));
          });
        }
      });
    };

    publicObj.openSheetDetail = function() {
      mng.getSheetName("cultureSheet", $$("#cultureSheet")).open();
    };

    publicObj.setCultureEvent = function() {
      publicObj.getCultureFestival(mng.getGName());
    };

    return publicObj;
}());
PublicDatas.CultureEvent = CultureEvent;

let BusStation = (function(){
  let publicObj = {};

  publicObj.busInfo;
  publicObj.setArea = function() {
    const sido = mng.getGSido();
    if(sido === "서울") {
      publicObj.busInfo = seoulBus;
    }else if(sido === "경기") {
      publicObj.busInfo = gyeonggiBus;
    }
  };

  const seoulBus = {
    busStation : {
      url : "http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos",
      params : {
        serviceKey : publicServiceKey,
        radius: 500
      }
    },
    busStationArriveInfo : {
      url : "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid",
      params : {
        serviceKey : publicServiceKey
      }
    },
    busStationRouteInfo : {
      url : "http://ws.bus.go.kr/api/rest/stationinfo/getRouteByStation",
      params : {
        serviceKey : publicServiceKey
      }
    },
    busStationParamKey : ["tmX", "tmY"],
    busStationDataKeys: "ServiceResult.msgBody.itemList",
    busStationParse : function(station){
      return {
        type:"bus",
        lat: station.gpsY._text.toNum(),
        lng: station.gpsX._text.toNum(),
        key: "b"+station.arsId._text,
        text: station.stationNm._text,
      }
    },
    busArriveDataKeys:"ServiceResult.msgBody.itemList",
    busRouteDataKeys:"ServiceResult.msgBody.itemList",
    busArriveParamKey:["arsId"],
    busMapKey:"busRouteId",
    busName : "busRouteNm._text",
    getArriveInfo : function(data) {
      let arriveArray = [];
      if(data) {
        arriveArray.push({
          arrmsg : data.arrmsg1._text,      // 차량 위치 정보(위경도) 라는데 가져오는 건 숫자임. (2, 11) 이런식... 남은 정류장 수 같은데 확실하진 않음.
        });

        if(data.arrmsg2._text){
          arriveArray.push({
            arrmsg : data.arrmsg2._text,
          });
        }
      }
      return arriveArray;
    }
  };

  const gyeonggiBus = {
    busStation : {
      url : "http://openapi.gbis.go.kr/ws/rest/busstationservice/searcharound",
      params : {
        serviceKey : publicServiceKey
      }
    },
    busStationArriveInfo : {
      url : "http://openapi.gbis.go.kr/ws/rest/busarrivalservice/station",
      params : {
        serviceKey : publicServiceKey
      }
    },
    busStationRouteInfo : {
      url : "http://openapi.gbis.go.kr/ws/rest/busstationservice/route",
      params : {
        serviceKey : publicServiceKey
      }
    },
    busStationParamKey : ["x", "y"],
    busStationDataKeys: "response.msgBody.busStationAroundList",
    busStationParse : function(station){
      return {
        type:"bus",
        lat: station.y._text.toNum(),
        lng: station.x._text.toNum(),
        key: "b"+station.stationId._text,
        text: station.stationName._text,
      }
    },
    busArriveDataKeys:"response.msgBody.busArrivalList",
    busRouteDataKeys:"response.msgBody.busRouteList",
    busArriveParamKey:["stationId"],
    busMapKey:"routeId",
    busName : "routeName._text",
    getArriveInfo : function(data) {
      let arriveArray = [];
      if(data) {
        arriveArray.push({
          locationNo : data.locationNo1._text,      // 차량 위치 정보(위경도) 라는데 가져오는 건 숫자임. (2, 11) 이런식... 남은 정류장 수 같은데 확실하진 않음.
          lowPlate : data.lowPlate1._text,          // 저상 버스
          plateNo : data.plateNo1._text,            // 차량 정보(경기70아8857)
          predictTime : data.predictTime1._text,         // 도착 예상 시간.
          remainSeatCnt : data.remainSeatCnt1._text // 남은 좌석 수 -1 정보 없음.
        });

        if(data.locationNo2._text){
          arriveArray.push({
            locationNo : data.locationNo2._text,
            lowPlate : data.lowPlate2._text,
            plateNo : data.plateNo2._text,
            predictTime : data.predictTime2._text,
            remainSeatCnt : data.remainSeatCnt2._text
          });
        }
      }
      return arriveArray;
    }
  };
  // 화면 중앙 기준 주변 정류장 가져오기
  publicObj.around = function() {
    const center = NoblMap.map.getCenter(),
          url = _makeQuerystringParams(publicObj.busInfo.busStation, publicObj.busInfo.busStationParamKey, center.lng(), center.lat());
    Ajax.run({url:"/etc/getOpenAPI", method:"POST", data:{url}}, (datas) => {
      let groupMarker = infosMng.get("markers.groupMarkers.icon.bus");
      if(groupMarker) {
        groupMarker.onRemove();
        infosMng.del("markers.groupMarkers.icon.bus");
      }

      let busList = [];
      const list = _.get(datas, publicObj.busInfo.busStationDataKeys);
      _.each(list, (busStation) => {
        busList.push(publicObj.busInfo.busStationParse(busStation));
      });

      let mapBounds = NoblMap.map.getBounds();
      const mapTypeId = NoblMap.map.getMapTypeId();
      if(mapTypeId !== "roadmap" && mapTypeId !== infosMng.get("imapData.areaKey")) {
        const key = mapTypeId.split("Type")[0];
        mapBounds = NoblMap.infos.headers.filter((head) => head.key === key)[0].bounds;
      }
      busList = busList.filter((data) => mapBounds.contains(new google.maps.LatLng(data.lat, data.lng)));

      groupMarker = NoblMap.CustomMarkers.addIconGroupMarker(busList, "bus", 18);

      groupMarker.markerLayer.on("click", ".pictoMarker", (e) => {
        NoblMap.stopCircle = true;
        const key = $$(e.target).parent().attr("id");
        const options = groupMarker.datas.filter((data) => data.key === key)[0];
        NoblMap.infos.stationName = options.text;
        NoblMap.PublicDatas.BusStation.busArrive(options.key.substring(1));
      });
    });
  };
  publicObj.around_debounce = _.debounce(publicObj.around, 500);

  publicObj.makeMap = function(array, keyName) {
      let resultMap = {};
      if(!array) {
        resultMap = null;
      }else if(mng.isArray(array)){
        _.each(array, (data) => {
          resultMap["r"+data[keyName]._text] = data;
        });
      }else{
        resultMap["r"+array[keyName]._text] = array;
      }

      return resultMap;
  };

  // 정류장 버스 도착 정보 가져오기
  publicObj.busArrive = function(stationId) {
    const arriveUrl = _makeQuerystringParams(publicObj.busInfo.busStationArriveInfo, publicObj.busInfo.busArriveParamKey, stationId),
          routeUrl = _makeQuerystringParams(publicObj.busInfo.busStationRouteInfo, publicObj.busInfo.busArriveParamKey, stationId);

    Ajax.promiseAll([openApiPromise(arriveUrl), openApiPromise(routeUrl)]).then((datas) => {
      const arriveDatas = publicObj.makeMap(_.get(datas[0], publicObj.busInfo.busArriveDataKeys), publicObj.busInfo.busMapKey) || null,
            routeDatas  = publicObj.makeMap(_.get(datas[1], publicObj.busInfo.busRouteDataKeys), publicObj.busInfo.busMapKey) || null;
      const routeInfo = [];
      // console.log(arriveDatas, routeDatas)
      _.each(routeDatas, (data, key) => {
        routeInfo.push({
          routeId : key,
          routeNm : _.get(data, publicObj.busInfo.busName),
          arriveInfo: publicObj.busInfo.getArriveInfo(arriveDatas && arriveDatas[key])
        });
      });

      NoblMap.infos.routeInfo = routeInfo;
      mng.getSheetName("busSheet", $$("#busSheet")).open();
    });
  };
  return publicObj;
}());
PublicDatas.BusStation = BusStation;
mng.fnRecursive(100, ()=> !!mng.getGSido(), () => {
  BusStation.setArea();
});

// 날씨 정보를 그냥 가져오기로 함.
let Weather = (function() {
  let publicObj = {};

  const _WeahterUrl = function() {
    const xy = mng.getWeatherXY();
    const d = new Date().minus("hour", 1);
    const _Weather = {
      // url : "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib",
      url : "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastTimeData",
      params : {
        serviceKey : publicServiceKey,
        base_date: d.format("yyyyMMdd"),
        base_time: d.format("HHmm"),     // 현재시간에서 한시간 이전 정보를 가져옴.
        nx:xy.x,
        ny:xy.y,
        numOfRows:30,
        _type:"json"
      }
    };
    return _makeQuerystring(_Weather);
  };

  const _DustUrl = function() { // 미세먼지
    const _Dust = {
      url : "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst",
      params : {
        serviceKey : publicServiceKey,
        sidoName : encodeURI(mng.getGSidoWeather()),
        searchCondition: "HOUR",
        numOfRows: 40
      }
    };
    return _makeQuerystring(_Dust);
  };

  const code = {};
  code.SKY = {1:"맑음", 2:"구름조금", 3:"구름많음", 4:"흐림"}; // 하늘상태
  code.PTY = {0:"", 1:"비", 2:"비/눈", 3:"눈"}; // 강수형태
  code.LGT = {0:false, 1:true}; // 낙뢰 0 없음 1 있음

  const _getWeatherInfo = function(items, category) {
    return items.filter((item) => item.category === category).first().fcstValue;
  };

  const _getNumberWeatherIcon = function(SKY, PTY, LGT) {
    let num = "01";
    if(LGT === 1) {
      if(SKY === 4 && PTY === 0) {
        num = "11";
      }else if(PTY === 1) {
        num = "12";
      }else if(PTY === 2) {
        num = "14";
      }else if(PTY === 3) {
        num = "13";
      }
    }else{
      if(SKY === 2) {
        num = "02";
      }else if(SKY === 3) {
        if(PTY === 0) {
          num = "03";
        }else if(PTY === 1) {
          num = "04";
        }else if(PTY === 2) {
          num = "06";
        }else if(PTY === 3) {
          num = "05";
        }
      }else if(SKY === 4) {
        if(PTY === 0) {
          num = "07";
        }else if(PTY === 1) {
          num = "08";
        }else if(PTY === 2) {
          num = "10";
        }else if(PTY === 3) {
          num = "09";
        }
      }
    }
    return num;
  };

  const _dustState = function(type, value) {
    let state = "";
    if(type === "PM10") {
      if(0 <= value && value <= 30) {
        state = "DEFINE_WHETHER_DUST_FINE";
      }else if(30 < value && value <= 80) {
        state = "DEFINE_WHETHER_DUST_NORMAL";
      }else if(80 < value && value <= 150) {
        state = "DEFINE_WHETHER_DUST_BAD";
      }else if(150 < value ) {
        state = "DEFINE_WHETHER_DUST_VERYBAD";
      }
    }else if(type === "PM25") {
      if(0 <= value && value <= 15) {
        state = "DEFINE_WHETHER_DUST_FINE";
      }else if(15 < value && value <= 35) {
        state = "DEFINE_WHETHER_DUST_NORMAL";
      }else if(35 < value && value <= 75) {
        state = "DEFINE_WHETHER_DUST_BAD";
      }else if(76 < value ) {
        state = "DEFINE_WHETHER_DUST_VERYBAD";
      }
    }
    return state;
  };

  publicObj.weatherInfos = function() {
    return mng.promise(function(resolve, reject) {
      Ajax.promiseAll([openApiPromise(_WeahterUrl()), openApiPromise(_DustUrl())]).then((datas) => {
        let cityName = mng.getGName();
        if(cityName === "철원군") {
          cityName = "연천군";
        }
        if(cityName.split(" ").length > 1) {
          cityName = cityName.split(" ").last();
        }
        const resolveData = {};
        const weatherItem = datas[0].response.body.items.item;
        console.log(weatherItem);
        resolveData.icon = _getNumberWeatherIcon(_getWeatherInfo(weatherItem, "SKY"), _getWeatherInfo(weatherItem, "PTY"), _getWeatherInfo(weatherItem, "LGT"));
        resolveData.temp = _getWeatherInfo(weatherItem, "T1H");
        if(datas[1].response.body) {
          const dust = datas[1].response.body.items.item.filter((item)=> item.cityName._text === cityName)[0];
          const pm10Value = dust.pm10Value._text.toNum();
          resolveData.dust_desc =  _dustState("PM10", pm10Value);
          resolveData.dust_value = pm10Value;
        }else{
          console.error(datas);
          reject({error:true});
        }
        resolve(resolveData);
      });
    });
  };

  return publicObj;
}());
PublicDatas.Weather = Weather;

let Toilet = (function() {
  let publicObj = {};
  const _ToiletUrl = function() { // 미세먼지
    const _Toilet = {
      url : "https://openapi.gg.go.kr/Publtolt",
      params : {
        key : "0bbd720427f84edbb489ee86cd1f1341",
        SIGUN_NM : mng.getGName(),
        Type: "json",
        pSize: 500 // 성남은 297 개 나옴.
      }
    };
    return _makeQuerystring(_Toilet);
  };


  publicObj.toiletInfos = function() {
    if(infosMng.has("infos.toilets")) {
      NoblMap.CustomMarkers.addToiletGroupMarker(infosMng.get("infos.toilets"));
    }else{
      Ajax.run({url:_ToiletUrl()}, (datas) => {
        let rows = datas.Publtolt[1].row,
            newRows = [];
        _.each(rows, (row, idx) => {
          if(row.REFINE_WGS84_LAT) {
            let table = '{"title":"변기 갯수 정보", "field":[["구분","대변기수","대변기수-장애인","대변기수-어린이","소변기수","소변기수-장애인","소변기수-어린이"]],' +
              '"rows":[["남성용","'+row.MALE_WTRCLS_CNT+'", "'+row.MALE_DSPSN_UIL_CNT+'","'+row.MALE_CHILDUSE_UIL_CNT+'","'+row.MALE_UIL_CNT+'", "'+row.MALE_DSPSN_UIL_CNT+'","'+row.MALE_CHILDUSE_UIL_CNT+'"],' +
              '["여성용","'+row.FEMALE_WTRCLS_CNT+'", "'+row.FEMALE_DSPSN_WTRCLS_CNT+'","'+row.FEMALE_CHILDUSE_WTRCLS_CNT+'"]]}';

            newRows.push({
              key: "toilet_"+ ("000" +  idx).slice(-3),
              mid:"true",
              lat : row.REFINE_WGS84_LAT.toNum(),
              lng : row.REFINE_WGS84_LOGT.toNum(),
              name : row.PBCTLT_PLC_NM,
              address: row.REFINE_ROADNM_ADDR,
              manage_inst_nm : row.MANAGE_INST_NM,
              phone: row.MANAGE_INST_TELNO,
              open_tm_info: row.OPEN_TM_INFO,
              public_toilet: row.MALE_FEMALE_TOILET_YN,
              $table : table
            });
          }
        });

        let mapBounds = NoblMap.map.getBounds();
        const mapTypeId = NoblMap.map.getMapTypeId();
        if(mapTypeId !== "roadmap" && mapTypeId !== infosMng.get("imapData.areaKey")) {
          const key = mapTypeId.split("Type")[0];
          mapBounds = NoblMap.infos.headers.filter((head) => head.key === key)[0].bounds;
        }
        newRows = newRows.filter((data) => mapBounds.contains(new google.maps.LatLng(data.lat, data.lng)));

        infosMng.set("infos.toilets", newRows);
        NoblMap.CustomMarkers.addToiletGroupMarker(newRows);
      });
    }
  };
  return publicObj;
}());
PublicDatas.Toilet = Toilet;

const Metro = (function() {
  const publicObj = {};
  publicObj.init = function() {
    // 메트로가 없으면 안함.
    // 있으면 seoul, busan 같이 가지고 있다가 로딩.
    publicObj.metroKey = mng.getMetroService();
    if(publicObj.metroKey !== "") {
      $.getJSON(mng.getImgPath() + "datas/metro/"+publicObj.metroKey+".json").then((result) => {
        publicObj.metroSubwayLines = result.subwayLines;
        publicObj.metroData = result.DATA;
        publicObj.metroData.map((data) => data.loc = new google.maps.LatLng(data.xpoint_wgs, data.ypoint_wgs));

        NoblMap.map.addListener('zoom_changed', newMetroData_debounce);
        NoblMap.map.addListener('dragend', newMetroData_debounce);
      });
    }
  };
  const newMetroData = function() {
    const datas = publicObj.getContainMetro();
    if(infosMng.has("markers.groupMarkers.icon.metro")) {
      NoblMap.CustomOverlays.IconGroupFn.changeDatas("metro", datas);
    }else{
      NoblMap.CustomMarkers.addMetroGroupMarker(datas);
    }
  };
  const newMetroData_debounce = _.debounce(newMetroData, 100);

  publicObj.getContainMetro = function() {
    let bounds = NoblMap.map.getBounds();
    const mapTypeId = NoblMap.map.getMapTypeId();
    if(mapTypeId !== "roadmap" && mapTypeId !== infosMng.get("imapData.areaKey")) {
      const key = mapTypeId.split("Type")[0];
      bounds = NoblMap.infos.headers.filter((head) => head.key === key)[0].bounds;
    }

    const mergeData = {}; // 같은 역끼리 데이터 모으기.
    _.each(publicObj.metroData.filter((data) => bounds.contains(data.loc)), (data) => {
      if(mergeData.hasOwnProperty(data.station_nm)) {
        mergeData[data.station_nm].datas.push(data);
      }else{
        mergeData[data.station_nm] = {
          map_type: 1,
          map_res_url: 60,
          key:'metro_'+data.station_cd,
          name: data.station_nm,
          lat: data.xpoint_wgs,
          lng: data.ypoint_wgs,
          latLng: data.loc,
          datas: [data]
        }
      }
    });
    return Object.values(mergeData);
  };

  const seoul = function(stationName){
    return openApiPromise("http://swopenapi.seoul.go.kr/api/subway/716b6844626e6f62383856414e4c4d/json/realtimeStationArrival/0/50/" + encodeURIComponent(stationName));
  };

  const realtimeStationArrival = {
    seoul
  };

  publicObj.getRealtimeStationArrival = function(stationName) {
    return realtimeStationArrival[publicObj.metroKey](stationName);
  };

  return publicObj;
}());
PublicDatas.Metro = Metro;

export default PublicDatas;
