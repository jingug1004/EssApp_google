<template>
  <!-- App -->
  <f7-app :params="f7params" id="app">

    <!-- Statusbar -->
    <f7-statusbar></f7-statusbar>

    <!-- Left Panel -->
    <f7-panel left cover style="overflow:hidden;">
      <f7-view name="left" url="/panel-left/"></f7-view>
    </f7-panel>

    <!-- Main View -->
    <f7-view id="main-view" url="/home" main></f7-view>

    <!-- Popup -->
    <f7-popup id="popup-menu" tablet-fullscreen>
      <f7-view class="popup-menu-view" :allowDuplicateUrls='true'></f7-view>
    </f7-popup>

    <f7-popup id="popup-menu-detail" tablet-fullscreen>
      <f7-view class="popup-menu-detail-view" :allowDuplicateUrls='true'></f7-view>
    </f7-popup>

    <f7-popup id="popup-trek" tablet-fullscreen>
      <f7-view class="popup-trek-view" :allowDuplicateUrls='true'></f7-view>
    </f7-popup>

    <f7-popup id="popup-trek-course" tablet-fullscreen>
      <f7-view class="popup-trek-course-view" :allowDuplicateUrls='true'></f7-view>
    </f7-popup>

    <f7-popup id="popup-event" tablet-fullscreen>
      <f7-view class="popup-event-view" :allowDuplicateUrls='true'></f7-view>
    </f7-popup>
    <div id="hideArea" class="hide"></div>
  </f7-app>

</template>

<script>
// Import Routes
import routes from './routes.js'

export default {
  data() {
    return {
      // Framework7 parameters here
      f7params: {
        id: 'noblapp.map.google', // App bundle ID
        name: 'Noblapp', // App name
        theme: 'auto', // Automatic theme detection
        // App routes
        routes,
        precompileTemplates :true,
        template7Pages: true,
        on : {
          resize: function(page) {
            $$("#map").css({"height": ( innerHeight + 30 )+"px", "width": ( innerWidth )+"px"});
            $$("#map").parent().css({"height": ( innerHeight )+"px", "width": ( innerWidth )+"px"});
            if(NoblMap && NoblMap.map && window.google) {
              google.maps.event.trigger(NoblMap.map, 'resize');
            }
          }
        }
      },
    }
  }
}
</script>
