<template>
	<f7-page id="menuList">
    <f7-navbar>
      <f7-nav-left> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-nav-left>
  		<f7-nav-title id="menuTitle"> {{ title }} </f7-nav-title>
    	<f7-nav-right>
        <f7-link @click="popupClose">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <div v-if="dulle" style="padding:40px 10px 0 10px;">
      <button class="col button button-big button-round button-fill" :data-tcid="dulle.tc_id" :data-cname="dulle.course_name" @click="trekCourse">{{$t("DEFINE_DULLEGIL")}}</button>
    </div>
		<f7-list id="search-list" class="searchbar-found" media-list virtual-list :virtual-list-params="{ items, height: 63, searchAll, renderExternal }">
      <ul>
	      <li class="media-item" style="top: 0px;" v-for="(item, key) in items" :key="key">
	        <a :href="'/menuDetail/'+item.pid" class="item-link item-content" data-view=".popup-menu-detail-view" @click="popupOpen">
            <div class="item-media">
              <img v-if="!item.image" :src="ImgPath+'images/blank.jpg'" />
              <img v-else :src="ImgUrl+'/places/' + item.pid +'/'+ item.image" style="" slot="media"/>
            </div>
        		<div class="item-inner">
        			<div class="item-title-row">
        				<div class="item-title">{{ item.name }}</div>
        				<div class="item-after"></div>
        			</div>
        			<div v-if="!!item.text" class="item-text"> {{ item.text }} </div>
               <div v-else class="item-text">
                 <div>{{ item.address }}</div>
                 <div>{{ item.phone }}</div>
               </div>
        		</div>
          </a>
        </li>
      </ul>
    </f7-list>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		const cid = this.$f7route.params.cid.toNum();
		return {
			ImgPath : Manage.mng.getImgPath(),
			ImgUrl: Manage.mng.getImgUrl(),
			title : categoryMap.get(cid).title,
			cid : cid,
			items :[],
      dulle: "",
			vlData: {}
		};
	},
  created() {
  	const that = this;
    Ajax.promiseAll([
      Ajax.getPromise2({url:"/map/mappedPlaces/"+ that.cid +"/"+ Manage.lang.isLang()}),
      Ajax.getPromise2({url:"/leisure/trek/course/cid", method:"POST", data:{cid: that.cid}})
    ]).then(function(datas) {
      const br = '<br>',
            emptySpace = " ";

      that.items = datas[0].list.map((place) => {
        if(place.images) {
          place.image = JSON.parse(place.images)[0];
        }
        if(place.name.indexOf(br) > -1) {
          place.name = place.name.split(br).join(emptySpace);
        }
        return place;
      });

      if(datas[1].list){
        that.dulle = datas[1].list[0];
        $$("#search-list").css("margin-top", "5px");
      }
    });
  },
  mounted() {
    Manage.mng.stopPullToRefresh($$("#menuList .page-content"));
    $$("#menuList").parents(".popup").on("popup:close", function() {
      NoblMap.showMarkers();
    });


  },
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-menu"));
  	},
  	popupOpen() {
  		// Manage.mng.getPopup().open($$("#popup-menu-detail"), false);
			Manage.mng.openPopup($$("#popup-menu-detail"));
  	},
  	searchAll(query, items) {
			let found = [];
			for (let i = 0, n=items.length; i < n; i += 1) {
		    if (items[i].title.toLowerCase().indexOf(query) >= 0 || query.trim() === '') found.push(i);
			}
			return found; // return array with mathced indexes
		},
		renderExternal(vl, vlData) {
			this.vlData = vlData;
		},
    trekCourse(e) {
		  const that = this,
            target = $$(e.target);

      NoblMap.Trek.makeTrekCourse(target.data("tcid"), target.data("cname"), () => {
        that.popupClose();
      });
    }
  }
}
</script>
