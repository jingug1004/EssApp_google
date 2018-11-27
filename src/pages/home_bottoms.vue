<template>
  <div id="bottoms">
    <div class="fab fab-left-bottom">
      <div class="left">
        <div class="titleTxt"> {{ gName }}</div>
      </div>

      <div class="right">
        <Weather />
      </div>
    </div>
    <div class="fab fab-left-bottom2">
      노블앱 | 사업자등록번호: 852-01-00655 | 대표자: 안정훈 | 이메일: jenina1150@gmail.com
      <!--<img :src='ImgPath+"images/noblapp.png"' style="width:100%;" />-->
    </div>
  </div>
</template>

<script>
import Weather from '@/pages/home_weather';
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      gName:Manage.mng.getGName()
    }
  },
  created() {
  },
  methods: {

  },
  components: {
    Weather
  }
}
</script>
