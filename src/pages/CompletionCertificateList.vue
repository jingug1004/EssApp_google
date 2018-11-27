<template>
	<f7-page>
		<f7-navbar>
			<f7-nav-left>
        <f7-link> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
      </f7-nav-left>
			<f7-nav-title id="menuTitle"> 완주 인증서 </f7-nav-title>
  		<f7-nav-right>
        <f7-link @click="popupClose"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
  		</f7-nav-right>
		</f7-navbar>
    <div>
      <div class="marginTop0 userTitle block-title"> 코스별 완주 인증서, 총 <span id="completeCnt">0</span>개 완주 </div>
      <f7-list v-if='items.length > 0'>
        <ul>
	        <li class="media-item" style="top: 0px;" v-for="(item, key) in items" :key="key">
						<a :href="'/CompCert'" class="item-link item-content" data-view=".popup-trek-course-view" @click="saveData" :data-cid="item.cid">
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title">{{ item.course_name + " - " + new Date(item.issued_time).format("yyyy년 MM월 dd일") }}</div>
                  <div class="item-after"></div>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </f7-list>
      <div v-else class="block-title textCenter"> {{ noData }} </div>
    </div>
	</f7-page>
</template>
<script>
export default {
	data: function(){
		return {
			ImgPath : Manage.mng.getImgPath(),
			items :[],
      noData:"완주 데이터가 없습니다."
		};
	},
  created() {
  	const that = this;
		Ajax.run({url:"/leisure/trek/cert", method:"POST", data:{uid:Manage.cookie.getUid()}, token:true}, function(data){
			console.log(data);
			if(data.ecode === 99998) {
				$$("#completeCnt").text(0);
			}else{
				$$("#completeCnt").text(data.list.length);
				that.items = data.list;
			}
		});
  },
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-trek"));
    },
    saveData(e) {
      const cid = $$(e.target).parents("a").data("cid").toNum();
      NoblMap.infos.compCertData = this.items.filter((item) => item.cid === cid)[0];
      Manage.mng.openPopup($$("#popup-trek-course"));
    }
  }
}
</script>
