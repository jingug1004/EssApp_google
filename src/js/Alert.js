import _ from 'lodash';
import $ from 'jquery';
import alertify from '@/plugins/alertify/alertify.js';

let Alert = (function(){
  let publicObj = {};

  const _setZindex = function (target) {
    const zIndex = "6000";
    let elements = target.elements;
    $(elements.header).remove();
    $(elements.modal).css("z-index", zIndex);
    $(elements.dimmer).css("z-index", zIndex);
  };

  publicObj.init = function(i18next) {
    var options = {
  		'autoReset':true,
  		'resizable':false,
  		'movable':true,
  		'closable':false,
  		'pinnable':false,
  		'transition':'zoom'
    };

    alertify.alert().setting( _.extend({'label':i18next.t("DEFINE_MESSAGE_BUTTON_OK")}, options));
    _setZindex(alertify.alert());

    // alertify.confirm().setting(_.extend({'labels':{ok:bomLocale.getText("confirm"), cancel:bomLocale.getText("cancel")}}, options));
    alertify.confirm().setting(_.extend({'labels':{ok:i18next.t("DEFINE_MESSAGE_BUTTON_OK"), cancel:i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL")}}, options));
    _setZindex(alertify.confirm());

    alertify.dialog('mapClickConfirm', function() {
			var settings;
			return {
				setup: function() {
					var settings = alertify.confirm().settings;
					for (var prop in settings){
		        		this.settings[prop] = settings[prop];
					}

					var setup = alertify.confirm().setup();
					setup.buttons = [
						{text: i18next.t("DEFINE_CATEGORY_MID_BUTTON_NAVI"), className:'navi'},
						// {text: i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL"), className:'path'},
						{text: i18next.t("DEFINE_PUBLIC_TRANSPORT"), className:'path'},
						{text: i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL"), key:27/*Esc*/ , className:'cancel'}];

					setup.options = _.extend(options, {'maximizable':false});
					return setup;
		    	},
		    	settings: {
					oncontinue: null
				},
				callback: function(closeEvent) {
					if (closeEvent.index === 2) {
						if (typeof this.get('oncontinue') === 'function') {
							const returnValue = this.get('oncontinue').call(this, closeEvent);
							if (typeof returnValue !== 'undefined') {
								closeEvent.cancel = !returnValue;
							}
						}
					} else {
						alertify.confirm().callback.call(this, closeEvent);
					}
				}
			};
		}, false, 'confirm');

    _setZindex(alertify.mapClickConfirm());

    alertify.dialog('mapClickConfirm2', function() {
      var settings;
      return {
        setup: function() {
          var settings = alertify.confirm().settings;
          for (var prop in settings){
            this.settings[prop] = settings[prop];
          }

          var setup = alertify.confirm().setup();
          // setup.buttons = [
          //   {text: i18next.t("DEFINE_CATEGORY_MID_BUTTON_NAVI"), className:'navi'},
          //   // {text: i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL"), className:'path'},
          //   {text: i18next.t("DEFINE_PUBLIC_TRANSPORT"), className:'path'},
          //   {text: i18next.t("DEFINE_MESSAGE_BUTTON_CANCEL"), key:27/*Esc*/ , className:'cancel'}];

          setup.buttons = [];

          setup.options = _.extend(options, {'maximizable':false});
          return setup;
        },
        settings: {
          oncontinue: null
        },
        callback: function(closeEvent) {
          if (closeEvent.index === 2) {
            if (typeof this.get('oncontinue') === 'function') {
              const returnValue = this.get('oncontinue').call(this, closeEvent);
              if (typeof returnValue !== 'undefined') {
                closeEvent.cancel = !returnValue;
              }
            }
          } else {
            alertify.confirm().callback.call(this, closeEvent);
          }
        }
      };
    }, false, 'confirm');

    $(alertify.mapClickConfirm2().elements.footer).remove();
    $(alertify.mapClickConfirm2().elements.body).on("click", "#msgKakaoNavi, #msgLocation, #msgPublicTransit, #msgClose", (e)=> {
      const id = $(e.target).attr("id") || $(e.target).parents("#msgKakaoNavi").attr("id");
      const key = $(e.target).parents("#msgBtns").data("key");
      const data = publicObj.openMsg[key].data;

      if(id === "msgKakaoNavi") {
        NoblMap.kakaoNavi(Manage.lang.trans("DEFINE_KAKAO_SELECTED"), data.lat, data.lng);
      }else if(id === "msgLocation") {
        const zoom = 20;
        if(NoblMap.map.getMapTypeId() !== "roadmap") {
          Manage.infosMng.set("changeZoom", zoom);
        }
        NoblMap.setCenterZoom(data.lat, data.lng, zoom);

        setTimeout(()=>{
          NoblMap.CustomMarkers.addClickGroupMarker([{lat:data.lat, lng:data.lng}]);
        }, 500);
      }else if(id === "msgPublicTransit") {
        NoblMap.publicTransportationDirections(data.lat, data.lng);
      }

      publicObj.openMsg[key].close();
      delete publicObj.openMsg[key];
    });
    _setZindex(alertify.mapClickConfirm2());
  };


  publicObj.alert = function(msg, callback, params, isNoModal){
		if(isNoModal){
			alertify.alert("", msg, callback).set({'modal':false, 'pinnable':false}) ;
		}else if(params){
			alertify.alert("", msg, callback).set(params) ;
		}else{
			alertify.alert("", msg, callback).set({'modal':true}) ;
		}
	};

	publicObj.confirm = function(msg, callback, params){
		alertify.confirm(msg, callback).set(params) ;
  };

  publicObj.navi = function(msg, func1, func2, params){
    if(params) {
      alertify.mapClickConfirm(msg, func1, func2).set(params);
    }else{
      alertify.mapClickConfirm(msg, func1, func2);
    }
  };

  const setMsg = function(msg, id) {
    console.log(id);
    msg = msg + '<br/><br/>';
    msg += '<div id="msgBtns" data-key="'+id+'">';
    msg += '<p class="row">';
    msg += '<button class="col button button-big button-round button-fill kakaoNavi" id="msgKakaoNavi"><img src="'+ Manage.mng.getImgPath() +'buttons/kakao/navi/kakaonavi_btn_small.png" /><span>'+Manage.lang.trans("DEFINE_CATEGORY_MID_BUTTON_NAVI")+'</span></button>';
    msg += '<button class="col button button-big button-round button-fill" id="msgLocation">'+Manage.lang.trans("DEFINE_CATEGORY_MID_BUTTON_LOCATION")+' </button>';
    msg += '</p>';
    msg += '<p class="row" style="margin-top: 10px;">';
    msg += '<button class="col button button-big button-round button-fill" id="msgPublicTransit">'+ Manage.lang.trans("DEFINE_PUBLIC_TRANSPORT") +'</button>';
    msg += '<button class="col button button-big button-round button-fill color-gray" id="msgClose">'+Manage.lang.trans("DEFINE_MESSAGE_BUTTON_CANCEL")+'</button>';
    msg += '</p>';
    msg += '</div>';
    return msg;
  };

  function randomId4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }

  publicObj.openMsg = {};
  publicObj.navi2 = function(msg, data){
    const id= randomId4();
    publicObj.openMsg[id] = alertify.mapClickConfirm2(setMsg(msg, id));
    publicObj.openMsg[id].data = data;
  };

  return publicObj;
}());

export default Alert;
