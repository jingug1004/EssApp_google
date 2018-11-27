<template>
  <div>
    <f7-navbar>
      <f7-nav-left> <f7-link> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link> </f7-nav-left>
      <f7-nav-title id="menuTitle"> {{title}} </f7-nav-title>
        <f7-nav-right>
          <f7-link @click="popupClose"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-page>
      <!--<iframe id="pdfviewer" :src="data.helpFile" frameborder="0" width="100%" height="100%" style="position:absolute;top:0;"></iframe>-->
      <div id="pdfDiv" class="pdf"></div>
    </f7-page>
  </div>
</template>
<script>
  import PDFObject from "pdfobject";

export default {
	data: function(){
    const cid = this.$f7route.params.cid.toNum(),
          categoryData = window.categoryMap.get(cid);
		return {
      pdfurl: Manage.mng.getImgUrl('category', cid, categoryData.help_file),
      title: categoryData.title,
      ImgPath : Manage.mng.getImgPath()
		};
	},
  mounted(){
    PDFObject.embed(this.pdfurl, "#pdfDiv", {
      pdfOpenParams: {
        page: 1
      },
      forcePDFJS: true,
      PDFJS_URL: this.ImgPath + "pdfjs/web/viewer.html"
    });
  },
	methods: {
    popupClose() {
      NoblMap.showMarkers();
      Manage.mng.getPopup().close($$("#popup-menu"));
      setTimeout(() => {
        Manage.mng.getView($$(".popup-menu-view")).history.pop();
      }, 200);
    },


  }
}
</script>
<style scoped>
  .pdf {
    height: 100%;
    width: 100%;
    position:absolute;
    top:0;
  }
</style>
