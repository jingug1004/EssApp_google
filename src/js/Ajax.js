import axios from 'axios';
import {cookie} from '@/js/Manage';
const xmljs = require('xml-js');

let Ajax = (function(){
    let publicObj = {};
    let path = location.pathname.split("/client/index.html")[0];
    path = (path.length === 1)?"/seongnam":path;
    // publicObj.url = "https://221.150.19.55:8443"+path;
    let port = location.port;
    if(location.hostname === "localhost" ||location.hostname === "172.30.1.50" ) {
      port = "8080";
    }
    publicObj.url = "http://noblapp.com:" + port + path;
    publicObj.uri = path;

    publicObj.getInstance = function(options){
        const instance = axios.create();
        instance.defaults.timeout = 30000;
        instance.defaults.headers = {
          // 'Accept': 'application/json',
          'Content-Type': 'application/json; charset=UTF-8',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        };

        return instance;
    };

    const _setUrl = function(options) {
        let url = "";
        if(!/^http/.test(options.url)) {
          if(process.env && process.env.NODE_ENV === "development") {
            url = publicObj.url;
          }else{
            const uriReg = new RegExp("^"+publicObj.uri);
            if(!uriReg.test(options.url)) {
              url = publicObj.uri;
            }
          }
        }
        options.url = url + options.url;
    };

    const _setData = function(options) {
      if(options.data) {
        options.data = {
          module: options.url,
          parameter : JSON.stringify(options.data)
        };
      }
    };

    const _setOptions = function(options) {
      _setUrl(options);
      _setData(options);
    };

    publicObj.run = function(options, fn) {
        _setOptions(options);
        const instance = publicObj.getInstance(options);
        if(options.token) {
          instance.defaults.headers['access_token'] = cookie.getToken();
        }
        instance.request(options)
        .then((res)=>{
          let data;
          if(typeof res.data === "string" && /xml/.test(res.data)) {
            data = JSON.parse(xmljs.xml2json(res.data, {compact: true, spaces: 4}));
          }else{
            data = res.data.response && typeof res.data.response === "string" && JSON.parse(res.data.response) || res.data;
            if(data.ecode === 10005) {
              Manage.msg.alert(Manage.lang.trans("DEFINE_LOGIN_AGAIN"));
              Manage.cookie.clearUser();
            }
          }
          if(fn) {
            fn(data, res);
          }
        })
        .catch(function(err){
          console.error(err);
        });
    };

    publicObj.getPromise = function(options) {
        _setUrl(options);
        return publicObj.getInstance(options).request(options).catch(function(e){console.error(e)});
    };

    publicObj.getPromise2 = function(options) {
      _setOptions(options);
      return new Promise(function(resolve, reject) {
        publicObj.getInstance(options).request(options).then((res) => {
          let data;
          if(typeof res.data === "string" && /xml/.test(res.data)) {
            data = JSON.parse(xmljs.xml2json(res.data, {compact: true, spaces: 4}));
          }else{
            data = res.data.response && typeof res.data.response === "string" && JSON.parse(res.data.response) || res.data;
            if(data.ecode === 10005) {
              Manage.msg.alert(Manage.lang.trans("DEFINE_LOGIN_AGAIN"));
              Manage.cookie.clearUser();
              reject();
            }
          }
          resolve(data, res);
        });
      });
    };

    // promises : array
    publicObj.promiseAll = function(promises) {
      return axios.all(promises);
    };
    return publicObj;
}());


export default Ajax;
