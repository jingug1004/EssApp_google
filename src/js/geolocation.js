import * as Manage from '@/js/Manage';

const infosMng = Manage.infosMng;

const geolocation = (function(){
  let publicObj = {};
  publicObj.nowLocation = {lat:0, lng :0, key:"myLocation"};

  const _success = function(position) {
    const crd = position.coords;

    if(publicObj.nowLocation.lat !== crd.latitude || publicObj.nowLocation.lng !== crd.longitude) {
      publicObj.nowLocation.lat = crd.latitude;
      publicObj.nowLocation.lng = crd.longitude;
      // NoblMap.marker.geoRingMarker(publicObj.nowLocation);
      NoblMap.CustomMarkers.addGPSGroupMarker([publicObj.nowLocation]);
    }
  };

  const _fail = function() {
    handleLocationError(true);
  };

  const _options = {
    enableHighAccuracy: false,
    timeout: 60000,
    maximumAge: 0
  };


  const handleLocationError = function(browserHasGeolocation) {
    // Manage.msg.alert(browserHasGeolocation ? 'Error: The Geolocation service failed.' :'Error: Your browser doesn\'t support geolocation.');
  };

  publicObj.getCurrentPosition = function(){
      // if(!NoblMap.strictBounds_map.contains(publicObj.nowLocation)) {
      //   Manage.msg.alert("현재 "+Manage.mng.getGName()+" 외부에 있습니다.");
      // }
      if(NoblMap.map.mapTypeId !== "roadmap") {
        NoblMap.map.setMapTypeId("roadmap");
      }

      // if(infosMng.has("markers.geoRingMarker.circle")) {
      //   const circle = infosMng.get("markers.geoRingMarker.circle"),
      //         rings = infosMng.get("markers.geoRingMarker.rings");
      //
      //   circle.setPosition(new google.maps.LatLng(publicObj.nowLocation));
      //   rings.setPosition(new google.maps.LatLng(publicObj.nowLocation));
      // }else{
      //   publicObj.locationMarker = NoblMap.marker.geoRingMarker(publicObj.nowLocation);
      // }
      NoblMap.CustomMarkers.addGPSGroupMarker([publicObj.nowLocation]);
      NoblMap.setCenterZoom(publicObj.nowLocation.lat, publicObj.nowLocation.lng, Manage.infosMng.get("imapData.area.minZoom") - 1);
  };

  publicObj.initCurrentPosition = function(){
      publicObj.init();
      Manage.mng.fnRecursive(100, ()=> publicObj.nowLocation.lat !== 0 && publicObj.nowLocation.lng !== 0, () =>{
        console.log(publicObj.nowLocation);
        // NoblMap.marker.geoRingMarker(publicObj.nowLocation);
        NoblMap.CustomMarkers.addGPSGroupMarker([publicObj.nowLocation]);
      });      
  };

  publicObj.init = function() {
    if (navigator.geolocation) {
      publicObj.watchId = navigator.geolocation.watchPosition(_success, _fail, _options);
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false);
    }
  };

  return publicObj;
}());

export default geolocation;
