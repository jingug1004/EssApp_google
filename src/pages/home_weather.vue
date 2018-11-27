<template>
  <div id="weather" @click="weatherLink">
    <img>
    <div class="temperatureTxt"></div>
    <div class="temperatureTxt"><p>℃</p></div>
    <div class="weatherTxtStyle">
      <!-- <div class="weatherTxt"></div> -->
      <!--<div class="dustTxt" data-i18n="DEFINE_WEATHER_PATICLE"></div>-->
      <div class="dustValue"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath()
    }
  },
  created() {
    const that = this;
    that.setTimer(that.setWeather);
  },
  methods: {
    weatherLink() {
      window.open("https://m.weather.naver.com/m/main.nhn?regionCode="+Manage.mng.getRegionCode(), "_blank");
    },
    getImg(idx) {
      return this.ImgPath + "weather/weather_icons_"+idx+".png";
    },
    getWeather(idx) {
      return "DEFINE_WEATHER_CONDITION_"+idx;
    },
    drawWeather(data) {
      const that = this;
      setLocale($$("#weather"));
      $$("#weather").show();
      $$("#weather img").attr("src", that.getImg(data.icon));
      $$(".temperatureTxt").eq(0).text(data.temp);
      // $$(".weatherTxt").attr("data-i18n", that.getWeather(data.icon));
      $$(".dustValue").text(Manage.lang.trans(data.dust_desc)+" ("+data.dust_value+")");
      console.log(new Date().format("yyyy-MM-dd HH:mm:ss") + " 날씨 가져온 시간." + (data.check_time?"DB":"Open"));
    },
    setWeather() {
      const that = this;
      Ajax.run({url:"/etc/weather"}, (result) => {
        if(!result.check_time || 3600000 < new Date().getTime() - result.check_time) {
          NoblMap.PublicDatas.Weather.weatherInfos().then((data) => {
            if(data.error){
                $$("#weather").hide();
            }else{
              that.drawWeather(data);
              Ajax.run({url:"/etc/saveWeather", method:"POST", data:{temp:data.temp, desc:data.icon, dust_desc:data.dust_desc||"", dust_value:data.dust_value||""}});
            }
          });
        }else{
          result.icon = result.desc;
          that.drawWeather(result);
        }
      });
    },
    setTimer(func) {
      const curr = new Date(),            
            alarmTime = Date.parse(curr.plus("hour", curr.getMinutes() < 5?0:1).format("yyyy-MM-ddTHH:05:00")),
            that = this;

      func();
      setTimeout(() => {
        that.setTimer(that.setWeather);
      }, (alarmTime - curr.getTime()));
    }
  }
}
</script>
