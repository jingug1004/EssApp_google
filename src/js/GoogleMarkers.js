import * as Manage from '@/js/Manage';

const mng = Manage.mng;
const _ = mng._;
const $ = mng.$;
const infosMng = Manage.infosMng;

const makeKey = function (data) {
  return data.key || data.category + "." + data.sp_id;
}

const marker = (function () {
  let publicObj = {};

  const _markerZindex = 250,
    _defaultOptions = {
      zIndex: _markerZindex
    };

  const _pinSymbol = function (fill, stroke) {
    return {
      path: 'M38.853,5.324L38.853,5.324c-7.098-7.098-18.607-7.098-25.706,0h0 C6.751,11.72,6.031,23.763,11.459,31L26,52l14.541-21C45.969,23.763,45.249,11.72,38.853,5.324z M26.177,24c-3.314,0-6-2.686-6-6 s2.686-6,6-6s6,2.686,6,6S29.491,24,26.177,24z',
      fillColor: fill,
      fillOpacity: 1,
      strokeColor: stroke || fill,
      strokeWeight: 1,
      scale: 0.5,
      anchor: new google.maps.Point(7, 70)
    };
  }

  const _circleSymbol = function (color) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      strokeColor: '#000',
      strokeWeight: 0,
      fillColor: color,
      fillOpacity: 1,
      scale: 5
    };
  }

  const _starSymbol = function () {
    return {
      url: mng.getImgPath() + "menu_icon/course_spot_off.png",
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 15)
    };
  }

  const _latlngToNum = function (num) {
    return (typeof num === "string") ? num.toNum() : num;
  }

  publicObj.addMarker = function (data) {
    let options = mng.merge(_defaultOptions, {
        position: {lat: _latlngToNum(data.lat), lng: _latlngToNum(data.lng)},
        map: NoblMap.map
      }),
      marker = new google.maps.Marker(options);
    return marker;
  }

  publicObj.addCenterMarker = function (lat, lng) {
    let options = mng.merge(_defaultOptions, {
      position: {lat, lng},
      map: NoblMap.map
    });

    return new google.maps.Marker(options);
  }

  // 인포윈도우까지 연계되는 마커.
  publicObj.addInfoMarker = function (data) {
    const options = mng.merge(_defaultOptions, {
        position: {lat: _latlngToNum(data.lat), lng: _latlngToNum(data.lng)},
        map: NoblMap.map
      }),
      markerKey = "id_" + data.cid + "_" + data.pid;

    let marker = infosMng.get("infoWindow.marker." + markerKey);
    if (marker) {
      marker.setOptions(options);
    } else {
      marker = new google.maps.Marker(options);
      marker.addListener('click', function () {
        infoWindow.removeInfoWindows();
        infoWindow.addInfoWindow(markerKey, data, marker);
        publicObj.detailMarker = marker; // 팝업에서 쓰려고 함.
      });
      infosMng.set("infoWindow.marker." + markerKey, marker);
    }
    return marker;
  }

  publicObj.removeInfoMarker = function (name) {
    const marker = infosMng.get("markers.infoMarkers." + name);
    marker.setMap(null);
    infosMng.del("markers.infoMarkers." + name);
  }

  publicObj.geoRingMarker = function (params) {
    publicObj.removeRingMarker("geoRingMarker");
    let options = mng.merge(_defaultOptions, {
      position: {lat: params.lat, lng: params.lng},
      map: NoblMap.map
    });

    const circle = new google.maps.Marker(mng.merge(options, {icon: _circleSymbol("#FF4444")}));
    const rings = new google.maps.Marker(mng.merge(options, {
      zIndex: _markerZindex + 1, icon: {
        url: mng.getImgPath() + "map_icon/rings_red.svg",
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(22.5, 22.5),
        scale: 1.2
      }
    }));

    infosMng.set("markers.geoRingMarker.circle", circle);
    infosMng.set("markers.geoRingMarker.rings", rings);
  };

  publicObj.starMarker = function (params) {
    let options = mng.merge(_defaultOptions, {
      position: {lat: params.lat, lng: params.lng},
      map: NoblMap.map
    });

    let data = {};
    data["star_" + params.tc_id + "_" + params.tcs_id] = new google.maps.Marker(mng.merge(options, {icon: _starSymbol()}));
    infosMng.set("markers.starMarker", mng.merge(infosMng.get("markers.starMarker"), data));
  };

  // 유저가 지도를 클릭했을 때 마커.
  publicObj.addClickMarker = function (params) {
    publicObj.removeRingMarker("clickMarker");

    let options = mng.merge(_defaultOptions, {
      position: {lat: params.lat, lng: params.lng},
      map: NoblMap.map
    });

    const circle = new google.maps.Marker(mng.merge(options, {icon: _circleSymbol("#00A4FF")}));
    const rings = new google.maps.Marker(mng.merge(options, {
      zIndex: _markerZindex + 1, icon: {
        url: mng.getImgPath() + "map_icon/rings_blue.svg",
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(22.5, 22.5),
        scale: 1.2
      }
    }));

    rings.addListener('click', function (e) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      msg.navi(Manage.lang.trans("DEFINE_USE_ROUTE_INFORMATION"),
        () => {
          NoblMap.kakaoNavi("선택한 곳", lat, lng);
        },
        () => {
          NoblMap.publicTransportationDirections(lat, lng);
        });
     });

    infosMng.set("markers.clickMarker.rings", rings);
    infosMng.set("markers.clickMarker.circle", circle);
  };

  publicObj.removeRingMarker = function (name) {
    name = "markers." + name + ".";
    let rings = infosMng.get(name + "rings"),
      circle = infosMng.get(name + "circle");
    if (rings) {
      rings.setMap(null);
      infosMng.del(name + "rings");
      circle.setMap(null);
      infosMng.del(name + "circle");
    }
  };

  publicObj.markerBounce = function (marker) {
    const bounceMarker = infosMng.get("markers.bounceMarker");
    if (bounceMarker !== marker) {
      if (bounceMarker) {
        publicObj.stopBounce(bounceMarker);
      }
      publicObj.startBounce(marker);
    }
  };

  publicObj.startBounce = function (marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    infosMng.set("markers.bounceMarker", marker);
  };

  publicObj.stopBounce = function (marker) {
    marker.setAnimation(null);
    infosMng.del("markers.bounceMarker");
  };

  const _setMarkerVisible = function () {
    const zoom = NoblMap.map.getZoom(),
      markers = infosMng.get("markers.infoMarkers");

    _.each(markers, (mk) => {
      let flag = true;
      if ((!NoblMap.isContainsMapBounds(mk.position.lat(), mk.position.lng())) || zoom <= 11) {
        flag = false;
      }
      mk.setVisible(flag);
    });
  };

  publicObj.addDetailMarker = function (data) {
    const markerName = "markers.detailMarker";
    publicObj.removeDetailMarker(markerName);

    const marker = new google.maps.Marker(mng.merge(_defaultOptions, {
      map: NoblMap.map,
      icon: _pinSymbol("#FF4444"),
      position: {lat: data.lat, lng: data.lng}
    }));
    marker.data = data;
    marker.addListener('click', function () {
      infosMng.set("changeZoom", marker.data.display_zoom);
      setTimeout(() => infosMng.del("changeZoom"), 1000);
      NoblMap.map.setZoom(marker.data.display_zoom);
      NoblMap.map.panTo(marker.getPosition());
    });
    infosMng.set(markerName, marker);
  };

  publicObj.removeDetailMarker = function (name) {
    name = name || "markers.detailMarker";
    if (infosMng.has(name)) {
      infosMng.get(name).setMap(null);
      infosMng.del(name);
    }
  };

  publicObj.addSearchMarkers = function (datas) {
    let options = mng.merge(_defaultOptions, {
      map: NoblMap.map
    });

    _.each(datas, (data) => {
      const marker = new google.maps.Marker(mng.merge(options, {
        icon: _pinSymbol("#FF4444"),
        position: {lat: data.lat, lng: data.lng}
      }));
      marker.data = data;
      marker.addListener('click', function () {
        infosMng.set("changeZoom", marker.data.display_zoom);
        NoblMap.map.setZoom(marker.data.display_zoom);
        NoblMap.map.panTo(marker.getPosition());
      });
      infosMng.set("markers.searchMarker.search_" + data.pid, marker);
    });
  };

  publicObj.removeSearchMarker = function () {
    const name = "markers.searchMarker";
    if (infosMng.has(name)) {
      _.each(infosMng.get(name), (marker, key) => {
        marker.setMap(null);
        infosMng.del(name + "." + key);
      });
    }
  };

  publicObj.setEvent = function () {
    // NoblMap.map.addListener("zoom_changed", _.debounce(_setMarkerVisible, 50));
    // NoblMap.map.addListener("center_changed", _.debounce(_setMarkerVisible, 50));
  };
  return publicObj;
}());

const infoWindow = (function () {
  let publicObj = {};
  publicObj.infoWindows = new Map();

  const _newInfoWindow = function (opts, data) {
    const iw = new google.maps.InfoWindow();

    google.maps.event.addListener(iw, 'content_changed', function () {
      if (typeof this.getContent() === 'string') {
        const div = document.createElement('div');
        div.innerHTML = this.getContent();
        this.setContent(div);
        return;
      }

      google.maps.event.addListener(this, 'domready', function () {
        if (publicObj.clickEvent) {
          google.maps.event.removeListener(publicObj.clickEvent);
        }

        publicObj.clickEvent = google.maps.event.addDomListener(this.getContent().parentNode.parentNode, 'click', function () {
          mng.goPage(".popup-menu-detail-view", "/menuDetail/" + data.pid);
          mng.openPopup($$("#popup-menu-detail"));
        });
      });
    });

    if (opts) iw.setOptions(opts);
    return iw;
  };

  publicObj.addInfoWindow = function (key, data, marker) {
    const infoWindow = _newInfoWindow({content: '<div id="content">' + data.name + '</div>'}, data);

    infosMng.set("infoWindow.iws." + key, infoWindow);
    infoWindow.open(NoblMap.map, marker);
  };


  publicObj.removeInfoWindow = function (name) {
    const iw = infosMng.get("infoWindow.iws." + name);
    iw.setMap(null);
    infosMng.del("infoWindow.iws." + name);
  };

  publicObj.removeInfoWindows = function () {
    const iws = infosMng.get("infoWindow.iws");
    _.each(iws, (iw) => {
      iw.setMap(null);
    });
    infosMng.del("infoWindow.iws");
  };


  return publicObj;
}());

export {marker, infoWindow};
