<template>
  <f7-page id="loginPage">
    <f7-navbar>
      <f7-nav-left style="color:#F7F7F8;">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</f7-nav-left>
      <f7-nav-title :title='$t( "DEFINE_USER_LOGIN" )' class="flex1" style="text-align:center;"></f7-nav-title>
      <f7-nav-right>
          <f7-link @click="popupClose">{{ $t("DEFINE_MESSAGE_BUTTON_CLOSE") }}</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <div class="login-screen modal-in" style="display: block;top: 45px;">
      <div class="page">
        <div class="page-content login-screen-content" style="padding-top: 10px;">
          <div id="login" class="list" style="padding: 0 10px;">
            Email / Id<br />
            <input type="text" name="id" required /> <br />
            Password<br />
            <input type="password" name="password" required /> <br />
            <p class="row" style="margin-top: 0px;margin-bottom: 15px;">
              <button class="col button button-fill h45" @click="login">{{$t( "DEFINE_USER_LOGIN" )}}</button>
              <button class="col button button-fill h45" @click="termsPopupOpen"> {{$t("DEFINE_USER_SIGN_UP")}}</button>
            </p>
            <div class="snsBtns">
              <div @click="kakaoInit">
                <img :src='ImgPath+"buttons/kakao/login/kr/kakao_account_login_btn_large_narrow.png"' />
              </div>

              <!--<div id="naverIdLogin">-->
                <!--<img :src='ImgPath+"buttons/naver/naver_ko_short.png"' />-->
              <!--</div>-->

              <div class="google" @click="authenticate('google')">
                <img :src='ImgPath+"buttons/google/1x/btn_google_signin_dark_normal_web.png"' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div id="loadingDiv" class="hide"><div><img :src='ImgPath+"oval.svg"' class="flex1"></div></div> -->
  </f7-page>
</template>

<script>
export default {
  data () {
    Manage.mng.fnRecursive(50, function(){return ($$("#loginPage").length > 0);}, function() {
      $$("#loginPage .login-screen").css("top", $$("#loginPage .navbar").css("height"));
      setLocale($$("#loginPage"));
    });
    return {
      ImgPath : Manage.mng.getImgPath(),
    };
  },
  mounted() {
    $$("#loginPage").parents(".popup").on("popup:close", () => {
      NoblMap.showMarkers();
    });

    // this.naverInit();
  },
  methods: {
    popupClose() {
      app.$f7.popup.close($$("#popup-menu"), false);
    },
    termsPopupOpen() {
      Manage.mng.goPage(".popup-menu-detail-view", "/terms");
      Manage.mng.openPopup($$("#popup-menu-detail"));
    },
    loadingOn () {
      $$("#loadingDiv").addClass("loadingDiv").removeClass("hide");
    },
    loadingOff () {
      $$("#loadingDiv").addClass("hide").removeClass("loadingDiv");
    },
    validate(target) {
      let datas = {};
      let returnChk = true;
      target.find("[required]").each((idx, dom) => {
        const value = $$(dom).val();
        const name = $$(dom).attr("name");
        if(value === "") {
          Manage.msg.alert(name + "값이 없습니다.");
          returnChk = false;
          return false;
        }
        datas[name] = value;
      });
      if(returnChk) {
        return datas;
      }else{
        return false;
      }
    },
    loginSuccessCallback(that, data) {
      Manage.cookie.set("uid", data.uid, 1800);
      Manage.cookie.set("name", data.name, 1800);
      Manage.cookie.set("access_token", data.access_token, 1800);

      Manage.toast.autoClose(Manage.lang.trans("DEFINE_USER_MSG_LOGIN"), "success");
      that.popupClose();
    },
    login() {
      const that = this;
      let data = this.validate($$("#login"));
      if(data) {
        Ajax.run({url:"/user/login", method:"POST", data}, function(data, res){
          if(data.uid) {
            that.loginSuccessCallback(that, data);
          }else{
            if(res.data.ecode === 10003) {
              msg.alert(Manage.lang.trans("DEFINE_USER_MSG_NOT_EXIST_ID"));
            }else if(res.data.ecode === 10004) {
              msg.alert(Manage.lang.trans("DEFINE_USER_MSG_PASSWD_INCORRECT"));
            }
            $$("#login").find("[required]").val("");
          }
        });
      }
    },

    snsLogin(datas) {
      const that = this;
      Ajax.run({url:"/user/join", method:"POST", data:datas}, function(data, res){
        if(res.data.ecode === 10002) {
            Ajax.run({url:"/user/login", method:"POST", data:datas}, function(data){
              that.loginSuccessCallback(that, data);
            });
        }else{
          that.loginSuccessCallback(that, data);
        }
      });
    },

    authenticate: function (provider) {
      const that = this;
      this.$auth.authenticate(provider).then(res => {
        console.log(res);
        const data = res.data;
        that.snsLogin({id: data.email, name:data.name, password: "google"});
      }).catch(response => console.err(response));
    },

    kakaoSetToken() {
      let that = this;
      Kakao.Auth.login({
        success: function(authObj) {
          that.kakaoUserInfo();
        },
        fail: function(err) {
          console.log(err);
        }
      });
    },
    kakaoUserInfo () {
      let that = this;

      Kakao.API.request({
        url: '/v1/user/me',
        success: function(res) {
          console.log(res);
          that.snsLogin({id: res.id, name:res.properties.nickname, password: "kakao"});
          //that.loadingOff();
        },
        fail: function(error) {
          console.log(JSON.stringify(error))
        }
      });
    },
    kakaoInit() {
      if(!window.Kakao) {
        let that = this;
        Manage.mng.getScriptKakao();
        Manage.mng.fnRecursive(50, function(){return window.Kakao}, function(){
          Kakao.init(Manage.mng.getApiKey("KAKAO").clientId);
          that.kakaoSetToken();
        });
      }else{
        this.kakaoSetToken();
      }
      //this.loadingOn();
    },


    naverInit() {
      Manage.mng.getScriptNaver().then((naverIdLogin) => {
        $$("#naverIdLogin").attr("id", "naver_id_login");
        const naverKey = Manage.mng.getApiKey("NAVER");

        let naverIdLoginObj = new naverIdLogin(naverKey.clientId, location.origin + naverKey.redirectUri);
        naverIdLoginObj.setPopup();
        naverIdLoginObj.setDomain(location.origin);
        naverIdLoginObj.setButton("green", 2, 40);
        naverIdLoginObj.setState(naverIdLoginObj.getUniqState());
        console.log(naverIdLoginObj.getNaverIdLoginLink());
        naverIdLoginObj.init_naver_id_login();
      });

    }

  }
}
</script>
