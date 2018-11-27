<template>
	<f7-page>
		<f7-navbar>
			<f7-nav-left style="color:#F7F7F8;">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</f7-nav-left>
			<f7-nav-title id="menuTitle"> {{ $t("DEFINE_TREK_COURSE_RECORD") }} </f7-nav-title>
  		<f7-nav-right>
    			<f7-link @click="popupClose">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</f7-link>
  		</f7-nav-right>
		</f7-navbar>
    <div>
      <div class="marginTop0 userTitle block-title"> {{$t("DEFINE_TREK_COURSE_RECORD_PART")}} </div>
      <f7-list>
        <ul>
	        <li class="media-item" style="top: 0px;" v-for="(item, key) in items" :key="key">
	        	<a :href="'/trekCourseHistory/'+item.tc_id" class="item-link item-content" data-view=".popup-trek-course-view" @click="popupOpen" >
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title">{{ item.course_name }}</div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </f7-list>
    </div>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		return {
			ImgPath : Manage.mng.getImgPath(),
			items :[],
		};
	},
  created() {
  	const that = this;
		Ajax.run({url:"/leisure/trek/course/list", method:"POST", data:{page:0, count:0}, token:true}, function(data){
			that.items = data.list;
			NoblMap.infos.trekCourse = data.list;
		});
  },
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-trek"));
  	},
    popupOpen() {
      Manage.mng.openPopup($$("#popup-trek-course"));
    },
  }
}
</script>
