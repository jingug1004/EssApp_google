<template>
    <div id="loadingArea">
      <div class="loadingImg">
        <img :src="defaultMascotImg" />
      </div>
      <div id="lottieDiv"></div>
    </div>
</template>
<script>
import lottieMng from '@/js/lottie';

export default {
  data() {
    const ImgPath = Manage.mng.getImgPath();
    return {
      ImgPath : ImgPath,
      defaultMascotImg: ImgPath + 'images/mascot.png',
      defaultMascotLottie: ImgPath + 'datas/lottie/mascot.json',
      serverMascot: Manage.mng.getLoadingSetSystem(),
      bgColor: Manage.mng.getLoadingBgColor(),
      imgLottie: Manage.mng.getLoadingImgLottie()
    }
  },
  created() {
    if(this.serverMascot !== "false") {
      if(this.imgLottie) {
        this.serverMascot = Manage.mng.getImgUrl() + "/mascot/" + this.serverMascot;
      }else{
        this.defaultMascotImg = Manage.mng.getImgUrl() + "/mascot/" + this.serverMascot;
      }
    }
  },
  mounted() {
    $$("#loadingArea").css({"height": innerHeight+"px", "background-color":"#"+this.bgColor});

    if(this.imgLottie) {
      this.setMascot();
    }
    this.setLottie();
    // setTimeout(()=>{
    //   Manage.mng.goPage("#main-view","/Home");
    // }, 3000);
  },
  methods: {
    setMascot() {
      const mascotPath = (this.serverMascot === "false")?this.defaultMascotLottie:this.serverMascot;
      $$(".loadingImg").html("<div id='lottieMascot'></div>");
      lottieMng.makeLottie({
        container : document.getElementById("lottieMascot"),
        path: mascotPath
      });
    },
    setLottie() {
      lottieMng.makeLottie({
        container : document.getElementById("lottieDiv"),
        path: this.ImgPath + "datas/lottie/loading.json"
      });
    },
  }
}
</script>
