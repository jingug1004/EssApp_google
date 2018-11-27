<template>
  <div>
    <div id="actions" class="actions-modal actions-grid">
      <div id="tab1">
        <div v-for="(group, key) in actionMenus" :key="key" :class="'actions-group btn'+rowBtnNum">
          <div v-for="(menu, key2) in group" :key="key2" :class="'actions-button '+(menu.children?'':'actions-close')" :data-cid="menu.cid">
            <div class="actions-button-media">
              <img :src="ImgUrl + '/category/' + menu.cid +'/'+ menu.icon_url"/>
            </div>
            <div class="actions-button-text">{{ $t(menu.title) }}</div>
          </div>
        </div>
      </div>
      <div id="tab2">
      </div>
    </div>
    <div class="actions-backdrop"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rowBtnNum : 5,
      markerLimit : 15,
      ImgPath : Manage.mng.getImgPath(),
      ImgUrl: Manage.mng.getImgUrl(),
      actionMenus : []
    }
  },
  created() {
		const that = this;
		Manage.mng.fnRecursive(50, () => NoblMap.infos.categorys, () => {
      that.actionMenus = that.getCategoryActionMenus(that.rowBtnNum);
    });
  },
  mounted(){
    let that = this;
    $$("#actions").on("actions:open", function(e) {
      // $$("#actions .actions-group").addClass("btn"+that.rowBtnNum);
    });

    $$("#actions").on("click", ".actions-button", function(){
      const cid = $$(this).data("cid");
      if(cid === "back") {
        $$("#actions #tab1").show();
        $$("#actions #tab2").empty().hide();
      }else{
        const category = categoryMap.get(Number(cid));
        if(category.children) {
          that.setTab2(category);
        }else{
          that.makeMarkers(category);
        }
      }
    });
  },
  methods: {
    getCategoryActionMenus(num) {
      let groups = [],
          group = [],
          idx = 0;

      const categoryArr = NoblMap.infos.categorys.filter((cate) => {
        return !(cate.children && (cate.children[0].link || cate.children[0].help_file));
      });

      Manage.mng._.each(categoryArr, (menu) => {
        group.push(menu);
        if(idx++ % num === num -1) {
          groups.push(group);
          group = [];
        }
      });
      if(idx-1 % num !== num -1) {
        groups.push(group);
      }

      return groups;
    },
    setTab2(menu) {
      let tab2Html = [],
          tempHtml = '';
      tempHtml += '<div class="actions-button" data-cid="back">';
        tempHtml += '<div class="actions-button-media">';
          tempHtml += '<img src="'+this.ImgPath+'images/back.svg">';
        tempHtml += '</div>';
        tempHtml += '<div class="actions-button-text">'+ Manage.lang.trans("DEFINE_ACTIONBAR_BACK") +'</div>';
      tempHtml += '</div>';
      tab2Html.push(tempHtml);

      Manage.mng._.each(menu.children, (child) => {
        tempHtml = '';
        tempHtml += '<div class="actions-button actions-close" data-cid="'+child.cid+'">';
          tempHtml += '<div class="actions-button-media">';
            tempHtml += '<img src="' + this.ImgUrl + '/category/' + child.cid +'/'+ child.icon_url +'"/>';
          tempHtml += '</div>';
          tempHtml += '<div class="actions-button-text">'+ child.title +'</div>';
        tempHtml += '</div>';
        tab2Html.push(tempHtml);
      });

      $$("#actions #tab2").html('<div class="actions-group btn'+tab2Html.length+'">'+tab2Html.join("")+'</div>');

      $$("#actions #tab1").hide();
      $$("#actions #tab2").show();
    },
    makeMarkers(menu) {
      const that = this;
      Ajax.run({url:"/map/mappedPlaces/"+menu.cid+"/"+Manage.lang.isLang()}, (result)=>{
        if(result.list) {
          const infosMng = Manage.infosMng;
          Manage.toast.clickPrevToast("actionBarToast");
          // $$(".searchbar input").val(menu.title).addClass("input-with-value").blur();
          NoblMap.map.setZoom(Manage.infosMng.get("imapData.area.minZoom"));

          NoblMap.CustomMarkers.addMarkerGroupMarker("action", Manage.mng._.sampleSize(result.list, that.markerLimit));
          infosMng.set("action.allDatas", result.list);
          infosMng.set("action.limit", that.markerLimit);
          NoblMap.addPictograms_debounce();
          Manage.toast.clickClose(Manage.lang.trans("DEFINE_MAP_LEGEND")+" - " + menu.title, "success", {id:"actionBarToast", onclick:()=>{
            const searchTypeMarkerKey = "markers.groupMarkers.markers.action";
            if(infosMng.has(searchTypeMarkerKey)) {
              infosMng.get(searchTypeMarkerKey).onRemove();
              infosMng.del(searchTypeMarkerKey);
              infosMng.del("action");
            }
          }});
        }else{
          Manage.msg.alert(Manage.lang.trans("DEFINE_NO_RESULTS"));
        }
      });
    }
  }
}
</script>
