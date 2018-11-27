<template>
  <f7-page>
    <Loading v-if="loadingPage" />
    <div id="content" class="overflowHidden">
      <div id="map"></div>
      <div id="fabArea" v-if="!loadingPage">
        <SearchBar />
        <Buttons />
        <Bottoms />
      </div>
    </div>
    <Actionbar />
    <BusStationSheet />
    <MetroSheet />
    <CultureEventSheet />
    <TrekCourseListSheet />
    <VisitorLogSheet />
  </f7-page>
</template>
<script>
import GMap from '@/js/GoogleMap';
import SearchBar from '@/pages/home_searchBar';
import Bottoms from '@/pages/home_bottoms';
import Buttons from '@/pages/home_buttons';
import Actionbar from '@/pages/home_actionbar';
import BusStationSheet from '@/pages/home_BusStationSheet';
import MetroSheet from '@/pages/home_MetroSheet';
import CultureEventSheet from '@/pages/home_CultureEventSheet';
import TrekCourseListSheet from '@/pages/TrekCourseListSheet';
import VisitorLogSheet from '@/pages/visitorLogSheet';
import Loading from '@/pages/loading';
window.NoblMap = GMap;

export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      loadingPage: true
    }
  },
  created() {
    const that = this;
    setTimeout(() => {
      that.loadingPage = false;
      that.eventPopup();
    }, 3000);
  },
  watch: {
    loadingPage: function(val){
      console.log(val);
    }
  },
  mounted() {
    const that = this;
    const mapAreaId = "map";
    $$("#map").css({"height": ( innerHeight + 30 )+"px", "width": ( innerWidth )+"px"});
    $$("#map").parent().css({"height": ( innerHeight )+"px", "width": ( innerWidth )+"px"});
    NoblMap.init(mapAreaId).then(()=>{});
    setLocale();

    //
    window.addEventListener("wheel", Manage.mng._.debounce((e) => {
      Manage.infosMng.set("zoomEvent", "mouse_wheel");
      const $ = Manage.mng.$;
      if(!($(".sheet-backdrop, .popup-backdrop").filter(".backdrop-in").is(":visible") || $(".panel-left").is(".panel-active"))) {
        that.fix_zoom_change(e.wheelDelta > 0 ? 1 : -1);
      }
    }, 100));

    document.addEventListener('touchstart', (e) => {
      if(e.touches.length === 2) {
        Manage.infosMng.set("touch.start", e.touches);
        Manage.infosMng.set("zoomEvent", "touch");
      }
    });

    document.addEventListener('touchmove', (e) => {
      if(e.touches.length === 2) {
        Manage.infosMng.set("touch.move", e.touches);
      }
    });

    document.addEventListener('touchend', () => {
      setTimeout(()=>{
        Manage.infosMng.del("touch.start");
        Manage.infosMng.del("touch.move");
      }, 1000);
    });
    // this.eventPopup();
    setTimeout(()=>{that.stopPage();}, 5000);
  },
  methods: {
    fix_zoom_change(changeNum) { // zoom이 안 바뀔 때가 있다. 안바뀌고 있으면 바꿔줌. mapType의 zoom 범위에 포함되고 이전 zoom과 현재 줌이 같으면. 강제!!
      const zoom = NoblMap.map.getZoom(),
            mapType = NoblMap.map.mapTypes[NoblMap.map.mapTypeId];
      if(mapType.minZoom < zoom && mapType.maxZoom > zoom && NoblMap.infos.beforeZoom === zoom) {
        console.log("move!!");
        NoblMap.zoomChange(changeNum);
      }
    },
    eventPopup() {
      Ajax.run({url:"/map/events/"+Manage.lang.isLang()}, (data) => {
        const eventNotOpenIds = JSON.parse(Manage.cookie.get("eventNotOpenIds")||"[]");
        if(data.list.length > 0 ) {
          Manage.mng._.each(data.list, (event) => {
            if(Manage.mng._.indexOf(eventNotOpenIds, event.eid) === -1) {
              Manage.toast.eventClose(event.name, "info", {onclick:()=>{
                  Manage.infosMng.set("eventData.event", event);
                  Manage.mng.goPage(".popup-event-view", "/event/event");
                  Manage.mng.openPopup($$("#popup-event"));
              }});
            }
          });
        }
      });
    },
    stopPage() {
      Manage.mng.$(window).on("beforeunload", function(e){
        return true;
      });
    }
  },
  components: {
    SearchBar, Bottoms, Buttons, BusStationSheet, CultureEventSheet, TrekCourseListSheet, Actionbar, VisitorLogSheet, MetroSheet, Loading
  }
}
</script>
