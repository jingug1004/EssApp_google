import * as Manage from '@/js/Manage';

const mng = Manage.mng;
const _ = mng._;
const infosMng = Manage.infosMng;

let Trek = (function(){
  let publicObj = {};
  publicObj.timeoutId = null;
  publicObj.time = 10000;

  const _userTrekking = function() {
    let data = {
      lat : NoblMap.geolocation.nowLocation.lat,
      lng : NoblMap.geolocation.nowLocation.lng,
      uid : Manage.cookie.getUid()
    };

    if(data.uid && data.lat)  {
      Ajax.run({url:"/leisure/trek/update", method:"POST", data, token:true}, (datas)=>{
        if(!datas.ecode){
          console.log(new Date().format("yyyy-MM-dd HH:mm:ss"), datas);
          NoblMap.setCenterZoom(datas.lat, datas.lng, 18);
          NoblMap.marker.starMarker(datas);
          Ajax.run({url:"/leisure/trek/course/sectors", method:"POST", data:{"tc_id":datas.tc_id}, token:true}, function(sectorDatas){
            NoblMap.polyline.setPolyline(sectorDatas.list);
            // NoblMap.setCenterZoom(datas.lat, datas.lng, 18);
            let bounds = new google.maps.LatLngBounds();
            Manage.infosMng.get("polyline.line").getPath().forEach(function(e){//can't do polyline.getPath()[i] because it's a MVCArray
              bounds.extend(e);
            });
            NoblMap.map.fitBounds(bounds);       //auto-zoom
            NoblMap.map.panToBounds(bounds);     //auto-center

            Manage.toast.autoClose(Manage.lang.trans("DEFINE_PASSED_DULLEGIL"), "success");
          });
        }else{
          // console.log(datas);
        }
      });
    }
  };

  publicObj.setUserTrekking = function() {
    _userTrekking();
    if(publicObj.timeoutId) {
      clearTimeout(publicObj.timeoutId);
    }
    publicObj.timeoutId = setTimeout(publicObj.setUserTrekking, publicObj.time);
  };

  publicObj.getCourseList  = function() {
    return mng.promise(function(resolve, reject){
      Ajax.run({url:"/leisure/trek/course/list", method:"POST", data:{page:0, count:0}, token:true}, function(datas){
        resolve(datas);
      });
    });
  };

  publicObj.getCourseSectors  = function(data) {
    return mng.promise(function(resolve, reject){
      Ajax.run({url:"/leisure/trek/course/sectors", method:"POST", data, token:true}, function(datas){
        resolve(datas);
      });
    });
  };

  publicObj.getCourseLog  = function(data) {
    return mng.promise(function(resolve, reject){
      Ajax.run({url:"/leisure/trek/course/log", method:"POST", data, token:true}, function(datas) {
        resolve(datas);
      });
    });
  };

  publicObj.makeTrekCourse = function(tc_id, course_name, afterFn) {
    NoblMap.Trek.getCourseSectors({tc_id}).then((datas) => {
      Manage.toast.clickPrevToast("trekCourseToast");
      Manage.infosMng.set("trekData.tc_id", tc_id);

      NoblMap.polyline.setPolyline(datas.list.filter((data) => data.s_idx > 0));
      let toastMsg = "";
      if(course_name) {
        toastMsg = (course_name);
      }

      Manage.toast.clickClose(toastMsg, "success", {id:"trekCourseToast", onclick:()=>{
        NoblMap.polyline.removePolyline();
      }});

      let bounds = new google.maps.LatLngBounds();
      Manage.infosMng.get("polyline.line").getPath().forEach((e) => {//can't do polyline.getPath()[i] because it's a MVCArray
        bounds.extend(e);
      });

      NoblMap.map.fitBounds(bounds);       //auto-zoom
      NoblMap.map.panToBounds(bounds);     //auto-center

      if(Manage.cookie.getToken()) {
        NoblMap.Trek.getCourseLog({uid:Manage.cookie.getUid(), tc_id}).then((datas) => {
          if(datas.list) {
            Manage.mng._.each(datas.list, (log) => {
              NoblMap.marker.starMarker(log);
            });
          }
        });
      }

      afterFn && afterFn();
    });
  };



  return publicObj;
}());

setTimeout(function() {
  Trek.setUserTrekking();
}, 10000);

export default Trek;
