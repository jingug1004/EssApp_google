<template>
  <div class="fab fab-right-bottom" @click="test">
  	<img :src='ImgPath+"images/map_arrows_ns.svg"'/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath()
    }
  },
  methods: {
    test() {
      if(Manage.infosMng.has("markers.groupMarkers.complex.lotties")) {
        Manage.infosMng.get("markers.groupMarkers.complex.lotties").onRemove();
      }else{
        NoblMap.CustomMarkers.addLottiesGroupMarker();
      }
    }
  }
}
</script>
