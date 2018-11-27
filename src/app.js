// Import Vue
import Vue from 'vue';
import i18next from 'i18next';
import VueI18Next from '@panter/vue-i18next';

// import 'core-js';
import '@babel/polyfill';

// Import F7
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import F7 Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js';

// Import F7 Styles
import Framework7Styles from 'framework7/css/framework7.css';

import 'toastr/build/toastr.css';

import AlertifyStyle from '@/plugins/alertify/css/alertify.min.css';
import AlertifyThemeStyle from '@/plugins/alertify/css/themes/default.min.css';
// import alertify from '@/plugins/alertify/alertify.js';

// Import Icons and App Custom Styles
import IconsStyles from './css/icons.css';
import AppStyles from './css/app.css';
import FontStyles from '@/css/font.css';

// Import App Component
import App from './app.vue';
import Meta from 'vue-meta';
import VueAxios from 'vue-axios';
import VueAuthenticate from 'vue-authenticate';
import axios from 'axios';

import Ajax from '@/js/Ajax';
import _ from 'lodash';


Ajax.run({url:"/map/configdata"}, (datas) => {
  let GLOBAL_CONSTS = {};
  const nameMap = new Map();
  nameMap.set("service_region_coordinates", "coordinates");
  nameMap.set("service_region_gid", "map_gid");
  nameMap.set("service_region_sido", "map_gSido");
  nameMap.set("service_region_name", "map_gname");
  nameMap.set("service_region_engname", "map_gname_en");
  nameMap.set("weather_xy", "map_weather_xy");
  nameMap.set("base_lat", "lat");
  nameMap.set("base_lng", "lng");
  nameMap.set("supported_language_txt", "language_txt_array");

  _.each(datas.list, (data) => {
    if(nameMap.has(data.name) && data.name === "service_region_coordinates") {
      _.set(GLOBAL_CONSTS, nameMap.get(data.name), data.description);
    }else if(nameMap.has(data.name)) {
      _.set(GLOBAL_CONSTS, nameMap.get(data.name), data.the_value);
    }else if(data.name.indexOf("APIKEYS") === 0){
      _.set(GLOBAL_CONSTS, data.name, data.the_value);
    }else{
      _.set(GLOBAL_CONSTS, data.name, data.the_value);
    }
  });
  window.GLOBAL_CONSTS = GLOBAL_CONSTS;
});
import * as Manage from '@/js/Manage';
import msg from '@/js/Alert';

window.Ajax = Ajax;
window.Manage = Manage;
window.msg = msg;

// Init F7 Vue Plugin
Framework7.use(Framework7Vue);

Manage.mng.fnRecursive(50, () => !!window.GLOBAL_CONSTS, () => {
  const googleKey = Manage.mng.getApiKey("GOOGLE");
  const baseUrl = location.origin;

  Vue.use(VueI18Next);
  Vue.use(Meta);
  Vue.prototype.$http = axios;
  Vue.use(VueAxios, axios);
  Vue.use(VueAuthenticate, {
    baseUrl: baseUrl, // Your API domain
    providers: {
      google: {
        clientId: googleKey.clientId,
        redirectUri: googleKey.redirectUri // Your client app URL
      }
    }
  });

  let lang = navigator.language.split("-")[0];
  if(Manage.cookie.get("lang")){
    lang = Manage.cookie.get("lang");
    Manage.cookie.del("lang");
  }
  let langIdx = Manage.mng._.findIndex(["ko", "en"], (ln) => ln === lang);
  if(langIdx === -1){
    lang = "ko";
  }

  Ajax.run({url:"/etc/stringTable/"+lang}, function(data, res){
    const resources = {};
    resources[lang] =  { translation: Manage.lang.setData(data.list) };
    i18next.init({
      lng: lang,
      fallbackLng: lang,
      resources
    });

    msg.init(i18next);
    // Init App
    const app = new Vue({
      el: '#app',
      template: '<app/>',

      // Register App Component
      components: { app: App },
      metaInfo: {
        title: GLOBAL_CONSTS.language_txt_array.split(",")[_.findIndex(GLOBAL_CONSTS.supported_language.split(","), (la) => la === lang)],
        titleTemplate: "%s 스마트 관광 전자지도",
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover' }
        ]
      },
      i18n: new VueI18Next(i18next)
    });

    window.$$ = app.$$;
    window.app = app;

    // 우클릭 막기
    // document.addEventListener('contextmenu', function(event) {
    //   event.preventDefault();
    //   return false;
    // });
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });

    if(GLOBAL_CONSTS.setFont){
      const font = GLOBAL_CONSTS.setFont;
      setTimeout(() => {
        $$("body").css("font-family", font + ", " + $$("body").css("font-family"));
        $$(".gm-style").css("font-family", font+", " + $$(".gm-style").css("font-family"));
      }, 5000);
    }

    // 구글 지도 라이브러리 호출
    Manage.mng.getScriptGoogle();
    Manage.mng.setCategoryMap();
    Ajax.run({url:"/map/imaps/"+lang}, function(imaps){
      const headers = [];
      const tile_infos = {};
      let key;
      Manage.mng._.each(imaps.list, (imap) => {
        key = "mid"+ imap.mid;
        if(imap.lat !== 0) {
          const header = JSON.parse(imap.header);
          header.key = key;
          header.text = imap.name;
          header.zoom = imap.zoom;
          headers.push(header);
        }
        tile_infos[key] = JSON.parse(imap.tile_info);
      });

      NoblMap.infos.headers = headers;
      NoblMap.infos.tileInfos = tile_infos;
      NoblMap.infos.imaps = imaps.list;
      NoblMap.overlayMapType.setTileInfo();
    });

    Ajax.run({url:"/map/spots/"+lang}, (spots)=>{
      if(spots.map) {
        NoblMap.infos.spots= spots.map;
      }
    });

    Ajax.run({url:"/map/allplaces/"+lang}, (places)=>{
      if(places.list) {
        let list = places.list.filter((place) => place.map_type > 0);
        _.each(list, (place) => {
          const name = "display_zoom_max";
          if(place.cf.indexOf(name) > -1){
            place[name] = JSON.parse(place.cv)[_.indexOf(JSON.parse(place.cf), name)].toNum();
          }
        });
        NoblMap.infos.places = list;
      }
    });

    Ajax.run({url:"/map/allPictograms"}, (pictograms) => {
      if(pictograms.list) {
        NoblMap.infos.pictograms = Manage.mng.makeMap(pictograms.list, "pid");
      }
    });
  });
});
