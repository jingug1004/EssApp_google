<template>
  <div class="fab fab-left-top searchBar">
    <f7-navbar>
       <f7-nav-left>
         <a href="#" data-panel="left" class="panel-open icon-only link">
           <img :src='ImgPath + "images/menu.png"' style="width: 24px;" />
         </a>
       </f7-nav-left>

       <div class="searchbar-backdrop"></div>
         <div class="searchbar flex1">
           <div class="searchbar-inner">
             <div class="searchbar-input-wrap">
               <input type="search" name="searchValue" data-i18n="DEFINE_FIND_INPUT_PLACEHOLDER.placeholder" @keyup.enter="search">
               <i class="searchbar-icon "></i>
               <span class="input-clear-button" @click="clearMarkers"></span>
             </div>
             <span class="searchbar-disable-button">X</span>
           </div>
         </div>
     </f7-navbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      markerLimit: 15
    }
  },
  methods: {
    search() {
      const that = this;
      const v = encodeURIComponent($$("[name=searchValue]").val().trim());
      if(v) {
        Ajax.run({url:"/map/search?lang=" + Manage.lang.isLang() + "&v="+v}, (result) => {
          if(result.list) {
            NoblMap.map.setZoom(Manage.infosMng.get("imapData.area.minZoom"));
            NoblMap.CustomMarkers.addMarkerGroupMarker("search", Manage.mng._.sampleSize(result.list, that.markerLimit));
            Manage.infosMng.set("search.allDatas", result.list);
            Manage.infosMng.set("search.limit", that.markerLimit);
            NoblMap.addPictograms_debounce();
          }else{
            Manage.msg.alert(Manage.lang.trans("DEFINE_NO_RESULTS"));
          }
        });
        $$("[name=searchValue]").blur();
      }
    },
    clearMarkers() {
      const searchMarkersName = "markers.groupMarkers.markers.search";
      Manage.infosMng.get(searchMarkersName).onRemove();
      Manage.infosMng.del(searchMarkersName);
      Manage.infosMng.del("search");
    }
  }
}
</script>
