<template>
	<f7-page>
		<f7-navbar>
			<f7-nav-left><f7-link> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link></f7-nav-left>
			<f7-nav-title id="menuTitle"> 완주 인증서 </f7-nav-title>
  		<f7-nav-right>
        <f7-link @click="popupClose"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
  		</f7-nav-right>
		</f7-navbar>
    <div id="compCertDiv">
      <img :src="ImgPath + 'images/certification.svg'"/>
      <div class="certBorder">
        <div class="certTitle">둘레길 완주인증서</div>
        <div class="certTitleEng">Dulle-gil Trail Completion Certificate</div>
        <div class="certUserName">{{ $t('DEFINE_CERTIFICATE_NAME')}} <span id="userName"></span></div>
        <div class="certCourseName">{{ $t('DEFINE_CERTIFICATE_COURSE')}} <span id="courseName"></span></div>
        <div class="certNo">{{ $t('DEFINE_CERTIFICATE_NO')}} <span id="certNo"></span></div>
        <div class="certText">위 사람은 상기 둘레길을<br>완주하였기에 이 증서를 드립니다.</div>
        <div class="certTextEng">This certifies that the person whose name<br>appears above has completed<br>the Dulle-gil Trail</div>
        <div id="compDate"></div>
        <div id="mayor"></div>
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
  	const that = this;

    Manage.mng.fnRecursive(50, () => !!NoblMap.infos.compCertData, () => {
      const compCertData = NoblMap.infos.compCertData;
      delete NoblMap.infos.compCertData;
      console.log(compCertData);
      const compCertDiv = $$("#compCertDiv");
      compCertDiv.find("#userName").text(Manage.cookie.getName());
      compCertDiv.find("#courseName").text(compCertData.course_name);
      compCertDiv.find("#certNo").text(("00000000" + compCertData.cid).slice(-8));
      compCertDiv.find("#compDate").text(new Date(compCertData.issued_time).format('yyyy-MM-dd HH:mm:ss'));
      compCertDiv.find("#mayor").text(Manage.mng.getMayor());
    });
  },
  methods: {
		popupClose(e) {
			Manage.mng.getPopup().close($$("#popup-trek-course"));
    },
  }
}
</script>
