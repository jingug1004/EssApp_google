
<template>
  <div id="visitorLogSheet" class="sheet-modal">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left"><a class="link blue">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</a></div>
        <div class="center" style="flex:1;text-align:center;font-size: 20px;">{{ $t("DEFINE_VISIT_LOG_TITLE")}}</div>
        <div class="right"><a class="link sheet-close" href="#">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</a></div>
      </div>
    </div>
    <div class="sheet-modal-inner" style="height: 90%;overflow-y: auto;">
      <div>
        <div class="block">
          <div class="block-title">{{ $t("DEFINE_VISIT_LOG_TOTAL_COUNT_TITLE") }}</div>
          <f7-list>
            <f7-list-item id="today" :title='$t("DEFINE_VISIT_LOG_TODAY_TITLE")' after="0"></f7-list-item>
            <f7-list-item id="total" :title='$t("DEFINE_VISIT_LOG_TOTAL_TITLE")' after="0"></f7-list-item>
          </f7-list>
        </div>
      </div>
      <div id="last_ten_days">
        <div class="block">
          <div class="block-title">{{ $t("DEFINE_VISIT_LOG_DAYS_TITLE") }}</div>
          <div class="list">
            <ul>
            </ul>
          </div>
        </div>
      </div>
      <div id="last_ten_months">
        <div class="block">
          <div class="block-title">{{ $t("DEFINE_VISIT_LOG_MONTHS_TITLE") }}</div>
          <div class="list">
            <ul>
            </ul>
          </div>
        </div>
      </div>
      <div id="last_ten_years">
        <div class="block">
          <div class="block-title">{{ $t("DEFINE_VISIT_LOG_YEARS_TITLE") }}</div>
          <div class="list">
            <ul>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      sheetId : "#visitorLogSheet",
      touchActionState:"auto"
    }
  },
  mounted() {
    let that = this;
    $$(this.sheetId).on("sheet:open", function(e, sheet) {
      that.setList();
    });

    $$(this.sheetId).on("sheet:close", function(e, sheet) {
      NoblMap.showMarkers();
    });

    $$(this.sheetId).find(".sheet-modal-inner").on("scroll", function(e){
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
    setList() {
      const that = this;
      Ajax.run({url:"/etc/stats/visitors"}, function(datas){

        $$(that.sheetId).find("#today .item-after span").text(datas.today);
        $$(that.sheetId).find("#total .item-after span").text(datas.total);

        const arr = ["days", "months", "years"];

        Manage.mng._.each(arr, (data) => {
          let html = '';
          Manage.mng._.each(datas["last_ten_"+data].reverse(), (info) => {
            html += that.makeRowHtml(info.d, info.counts);
          });
          $$(that.sheetId).find("#last_ten_"+data).find("ul").html(html);
        });
      });
    },
    makeRowHtml(title, value) {
      let itemTitle = title.split("-");
      if(itemTitle.length === 3) {
        itemTitle = itemTitle.last() + Manage.lang.trans("DEFINE_VISIT_LOG_DAYS_STITLE");
      }else if(itemTitle.length === 2) {
        itemTitle = itemTitle.last() + Manage.lang.trans("DEFINE_VISIT_LOG_MONTHS_STITLE");
      }else if(itemTitle.length === 1) {
        itemTitle = itemTitle.last() + Manage.lang.trans("DEFINE_VISIT_LOG_YEARS_STITLE");
      }
      let html = '';
      html += '<li class="">';
        html += '<div class="item-content">';
          html += '<div class="item-inner">';
            html += '<div class="item-title">'+itemTitle+'</div>';
            html += '<div class="item-after"><span>'+value+'</span></div>';
          html += '</div>';
        html += '</div>';
      html += '</li>';
      return html;
    }
  }
}
</script>
