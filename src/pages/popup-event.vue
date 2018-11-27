<template>
  <div>
    <f7-navbar>
      <f7-nav-left> <f7-link> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link> </f7-nav-left>
      <f7-nav-title id="menuTitle"> {{eventData.name}} </f7-nav-title>
        <f7-nav-right>
          <f7-link @click="popupClose"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
      </f7-nav-right>
    </f7-navbar>
			<!--<div style="overflow:auto;height:98%">-->
    <f7-page id="eventDetail" :class="popupId">
      <f7-block v-if="eventData.image" style="text-align: center;margin-top:0;">
        <img :src="ImgUrl+'/events/' + eventData.eid +'/'+ eventData.image" draggable="false"/>
      </f7-block>

      <div class="block" v-if="eventData.text">
        <f7-block-title> {{ $t("DEFINE_CATEGORY_STITLE_DETAIL_INFO") }} </f7-block-title>
        <f7-block strong inset>
          <pre style="margin:0;">{{ eventData.text }}</pre>
        </f7-block>
      </div>

      <div class="block" v-for="(cf, key) in eventData.cf" :key="key">
        <f7-block-title> {{ cf.name }} </f7-block-title>
        <f7-block strong inset>
          <pre style="margin:0;" v-if="['홈페이지','homepage'].indexOf(cf.name) > -1" class="pointer" @click="website">{{ cf.value }}</pre>
          <pre style="margin:0;" v-else-if="['연락처', 'phone'].indexOf(cf.name) > -1" class="pointer" @click="phone">{{ cf.value }}</pre>
          <pre style="margin:0;" v-else>{{ cf.value }}</pre>
        </f7-block>
      </div>

      <div class="block" v-if="eventData.pid">
        <p class="row">
          <button class="col button button-big button-round button-fill" @click="position" :data-pid="eventData.pid"> {{$t("DEFINE_EVENT_RELATED_PLACE")}} </button>
        </p>
      </div>

      <div class="block">
        <label style="color: rgba(0, 0, 0, 0.54);">
          <input type="checkbox" style="transform:scale(1.5);" name="notOpen" :value="eventData.eid" /> &nbsp; {{$t("DEFINE_EVENT_NOTOPEN")}}
        </label>
      </div>

	  </f7-page>
  </div>
</template>
<script>
export default {
	data: function(){
		return {
      eventData: {},
      popupId: "",
			ImgPath : Manage.mng.getImgPath(),
			ImgUrl: Manage.mng.getImgUrl(),
		};
	},
	created() {
		const that = this;
    that.popupId = that.$f7route.params.popupid;
		that.eventData = Manage.infosMng.get("eventData."+that.popupId);
    that.eventData.cf = JSON.parse(that.eventData.cf);
  },
  mounted() {
	  const that = this;
    Manage.mng.stopPullToRefresh($$("#eventDetail."+that.popupId+" .page-content"));
    $$("#eventDetail."+that.popupId).parents(".popup").on("popup:open", function() {
      if($$("#popup-menu").css("display") === "none"){
        NoblMap.hideMarkers();
      }
    });
    $$("#eventDetail."+that.popupId).parents(".popup").on("popup:close", function() {
      if($$("#popup-menu").css("display") === "none" ){
        NoblMap.showMarkers();
      }
    });

  },
	methods: {
    	popupClose() {
    	  const that = this;
        const notOpen = $$("#eventDetail."+that.popupId+" [name=notOpen]");
    	  if(notOpen.prop("checked")) {
          const cookie = Manage.cookie,
                eid = notOpen.val().toNum(),
                eventNotOpenIds = JSON.parse(cookie.get("eventNotOpenIds") || "[]") ;

          eventNotOpenIds.push(eid);
          cookie.set("eventNotOpenIds", eventNotOpenIds, 1);
        }
    		Manage.mng.getPopup().close($$("#popup-"+that.popupId));
				setTimeout(() => {
					Manage.mng.getView($$(".popup-"+that.popupId+"-view")).history.pop();
				}, 200);
    	},
      phone() {
        location.href='tel:' + this.menuData.phone;
      },
      website(e) {
        let url = $$(e.target).text();
        if(!/^http/.test(url)) {
          url = "http://" + url;
        }
        window.open(url, "_blank");
      },
      viewpdf(e) {
        let url = $$(e.target).text();
        url = url.split("(").last().split(")").first();
        if(!/^http/.test(url)) {
          url = Manage.mng.getImgUrl()  + "/places/" + this.menuData.pid + "/"+ url;
        }
        window.open(url, "_blank");
      },
      position(e) {
        const pid = $$(e.target).data("pid"),
              lang = Manage.lang.isLang(),
              that = this;

        Ajax.run({url:"/map/places/detail/"+pid+"/"+lang}, (data)=>{
          const zoom = 18;
          Manage.infosMng.set("changeZoom", zoom);
          NoblMap.map.setZoom(zoom);
          NoblMap.map.setCenter(new google.maps.LatLng(data.lat, data.lng));
          setTimeout(()=>{
            that.popupClose();
          }, 500);
        });
      }
    }
}
</script>
