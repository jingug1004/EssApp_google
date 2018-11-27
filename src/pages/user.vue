<template>
	<f7-page id="userLogs">
		<f7-navbar>
			<f7-nav-left><f7-link> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link></f7-nav-left>
			<f7-nav-title id="menuTitle"> {{ $t("DEFINE_USER")}} </f7-nav-title>
  		<f7-nav-right>
					<f7-link @click="popupClose"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
  		</f7-nav-right>
		</f7-navbar>
    <div>
      <div class="marginTop0 userTitle block-title "> {{$t("DEFINE_DEFAULT_INFO")}} </div>
      <f7-list>
        <ul>
	        <li class="media-item" style="top: 0px;">
	        	<a class="item-link item-content">
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title"> {{$t("DEFINE_USER_INFO")}} </div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </f7-list>
      <div class="userTitle block-title"> {{$t("DEFINE_COURSE_INFO")}} </div>
      <f7-list>
        <ul>
          <li class="media-item" style="top: 0px;">
            <a :href="'/trekCourseList'" class="item-link item-content" data-view=".popup-trek-view" @click="popupOpen">
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title"> {{$t("DEFINE_COURSE_RECORD")}} </div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
          <li class="media-item" style="top: 0px;">	        	
						<a :href="'/CompCertList'" class="item-link item-content" data-view=".popup-trek-view" @click="popupOpen">
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title"> {{$t("DEFINE_COURSE_COMPLETE")}} </div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </f7-list>
      <div class="block">
        <p class="row">
          <button class="col button button-big button-fill popup-close" @click="logout">{{$t("DEFINE_USER_LOGOUT")}}</button>
        </p>
      </div>
    </div>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		return {
			ImgPath : Manage.mng.getImgPath(),
		};
	},
  mounted() {
    $$("#userLogs").parents(".popup").on("popup:close", () => {
      NoblMap.showMarkers();
    });
  },
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-menu"));
  	},
    popupOpen() {
      Manage.mng.openPopup($$("#popup-trek"));
    },
    logout() {
      Ajax.run({url:"/user/logout", method:"POST", data:{uid:Manage.cookie.getUid()}, token:true}, function(data){
        if(!data.ecode) {
          Manage.cookie.clearUser();
          Manage.toast.autoClose(Manage.lang.trans("DEFINE_USER_MSG_LOGOUT"), "success");
        }
  		});
    }
  }
}
</script>
