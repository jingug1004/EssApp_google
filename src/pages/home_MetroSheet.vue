<template>
  <div id="metroSheet" class="sheet-modal my-sheet">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left"></div>
        <div class="right"><a class="link sheet-close" href="#">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</a></div>
      </div>
    </div>
    <div class="sheet-modal-inner">
      <div id="subwayLines" class="block">

      </div>
      <div class="block metroArriveInfo">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      touchActionState: "auto",
    }
  },
  mounted(){
    let that = this;

    $$("#metroSheet").on("sheet:open", function() {
      if(!that.lineMap) {
        that.lineMap = Manage.mng.makeMap(NoblMap.PublicDatas.Metro.metroSubwayLines, "subwayId");
      }

      const metroData = NoblMap.infos.metroData,
            stationName = metroData[0].station_nm;

      $$("#metroSheet").find(".toolbar .left").text(stationName+"역 ");
      try {
        NoblMap.PublicDatas.Metro.getRealtimeStationArrival(stationName).then((result) => {
          if(!!result ) {
            const realtimeArrivalList = result.realtimeArrivalList,
                  subwayList = realtimeArrivalList[0].subwayList.split(",");

            $$("#subwayLines").html(that.makeHtml_subwayLine(subwayList));
            that.arrivalList = realtimeArrivalList;
            $$("#subwayLines").find(".subway").eq(0).click();
          }else{
            $$("#metroArriveInfo").html("<div>"+Manage.lang.trans("DEFINE_METRO_API_ERROR")+"</div>");
          }
        });
      }catch(e) {
        debugger;
      }
    });

    $$("#metroSheet").on("sheet:close", function() {
      delete NoblMap.infos.metroData;
    });

    $$("#metroSheet #subwayLines").on("click", ".subway", function(e) {
      const subwayId = $$(e.target).data("subwayid");
      const arrivalData = that.arrivalList.filter((arr) => arr.subwayId === subwayId);
      $$(".metroArriveInfo").html(that.makeHtml_arrive(arrivalData));
      $$("#metroSheet").find(".toolbar .left").text($$("#metroSheet").find(".toolbar .left").text().split(" ")[0] + "  " + that.lineMap.get(subwayId).subwayNm);
    });

  },
  methods: {
    makeHtml_subwayLine (lines) {
      let html = '<div style="margin-right: 16px;"> '+Manage.lang.trans("DEFINE_METRO_ROUTE")+' </div>';
      const lineMap = this.lineMap;
      Manage.mng._.each(lines, (lineCd) => {
        const lineValue = lineMap.get(lineCd);
        html += '<div class="subway" data-subwayId="'+lineValue.subwayId+'" style="background-color:#'+lineValue.lineColor+'">'+lineValue.subwayNm+'</div>';
      });
      return html;
    },
    makeHtml_arrive(arrivalData) {
      console.log(this);
      let html = '<div>';
      html += this.makeArvlStr(arrivalData.filter((data) => /^01/.test(data.ordkey))[0], true);
      html += this.makeArvlStr(arrivalData.filter((data) => /^02/.test(data.ordkey))[0], true);
      html += '</div>';
      html += '<div>';
      html += this.makeArvlStr(arrivalData.filter((data) => /^11/.test(data.ordkey))[0]);
      html += this.makeArvlStr(arrivalData.filter((data) => /^12/.test(data.ordkey))[0]);
      html += '</div>';
      return html;
    },
    makeArvlStr(data, border) {
      // 종점일때 처리.
      //  열차가 없을 때 처리 등등 몇가지 더 봐야 함.
      let returnStr = '';
      let returnClass = '';
      const arvlCd = data.arvlCd;

      if(data.bstatnNm === data.statnNm) {
        returnStr = '   -   ';
        returnClass = "colorBlack";
      }else {
        if(arvlCd === "99"){
          const barvlDt = Number(data.barvlDt);
          if(barvlDt === 0) {
            returnStr = data.arvlMsg2;
          }else{
            returnStr = this.minsecStr(data.barvlDt);
          }
        }else if(arvlCd === "5"){
          returnStr = "DEFIND_METRO_PREV_ARRIVAL";
        }else if(arvlCd === "4"){
          returnStr = "DEFIND_METRO_PREV_ENTRY";
        }else if(arvlCd === "3"){
          returnStr = "DEFIND_METRO_PREV_DEPARTURE";
        }else if(arvlCd === "2"){
          returnStr = "DEFINE_METRO_DEPARTURE";
        }else if(arvlCd === "1"){
          if(Number(data.barvlDt) > 60) {
            returnStr = this.minsecStr(data.barvlDt);
          }else{
            returnStr = "DEFIND_METRO_ARRIVE";
          }
        }else if(arvlCd === "0"){
          returnStr = "DEFIND_METRO_ENTERING";
        }
      }

      let borderStyle = (border)?'border-right:1px solid #888;':'';
      if(returnClass) {
        return '<div style="padding:0 15px;'+borderStyle+'">'+ Manage.lang.trans(returnStr) + '</div>';
      }else{
        return '<div style="padding:0 5px;'+borderStyle+'">'+data.bstatnNm+Manage.lang.trans("DEFINE_METRO_DERECTION")+' <span>'+ Manage.lang.trans(returnStr) + '</span></div>';
      }
    },
    minsecStr(barvlDt) {
      barvlDt = Number(barvlDt);

      const minute = Math.floor(barvlDt / 60),
            second = Math.floor(barvlDt % 60);
      return  minute + Manage.lang.trans("DEFINE_METRO_MINUTES") + " " + second + Manage.lang.trans("DEFINE_METRO_SECONDS");
    }
  }
}
</script>
