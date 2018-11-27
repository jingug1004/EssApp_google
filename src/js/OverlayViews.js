import * as Manage from '@/js/Manage';

const mng = Manage.mng;
const _ = mng._;
const infosMng = Manage.infosMng;
const throttleTime = 10;

const CustomOverlays = (function(){
	let publicObj = {};

	const setIcon = function(loc, store) {
		let iconStr = '<div id="'+store.key+'"'
					+'class="map-icon-label iconMarker" '
					+'style="'
						+'left:'+(loc.x)+'px; '
						+'top:'+(loc.y - 10)+'px; '
				+'">';
				iconStr += '<span class="map-icon"><img src="'+(mng.getImgUrl("pictogram", store.map_res_url))+'" /></span>';
				iconStr += '</div>';
		return $$(iconStr);
	};

	const setImage = function(loc, store) {
		return $$('<div id="'+store.key+'"'
					+'class="imageMarker" '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 10)+'px; '
				+'">'
					+ '<img alt="" src="'+mng.getImgPath()+'map_icon/minimapIcon.svg" draggable="false">'
				+'</div>');
	};

	const setMarker = function(loc, store) {
		return $$('<div id="'+store.key+'"'
					+'class="markerMarker" '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 35)+'px; '
				+'">'
					+ '<img alt="" src="'+mng.getImgPath()+'map_icon/marker.svg" draggable="false">'
				+'</div>');
	};

  const setRingMarker = function(loc, store, name) {
    return $$('<div id="'+store.key+'"'
      +'class="singleMarker" '
      +'style="'
      +'left:'+(loc.x - 22.5)+'px; '
      +'top:'+(loc.y - 22.5)+'px; '
      +'">'
      + ((name==="click")?'<img alt="" src="'+mng.getImgPath()+'map_icon/rings_blue.svg" draggable="false">':'')
      + ((name==="gps")?'<img alt="" src="'+mng.getImgPath()+'map_icon/rings_red.svg" draggable="false">':'')
      +'</div>');
  };

	const setPicto = function(loc, store) {
		let iconStr = '<div id="'+store.key+'" '
					+'class="pictoMarker" '
					+'style="'
						+'left:'+(loc.x)+'px; '
						+'top:'+(loc.y - 10)+'px; '
				+'">';
		    if(store.isOverlaidPictos) {
          iconStr += '<img src="'+mng.getImgPath()+'map_icon/overlaidPictos.png" />';
        }else{
          iconStr += '<img src="'+(mng.getImgUrl("pictogram", store.map_res_url))+'" />';
        }
				iconStr += '</div>';
		return $$(iconStr);
	};

	const setIFrame = function(loc, store, noEvent, noSymbol) {
    const style = 'style="width:'+store.w+'px;height:'+store.h+'px;"';
		let iframeStr = '<div id="'+store.key+'"'
					+'class="symbol '+ ((noEvent)?'':'scale' )+' " '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 10)+'px; '
						+'width:' + store.w + 'px;'
						+'height:' + store.h + 'px;'
				+'">'
				if(!noSymbol && store.assetId || store.assetFile){
					iframeStr += '<iframe scrolling="no" style="width:100%;height:100%;" src="'+(mng.getImgUrl(store.assetFolder, store.assetId, store.assetFile))+'"></iframe>';
				}
				iframeStr += '<div class="iframeEvent" '+style+'> </div>';
				iframeStr += '</div>';
		return $$(iframeStr);
	};

	const setSVG = function(loc, store) {
		let svgStr = '<div id="'+store.key+'"'
					+'class="svgMarker" '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 10)+'px; '
						+'width:' + store.w + 'px;'
						+'height:' + store.h + 'px;'
				+'">'
				+'<img />'
				+'</div>';
		return $$(svgStr);
	};

  const setLowSVG = function(loc, store) {
    let svgStr = '<div id="'+store.key+'"'
      +'class="lowSvgMarker" '
      +'style="'
      +'left:'+loc.x+'px; '
      +'top:'+(loc.y - 10)+'px; '
      +'width:' + store.w + 'px;'
      +'height:' + store.h + 'px;'
      +'">'
      +'<img />'
      +'</div>';
    return $$(svgStr);
  };

	const setLottie = function(loc, store, addClass) {
		let lottieStr = '<div id="'+store.key+'"'
					+'class="lottieMarker '+ ((addClass)?addClass:'' )+' " '
					+'style="'
						+'left:'+loc.x+'px; '
						+'top:'+(loc.y - 10)+'px; '
						+'width:' + store.w + 'px;'
						+'height:' + store.h + 'px;'
				+'">'
				lottieStr += '<div id="lottie"></div>';
				lottieStr += '</div>';
		return $$(lottieStr);
	};

	const setText = function(params) {
		const $point = params.$point,
					store = params.store,
					type = params.type,
          position = params.position,
          name = store.name2||store.text||store.name,
          fontSize = params.fontSize,
          txtDom = mng.textDom(name, fontSize);
    let pos = {x:0, y:1};

		const textWidth = Math.ceil(txtDom.outerWidth());
    const textHeight = Math.ceil(txtDom.outerHeight());
		if(type === "image"){
			pos.x = (-textWidth / 2);
			pos.y = 0;
		}else if(type === "iframe" || type === "SVG" || type === "lottie") {
			pos.x = (store.w - textWidth) / 2 ;
			pos.y = store.h - 10;
			store.textWidth = textWidth;
		}else if(type === "minimap") {
		  if(position === "center") {
        pos.x = (store.w - textWidth) / 2 ;
        pos.y = (store.h / 2) - (textHeight / 2);
      }else{
        pos.x = (store.w - textWidth) / 2 ;
        pos.y = store.h - 20;
      }
		}else{
			const direction = store.text_direction || "bottom";
			if(direction === "right") {
				pos.x = 20;
			}else if(direction === "left") {
				pos.x = -textWidth - 3;
			}else if(direction === "bottom") {
				pos.x = (-textWidth / 2) + 9;
				pos.y = 21;
			}else if(direction === "top") {
				pos.x = (-textWidth / 2) + 9;
				pos.y = -21;
			}
		}

		$point.append('<span class="textMarker"'
				+'style="'
					+'top:'+pos.y+'px; '
					+'left:'+pos.x+'px; '
          +((fontSize)?'font-size:'+fontSize+'px':'')
				+'">'
					+name
				+'</span>');
	};

	const setTextIcon = function(params) {
    const store = params.store,
          name = store.name2||store.text||store.name,
          fontSize = params.fontSize,
          txtDom = mng.textDom(name, fontSize),
          textWidth = Math.ceil(txtDom.outerWidth()),
          textHeight = Math.ceil(txtDom.outerHeight());

    if(textHeight / 14 === 1 && textWidth > 150){
      if(name.indexOf(" ") > -1) {
        store.name2 = name.replace(" ", "<br>");
      }else if(name.indexOf(".") > -1) {
        store.name2 = name.replace(".", "<br>");
      }
    }
	  setText(params);
  };

	const setMinimap = function(loc, store) {
		return $$('<div class="minimapImageMarker" ">'
					+ '<img alt="" src="'+mng.getImgPath()+'map_icon/puff.svg" draggable="false">'
				+'</div>');
	};

	const setSymbolMinimap = function(loc, store) {
    const $point = setLottie(loc, store, "minimap");
    if( store.name ){
    	setText({$point:$point, store, type:"minimap", fontSize: 14, position:"center"});
    }
		return $point;
	};

	const setTextMarker = function(loc, store) {
	  const txtDom = mng.textDom(store.name, store.font_size);
    const textWidth = Math.ceil(txtDom.outerWidth());
    const textHeight = Math.ceil(txtDom.outerHeight());
    store.textWidth = textWidth / 2;
    store.textHeight = textHeight / 2;

    return $$('<div id="'+store.key+'" class="text-onlyMarker"'
      +'style="'
      +((store.font_size)?'font-size:'+store.font_size+'px;':'')
      +'width:' +textWidth + 'px;'
      +'left:'+(loc.x - store.textWidth)+'px; '
      +'top:'+(loc.y - store.textHeight )+'px; '
      +((store.text_rotate)?'transform: rotate('+store.text_rotate+'deg);':'')
      +'">'
      +store.name
      +'</div>');
  };

  publicObj.IconGroupMarker = function( options ) {
    const Group = function() {
      this.setValues( options );
      this.markerLayer = $$('<div />').addClass("overlayMarkers");
    };

    Group.prototype = new google.maps.OverlayView;
    Group.prototype.onRemove = IconGroupFn.remove;
    Group.prototype.draw = IconGroupFn.draw;
    Group.prototype.onAdd = IconGroupFn.add;

    return new Group(options);
  };

  const IconGroupFn = {
    addDom : function(projection, fragment, zoom, store, name) {
      let loc,
          map_res_url ;

      if(name === "bus") {
        map_res_url = 67;
      }else if(name === "toilet") {
        map_res_url = 10;
      }else if(name === "metro") {
        map_res_url = 60;
      }
      if(!store.latLng){
        store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
      }
      loc = projection.fromLatLngToDivPixel( store.latLng );
      store.map_res_url = map_res_url;

      let $point = setPicto(loc, store);
      if(name === "metro") {
        store.name2 = store.name  + " 역";
      }
      setTextIcon({$point, store});

      fragment.appendChild( $point[0] );
    },
		add : function() {
      const $pane = $$(this.getPanes().overlayImage); // Pane 4
      $pane.append( this.markerLayer );
      const projection = this.getProjection(),
        fragment = document.createDocumentFragment(),
        zoom = this.getMap().getZoom(),
        name = this.name;

      this.markerLayer.empty();
      _.each(this.datas, (store) => {
        IconGroupFn.addDom(projection, fragment, zoom, store, name);
      });

      this.markerLayer.append(fragment);
		},
    remove : function() {
      const removeName = "markers.groupMarkers.icon." + this.name;
      if(infosMng.has(removeName)) {
        const removeMarker = infosMng.get(removeName);
        removeMarker.markerLayer.remove();
        removeMarker.setMap(null);
        infosMng.del(removeName);
      }
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom();
			let loc;

			if(zoom >= this.minZoom) {
        _.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( store.latLng );
					$$("#"+store.key).css({
						"left":loc.x+"px",
						"top":(loc.y - 10)+"px",
					});
				});
			}else{
				this.onRemove();
			}
		},
    addDatas: function(newDatas, name) {
      const groupMarker = infosMng.get("markers.groupMarkers.icon." + name),
        projection = groupMarker.getProjection(),
        fragment = document.createDocumentFragment(),
        zoom = NoblMap.map.getZoom(),
        addDom = this.addDom;

      _.each(newDatas, (data) => {
        addDom(projection, fragment, zoom, data, name);
      });
      groupMarker.markerLayer.append( fragment );
      groupMarker.datas = groupMarker.datas.concat(newDatas);
    },
    removeDatas: function(removeDatas, name) {
      const groupMarker = infosMng.get("markers.groupMarkers.icon." + name);
      let datas = groupMarker.datas;

      _.each(removeDatas, (removeData) => {
        $$("#"+removeData.key).remove();
        datas = datas.filter((data) => data.key !== removeData.key);
      });
      groupMarker.datas = datas;
    },
    changeDatas: function(name, newDatas) {
      const datas = infosMng.get("markers.groupMarkers.icon." + name + ".datas");
      let addDatas = [],
        removeDatas = _.assign([], datas);

      if(datas) {
        _.each(newDatas, (newData) => {
          let data,
            checkFlag = true;

          for(let i=0, n=datas.length; i<n; i++) {
            data = datas[i];
            if(!newData.key) {
              addDatas.push(newData);
              checkFlag = false;
              break;
            }

            if(newData.key === data.key) {
              removeDatas = removeDatas.filter((removeData) => removeData.key !== data.key );
              checkFlag = false;
              break;
            }
          }
          if(checkFlag) {
            addDatas.push(newData);
          }
        });

        this.removeDatas(removeDatas, name);
        this.addDatas(addDatas, name);
      }
    }
	};
  publicObj.IconGroupFn = IconGroupFn;

	publicObj.MinimapGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers minimap");
		};

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = _.debounce(MinimapGroupFn.remove, 30, { 'trailing': true });
		Group.prototype.draw = MinimapGroupFn.draw;
		Group.prototype.onAdd = MinimapGroupFn.add;
		return new Group(options);
	};

	const MinimapGroupFn = {
		visible_: function(maxZoom, curZoom){
			return (NoblMap.infos.selectedMap)?"hidden":"";
		},
		add : function() {
      const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			this.markerLayer.empty();
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment();
			let loc,
					datasMap = {};

			_.each(this.datas, (store) => {
          store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
					loc = projection.fromLatLngToDivPixel( store.latLng );
					store.key = "mid" + store.mid;

					store.w = 100;
					store.h = 100;
					loc.x = loc.x - (store.w / 2);
          loc.y = loc.y - (store.h / 2);

					datasMap["mid"+store.mid] = store;
          const $point = setSymbolMinimap(loc, store);
					fragment.appendChild( $point[0] );

          Manage.lottieMng.makeLottie({
            container : $point.find("#lottie")[0],
            path: mng.getImgPath() +"datas/lottie/location_map.json"
          });
				});
				this.markerLayer.append(fragment);
				this.datasMap = datasMap;
		},
		remove : function() {
      let minimap = infosMng.get("markers.groupMarkers.minimap");
			if(minimap) {
				minimap.markerLayer.remove();
				minimap.setMap(null);
				infosMng.del("markers.groupMarkers.minimap");
			}
		},
		draw : function() {
			// console.log("minimap draw", this.name, new Date().format("HH:mm:ss.ms"))
			const zoom = this.getMap().getZoom(),
            bounds = this.getMap().getBounds();

			if(zoom > infosMng.get("imapData.area.minZoom") - 1) {
				const projection = this.getProjection();
				let loc;

        _.each(this.datas, (store) => {
          store.visibility = bounds.contains(store.latLng)?"":"hidden";
					loc = projection.fromLatLngToDivPixel( store.latLng );
					$$("#"+store.key).css({
						"left":(loc.x - (store.w / 2))+"px",
						"top": (loc.y - (store.h / 2))+"px",
            "visibility": store.visibility
					});
				});
			}else{
				this.onRemove();
			}
		}
	};

	publicObj.PictoSymbolComplexGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers pictos");
		};

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = PictoSymbolComplexGroupFn.remove;
		Group.prototype.draw = PictoSymbolComplexGroupFn.draw;
		Group.prototype.onAdd = PictoSymbolComplexGroupFn.add;

		return new Group(options);
	};

	const PictoSymbolComplexGroupFn = {
		addDom : function(projection, fragment, zoom, store) {
			let loc,
					$point;

			if(store.cf) {
				const cf = JSON.parse(store.cf);
				const cv = JSON.parse(store.cv);
				const chkList = ["w","h","text_direction", "name_display"];
				_.each(chkList, (key) => {
					const keyIdx = _.indexOf(cf, key);
					if(keyIdx > -1) {
						if(key === "w" || key === "h") {
							store[key] = Number(cv[keyIdx]);
						}else{
							if(key === "name_display") {
								store[key] = JSON.parse(cv[keyIdx].toLowerCase());
							}else{
								store[key] = cv[keyIdx];
							}
						}
					}
				});
			}else if(store.name_display && typeof store.name_display === "string"){
			  store.name_display = JSON.parse(store.name_display);
      }
			store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
			loc = projection.fromLatLngToDivPixel( store.latLng );
      if(!store.key) {
        if (store.mid) {
          store.key = "pictos_spots_" + store.pid;
        } else {
          store.key = "pictos_places_" + store.pid;
        }
      }

      if(store.type === "text") {
        $point = setTextMarker(loc, store);

      }else if(store.map_type === 1) {
				$point = setPicto(loc, store);
				if(store.name || store.text) {
          setText({$point, store});
        }
			}else if(store.map_type > 1) {
				loc.x -= (store.w / 2);
				loc.y -= (store.h / 2);

				store.assetFolder = (store.mid)?"spots":"places";
				store.assetId = store.pid;
				store.assetFile = store.map_res_url;
				if(store.map_type === 2) {
					$point = setIFrame(loc, store, true);
					if(store.name_display) {
						setText({$point, store, type:"iframe"});
					}
				}else if(store.map_type === 3) { // 상위 SVG
					$point = setSVG(loc, store);
					if(store.name_display) {
						setText({$point, store, type:"SVG"});
					}
				}else if(store.map_type === 4) {
					$point = setLottie(loc, store);
					if(store.name_display) {
            setText({$point, store, type:"lottie"});
					}
        }else if(store.map_type === 5) { // 하위 SVG
          $point = setLowSVG(loc, store);
          if(store.name_display) {
            setText({$point, store, type:"SVG"});
          }
				}

			}else{
				console.log("map_type이 1,2,3,4가 아님. ", store);
			}

			fragment.appendChild( $point[0] );

			if(store.map_type === 3 || store.map_type === 5) {
				if($$("#hide_"+store.key).length === 0) {
					Ajax.run({url:mng.getImgUrl(store.assetFolder, store.assetId, store.assetFile)}, (svg, res) => {
						$$("#hideArea").append('<div id="hide_'+store.key+'">'+res.data+'</div>');
						mng.fnRecursive(10, () => $$("#hide_"+store.key+" svg").length > 0 , () => {
							infosMng.set("svgFiles."+store.key, btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString($$("#hide_"+store.key+" svg")[0])))));
							$$("#hide_"+store.key).remove();
						});
					});
				}
				mng.fnRecursive(20, () => !!infosMng.get("svgFiles."+store.key) && $$("#"+store.key+" img").length > 0 , () => {
					$$("#"+store.key+" img")
						//.css({"width":store.w+"px","height":store.h+"px"})
						.attr("src", 'data:image/svg+xml;base64,' + infosMng.get("svgFiles."+store.key));
				});
			}else if(store.map_type === 4) {
				Manage.lottieMng.makeLottie({
					container : $point.find("#lottie")[0],
					path: mng.getImgUrl(store.assetFolder, store.assetId, store.assetFile)
				});
			}
		},
		add : function() {
			const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment(),
						zoom = this.getMap().getZoom();

			this.markerLayer.empty();
			_.each(this.datas, (store, idx) => {
				PictoSymbolComplexGroupFn.addDom(projection, fragment, zoom, store);
			});

			this.markerLayer.append(fragment);
		},
		remove : function() {
			const removeComplex = infosMng.get("markers.groupMarkers.complex." + this.name);
			if(removeComplex) {
				removeComplex.markerLayer.remove();
				removeComplex.setMap(null);
				infosMng.del("markers.groupMarkers.complex." + this.name);
			}
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom(),
            popover = mng.getPopover();

			let loc;
			if(infosMng.get("imapData.area.minZoom") - 1 < zoom) {
				_.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( store.latLng );
					if(store.map_type > 1) {
						loc.x -= (store.w / 2);
						loc.y -= (store.h / 2);
					}

					if(store.type === "text") {
            $$("#"+store.key).css({
              "left":(loc.x - store.textWidth)+"px",
              "top":(loc.y - store.textHeight)+"px",
            });
          }else{
            $$("#"+store.key).css({
              "left":loc.x+"px",
              "top":(loc.y - 10)+"px",
            });
          }

					if(/^overliadPictos/.test(store.key) && popover.get("." + store.key) ) {
					  const beforeZoom = this.beforeZoom || zoom;
					  if(beforeZoom === zoom) {
              const popoverDom = popover.get("." + store.key).$el,
                latlng = popoverDom.data("latlng"),
                pixel = mng.fromGpsToPixel(latlng.lat, latlng.lng);

              popoverDom.css({
                left: pixel.x + "px",
                top: pixel.y + "px",
              });
            }else{
					    CustomMarkers.removeOverlayPopover();
            }
          }
				});
			}else{
				if(this.datas && this.datas.length > 0) {
					PictoSymbolComplexGroupFn.removePictos(this.datas);
				}
			}
			this.beforeZoom = zoom;
		},
		addPictos: function(newDatas) {
      if(newDatas.length > 0) {
        const pictograms = infosMng.get("markers.groupMarkers.complex.pictograms"),
          projection = pictograms.getProjection(),
          fragment = document.createDocumentFragment(),
          zoom = NoblMap.map.getZoom(),
          PictosFn = NoblMap.CustomOverlays.PictoSymbolComplexGroupFn;

        _.each(newDatas, (data) => {
          PictosFn.addDom(projection, fragment, zoom, data);
        });
        pictograms.markerLayer.append( fragment );
        pictograms.datas = pictograms.datas.concat(newDatas);
      }
		},
		removePictos: function(removeDatas) {
      if(removeDatas.length > 0) {
        const pictograms = infosMng.get("markers.groupMarkers.complex.pictograms");
        let datas = pictograms.datas;

        _.each(removeDatas, (removeData) => {
          $$("#"+removeData.key).remove();
          datas = datas.filter((data) => data.key !== removeData.key);
        });
        infosMng.set("markers.groupMarkers.complex.pictograms.datas", datas);
      }
		}
	};
	publicObj.PictoSymbolComplexGroupFn = PictoSymbolComplexGroupFn;

	publicObj.LottiesComplexGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers");
		};

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = _.debounce(LottiesComplexGroupFn.remove, 50, { 'trailing': true });
		Group.prototype.draw = LottiesComplexGroupFn.draw;
		Group.prototype.onAdd = LottiesComplexGroupFn.add;

		return new Group(options);
	};

	const LottiesComplexGroupFn = {
		add : function() {
			const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment();

			let loc,
					$point;

			this.markerLayer.empty();
			_.each(this.datas, (store, idx) => {
				store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
				store.key = "lotties_" + idx;
				loc = projection.fromLatLngToDivPixel( store.latLng );
				loc.x -= (store.w / 2);
				loc.y -= (store.h / 2);

				$point = setLottie(loc, store);
				fragment.appendChild( $point[0] );

				Manage.lottieMng.makeLottie({
					container : $point.find("#lottie")[0],
	        path: store.path
				});
				$point.find("#lottie")[0];
			});

			this.markerLayer.append(fragment);
		},
		remove : function() {
			const removeComplex = infosMng.get("markers.groupMarkers.complex." + this.name);
			if(removeComplex) {
				removeComplex.markerLayer.remove();
				removeComplex.setMap(null);
				infosMng.del("markers.groupMarkers.complex." + this.name);
			}
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom();

			let loc;
			if(zoom >= this.minZoom || this.datas.length > 0) {
				_.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( store.latLng );
					if(store.map_type === 2) {
						loc.x -= (store.w / 2);
						loc.y -= (store.h / 2);
					}
					$$("#"+store.key).css({
						"left":loc.x+"px",
						"top":(loc.y - 10)+"px",
					});
				});
			}else{
				this.onRemove();
			}
		}
	};

	publicObj.PolygonSymbolMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers");
		};

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = PolygonSymbolFn.remove;
		Group.prototype.draw = PolygonSymbolFn.draw;
		Group.prototype.onAdd = PolygonSymbolFn.add;

		return new Group(options);
	};

	const PolygonSymbolFn = {
		add : function() {
			const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment();
			let loc,
					$point;

			_.each(this.datas, (store) => {
        store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
        loc = projection.fromLatLngToDivPixel( store.latLng );

        store.w = 200;
        store.h = 200;
        loc.x = loc.x - (store.w / 2);
        loc.y = loc.y - (store.h / 2);

        $point = setLottie(loc, store);
        fragment.appendChild( $point[0] );

        Manage.lottieMng.makeLottie({
          container : $point.find("#lottie")[0],
          path: mng.getImgPath() +"datas/lottie/location_map.json"
        });
      });
			this.markerLayer.append(fragment);
		},
		remove : function() {
			const removeComplex = infosMng.get("markers.groupMarkers.complex.polygonSymbol");
			if(removeComplex) {
				removeComplex.markerLayer.remove();
				removeComplex.setMap(null);
				infosMng.del("markers.groupMarkers.complex.polygonSymbol");
			}
		},
		draw : function() {
			const projection = this.getProjection(),
						zoom = this.getMap().getZoom();

			let loc;
			if((zoom < this.maxZoom) && this.datas.length > 0) {
				_.each(this.datas, (store) => {
					loc = projection.fromLatLngToDivPixel( store.latLng );

					$$("#"+store.key).css({
						"left":loc.x - (store.w / 2)+"px",
						"top":(loc.y - (store.h / 2))+"px",
					});
				});
			}else{
				this.onRemove();
			}
		}
	};

	publicObj.MarkerGroupMarker = function( options ) {
		const Group = function() {
			this.setValues( options );
			this.markerLayer = $$('<div />').addClass("overlayMarkers actions");
		};

		Group.prototype = new google.maps.OverlayView;
		Group.prototype.onRemove = MarkerGroupFn.remove;
		Group.prototype.draw = MarkerGroupFn.draw;
		Group.prototype.onAdd = MarkerGroupFn.add;

		return new Group(options);
	};

	const MarkerGroupFn = {
		addDom : function(projection, fragment, zoom, store, name) {
			let loc,
					$point;

			store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
			loc = projection.fromLatLngToDivPixel( store.latLng );
			store.key = name + "_marker_" + store.pid;

			$point = setMarker(loc, store);
			fragment.appendChild( $point[0] );
		},
		add : function() {
			const $pane = $$(this.getPanes().overlayImage); // Pane 4
			$pane.append( this.markerLayer );
			const projection = this.getProjection(),
						fragment = document.createDocumentFragment(),
						zoom = this.getMap().getZoom(),
						name = this.name;

			this.markerLayer.empty();
			_.each(this.datas, (store) => {
				MarkerGroupFn.addDom(projection, fragment, zoom, store, name);
			});

			this.markerLayer.append(fragment);
		},
		remove : function() {
      const removeName = "markers.groupMarkers.markers." + this.name;
			if(infosMng.has(removeName)) {
        const removeComplex = infosMng.get(removeName);
				removeComplex.markerLayer.remove();
				removeComplex.setMap(null);
				infosMng.del(removeName);
			}
		},
		draw : function() {
			const projection = this.getProjection();
			let loc;

			_.each(this.datas, (store) => {
				loc = projection.fromLatLngToDivPixel( store.latLng );
				$$("#"+store.key).css({
					"left":loc.x+"px",
					"top":(loc.y - 35)+"px",
				});
			});
		},
		addDatas: function(newDatas, name) {
			const markers = infosMng.get("markers.groupMarkers.markers." + name),
						projection = markers.getProjection(),
						fragment = document.createDocumentFragment(),
						zoom = NoblMap.map.getZoom(),
						MarkerFn = NoblMap.CustomOverlays.MarkerGroupFn;

			_.each(newDatas, (data) => {
				MarkerFn.addDom(projection, fragment, zoom, data);
			});
			markers.markerLayer.append( fragment );
			markers.datas = markers.datas.concat(newDatas);
		},
		removeDatas: function(removeDatas, name) {
			const markers = infosMng.get("markers.groupMarkers.markers." + name);
			let datas = markers.datas;

			_.each(removeDatas, (removeData) => {
				$$("#"+removeData.key).remove();
				datas = datas.filter((data) => data.key !== removeData.key);
			});
			markers.datas = datas;
		}
	};
	publicObj.MarkerGroupFn = MarkerGroupFn;

  publicObj.SingleMarker = function( options ) {
    const Group = function() {
      this.setValues( options );
      this.markerLayer = $$('<div />').addClass("overlayMarkers single");
    };

    Group.prototype = new google.maps.OverlayView;
    Group.prototype.onRemove = SingleMarkerFn.remove;
    Group.prototype.draw = SingleMarkerFn.draw;
    Group.prototype.onAdd = SingleMarkerFn.add;

    return new Group(options);
  };

  const SingleMarkerFn = {
    addDom : function(projection, fragment, zoom, store, name) {
      let loc,
        $point;

      store.latLng = new google.maps.LatLng({lat:store.lat, lng:store.lng});
      loc = projection.fromLatLngToDivPixel( store.latLng );
      store.key = name + "_marker";

      if(mng.getDevice().ie) {
        store.w = 50;
        store.h = 120;
      }else{
        store.w = 50;
        store.h = 50;
      }

      loc.x = loc.x - (store.w / 2);
      loc.y = loc.y - (store.h / 2);

      $point = setLottie(loc, store);
      fragment.appendChild( $point[0] );

      Manage.lottieMng.makeLottie({
        container : $point.find("#lottie")[0],
        path: mng.getImgPath() +"datas/lottie/location_" + name + ".json"
      });

    },
    add : function() {
      const $pane = $$(this.getPanes().overlayImage); // Pane 4
      $pane.append( this.markerLayer );
      const projection = this.getProjection(),
        fragment = document.createDocumentFragment(),
        zoom = this.getMap().getZoom(),
        name = this.name;

      this.markerLayer.empty();
      _.each(this.datas, (store) => {
        SingleMarkerFn.addDom(projection, fragment, zoom, store, name);
      });

      this.markerLayer.append(fragment);
    },
    remove : function() {
      const removeName = "markers.groupMarkers.markers." + this.name;
      if(infosMng.has(removeName)) {
        const removeComplex = infosMng.get(removeName);
        removeComplex.markerLayer.remove();
        removeComplex.setMap(null);
        infosMng.del(removeName);
      }
    },
    draw : function() {
      const projection = this.getProjection();
      let loc;

      _.each(this.datas, (store) => {
        loc = projection.fromLatLngToDivPixel( store.latLng );
        $$("#"+store.key).css({
          "left":(loc.x - (store.w / 2)) + "px",
          "top":(loc.y - (store.h / 2))+"px",
        });
      });
    }
  };

  // 위경도를 받아서 Bounds를 리턴한다.
  publicObj.MapOverlay = function(options) {
    const MapOverlay = function(options) {this.setValues( options );};

    MapOverlay.prototype = new google.maps.OverlayView();
    MapOverlay.prototype.onAdd = function() { };
    MapOverlay.prototype.onRemove = function() { this.setMap(null); };
    MapOverlay.prototype.draw = function() { };
    MapOverlay.prototype.getBounds = function(data) {
      const loc = new google.maps.LatLng(data.lat, data.lng),
            bounds = new google.maps.LatLngBounds(loc, loc),
            pixel = mng.fromGpsToPixel(data.lat, data.lng),
            trPix = {x:pixel.x, y:pixel.y},
            blPix = {x:pixel.x, y:pixel.y};

      trPix.x += 25;
      trPix.y -= 5;
      blPix.x -= 5;
      blPix.y += 25;

      const ne = mng.fromPixelToGps(trPix.x, trPix.y);
      const sw = mng.fromPixelToGps(blPix.x, blPix.y);

      bounds.extend(ne);
      bounds.extend(sw);

      if(NoblMap.infos.test) {
        new google.maps.Marker({map:NoblMap.map, position:bounds.getSouthWest()});
        new google.maps.Marker({map:NoblMap.map, position:bounds.getNorthEast()});
      }

      return bounds;
    };

    return new MapOverlay(options);
  };

	return publicObj;
}());

// 이미지 마커에 text 라벨 추가요~
const CustomMarkers = (function(){
  let publicObj = {};
	publicObj.setTitle = function(txt) {
		$$(".fab-left-bottom .titleTxt").text(txt);
	};

	publicObj.addMinimapGroupMarker = function(datas) {
		if(!infosMng.has("markers.groupMarkers.minimap")){
			const groupMarker = CustomOverlays.MinimapGroupMarker({
	    	map: NoblMap.map,
	    	datas,
				minZoom: infosMng.get("imapData.area.minZoom"),
				name: "minimap"
	    });
	    infosMng.set("markers.groupMarkers.minimap", groupMarker);

      groupMarker.markerLayer.on("click", ".lottieMarker", (e) => {
	    //groupMarker.markerLayer.on("click", ".minimapImageMarker", function(e) {
	      // (e.stopPropagation) && e.stopPropagation();
				NoblMap.stopCircle = true;
        if(infosMng.has("clickCancel")) {
          infosMng.del("clickCancel");
          return false;
        }
        infosMng.del("clickCancel");
	      const key = $$(e.target).parents(".symbol, [class*=Marker]").eq(0).attr("id"),
							data = groupMarker.datasMap[key];

				publicObj.setTitle(Manage.mng.getGName() +" "+ data.name.split("<br>").join(" "));

				if(!NoblMap.map.mapTypes.hasOwnProperty(key+"Type")) { // 맵타입 없으면 생성
					NoblMap.imageMapType.setMapType(key+"Type", data.minZoom-1, (data.maxZoom+1 <= 20)?20:data.maxZoom+1, data.mid);
				}
				NoblMap.map.setMapTypeId(key+"Type");
        const zoom = NoblMap.map.getZoom();
				NoblMap.setCenterZoom(data.lat, data.lng, (zoom > data.zoom)?zoom:data.zoom);
        // NoblMap.map.setZoom((zoom > data.zoom)?zoom:data.zoom);
				infosMng.get("markers.groupMarkers.minimap").onRemove();
	    });
		}
  };

	// type : "open" 이라면 overlay 개수가 1개일 땐 삭제하지 않는다.
  publicObj.removeOverlayPopover = function(type) {
    // $$(".popover.overlay")
    const targets = $$(".popover.overlay").toArray();
    if(type === "open") {
      targets.splice(targets.length - 1, 1);
    }

    _.each(targets, (target) => {
      const divDom = $$(target);
      const popoverObj = mng.getPopover().get("."+divDom.attr("class").split(" ").filter((str) => /^overliadPictos/.test(str))[0]);
      if(popoverObj) {
        popoverObj.close();
        popoverObj.destroy();
      }
      divDom.remove();
    });
  };

	publicObj.addPictoSymbolGroupMarker = function(name, datas, minZoom){
		if(!infosMng.has("markers.groupMarkers.complex." + name)) {
			_.each(infosMng.get("markers.groupMarkers.complex"), (gMarker) => {
				gMarker.onRemove();
			});
			const groupMarker = CustomOverlays.PictoSymbolComplexGroupMarker({
				map: NoblMap.map,
				datas,
				minZoom,
				name
			});
			infosMng.set("markers.groupMarkers.complex." + name, groupMarker);

			groupMarker.markerLayer.on("click", ".pictoMarker, .iframeEvent, .svgMarker, .lottieMarker, .lowSvgMarker", (e) => {
				NoblMap.stopCircle = true;
        if(infosMng.has("clickCancel")) {
          infosMng.del("clickCancel");
          return false;
        }
        infosMng.del("clickCancel");

        let eTarget = $$(e.target);
        if(eTarget.children().length > 0) {
          eTarget = eTarget.children();
        }
        if(eTarget.parents(".symbol, [class*=Marker]").eq(0).is(".textMarker")) {
          eTarget = eTarget.parent();
        }
        const pid = eTarget.parents(".symbol, [class*=Marker]").eq(0).attr("id");
        console.log(pid);
        if(/^overliadPictos_/.test(pid)) {
          const data = groupMarker.datas.filter((data) => data.key === pid)[0];

          let content = '<div class="popover overlay '+data.key+'"><div class="popover-inner"><div class="list"><ul>';
          _.each(data.children, (child) => {
            content += '<li data-key="'+child.key+'" data-mid="'+ (child.mid || '')+'"><a class="list-button item-link popover-close pointer">';
            content += '<img src="'+mng.getImgUrl("pictogram", child.map_res_url)+'" draggable="false"/> '+child.name.split("<br>").join("");
            content += '</a></li>';
          });
          content += '</ul></div></div></div>';


          const popover = mng.getPopover().create({
            targetEl: "div#" + data.key,
            content,
            backdrop: false,
            on: {
              closed : function() {
                publicObj.removeOverlayPopover();
              },
              open: function(popover) {
                publicObj.removeOverlayPopover("open");
                setTimeout(()=>{
                    $$("body").on("click", function(e) {
                      if (!infosMng.get("clickCancel")) {
                        $$("body").off("click");
                      }
                      if($$(e.target).parents(".popover.overlay").length === 1) {
                        const pid = $$(e.target).parent().data("key");
                        let detailPid;
                        if(pid.indexOf("place") > -1) {
                          detailPid = pid.split("_").last();
                        }else{
                          const tempPid = pid.split("_").last().toNum();
                          detailPid = "spot_" + $$(this).data("mid") + "." + tempPid;
                        }
                        mng.goPage(".popup-menu-detail-view", "/menuDetail/" + detailPid);
                        mng.openPopup($$("#popup-menu-detail"));
                      }else{
                        if(!infosMng.get("clickCancel")) {
                          CustomMarkers.removeOverlayPopover();
                        }
                      }
                    });
                }, 300);
              },
              opened: function(popover) {
                const target = popover.$el;
                const latLng = mng.fromPixelToGps(target.css("left").pxRemoveNum(), target.css("top").pxRemoveNum());
                target.data("latlng", latLng.toJSON());
              }
            }
          }).open();
        }else{
          let detailPid;
          console.log(e, $$(e.target), pid);
          if(pid.indexOf("place") > -1) {
            detailPid = pid.split("_").last();
          }else{
            const tempPid = pid.split("_").last().toNum();
            const mid = groupMarker.datas.filter((data) => data.mid && data.pid === tempPid).first().mid;
            detailPid = "spot_" + mid + "." + tempPid;
          }
          mng.goPage(".popup-menu-detail-view", "/menuDetail/" + detailPid);
          mng.openPopup($$("#popup-menu-detail"));
        }
			});

			return groupMarker;
		}
	};

	publicObj.addMarkerGroupMarker = function(name, datas){
		if(infosMng.has("markers.groupMarkers.markers." + name)) {
			infosMng.get("markers.groupMarkers.markers." + name).onRemove();
		}

		const groupMarker = CustomOverlays.MarkerGroupMarker({
			map: NoblMap.map,
			datas,
			name
		});
		infosMng.set("markers.groupMarkers.markers." + name, groupMarker);

		groupMarker.markerLayer.on("click", ".markerMarker", (e) => {
			NoblMap.stopCircle = true;

			let pid = $$(e.target).parent().attr("id").split("_").last().toNum();
			let data = groupMarker.datas.filter((data) => data.pid === pid)[0];
			let displayZoom = data.display_zoom;
			if(groupMarker.name === "search") {
        displayZoom = 19;
      }
			infosMng.set("changeZoom", displayZoom);
      setTimeout(()=> infosMng.del("changeZoom"), 1000);
			NoblMap.map.setZoom(displayZoom);
      NoblMap.map.panTo(data.latLng);
		});
	};

  publicObj.addClickGroupMarker = function(datas){
    const infoKey = "markers.groupMarkers.markers.click";
    if(infosMng.has(infoKey)) {
      infosMng.get(infoKey).onRemove();
    }
    const groupMarker = CustomOverlays.SingleMarker({
      map: NoblMap.map,
      datas,
      name: "click"
    });
    infosMng.set(infoKey, groupMarker);

    groupMarker.markerLayer.on("click", ".lottieMarker", (e) => {
      NoblMap.stopCircle = true;

      let data = groupMarker.datas[0];
      NoblMap.geoCoder.geocode({'location': {lat:data.lat, lng:data.lng}}, function(results, status) {
        let msgTxt = Manage.lang.trans("DEFINE_ADDRESS_TRANS_FAILED");
        if(status === "OK") {
          msgTxt = results[0].formatted_address;
        }
        msg.navi2(msgTxt, data);
      });
    });
  };

  publicObj.addGPSGroupMarker = function(datas){
    const infoKey = "markers.groupMarkers.markers.gps";
    if(infosMng.has(infoKey)) {
      infosMng.get(infoKey).onRemove();
    }

    const groupMarker = CustomOverlays.SingleMarker({
      map: NoblMap.map,
      datas,
      name: "gps"
    });
    infosMng.set(infoKey, groupMarker);

    groupMarker.markerLayer.on("click", ".singleMarker", (e) => {
      NoblMap.stopCircle = true;
      console.log("gps");
    });
  };


  publicObj.addIconGroupMarker = function(datas, name, zoom){
    const groupMarker = CustomOverlays.IconGroupMarker({
      map: NoblMap.map,
      datas,
      minZoom: zoom,
      name
    });
    infosMng.set("markers.groupMarkers.icon." + name, groupMarker);
    return groupMarker;
  };

	publicObj.addPolygonSymbolMarker = function(datas, maxZoom){
		if(!infosMng.has("markers.groupMarkers.complex.polygonSymbol")) {
			const groupMarker = CustomOverlays.PolygonSymbolMarker({
				map: NoblMap.map,
				datas,
				maxZoom
			});
			infosMng.set("markers.groupMarkers.complex.polygonSymbol", groupMarker);
		}
	};

	publicObj.debounceRestrictMovement = _.debounce(function() {
		const mapType = NoblMap.map.getMapTypeId().split("Type")[0];
		if(mapType !== "roadmap") {
			const bounds = NoblMap.infos.headers.filter((head) => head.key === mapType)[0].bounds;
			const center = NoblMap.map.getCenter();

			if (bounds.contains(center)) return;
			const	maxX = bounds.getNorthEast().lng(),
						maxY = bounds.getNorthEast().lat(),
						minX = bounds.getSouthWest().lng(),
						minY = bounds.getSouthWest().lat();

			let x = center.lng(),
					y = center.lat();

			if (x < minX) x = minX;
			if (x > maxX) x = maxX;
			if (y < minY) y = minY;
			if (y > maxY) y = maxY;
			NoblMap.map.setCenter(new google.maps.LatLng(y, x));
		}
	}, 100);


	publicObj.addToiletGroupMarker = function(){
	  const toiletKey = "markers.groupMarkers.icon.toilet",
          toiletDataKey = "infos.toilets";
		if(!infosMng.has(toiletKey) && infosMng.has(toiletDataKey)) {
			const datas = infosMng.get(toiletDataKey);
			const mapTypeId = NoblMap.map.mapTypeId;
			let containDatas = [];
			if(mapTypeId !== "roadmap" && mapTypeId !== infosMng.get("imapData.areaKey")) {
				const key = mapTypeId.split("Type").join("");
				const bounds = infosMng.get("headers").filter((head) => head.key === key)[0].bounds;
				containDatas = datas.filter((data) => bounds.contains(new google.maps.LatLng(data)));
			}

			const groupMarker = CustomOverlays.IconGroupMarker({
	      map: NoblMap.map,
	      datas: containDatas,
	      minZoom: 18,
				name:"toilet"
	    });
	    infosMng.set(toiletKey, groupMarker);

			groupMarker.markerLayer.on("click", ".pictoMarker", (e) => {
        NoblMap.stopCircle = true;
	    	const key = $$(e.target).parent().attr("id");
        const data = groupMarker.datas.filter((data) => data.key === key)[0];
        infosMng.set("toilet.detailInfo", data);

        mng.goPage(".popup-menu-detail-view", "/menuDetail/" + key);
        mng.openPopup($$("#popup-menu-detail"));
	    });
	    return groupMarker;
		}
  };

  publicObj.addMetroGroupMarker = function(datas){
    const metroKey = "markers.groupMarkers.icon.metro";

    if(!infosMng.has(metroKey)) {
      const groupMarker = CustomOverlays.IconGroupMarker({
        map: NoblMap.map,
        datas,
        minZoom: 18,
        name:"metro"
      });
      infosMng.set(metroKey, groupMarker);

      groupMarker.markerLayer.on("click", ".pictoMarker", (e) => {
        NoblMap.stopCircle = true;
        const key = $$(e.target).parent().attr("id");
        const data = groupMarker.datas.filter((data) => data.key === key)[0];
        NoblMap.infos.metroData = data.datas;
        mng.getSheetName("metroSheet", $$("#metroSheet")).open();
      });
    }
  };

	publicObj.addLottiesGroupMarker = function(){
		const name = "lotties";
		const datas = [
			{lat:37.4369820268356, lng:127.10272075839089, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/funky_chicken.json"},
			{lat:37.418169851698806, lng:27.09834339327858, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/happy.json"},
			{lat:37.395427247877855, lng:127.09234258978108, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/loading_retro_rectangle.json"},
			{lat:37.377003505954015, lng:127.07406019635175, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/paw_like.json"},
			{lat:37.3573950175247, lng:127.08342254291529, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/spinner_into_confirmation.json"},
			{lat:37.364316559987245, lng:127.13700284247102, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/splash_screen_animation.json"},
			{lat:37.3900983846388, lng:127.14996327643098, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/star.json"},
			{lat:37.41000156375148, lng:127.16133276209757, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/star_with_confetti.json"},
			{lat:37.43395882643481, lng:127.17309719450736, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/super.json"},
			{lat:37.45534401931291, lng:127.16694233031842, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/loading.json"},

			{lat:37.45585876048914, lng:127.0858290500264, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/funky_chicken.json"},
			{lat:37.4553136841234, lng:127.05012348362015, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/happy.json"},
			{lat:37.42587366160614, lng:127.03604725071, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/loading_retro_rectangle.json"},
			{lat:37.39669481136057, lng:127.04531696506547, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/paw_like.json"},
			{lat:37.359864160430114, lng:127.03158405490922, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/spinner_into_confirmation.json"},
			{lat:37.33912191178025, lng:127.04222706028031, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/splash_screen_animation.json"},
			{lat:37.3530416848261, lng:127.05904987522172, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/star.json"},
			{lat:37.339940793390674, lng:127.08273914524125, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/star_with_confetti.json"},
			{lat:37.359318385203025, lng:127.17955616184281, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/super.json"},
			{lat:37.44631935056064, lng:127.17234638401078, w:100, h:100, path:Manage.mng.getImgPath()+"datas/lottie/loading.json"},
		];
		if(!infosMng.has("markers.groupMarkers.complex." + name)) {
			const groupMarker = CustomOverlays.LottiesComplexGroupMarker({
	      map: NoblMap.map,
	      datas,
	      minZoom: 12,
	      name
	    });
	    infosMng.set("markers.groupMarkers.complex." + name, groupMarker);
		}
  };


  return publicObj;
}());

export {CustomOverlays, CustomMarkers};
