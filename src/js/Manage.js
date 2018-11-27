import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import postscribe from 'postscribe';
import lottieMng from '@/js/lottie';
import * as Toastr from 'toastr';
const Cookies = require("js-cookie");
window.Cookies = Cookies;
const mng = {};
mng._ = _;
mng.$ = $;
mng.toast = Toastr;
mng.postscribe = postscribe;
mng.promise = function(fn) {
    return new Promise(function(resolve, reject) {
        fn(resolve, reject);
    });
};

mng.fnRecursive = function(delayTime, checkFn, actionFn, target){
    if(checkFn(target)){
        return actionFn(target);
    }else{
        setTimeout(function(){
            mng.fnRecursive(delayTime, checkFn, actionFn, target);
        }, delayTime);
    }
};

mng.addScript = function(src) {
    mng.$(function(){
        mng.postscribe(mng.$("head"), '<script src="'+src+'"><\/script>');
    });
};

mng.addLocalScript = function(src) {
    mng.$(function(){
        mng.$("head").html('<script src="'+src+'"><\/script>');
    });
};

// lodash 관련
mng.setData = function(target, key, value) {
    _.set(target, key, value);
};

mng.getData = function(target, key) {
    return _.get(target, key);
};

mng.getKeys = function(obj){
    return _.keys(obj);
};

mng.makeMap = function(array, keyName) {
    let resultMap = new Map();
    _.each(array, (item) => {
        resultMap.set(item[keyName], item);
    });

    return resultMap;
};

mng.isArray = function (target){
  return target.constructor === Array;
};

mng.isObject = function (target){
  return target.constructor === Object;
};

mng.merge = function(...objs) {
  return _.extend({}, ...objs);
};


// jquery 관련
mng.getTarget = function(id) {
    return $(id);
};

mng.getTargetById = function(id) {
    return $("#"+id);
};

mng.getIframe = function(id) {
    return this.getTargetById(id).find("iframe").get(0).contentWindow;
};

mng.strToJson = function(str) {
    return JSON.parse(str);
};

mng.jsonToStr = function(json) {
    return JSON.stringify(json);
};



mng.getScriptDaumMap = function() {
    mng.addScript("//dapi.kakao.com/v2/maps/sdk.js?appkey="+ mng.getApiKey("KAKAO").clientId);
};

mng.getScriptKakao = function() {
    mng.addScript("//developers.kakao.com/sdk/js/kakao.min.js");
};

mng.getScriptGoogle = function() {
    mng.addScript("https://maps.googleapis.com/maps/api/js?libraries=geometry&"+ mng.getScriptGoogleParams("language", "key"));
};

mng.getScriptNaver = function() {
  return mng.promise(function(resolve, reject) {

    if(!window.naver) {
      // mng.addScript("https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.0.js");
      mng.addScript("https://static.nid.naver.com/js/naverLogin_implicit-1.0.3.js");
    }

    mng.fnRecursive(50, function () { return !!window.naver_id_login; }, function () {
      // const naverKey = mng.getApiKey("NAVER");


      // let naver_id_login = new naver_id_login(naverKey.clientId, naverKey.redirectUri);
      // naver_id_login.setButton("white", 2,40);
      // naver_id_login.setDomain(location.origin);
      // naver_id_login.setState(naver_id_login.getUniqState());
      // naver_id_login.setPopup();

      // let naverLogin = new naver.LoginWithNaverId({
      //   clientId: mng.getApiKey("NAVER").clientId,
      //   callbackUrl: mng.getApiKey("NAVER").redirectUri,
      //   isPopup: true, /* 팝업을 통한 연동처리 여부 */
      //   loginButton: {color: "green", type: 2, height: 45} /* 로그인 버튼의 타입을 지정 */
      // });

      return resolve(naver_id_login);
    });
  });
};

mng.getScriptGoogleParams = function(...params) {
    let querys = [];
    _.each(params, (value) => {
        if(value === "key") {
            querys.push(value+"="+mng.getApiKey("GOOGLE").apikey);
        }else if(value === "language") {
            querys.push(value+"="+lang.isLang());
        }else if(value === "region") {
            querys.push(value+"="+"ko");
        }else if(value === "address") {
            //querys.push(value+"="+"yongin");
            querys.push(value+"="+GLOBAL_CONSTS.map_gname_en);
        }else if(value === "koAddress") {
            querys.push("address=korea");
        }else if(value === "places") {
          querys.push("libraries=places");
        }
    });

    return querys.join("&");
};


// mng.getScriptFacebook = function() {
//     mng.addScript("https://connect.facebook.net/en_US/sdk.js");
// }


// app 접근 관련
mng.getDevice = function() {
  return app.$f7.device;
};

mng.getI18next = function() {
  return app.$i18n.i18next;
};

mng.getView = function(name) {
  return app.$f7.views.get(name);
};

mng.goPage = function(name, url) {
  mng.getView($$(name)).router.navigate(url);
};

mng.goBack = function(name) {
    mng.getView($$("." + name)).router.back();
};

mng.getSwiper = function() {
  return app.$f7.swiper;
};

mng.getDialog = function() {
    return app.$f7.dialog;
};

mng.getPopover = function() {
  return app.$f7.popover;
};

mng.getPopup = function() {
    return app.$f7.popup;
};

mng.openPopup = function(el){
  const id = el.attr("id");
  $$("#"+id).find(".navbar-current, .page-current").remove();
   mng.getPopup().open(el, false);
};

mng.getToast = function() {
    return app.$f7.toast;
};

mng.getSheet = function() {
    return app.$f7.sheet;
};
mng.createSheet = function(el) {
  let sheet = mng.getSheet();
  return sheet.create({
    el,
    backdrop: true
  });
};

mng.getSheetName = function(name, el) {
  if(infosMng.has("sheets."+name)) {
    return infosMng.get("sheets."+name)
  }else{
    const sheet = mng.createSheet(el);
    infosMng.set("sheets."+name, sheet);
    return sheet;
  }
};

const table = {};
table.convertingMergeProperties = function(str) {
  const arr = str.split(":");
  let html = "";
  if(arr[0] === "r"){
    html += 'rowspan="'+arr[1]+'"';
  }else{
    html += 'colspan="'+arr[1]+'"';
  }
  return html;
};

table.convertingThTd = function(datas, type) {
  const Separator = "^&";
  let table = '';
  _.each(datas, (field) => {
    table += '<tr>';
    _.each(field, (header) => {
      header = header.split(Separator);

      if (header.length === 1) {
        table += '<'+type+'>' + header[0] + '</'+type+'>';
      } else {
        table += '<'+type+' ';
        for (let i = 1, n = header.length; i < n; i++) {
          table += (" " + this.convertingMergeProperties(header[i]));
        }
        table += '>' + header[0] + '</'+type+'>';
      }
    });
    table += '</tr>';
  });
  return table;
};

table.makeTable = function(str) {
  const obj = JSON.parse(str);

  let table = '<table>';
  table += '<thead>' + this.convertingThTd(obj.field, "th") + '</thead>';
  table += '<tbody>' + this.convertingThTd(obj.rows, "td") + '</tbody>';
  table += '</table>';
  return {title: obj.title, table};
};



// message 창은 여기서 정의
let msg = {};
msg.create = function(options){
    return mng.getDialog().create(options);
};
msg.alert = function(text){
    msg.create({text:text, buttons:[{text:lang.trans("DEFINE_MESSAGE_BUTTON_OK") , bold:true}]}).open();
};

msg.confirm = function(text, okfn, cancelfn){
    msg.create({
        text:text,
        buttons:[{text:lang.trans("DEFINE_MESSAGE_BUTTON_OK"), bold:true, onClick:okfn}, {text:lang.trans("DEFINE_MESSAGE_BUTTON_CANCEL"), bold:true, onClick:cancelfn}]
    }).open();
};

msg.toast = function(text) {
    msg.getToast().create({text:text, position:"center", closeButton:true}).open();

};


// gps 관련 여기서 정의
let gps = {};
gps.plusPoint = function(point, viewport) {
    return {
        x : point.x + viewport.x,
        y : point.y + viewport.y
    };
};

gps.minusPoint = function(point, viewport) {
    return {
        x : point.x - viewport.x * 2,
        y : point.y - viewport.y * 2
    };
};

gps.setGpsData = function(data){
    return {
        MAP_LPOSY: data[1],
        MAP_RPOSY: data[2],
        MAP_LPOSX: data[3],
        MAP_RPOSX: data[4],
        MAP_W: data[5],
        MAP_H: data[6]
    };
};
gps.getLatlngFromPixel = function(point, gpsData, correctionValue){
    gpsData = gpsData || gps.setGpsData(mng.getNowMapData().gps);

    if(correctionValue) {
        point = gps.plusPoint(point, correctionValue);
    }

    let lng = (-(point.x * ((gpsData.MAP_LPOSX - gpsData.MAP_RPOSX) / gpsData.MAP_W)) + gpsData.MAP_LPOSX).toFixedNum(7), // 경도
        lat = ((point.y * (-(gpsData.MAP_LPOSY - gpsData.MAP_RPOSY) / gpsData.MAP_H)) + gpsData.MAP_LPOSY).toFixedNum(7); // 위도

    return {lat, lng};
};

gps.getPixelFromLatlng = function(point, gpsData, correctionValue){
    gpsData = gpsData || gps.setGpsData(mng.getNowMapData().gps);

    let x = (-(point.y - gpsData.MAP_LPOSX) / ((gpsData.MAP_LPOSX - gpsData.MAP_RPOSX) / gpsData.MAP_W)).toFixedNum(0),
        y = ((point.x - gpsData.MAP_LPOSY) / (-(gpsData.MAP_LPOSY - gpsData.MAP_RPOSY) / gpsData.MAP_H)).toFixedNum(0);

    if(correctionValue) {
        point = gps.plusPoint({x, y}, correctionValue);
        x = point.x;
        y = point.y;
    }
    return {x, y};
};

gps.getLatlngFromPixelTest = function(point, viewport){
    return gps.getLatlngFromPixel(point, gps.setGpsData(mng.getMapData(gps.getMapName()).gps), viewport);
};

gps.getPixelFromLatlngTest = function(point, viewport){
    return gps.getPixelFromLatlng(point, gps.setGpsData(mng.getMapData(gps.getMapName()).gps), viewport);
};


// 상수 관련 함수
mng.getGid = function() {
    return GLOBAL_CONSTS.map_gid;
};

mng.getGName = function() {
  return GLOBAL_CONSTS.language_txt_array.split(",")[_.findIndex(GLOBAL_CONSTS.supported_language.split(","), (lang) => lang === Manage.lang.isLang())];
};

mng.getMayor = function() {
  return GLOBAL_CONSTS.mayor;
};

mng.getGSido = function() {
  return window.GLOBAL_CONSTS && GLOBAL_CONSTS.map_gSido;
};

mng.getGSidoWeather = function() {
  let sido = GLOBAL_CONSTS.map_gSido;
    if(GLOBAL_CONSTS.map_gname === "철원군") {
      sido = "경기";
    }
    return sido;
};

mng.getWeatherXY = function() {
  return JSON.parse(GLOBAL_CONSTS.map_weather_xy);
};

mng.getCenterGps = function() {
  return {lat:JSON.parse(GLOBAL_CONSTS.lat), lng:JSON.parse(GLOBAL_CONSTS.lng)};
};

mng.getRegionCode = function() {
  return GLOBAL_CONSTS.regionCode;
};

mng.getLoadingBgColor = function() {
  return GLOBAL_CONSTS.loadingBgColor;
};

mng.getLoadingImgLottie = function() {
  return JSON.parse(GLOBAL_CONSTS.loadingImgLottie);
};

mng.getLoadingSetSystem = function(){
  return GLOBAL_CONSTS.loadingSetSystem;
};



mng.getMetroService = function() {
  return GLOBAL_CONSTS.metro;
};

mng.fromPixelToGps = function(x, y) {
  const map = NoblMap.map,
        bounds = map.getBounds(),
        projection = map.getProjection(),
        topRight = projection.fromLatLngToPoint(bounds.getNorthEast()),
        bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest()),
        scale = 1 << map.getZoom();

  return projection.fromPointToLatLng(new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y));
};

mng.fromGpsToPixel = function(lat, lng) {
  const map = NoblMap.map,
        projection = map.getProjection(),
        bounds = map.getBounds(),
        pixel = projection.fromLatLngToPoint(new google.maps.LatLng(lat, lng)),
        ne = projection.fromLatLngToPoint(bounds.getNorthEast()),
        sw = projection.fromLatLngToPoint(bounds.getSouthWest()),
        scale = 1 << map.getZoom();

  return new google.maps.Point((pixel.x - sw.x) * scale, (pixel.y - ne.y) * scale);
};


let IMG_PATH = '/static/assets/';
if(location.pathname !== "/") {
  IMG_PATH = location.pathname.split("/index.html")[0] + IMG_PATH;
}
mng.getImgPath = function() {
  return IMG_PATH;
};

mng.getImgUrl = function(asset, id, file) {
  let url = "";
  if(location.hostname === "localhost"){
    url = Ajax.url;
  }else{
    url = Ajax.uri;
  }

  if(asset === "pictogram") {
    if(id) {
      file = NoblMap.infos.pictograms.get(Number(id)).icon_url;
    }
  }
  url += "/assetImg";
  url += ((asset)?"/"+asset:"");
  url += ((id)?"/"+id:"");
  url += ((file)?"/"+file:"");
  return url;
};

mng.getApiKey = function(name){
    return GLOBAL_CONSTS.APIKEYS[name];
};

mng.toArray = function( map, key ) {
    let datas;
    if(key === "key") {
        datas = map.keys();
    }else{
        datas = map.values();
    }

    return Array.from( datas );
};

mng.setCategoryMap = function(){
    Ajax.run({url:"/map/categories/"+ lang.isLang()}, (data, res) => {
      if(data.list) {
        window.categoryMap = mng.makeMap(data.list.filter((data)=>data.status === 1), "cid");
      }
    });
};

// localStorage 관련
mng.setUserId = function(userId){
    mng.setItem("userId", userId);
};

mng.getUserId = function(){
    return mng.getItem("userId");
};

mng.setItem = function(key, value){
    localStorage.setItem(key, value);
};

mng.getItem = function(key){
    return localStorage.getItem(key);
};

mng.textDom = function(text, fontSize) {
  if($$("#textWidth").length === 0) {
    $$("body").append('<span id="textWidth" style="display:hidden;">');
  }
  $$("#textWidth").css("font-size", (fontSize || 12)+"px").html(text);
  return $("#textWidth");
};

mng.calcDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2-lat1).toRad();
  const dLon = (lon2-lon1).toRad();
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};


mng.stopPullToRefresh = function(target){
  target.css("touch-action", "pan-down");
  target.on("touchend", () => {
    const scrollTop = target.scrollTop();
    if(scrollTop === 0 && target.css("touch-action") === "auto") {
      target.css("touch-action", "pan-down");
    }else if(scrollTop > 0) {
      target.css("touch-action", "auto");
    }
  });
};

// String, Number 같은 기본 클래스에 prototype으로 함수 추가할때
String.prototype.toNum = function() {
    return Number(this);
};

String.prototype.pxRemove = function() {
  return this.split("px").join("");
};

String.prototype.pxRemoveNum = function() {
  return this.split("px").join("").toNum();
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

Number.prototype.toFixedNum = function(num) {
    return this.toFixed(num).toNum();
};

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

Array.prototype.get = function(idx) {
    return this[idx];
};

Array.prototype.first = function() {
    return this[0];
};

Array.prototype.last = function() {
    return this[this.length - 1];
};

Array.prototype.remove = function(str) {
  this.splice(_.indexOf(this, str), 1);
  return this;
};

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";

    let weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    let d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|ms|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "ms": return d.getMilliseconds().zf(3);
            case "a/p": return d.getHours() < 12 ? locale.meridiem[0] : locale.meridiem[1];
            default: return $1;
        }
    });
};


Date.prototype.minus = function(type, minus) {
    var dat = new Date(this.valueOf());

    if(type === "year"){
        dat.setFullYear(dat.getFullYear() - minus);
    }else if(type === "month"){
        dat.setMonth(dat.getMonth() - minus);
    }else if(type === "date"){
        dat.setDate(dat.getDate() - minus);
    }else if(type === "hour"){
        dat.setHours(dat.getHours() - minus);
    }else if(type === "minute"){
        dat.setMinutes(dat.getMinutes() - minus);
    }else if(type === "second"){
        dat.setSeconds(dat.getSeconds() - minus);
    }
    return dat;
};

Date.prototype.plus = function(type, plus) {
    var dat = new Date(this.valueOf());

    if(type === "year"){
        dat.setFullYear(dat.getFullYear() + plus);
    }else if(type === "month"){
        dat.setMonth(dat.getMonth() + plus);
    }else if(type === "date"){
        dat.setDate(dat.getDate() + plus);
    }else if(type === "hour"){
        dat.setHours(dat.getHours() + plus);
    }else if(type === "minute"){
        dat.setMinutes(dat.getMinutes() + plus);
    }else if(type === "second"){
        dat.setSeconds(dat.getSeconds() + plus);
    }
    return dat;
};



// 비교 함수

let compare = {};
mng.compare = compare;


// i18next 관련
let lang = {};
lang.setData = function(list) {
    let language = {};
    _.each(list, (data) => {
        language[data.cname] = data.str;
    });
    return language;
};

lang.setLocale = function(targetArea) {
    const THAT = lang;
    const dataI18n = "[data-i18n]";

    targetArea = targetArea ? targetArea.find(dataI18n) : $$(dataI18n);
    _.each(targetArea, (target) => {
        const i18n = $$(target).data("i18n").split("."),
              last = i18n.last();
        let value = THAT.trans(i18n[0]);

        if(target.tagName === "INPUT"){
            if(i18n.length === 2 && i18n[1] === "placeholder") {
                target.placeholder = value;
            }else{
                target.value = value;
            }
        }else{
            if(i18n.length === 2 ){
                $$(target).find(i18n[1]).text(value);
            }else{
                $$(target).text(value);
            }
        }
    });
};

lang.trans = function(text) {
    return mng.getI18next().t(text);
};

lang.changeLanguage = function(changeLang) {
    if(lang.hasLanguage(changeLang)){
      mng.getI18next().changeLanguage(changeLang);
      setLocale();
      cookie.set("lang", changeLang);
      location.reload();
    }else{
        lang.addLanguage(changeLang);
    }
};

lang.isLang = function() {
    return mng.getI18next().language;
};

lang.getStoreData = function() {
    return mng.getI18next().store.data[this.isLang()].translation;
};

lang.hasLanguage = function(changeLang) {
    return mng.getI18next().store.data[changeLang];
};

lang.addLanguage = function(changeLang) {
    Ajax.run({url:"/etc/stringTable/"+changeLang}, function(data){
        Manage.mng.getI18next().addResources(changeLang, "translation", lang.setData(data.list));
        lang.changeLanguage(changeLang);
    });
};

window.setLocale = lang.setLocale;
window.changeLanguage = lang.changeLanguage;
window.isLang = lang.isLang;

let infosMng = {};
infosMng.set = function(key, value) {
  _.set(NoblMap.infos, key, value);
};

infosMng.get = function(key) {
  return _.get(NoblMap.infos, key);
};

infosMng.del = function(key) {
  _.unset(NoblMap.infos, key);
};

infosMng.has = function(key) {
  return !!_.get(NoblMap.infos, key);
};

const cookie = {
  get: function(name) {
    return cookie.getJSON(name);
  },
  set: function(name, value, expires) {
    if(!expires){
      expires = (1 / 24) * 2;
    }
    Cookies.set(name, JSON.stringify(value), { expires: expires });
  },
  del: function(name) {
    Cookies.remove(name);
  },
	getToken : function(){
		return cookie.get("access_token");
	},
	getUid : function(){
    return Number(cookie.get("uid"));
	},
	getName : function(){
    return cookie.get("name");
	},
  getJSON(name) {
    const str = Cookies.get(name);
    try{
      return JSON.parse(str);
    }catch(e) {
      return str;
    }
  },
  clearUser : function() {
    cookie.del("uid");
    cookie.del("name");
    cookie.del("access_token");
  }
};


const toast = {
  aaa:Toastr,
  options : {
    "closeButton": false,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-left",
    "preventDuplicates": false,
    "onclick": (e) => {},
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "tapToDismiss": false
  },
  init : function() {
    Toastr.options = this.options;
  },
  autoClose : function(msg, type, options) {
    return Toastr[type || "info"]('<div class="autoDiv">'+msg + '</div>', "", mng.merge({"timeOut": "5000", "extendedTimeOut": "1000"}, options));
  },
  getImageById : function(id) {
    let style = 'width: 0px;';
    let image = '';

    if(id === "directionsToast" ) {
      image = 'toast_icon_traffic_bus.svg';
    }else if(id === "subwayToast" ) {
      image = 'toast_icon_traffic_subway.svg';
    }else if(id === "locationToast" ) {
      image = 'toast_icon_pin.svg';
    }else if(id === "trekCourseToast" ) {
      image = 'toast_icon_stamp.svg';
    }else if(id === "eventToast" ) {
      image = 'toast_icon_event.png';
    }else{
      return 'width: 0px;';
    }
    if(image) {
      style = 'background-image:url(' + mng.getImgPath() + 'images/'+image + ');'
    }

    return style;
  },
  clickClose: function(msg, type, options) {
    let id = options && options.id || "";
    let html = '<div class="clickDiv" '+('id="'+id+'"')+'>';
      html += '<div style="'+ this.getImageById(id)+'"></div>';
      html += '<div>'+msg+'</div>';
      html += '<div></div>';
      html += '<div> '+lang.trans("DEFINE_UI_BUTTON_NAME_CLOSE")+' </div>';
      html += '</div>';

      return Toastr[type || "info"](html, "", mng.merge({"timeOut":0, "extendedTimeOut":0}, options, {onclick:(e)=>{
      options.onclick();
      if(mng.getDevice().ie && options.id) {
        mng.$(e.target).parents(".clickDiv").remove();
      }
    }}));
  },

  eventClose: function(msg, type, options) {
    let html = '<div class="clickDiv">';
    html += '<div style="'+ this.getImageById('eventToast')+'"></div>';
    html += '<div>'+msg+'</div>';
    html += '<div></div>';
    html += '<div id="toastClose"> '+lang.trans("DEFINE_UI_BUTTON_NAME_CLOSE")+' </div>';
    html += '</div>';

    return Toastr[type || "info"](html, "", mng.merge({"timeOut":0, "extendedTimeOut":0}, options, {onclick:(e)=>{
        if($$(e.target).attr("id") !== "toastClose") {
          options.onclick();
          if(mng.getDevice().ie && options.id) {
            mng.$(e.target).parents(".clickDiv").remove();
          }
        }
      }}));
  },

  clickPrevToast: function(id) {
    _.each(document.querySelectorAll("#toast-container #"+id), (node) => {
      $(node).click();
    });
    // document.querySelectorAll("#toast-container #"+id).forEach((node) => $(node).click());
  }
};
toast.init();

export { mng, lang, msg, gps, infosMng, cookie, lottieMng, toast, table, moment};
