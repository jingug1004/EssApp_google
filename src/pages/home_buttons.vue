<template>
  <div>
    <div class="fab fab-right-top btn">
      <a href="#" class="reduce-home-button">
        <img :src='ImgPath+"images/more.svg"' class="imgLevel4 topBtn"/>
        <img :src='ImgPath+"images/close.svg"' class="imgLevel4 topBtn opacity0"/>
      </a>
      <div class="fab-buttons fab-buttons-left fab-buttons-reduce-size">
        <a class="fab-close reduce-home-button01s" @click="website">
          <img :src='ImgPath+"images/internet.svg"' class="imgLevel2">
        </a>
        <a class="reduce-home-button01s" @click="trekking">
          <img :src='ImgPath+"images/icon_course_track.svg"' class="imgLevel2">
        </a>
        <a class="fab-close reduce-home-button01s reduce-home-button01s-fontsize popover-open" data-popover=".popover-language" @click="selectLanguage">
          {{ $t("DEFINE_LANGUAGE") }}
        </a>
      </div>
    </div>

    <div class="fab fab-center-center color-green" slot="fixed">

    </div>

    <div class="fab fab-right-top btn2 actions-open" data-actions="#actions">
      <a href="#" class="reduce-home-button">
        <img :src='ImgPath+"images/map_marker_icon.svg"' class="imgLevel1" />
      </a>
    </div>

    <div class="fab fab-right-top btn3" @click="mygps">
      <a href="#" class="reduce-home-button">
        <img :src='ImgPath+"images/navigation.svg"' class="imgLevel4"/>
      </a>
    </div>

    <div class="fab fab-right-top btn4" @click="setCenter">
      <a href="#" class="reduce-home-button"><img :src='ImgPath+"images/home.svg"' class="imgLevel3"></a>
    </div>

    <div class="fab fab-right-top btn5"  @click="zoomIn">
      <a href="#" class="reduce-home-button">
        <img :src='ImgPath+"images/add.svg"' class="imgLevel4"/>
      </a>
    </div>

    <div class="fab fab-right-top btn6" @click="zoomOut">
     <a href="#" class="reduce-home-button">
       <img :src='ImgPath+"images/remove.svg"' class="imgLevel4" />
     </a>
   </div>

    <f7-popover class="popover-language">
      <f7-list>
        <f7-list-item :title='getLangTitle()'></f7-list-item>
        <f7-list-item @click="changeLang" class="popover-close pointer" :title='getLangName(lang)' :data-lang='lang' v-for="(lang, key) in language" :key="key"></f7-list-item>
      </f7-list>
    </f7-popover>
  </div>
</template>

<script>
export default {
  data() {
    const languageMap = new Map();
    languageMap.set("ko", "Korean");
    languageMap.set("en", "English");
    languageMap.set("cn", "Chinese");
    languageMap.set("jp", "Japanese");
    return {
      ImgPath : Manage.mng.getImgPath(),
      language: GLOBAL_CONSTS.use_language.split(","),
      languageMap: languageMap
    }
  },
  methods: {
    zoomIn: function () {
      NoblMap.zoomChange(1);
    },
    zoomOut: function() {
      NoblMap.zoomChange(-1);
    },
    getLangTitle: function() {
      return Manage.lang.trans("DEFINE_LANGUAGE_SELECT");
    },
    getLangName: function(lang) {
      return this.languageMap.get(lang) + " (" +lang.toUpperCase()+ ")";
    },
    selectLanguage: function() {
      const popoverLang = Manage.mng.getPopover().get(".popover-language"),
            popoverLangEl = popoverLang.$el,
            left = (innerWidth - (popoverLangEl.css("width").pxRemoveNum())) / 2,
            top = (innerHeight - (popoverLangEl.css("height").pxRemoveNum())) / 2;

      popoverLang.open();
      popoverLangEl.css({"left":left+"px", "top":top+"px"});
    },
    changeLang: function(e) {
      changeLanguage($$(e.target).parents("[data-lang]").data("lang"));
    },
    mygps(){
      NoblMap.geolocation.getCurrentPosition();
    },
    setCenter(){
      const area = Manage.infosMng.get("imapData.area");
      NoblMap.setCenterZoom(area.lat, area.lng, area.minZoom);
      NoblMap.addPictograms_debounce();
    },
    trekking() {
      if(!Manage.infosMng.get("trekData.list")) {
        NoblMap.Trek.getCourseList().then((datas) => {
          Manage.infosMng.set("trekData.list", datas.list);
        });
      }

      Manage.mng.fnRecursive(30, ()=> !!Manage.infosMng.get("trekData.list"), () => {
        const datas = Manage.infosMng.get("trekData.list"),
              tc_id = Manage.infosMng.get("trekData.tc_id");

        let idx = (tc_id) ? Manage.mng._.findIndex(datas, {tc_id}) + 1 : 0;
        if(idx === datas.length) {
          idx = 0;
        }

        const data = datas[idx];
        NoblMap.Trek.makeTrekCourse(data.tc_id, data.course_name);
      })
    },
    website() {
      window.open(GLOBAL_CONSTS.site, "_blank");
    },
  }
}
</script>
