
<template>
  <div id="treklistSheet" class="sheet-modal my-sheet">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="left">{{$t("DEFINE_TREK_COURSES")}}</div>
        <div class="right"><a class="link sheet-close" href="#"> {{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }} </a></div>
      </div>
    </div>
    <div class="sheet-modal-inner">
      <div class="list links-list">
        <ul>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ImgPath : Manage.mng.getImgPath(),
      sheetId : "#treklistSheet",
      touchActionState:"auto"
    }
  },
  mounted(){
    let that = this;
    $$(this.sheetId).on("sheet:open", function() {
      that.setList();
    });

    $$(this.sheetId).on("sheet:close", function() {
      NoblMap.showMarkers();
    });

    $$(this.sheetId).find(".sheet-modal-inner").on("scroll", (e) => {
      if(e.target.scrollTop === 0 && that.touchActionState === "auto"){
        $$(e.target).css("touch-action", "pan-down");
        that.touchActionState = "pan-down";
      }else if(that.touchActionState === "pan-down"){
        $$(e.target).css("touch-action", "auto");
        that.touchActionState = "auto";
      }
    });

    $$(this.sheetId).find(".list").on("click", "li", function() {
      const closeTarget = $$(that.sheetId),
            tc_id = $$(this).data("tc_id"),
            course_name = $$(this).text();

      NoblMap.Trek.makeTrekCourse(tc_id, course_name, () => {
        Manage.mng.getSheet().close(closeTarget);
      });
    });
  },
  methods: {
    setList() {
      NoblMap.Trek.getCourseList().then((datas) => {
        let html = '';
        Manage.mng._.each(datas.list, (data) => {
          html += '<li data-tc_id="'+data.tc_id+'"><a href="#">'+ data.course_name +'</a></li>';
        });

        $$("#treklistSheet .sheet-modal-inner ul").html(html);
        Manage.infosMng.set("trekData.list", datas.list);
      });
    }
  }
}
</script>
