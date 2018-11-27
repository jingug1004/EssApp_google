<template>
  <div>
    <f7-navbar>
      <f7-nav-left> <f7-link> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link> </f7-nav-left>
      <f7-nav-title id="menuTitle"> {{menuData.name}} </f7-nav-title>
        <f7-nav-right>
          <f7-link @click="popupClose"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
      </f7-nav-right>
    </f7-navbar>
			<!--<div style="overflow:auto;height:98%">-->
    <f7-page id="menuDetail" :style='"height:"+ menuDetailHeight'>
      <div class="block">
        <f7-swiper :init="false" pagination>
          <f7-swiper-slide v-for="(dt, key) in menuData.imageVideoDataArr" :key="key" >
            <img v-if="dt === 'blank.jpg'" :src="ImgPath+'images/' + dt" />
            <img v-else-if="/^image_/.test(dt)" :src="ImgUrl+'/places/' + menuData.pid +'/'+ dt" />
            <video v-else-if="/^video_/.test(dt)" :src="ImgUrl+'/places/' + menuData.pid +'/'+ dt" preload="metadata" controls/>
          </f7-swiper-slide>
        </f7-swiper>
      </div>
<!-- FAE001 -->
      <div class="block">
        <p class="row">
          <button class="col button button-big button-round button-fill kakaoNavi" @click="kakaoNavi"><img :src='ImgPath+"buttons/kakao/navi/kakaonavi_btn_small.png"' /><span>{{$t("DEFINE_CATEGORY_MID_BUTTON_NAVI")}}</span></button>
          <button class="col button button-big button-round button-fill" @click="location"> {{$t("DEFINE_CATEGORY_MID_BUTTON_LOCATION")}} </button>
        </p>
        <p class="row">
          <button class="col button button-big button-round button-fill" @click="publicTransit">{{$t("DEFINE_PUBLIC_TRANSPORT")}}</button>
          <button class="col button button-big button-round button-fill color-gray" data-popover=".popover-menu" v-if="menuData.trekCourses && menuData.trekCourses.length === 1" @click="trekCourse">{{$t("DEFINE_DULLEGIL")}}</button>
          <button class="col button button-big button-round button-fill color-gray" data-popover=".popover-menu" v-else>{{$t("DEFINE_DULLEGIL")}}</button>
        </p>
      </div>

      <div class="block" v-if="!!menuData.time">
        <f7-block-title>{{ $t("DEFINE_CATEGORY_STITLE_STORE_TIME") }}</f7-block-title>
        <f7-block strong inset>
          <p>{{ menuData.time }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="menuData.address && menuData.address.trim()">
        <f7-block-title>{{ $t("DEFINE_CATEGORY_STITLE_ADDRESS") }}</f7-block-title>
        <f7-block strong inset>
          <p>{{ menuData.address }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="menuData.others && menuData.others.length > 0">
        <f7-block-title> {{$t("DEFINE_RELATED_FILES")}} </f7-block-title>
        <f7-block strong inset>
          <p v-for="(other, key) in menuData.others" :key="key" class="pointer" @click="viewpdf">다운로드({{other}})</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.homepage">
        <f7-block-title> {{ $t("DEFINE_CATEGORY_STITLE_WEBSITE") }} </f7-block-title>
        <f7-block strong inset>
          <p class="pointer" @click="website">{{ menuData.homepage }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.phone">
        <f7-block-title> {{ $t("DEFINE_CATEGORY_STITLE_PHONE") }} </f7-block-title>
        <f7-block strong inset>
          <p class="pointer" @click="phone">{{ menuData.phone }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.etc">
        <f7-block-title> {{ $t("DEFINE_CATEGORY_STITLE_ETC_INFO") }} </f7-block-title>
        <f7-block strong inset>
          <p>{{ menuData.etc }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.text">
        <f7-block-title> {{ $t("DEFINE_CATEGORY_STITLE_DETAIL_INFO") }} </f7-block-title>
        <f7-block strong inset>
          <p >{{ menuData.text }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.manage_inst_nm">
        <f7-block-title> {{$t("DEFINE_MANAGEMENT_AGENCY")}} </f7-block-title>
        <f7-block strong inset>
          <p >{{ menuData.manage_inst_nm }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.open_tm_info ">
        <f7-block-title> {{$t("DEFINE_HOUR_OPERATION")}} </f7-block-title>
        <f7-block strong inset>
          <p >{{ menuData.open_tm_info }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="!!menuData.public_toilet">
        <f7-block-title> {{$t("DEFINE_UNISEX_PUBLIC_TOILET")}} </f7-block-title>
        <f7-block strong inset>
          <p >{{ (menuData.public_toilet === "Y")?$t("DEFINE_YES"):$t("DEFINE_NO") }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="table.indexOf('$table') > -1 " v-for="(table, key) in Object.keys(menuData)" :key="key">
        <f7-block-title> {{ getTableTitle(menuData[table]) }} </f7-block-title>
        <f7-block strong inset>
          <div class="pointer detailTableDiv" >{{ getTableCf(menuData[table]) }}</div>
        </f7-block>
      </div>

      <div class="block" v-if="ccf && menuData.ccv[key]" v-for="(ccf, key) in menuData.ccf" :key="key">
        <f7-block-title> {{ ccf }} </f7-block-title>
        <f7-block strong inset>
          <p v-if="['홈페이지','homepage'].indexOf(ccf) > -1" class="pointer" @click="website">{{ menuData.ccv[key] }}</p>
          <p v-else>{{ menuData.ccv[key] }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="cf && menuData.cv[key] && ['w','h','text_direction', 'display_zoom_max', 'name_display'].indexOf(cf) === -1" v-for="(cf, key) in menuData.cf" :key="key">
        <f7-block-title v-if="cf.indexOf('$table') > -1"> {{ getTableTitle(menuData.cv[key]) }} </f7-block-title>
        <f7-block-title v-else> {{ cf }} </f7-block-title>
        <f7-block v-if="/^cv_/.test(menuData.cv[key])" strong inset class="center-block">
          <img v-if="isImage(menuData.cv[key])" :src="ImgUrl+'/places/' + menuData.pid +'/'+ menuData.cv[key]" @click="popImage" />
          <video v-else-if="isVideo(menuData.cv[key])" :src="ImgUrl+'/places/' + menuData.pid +'/'+ menuData.cv[key]" preload="metadata" controls></video>
        </f7-block>
        <f7-block v-else strong inset>
          <p v-if="['홈페이지','homepage'].indexOf(cf) > -1" class="pointer" @click="website">{{ menuData.cv[key] }}</p>
          <p v-else-if="['연락처', 'phone'].indexOf(cf) > -1" class="pointer" @click="phone">{{ menuData.cv[key] }}</p>
          <p v-else-if="cf.toLowerCase().indexOf('pdf') > -1" class="pointer" @click="viewpdf">{{ menuData.cv[key] }}</p>
          <div v-else-if="cf.indexOf('$table') > -1" class="pointer detailTableDiv" >{{ getTableCf(menuData.cv[key]) }}</div>
          <p v-else>{{ menuData.cv[key] }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="menuData.hits">
        <f7-block-title>{{ $t("DEFINE_DETAIL_HITS") }}</f7-block-title>
        <f7-block strong inset>
          <p>{{ menuData.hits }}</p>
        </f7-block>
      </div>

      <div class="block" v-if="menuData.update_dt">
        <f7-block-title> {{$t("DEFINE_DETAIL_MODIFIED")}} </f7-block-title>
        <f7-block strong inset>
          <p>{{ menuData.updateDt }}</p>
        </f7-block>
      </div>

      <f7-popover class="popover-menu" v-if="menuData.trekCourses && menuData.trekCourses.length > 1">
        <f7-list>
          <f7-list-item link="#" @click="trekCourse" popover-close :title='course.course_name' :data-tc_id='course.tc_id' v-for="(course, key) in menuData.trekCourses" :key="key"></f7-list-item>
        </f7-list>
      </f7-popover>
	  </f7-page>
    <div v-if="isAndroid" class="android-onlyClose">
      <span @click="popupClose">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</span>
    </div>
  </div>
</template>
<script>
export default {
	data: function(){
    // const isAndroid = Manage.mng.getDevice().android;
    const isAndroid = false;
		return {
			menuData: {},
			ImgPath : Manage.mng.getImgPath(),
			ImgUrl: Manage.mng.getImgUrl(),
      isAndroid,
      menuDetailHeight: isAndroid?"96%":"100%"
		};
	},
	created() {
		const that = this,
  		  pid = that.$f7route.params.pid,
  		  lang = Manage.lang.isLang();

		if(pid.indexOf("toilet") > -1) {
      that.menuData = Manage.infosMng.get("toilet.detailInfo");
      that.menuData.images = ["blank.jpg"];
      that.menuData.imageVideoDataArr = Manage.mng._.concat(that.menuData.images);
    }else if(pid.split(".").length === 1) {
      Ajax.promiseAll([Ajax.getPromise2({url:"/map/places/detail/"+pid+"/"+lang}), Ajax.getPromise2({url:"/leisure/trek/group", method:"POST", data:{pid}})]).then(function(datas) {
        const data = datas[0];
        if(datas[1].list) {
          data.trekCourses = datas[1].list;
          if(data.trekCourses.length > 1) {
            $$(".button.color-gray").addClass("popover-open").addClass("color-green").removeClass("color-gray");
          }else{
            $$(".button.color-gray").removeClass("popover-open").addClass("color-green").removeClass("color-gray");
          }
        }else{
          $$(".button.color-gray").removeClass("popover-open");
        }
        Manage.mng._.each(["cv","cf", "ccv", "ccf", "images", "videos", "others"], (name) => {
          if(data[name]) {
            data[name] = JSON.parse(data[name]);
          }
        });
        data.imageVideoDataArr = Manage.mng._.concat(data.images||["blank.jpg"], data.videos || []);
        console.log(data);
        that.menuData = data;
        that.menuData.tempName = that.menuData.name;
        that.menuData.name = that.menuData.name.split("<br>").join(" ");
        if(!that.menuData.images) {
          that.menuData.images = ["blank.jpg"];
        }
        if(data.update_dt) {
          that.menuData.updateDt = Manage.moment(new Date(data.update_dt).minus("hour", 9)).locale(Manage.lang.isLang()).format("lll");
        }
      });
		}else if(pid.split(".").length === 2){
			const ids = pid.split(".");
			const spotPid = Number(ids[1]);

      Ajax.run({url:"/map/spotDetail/"+spotPid+"/" + lang}, (data) => {
        that.menuData = data;
        that.menuData.tempName = that.menuData.name;
        that.menuData.name = that.menuData.name.split("<br>").join(" ");
        if(!that.menuData.images) {
          that.menuData.images = ["blank.jpg"];
        }
        that.menuData.imageVideoDataArr = Manage.mng._.concat(that.menuData.images);
        $$(".button.color-gray").removeClass("popover-open");
      });
			// that.menuData = NoblMap.infos.spots[ids[0]].filter((data) => data.pid === spotPid)[0];
      // that.menuData.tempName = that.menuData.name;
      // that.menuData.name = that.menuData.name.split("<br>").join(" ");
      // that.menuData.images = ["blank.jpg"];
      // $$(".button.color-gray").removeClass("popover-open");
		}
  },
  mounted() {
	  const that = this;

    Manage.mng.stopPullToRefresh($$("#menuDetail .page-content"));
    $$("#menuDetail").parents(".popup").on("popup:open", function() {
      if($$("#popup-menu").css("display") === "none"){
        NoblMap.hideMarkers();
      }
    });
    $$("#menuDetail").parents(".popup").on("popup:close", function() {
      if($$("#popup-menu").css("display") === "none" ){
        NoblMap.showMarkers();
      }
    });
    setTimeout(()=>{
      Manage.mng.getSwiper().create($$("#menuDetail .swiper-container"), {
        //loop:(that.menuData.imageVideoDataArr && that.menuData.imageVideoDataArr.length > 1)?true:false,
        loop: false,
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
        },
        on:{
          slideChange:function() {
            const wrapperChildren = this.$wrapperEl.children();
            function videoPlayPauseToggle (wrapperChildren, idx, type) {
              const videoTag = wrapperChildren.eq(idx).find("video");

              if(videoTag.length > 0) {
                if(type === "active") {
                  videoTag[0].play();
                }else{
                  videoTag[0].pause();
                }
              }
            }

            videoPlayPauseToggle(wrapperChildren, this.activeIndex, "active");
            videoPlayPauseToggle(wrapperChildren, this.previousIndex, "previous");
          }
        }
      });

      that.makeTableSet();
    }, 500);
  },
	methods: {
    	popupClose() {
        if(this.menuData.tempName) {
          this.menuData.name = this.menuData.tempName;
          delete this.menuData.tempName;
        }
    		Manage.mng.getPopup().close($$("#popup-menu-detail"));
				setTimeout(() => {
					Manage.mng.getView($$(".popup-menu-detail-view")).history.pop();
				}, 200);
        Manage.mng.getSwiper().destroy($$("#menuDetail .swiper-container"));
    	},
    	location() {
    	  const data = _.cloneDeep(this.menuData);
    		if(data.lng && data.lat) {
          Manage.toast.clickPrevToast("locationToast");
          const position = NoblMap.LatLng(data.lat, data.lng);
          NoblMap.CustomMarkers.addMarkerGroupMarker("detail", [data]);

          Manage.toast.clickClose(Manage.lang.trans("DEFINE_CATEGORY_MID_BUTTON_LOCATION"), "success", {id:"locationToast", onclick:()=>{
            const detailMarkerKey = "markers.groupMarkers.markers.detail";
            if(Manage.infosMng.has(detailMarkerKey)) {
              Manage.infosMng.get(detailMarkerKey).onRemove();
              Manage.infosMng.del(detailMarkerKey);
            }
          }});
					setTimeout(() => {
            const map = NoblMap.map;
			      map.panTo(position);
			      map.setZoom(data.display_zoom || map.getZoom());
            NoblMap.addPictograms_debounce();
			    }, 500);

    			this.popupClose();
    			if($$("#popup-menu").css("display") === "block" ){ // 메뉴리스트 팝업이 있으면 닫기.
						Manage.mng.getPopup().close($$("#popup-menu"));
    			}
    		}else{
          Manage.msg.alert(Manage.lang.trans("DEFINE_MSG_NODATA_GPS"));
    		}
    	},
      publicTransit() {
    	  const data = this.menuData;
        NoblMap.publicTransportationDirections(data.lat, data.lng);
        this.popupClose();
        if($$("#popup-menu").css("display") === "block" ){ // 메뉴리스트 팝업이 있으면 닫기.
          Manage.mng.getPopup().close($$("#popup-menu"));
        }
      },
    	kakaoNavi() {
    	  const data = this.menuData;
        if(data.lng && data.lat) {
          NoblMap.kakaoNavi(data.name, data.lat, data.lng, this.popupClose);
        }else{
          Manage.msg.alert(Manage.lang.trans("DEFINE_MSG_NODATA_GPS"));
        }
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
      } ,
			clearPopup() {
				$$("#menuTitle").empty();
			},
      trekCourse() {
    	  const that = this;

    	  let tc_id, course_name;

        if(that.menuData.trekCourses.length === 1) {
          const trekData = that.menuData.trekCourses[0];
          tc_id = trekData.tc_id;
          course_name = trekData.course_name;
        }else if(that.menuData.trekCourses.length > 1) {
          tc_id = $$(this).data("tc_id");
          course_name = $$(this).text();
        }
        NoblMap.Trek.makeTrekCourse(tc_id, course_name, () => {
          that.popupClose();
          if($$("#popup-menu").css("display") === "block" ){ // 메뉴리스트 팝업이 있으면 닫기.
            Manage.mng.getPopup().close($$("#popup-menu"));
          }
        });
      },
      getTableTitle(tableStr) {
        return Manage.table.makeTable(tableStr).title;
      },
      getTableCf(tableStr) {
        return Manage.table.makeTable(tableStr).table;
      },

      makeTableSet() {
        $$(".detailTableDiv").each(function() {
          const html = $$(this).text();
          $$(this).empty().html(html);
        });
      },
      isImage(fileStr) {
        fileStr = fileStr.toLowerCase();
        return ["bmp", "jpg", "jpeg", "png", "gif"].indexOf(fileStr.substr(fileStr.lastIndexOf(".") + 1)) > -1;
      },
      isVideo(fileStr) {
        fileStr = fileStr.toLowerCase();
        return ["mp4", "avi"].indexOf(fileStr.substr(fileStr.lastIndexOf(".") + 1)) > -1;
      },
      popImage(e) {
        window.open($$(e.target).attr("src"), "_blank");
      }
    }
}
</script>
