<template>
	<f7-page>
      <div style="height:20px;"></div>
			<div style="height:45px;display:flex;align-items:center;font-size:18px;">
				<div id="loginBefore" @click="loginPopupOpen" class="flex1 pointer panel-close">
					<div style="display:flex;align-items: center;padding-left: 15px;margin-top: 5px;">
						<div style="margin-right:10px;">
							<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media" style="width:30px;"/>
						</div>
						<div class="flex1">{{$t("DEFINE_USER_LOGIN")}}</div>
					</div>
				</div>
				<div id="loginAfter" class="hide flex1 pointer panel-close">
					<div style="display:flex;align-items: center;padding-left: 15px;margin-top: 5px;">
						<div style="margin-right:10px;">
							<img :src="ImgPath+'menu_icon/user_none.svg'" slot="media" style="width:30px;"/>
						</div>
						<div id="userName" view=".popup-menu-view" class="flex1 panel-close" @click="userPopupOpen"></div>
					</div>
				</div>
			</div>
	    <f7-list class="noneMargin accordion-list" style="overflow: unset;">
	    	<f7-list-item v-for="(item, key) in items" :key="key" :title="item.title" :accordion-item="item.children?true:false" :link="item.children?false:'/menus/'+item.cid" view=".popup-menu-view" :class="item.children?'':'panel-close'" @click="popupOpen">
	    		<img :src="ImgUrl + '/category/' + item.cid +'/'+ item.icon_url" slot="media"/>
					<f7-accordion-content v-if="item.children">
						<f7-block>
							<f7-list class="noneMargin">
								<f7-list-item v-if="!item2.link && !item2.help_file" v-for="(item2, key2) in item.children" :key="key2" :title="item2.title" :link="'/menus/'+item2.cid" view=".popup-menu-view" class="panel-close" @click="popupOpen">
									<img :src="ImgUrl + '/category/' + item2.cid +'/'+ item2.icon_url" slot="media"/>
					    	</f7-list-item>
                <f7-list-item v-else-if="item2.help_file" :title="item2.title" class="panel-close pointer" :link="'/pdf/'+item2.cid" view=".popup-menu-view" @click="popupOpen">
                  <img :src="ImgUrl + '/category/' + item2.cid +'/'+ item2.icon_url" slot="media"/>
                </f7-list-item>
                <f7-list-item v-else :title="item2.title" class="panel-close pointer" :data-url="item2.link" @click="linkOpen">
                  <img :src="ImgUrl + '/category/' + item2.cid +'/'+ item2.icon_url" slot="media"/>
                </f7-list-item>
							</f7-list>
						</f7-block>
					</f7-accordion-content>
	    	</f7-list-item>

				<f7-list-item :title="$t('DEFINE_DULLEGIL_COURSE')"  class="panel-close" link="#" @click="treklistOpen">
	    		<img :src="ImgPath+'menu_icon/route.png'" slot="media"/>
	    	</f7-list-item>
				<f7-list-item :title="$t('DEFINE_VISIT_LOG_TITLE')"  class="panel-close" link="#" @click="visitorLogOpen">
	    		<img :src="ImgPath+'menu_icon/result.png'" slot="media"/>
	    	</f7-list-item>
		</f7-list>
    <div style="height:50px;"></div>
	</f7-page>
</template>
<script>
export default {
	data () {
		return {
			ImgPath : Manage.mng.getImgPath(),
			ImgUrl: Manage.mng.getImgUrl(),
			items: []
		};
	},
	created() {
		const that = this;
		Manage.mng.fnRecursive(50, () => window.categoryMap, () => {
			let categorys = Manage.mng.toArray(categoryMap);
			let pcidCategorys = categorys.filter((data) => data.pcid === 0);
			pcidCategorys.forEach((datas) => {
				let list = categorys.filter((data) => data.pcid === datas.cid);
				if(list.length > 0) {
					datas.children = list;
				}
			});
			that.items = pcidCategorys;
			NoblMap.infos.categorys = pcidCategorys;
		});
		$$(".panel-left").on("panel:open", function() {
		  NoblMap.hideMarkers();
			if(that.isLogin()) {
				$$("#loginBefore").hide();
				$$("#loginAfter").show();
				$$("#loginAfter").find("#userName").text(Manage.cookie.getName());
			}else{
				$$("#loginBefore").show();
				$$("#loginAfter").hide();
			}
		});

    $$(".panel-left").on("panel:backdrop-click", function() {
      NoblMap.showMarkers();
    });
  },
  mounted() {
    Manage.mng.stopPullToRefresh($$(".panel-left .page-content"));
  },
	methods: {
		isLogin() {
			return !!Manage.cookie.getName();
		},
		loginPopupOpen() {
			Manage.mng.goPage(".popup-menu-view", "/login/");
			Manage.mng.openPopup($$("#popup-menu"));
		},
		userPopupOpen() {
			Manage.mng.goPage(".popup-menu-view", "/user/");
			Manage.mng.openPopup($$("#popup-menu"));
		},
		popupOpen(e) {
			if(!$$($$(e.target).parents("li")[0]).is(".accordion-item")) {
				Manage.mng.openPopup($$("#popup-menu"));
			}
		},
		treklistOpen(){
			Manage.mng.getSheetName("treklistSheet", $$("#treklistSheet")).open();
		},
		visitorLogOpen(){
			Manage.mng.getSheetName("visitorLogSheet", $$("#visitorLogSheet")).open();
		},
    linkOpen(e) {
      window.open($$(e.target).parents("li").eq(0).data("url"), "_blank");
    },
    pdfOpen(e) {
      if(!$$($$(e.target).parents("li")[0]).is(".accordion-item")) {
        Manage.mng.openPopup($$("#popup-menu"));
      }
    }
	}
}
</script>
