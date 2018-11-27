<template>
  <div id="busSheet" class="sheet-modal my-sheet">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left"></div>
        <div class="right"><a class="link sheet-close" href="#">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</a></div>
      </div>
    </div>
    <div class="sheet-modal-inner">
      <div class="block busArriveInfo">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      touchActionState:"auto"
    }
  },
  mounted(){
    let that = this;
    $$("#busSheet").on("sheet:open", function() {
      $$("#busSheet").find(".toolbar .left").text(NoblMap.infos.stationName);

      let html = '';
      if(NoblMap.infos.routeInfo.length === 0) {
        html += '<div class="noData">'+ Manage.lang.trans("DEFINE_BUS_NO_RESULT") +'</div>';
      }else{
        Manage.mng._.each(NoblMap.infos.routeInfo, (route) => {
          html += that.makeHtml(route);
        });
      }
      $$("#busSheet").find(".sheet-modal-inner .block").html(html);
    });

    $$("#busSheet").on("sheet:close", function() {
      delete NoblMap.infos.stationName;
      delete NoblMap.infos.routeInfo;
    });

    $$("#busSheet .busArriveInfo").on("scroll", (e) => {
      if(e.target.scrollTop === 0 && that.touchActionState === "auto"){
        $$(e.target).css("touch-action", "pan-down");
        that.touchActionState = "pan-down";
      }else if(that.touchActionState === "pan-down"){
        $$(e.target).css("touch-action", "auto");
        that.touchActionState = "auto";
      }
    });
  },
  methods: {
    makeHtml(route) {
      let html = '';
      html += '<div class="busRoute">';
        html += '<div class="left">'+route.routeNm+'</div>';
        html += '<div class="right">';

        if(route.arriveInfo.length === 0) {
          html += '<div class="noData middle">'+ Manage.lang.trans("DEFINE_BUS_NO_RESULT") +'</div>';
        }else if (route.arriveInfo.length === 1) {
          if(route.arriveInfo[0].arrmsg ) {
            html += '<div>'+ route.arriveInfo[0].arrmsg +'</div>';
          }else{
            html += '<div>' +this.makeHtml_minutes(route.arriveInfo[0]) +'</div>';
          }
          html += '<div class="noData">'+ Manage.lang.trans("DEFINE_BUS_NO_RESULT") +'</div>';
        }else if (route.arriveInfo.length === 2) {
          if(route.arriveInfo[0].arrmsg ) {
            html += '<div>'+ route.arriveInfo[0].arrmsg +'</div>';
            html += '<div>'+ route.arriveInfo[1].arrmsg +'</div>';
          }else{
            html += '<div>'+ this.makeHtml_minutes(route.arriveInfo[0]) +'</div>';
            html += '<div>'+ this.makeHtml_minutes(route.arriveInfo[1]) +'</div>';
          }
        }
        html += '</div>';
      html += '</div>';
      return html;
    },
    makeHtml_minutes(arriveInfo) {
      return '<div>'+ arriveInfo.predictTime + Manage.lang.trans("DEFINE_BUS_MINUTES") + ' ['+arriveInfo.locationNo+ Manage.lang.trans("DEFINE_BUS_PREV")+']' +'</div>';
    }
  }
}
</script>
