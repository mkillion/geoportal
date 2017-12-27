define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/arcgis/utils",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/on",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "application/TableOfContents",
  	"application/Drawer",
    "application/DrawerMenu",
    "esri/dijit/HomeButton",
    "esri/dijit/LocateButton",
    "esri/dijit/BasemapToggle",
    "esri/dijit/Geocoder",
    "esri/dijit/Popup",
    "esri/dijit/Legend",
    "application/About",
   	"esri/dijit/OverviewMap",
    "dijit/registry",
    "dojo/_base/array",
	"esri/tasks/query",
	"esri/lang",
	"esri/layers/FeatureLayer",
    "esri/tasks/FindTask",
    "esri/tasks/FindParameters",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/dijit/Scalebar",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/InfoTemplate",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/layers/ArcGISTiledMapServiceLayer"
],
function(
    declare,
    lang,
    arcgisUtils,
    domConstruct,
    dom,
    on,
    domStyle,
    domAttr,
    domClass,
    TableOfContents, Drawer, DrawerMenu,
    HomeButton, LocateButton, BasemapToggle,
    Geocoder,
    Popup,
    Legend,
    About,
   	OverviewMap,
    registry,
    array,
	Query,
	esriLang,
	FeatureLayer,
    FindTask,
    FindParameters,
    Point,
    SpatialReference,
    Scalebar,
    ArcGISDynamicMapServiceLayer,
    InfoTemplate,
    IdentifyTask,
    IdentifyParameters,
    ArcGISTiledMapServiceLayer
) {
 	return declare("", [About], {
        config: {},
        constructor: function(){
            // css classes
            this.css = {
                mobileSearchDisplay: "mobile-locate-box-display",
                toggleBlue: 'toggle-grey',
                toggleBlueOn: 'toggle-grey-on',
                panelPadding: "panel-padding",
                panelContainer: "panel-container",
                panelHeader: "panel-header",
                panelSection: "panel-section",
                panelSummary: "panel-summary",
                panelDescription: "panel-description",
                panelModified: "panel-modified-date",
                panelViews: "panel-views-count",
                panelMoreInfo: "panel-more-info",
                pointerEvents: "pointer-events",
                iconRight: "icon-right",
                iconList: "icon-list",
                iconLayers: "icon-layers",
                iconAbout: "icon-info-circled-1",
                iconText: "icon-text",
                locateButtonTheme: "LocateButtonCalcite",
                homebuttonTheme: "HomeButtonCalcite",
                desktopGeocoderTheme: "geocoder-desktop",
                mobileGeocoderTheme: "geocoder-mobile",
                appLoading: "app-loading",
                appError: "app-error",
                // MK:
                iconZoomTo: "icon-zoom-in",
                iconWrench: "icon-wrench"
            };
            // pointer event support
            if(this._pointerEventsSupport()){
                domClass.add(document.documentElement, this.css.pointerEvents);
            }
            // mobile size switch domClass
            this._showDrawerSize = 850;
        },
        startup: function (config) {
            // config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id
            // any url parameters and any application specific configuration information.
            if (config) {
                //config will contain application and user defined info for the template such as i18n strings, the web map id
                // and application id
                // any url parameters and any application specific configuration information.
                this.config = config;
                // drawer
                this._drawer = new Drawer({
                    showDrawerSize: this._showDrawerSize,
                    borderContainer: 'bc_outer',
                    contentPaneCenter: 'cp_outer_center',
                    contentPaneSide: 'cp_outer_left',
                    toggleButton: 'hamburger_button'
                });
                // drawer resize event
                on(this._drawer, 'resize', lang.hitch(this, function () {
                    // check mobile button status
                    this._checkMobileGeocoderVisibility();
                }));
                // startup drawer
                this._drawer.startup();

                // MK:
                this.createFrameElements();

                //supply either the webmap id or, if available, the item info
                var itemInfo = this.config.itemInfo || this.config.webmap;
                this._createWebMap(itemInfo);
            } else {
                var error = new Error("Main:: Config is not defined");
                this.reportError(error);
            }
        },
        reportError: function (error) {
            // remove spinner
            this._hideLoadingIndicator();
            // add app error
            domClass.add(document.body, this.css.appError);
            // set message
            var node = dom.byId('error_message');
            if(node){
                if (this.config && this.config.i18n) {
                    node.innerHTML = this.config.i18n.map.error + ": " + error.message;
                } else {
                    node.innerHTML = "Unable to create map: " + error.message;
                }
            }
        },
        // if pointer events are supported
        _pointerEventsSupport: function(){
            var element = document.createElement('x');
            element.style.cssText = 'pointer-events:auto';
            return element.style.pointerEvents === 'auto';
        },
        _initLegend: function(){
            var legendNode = dom.byId('LegendDiv');

			if(legendNode){
                this._mapLegend = new Legend({
                    map: this.map,
                	layerInfos: this.layerInfos
                }, legendNode);
                this._mapLegend.startup();
            }
        },
        _initTOC: function(){
            // layers
         	var tocNode = dom.byId('TableOfContents'), tocLayers, toc;
            if (tocNode) {
                tocLayers = this.layers;
                toc = new TableOfContents({
                    map: this.map,
                    layers: tocLayers
                }, tocNode);
                toc.startup();
            }
        },
        _init: function () {
            // locate button
            if (this.config.enableLocateButton) {
                this._LB = new LocateButton({
                    map: this.map,
                    theme: this.css.locateButtonTheme
                }, 'LocateButton');
                this._LB.startup();
            }

            // home button
            if (this.config.enableHomeButton) {
                this._HB = new HomeButton({
                    map: this.map,
                    theme: this.css.homebuttonTheme
                }, 'HomeButton');
                this._HB.startup();
                // clear locate on home button
                on(this._HB, 'home', lang.hitch(this, function(){
                    if(this._LB){
                        this._LB.clear();
                    }
                }));
            }

            // basemap toggle
            if (this.config.enableBasemapToggle) {
                var BT = new BasemapToggle({
                    map: this.map,
                    basemap: this.config.nextBasemap,
                    defaultBasemap: this.config.defaultBasemap
                }, 'BasemapToggle');
                BT.startup();

                /* Start temporary until after JSAPI 4.0 is released */
                var layers = this.map.getLayersVisibleAtScale(this.map.getScale());
                on.once(this.map, 'basemap-change', lang.hitch(this, function () {
                    for (var i = 0; i < layers.length; i++) {
                        if (layers[i]._basemapGalleryLayerType) {
                            var layer = this.map.getLayer(layers[i].id);
                            this.map.removeLayer(layer);
                        }
                    }
                }));
                /* END temporary until after JSAPI 4.0 is released */
            }

			// i18n overview placement
            var overviewPlacement = 'left';
            if(this.config.i18n.direction === 'rtl'){
                overviewPlacement = 'right';
            }

            // Overview Map
            if(this.config.enableOverviewMap){
                var size = this._getOverviewMapSize();
                this._overviewMap = new OverviewMap({
                    attachTo: "bottom-" + overviewPlacement,
                    width: size,
                    height: size,
                    visible: this.config.openOverviewMap,
                    map: this.map
                });
                this._overviewMap.startup();
                // responsive overview size
                on(this.map, 'resize', lang.hitch(this, function(){
                    this._resizeOverviewMap();
                }));
            }

            // geocoders
            this._createGeocoders();

            // startup legend
            this._initLegend();

            // startup toc
            //mk this._initTOC();

            // on body click containing underlay class
            on(document.body, '.dijitDialogUnderlay:click', function(){
                // get all dialogs
                var filtered = array.filter(registry.toArray(), function(w){
                    return w && w.declaredClass == "dijit.Dialog";
                });
                // hide all dialogs
                array.forEach(filtered, function(w){
                    w.hide();
                });
            });

            // hide loading div
            this._hideLoadingIndicator();

            // dialog modal
            if(this.config.enableDialogModal){
                require(["dijit/Dialog"], lang.hitch(this, function(Dialog){
                    var dialogContent = this.config.dialogModalContent;
                    var dialogModal = new Dialog({
                        title: this.config.dialogModalTitle || "Access and Use Constraints",
                        content: dialogContent,
                        style: "width: 375px"
                    });
                    dialogModal.show();
                }));
            }

            // swipe layer
            if(this.config.swipeLayer && this.config.swipeLayer.id){
                // get swipe tool
                require(["esri/dijit/LayerSwipe"], lang.hitch(this, function(LayerSwipe){
                    // get layer
                    var layer = this.map.getLayer(this.config.swipeLayer.id);
                    if(layer){
                        // create swipe
                        var layerSwipe = new LayerSwipe({
                            type: this.config.swipeType,
                            theme: "PIMSwipe",
                            invertPlacement: this.config.swipeInvertPlacement,
                            map: this.map,
                            layers: [ layer ]
                        }, "swipeDiv");
                        layerSwipe.startup();
                        on(layer, 'visibility-change', lang.hitch(this, function(evt){
                            if(evt.visible){
                                layerSwipe.set("enabled", true);
                            }
                            else{
                                layerSwipe.set("enabled", false);
                            }
                        }));
                    }
                }));
            }
            // drawer size check
            this._drawer.resize();

            this.urlZoom(location.search.substr(1));
        },

        // Begin MK functions:
        createFrameElements: function() {
            this._setTitleBar();

            this.drawerMenus = [];
            var content, menuObj;

            // Zoom-to panel:
            if (this.config.enableZoomToPanel) {
                content = '';
                content += '<div class="' + this.css.panelContainer + '">';

                content += '<div class="' + this.css.panelHeader + '">Zoom To</div>';
                content += '<div class="' + this.css.panelPadding + '">';
                content += '<table width="90%" style="font-size:10px;">';


                content += '</div>';
                content += '</div>';

                menuObj = {
                    title: this.config.i18n.general.about,
                    label: '<div class="' + this.css.iconZoomTo + '"></div><div class="' + this.css.iconText + '">Zoom To</div>',
                    content: content
                };

                if(this.config.defaultPanel === 'zoomto'){
                    this.drawerMenus.splice(0,0,menuObj);
                }
                else{
                    this.drawerMenus.push(menuObj);
                }
            }

            // Layers panel:
            if (this.config.enableLayersPanel) {
                content = '';
                content += '<div class="' + this.css.panelHeader + '">' + this.config.i18n.general.layers + '</div>';
                content += '<div class="' + this.css.panelContainer + '">';
                //content += '<div id="TableOfContents"></div>';
                content += '<div id="lyrs-toc"></div>';
                content += '</div>';

                menuObj = {
                    title: this.config.i18n.general.layers,
                    label: '<div class="' + this.css.iconLayers + '"></div><div class="' + this.css.iconText + '">' + this.config.i18n.general.layers + '</div>',
                    content: content
                };

                if(this.config.defaultPanel === 'layers'){
                    this.drawerMenus.splice(0,0,menuObj);
                }
                else{
                    this.drawerMenus.push(menuObj);
                }
            }

            // Legend panel:
            if (this.config.enableLegendPanel) {
                content = '';
                content += '<div class="' + this.css.panelHeader + '">' + this.config.i18n.general.legend + '</div>';
                content += '<div class="' + this.css.panelContainer + '">';
                content += '<div class="' + this.css.panelPadding + '">';

                content += '</div>';
                content += '</div>';

                menuObj = {
                    title: this.config.i18n.general.legend,
                    label: '<div class="' + this.css.iconList + '"></div><div class="' + this.css.iconText + '">' + this.config.i18n.general.legend + '</div>',
                    content: content
                };
                // legend menu
                if(this.config.defaultPanel === 'legend'){
                    this.drawerMenus.splice(0,0,menuObj);
                }
                else{
                    this.drawerMenus.push(menuObj);
                }
            }

            // Tools panel:
            if (this.config.enableToolsPanel) {
                content = '';

                content += '<div class="' + this.css.panelContainer + '">';
                content += '<div class="' + this.css.panelHeader + '">Tools</div>';
                content += '<div class="' + this.css.panelPadding + '">';
                content += '</div>';
                content += '</div>';

                menuObj = {
                    title: this.config.i18n.general.legend,
                    label: '<div class="' + this.css.iconWrench + '"></div><div class="' + this.css.iconText + '">Tools</div>',
                    content: content
                };

                if(this.config.defaultPanel === 'tools'){
                    this.drawerMenus.splice(0,0,menuObj);
                }
                else{
                    this.drawerMenus.push(menuObj);
                }
            }

            // Create menus:
            this._drawerMenu = new DrawerMenu({
                menus: this.drawerMenus
            }, dom.byId("drawer_menus"));
            this._drawerMenu.startup();

        },  // End createFrameElements.

        urlZoom: function(params) {
            var pairs = params.split("&");
            if (pairs.length > 1) {
                var extType = pairs[0].substring(11);
                var extValue = pairs[1].substring(12);

                var findURL = "";
                var findParams = new FindParameters();
                findParams.returnGeometry = true;
                findParams.contains = false;

                switch (extType) {
                    case "well":
                        findParams.layerIds = [0];
                        findParams.searchFields = ["kid"];
                        break;
                    case "field":
                        findParams.layerIds = [1];
                        findParams.searchFields = ["field_kid"];
                        // TODO: reinstate this (if fields layer is not visible by default)?
                        /*var myLayer = theMap.getLayer("theFieldsLayer");
                        myLayer.setVisibility(true);*/
                        break;
                }

                var find = new FindTask("http://services.kgs.ku.edu/arcgis/rest/services/oilgas/oilgas_general/MapServer");
                findParams.searchText = extValue;
                find.execute(findParams,this.zoomToResults);

                // TODO: tie last location to the Home button?
                //lastLocType = extType;
                //lastLocValue = extValue;
            }
        },
        zoomToResults: function(results) {
            // TODO: reinstate this error msg?
            /*if (results.length === 0) {
                // Show warning dialog box:
                dojo.byId('warning_msg').innerHTML = "This search did not return any features.<br>Please check your entries and try again.";
                dijit.byId('warning_box').show();
            }*/

            var feature = results[0].feature;

            switch (feature.geometry.type) {
                case "point":
                    var x = feature.geometry.x;
                    var y = feature.geometry.y;

                    //d var point = new Point([x,y],sr);
                    var point = new Point(x, y, new SpatialReference({ wkid: 3857 }));
                    theMap.centerAndZoom(point,16);

                    /*var lyrId = results[0].layerId;
                    showPoint(feature,lyrId);*/
                    break;
                case "polygon":
                    var ext = feature.geometry.getExtent();
                    theMap.setExtent(ext, true);

                    /*var lyrId = results[0].layerId;
                    showPoly(feature,lyrId);*/
                    break;
            }
            // TODO: highlight feature and open popup.
        },
        // End MK functions.

        _getOverviewMapSize: function(){
            var breakPoint = 500;
            var size = 150;
            if(this.map.width < breakPoint || this.map.height < breakPoint){
                size = 75;
            }
            return size;
        },
        _resizeOverviewMap: function(){
            if(this._overviewMap){
                var size = this._getOverviewMapSize();
                if(this._overviewMap.hasOwnProperty('resize')){
                    this._overviewMap.resize({ w:size, h:size });
                }
            }
        },
        _checkMobileGeocoderVisibility: function () {
            if(this._mobileGeocoderIconNode && this._mobileSearchNode){
                // check if mobile icon needs to be selected
                if (domClass.contains(this._mobileGeocoderIconNode, this.css.toggleBlueOn)) {
                    domClass.add(this._mobileSearchNode, this.css.mobileSearchDisplay);
                }
            }
        },
        _showMobileGeocoder: function () {
            if(this._mobileSearchNode && this._mobileGeocoderIconContainerNode){
                domClass.add(this._mobileSearchNode, this.css.mobileSearchDisplay);
                domClass.replace(this._mobileGeocoderIconContainerNode, this.css.toggleBlueOn, this.css.toggleBlue);
            }
        },
        _hideMobileGeocoder: function () {
            if(this._mobileSearchNode && this._mobileGeocoderIconContainerNode){
                domClass.remove(this._mobileSearchNode, this.css.mobileSearchDisplay);
                domStyle.set(this._mobileSearchNode, "display", "none");
                domClass.replace(this._mobileGeocoderIconContainerNode, this.css.toggleBlue, this.css.toggleBlueOn);
            }
        },
        _setTitle: function(title){
            // set config title
            this.config.title = title;
            // window title
            window.document.title = 'Map of Kansas Oil and Gas';
        },
        _setTitleBar: function () {
            // map title node
            var node = dom.byId('title');
            if (node) {
                // set title
                node.innerHTML = this.config.title;
                // title attribute
                domAttr.set(node, "title", this.config.title);
            }
        },
        _setDialogModalContent: function(content) {
            // set dialog modal content
            this.config.dialogModalContent = content;
        },
        _createGeocoderOptions: function() {
            var hasEsri = false, esriIdx, geocoders = lang.clone(this.config.helperServices.geocode);
            // default options
            var options = {
                map: this.map,
                autoNavigate: true,
                autoComplete: true,
                arcgisGeocoder: {
                    placeholder: this.config.i18n.general.find
                },
                geocoders: null
            };
            //only use geocoders with a url defined
            geocoders = array.filter(geocoders, function (geocoder) {
                if (geocoder.url) {
                    return true;
                }
                else{
                    return false;
                }
            });
            // at least 1 geocoder defined
            if(geocoders.length){
                // each geocoder
                array.forEach(geocoders, lang.hitch(this, function(geocoder) {
                    // if esri geocoder
                    if (geocoder.url && geocoder.url.indexOf(".arcgis.com/arcgis/rest/services/World/GeocodeServer") > -1) {
                        hasEsri = true;
                        geocoder.name = "Esri World Geocoder";
                        geocoder.outFields = "Match_addr, stAddr, City";
                        geocoder.singleLineFieldName = "SingleLine";
                        geocoder.esri = true;
                        geocoder.placefinding = true;
                        geocoder.placeholder = this.config.i18n.general.find;
                    }
                }));
                //only use geocoders with a singleLineFieldName that allow placefinding unless its custom
                geocoders = array.filter(geocoders, function (geocoder) {
                    if (geocoder.name && geocoder.name === "Custom") {
                        return (esriLang.isDefined(geocoder.singleLineFieldName));
                    } else {
                        return (esriLang.isDefined(geocoder.singleLineFieldName) && esriLang.isDefined(geocoder.placefinding) && geocoder.placefinding);
                    }
                });
                // if we have an esri geocoder
                if (hasEsri) {
                    for (var i = 0; i < geocoders.length; i++) {
                        if (esriLang.isDefined(geocoders[i].esri) && geocoders[i].esri === true) {
                            esriIdx = i;
                            break;
                        }
                    }
                }
                // set autoComplete
                options.autoComplete = hasEsri;
                // set esri options
                if (hasEsri) {
                    options.minCharacters = 0;
                    options.maxLocations = 5;
                    options.searchDelay = 100;
                }
                //If the World geocoder is primary enable auto complete
                if (hasEsri && esriIdx === 0) {
                    options.arcgisGeocoder = geocoders.splice(0, 1)[0]; //geocoders[0];
                    if (geocoders.length > 0) {
                        options.geocoders = geocoders;
                    }
                } else {
                    options.arcgisGeocoder = false;
                    options.geocoders = geocoders;
                }
            }
            return options;
        },
        // create geocoder widgets
        _createGeocoders: function () {
            // get options
            var createdOptions = this._createGeocoderOptions();
            // desktop geocoder options
            var desktopOptions = lang.mixin({}, createdOptions, {
                theme: this.css.desktopGeocoderTheme
            });
            // mobile geocoder options
            var mobileOptions = lang.mixin({}, createdOptions, {
                theme: this.css.mobileGeocoderTheme
            });
            // desktop size geocoder
            this._geocoder = new Geocoder(desktopOptions, dom.byId("geocoderSearch"));
            this._geocoder.startup();
            // geocoder results
            on(this._geocoder, 'find-results', lang.hitch(this, function (response) {
                if (!response.results || !response.results.results || !response.results.results.length) {
                    alert(this.config.i18n.general.noSearchResult);
                }
            }));
            // mobile sized geocoder
            this._mobileGeocoder = new Geocoder(mobileOptions, dom.byId("geocoderMobile"));
            this._mobileGeocoder.startup();
            // geocoder results
            on(this._mobileGeocoder, 'find-results', lang.hitch(this, function (response) {
                if (!response.results || !response.results.results || !response.results.results.length) {
                    alert(this.config.i18n.general.noSearchResult);
                }
                this._hideMobileGeocoder();
            }));
            // keep geocoder values in sync
            this._geocoder.watch("value", lang.hitch(this, function () {
                var value = arguments[2];
                this._mobileGeocoder.set("value", value);
            }));
            // keep geocoder values in sync
            this._mobileGeocoder.watch("value", lang.hitch(this, function () {
                var value = arguments[2];
                this._geocoder.set("value", value);
            }));
            // geocoder nodes
            this._mobileGeocoderIconNode = dom.byId("mobileGeocoderIcon");
            this._mobileSearchNode = dom.byId("mobileSearch");
            this._mobileGeocoderIconContainerNode = dom.byId("mobileGeocoderIconContainer");
            // mobile geocoder toggle
            if (this._mobileGeocoderIconNode) {
                on(this._mobileGeocoderIconNode, "click", lang.hitch(this, function () {
                    if (domStyle.get(this._mobileSearchNode, "display") === "none") {
                        this._showMobileGeocoder();
                    } else {
                        this._hideMobileGeocoder();
                    }
                }));
            }
            var closeMobileGeocoderNode = dom.byId("btnCloseGeocoder");
            if(closeMobileGeocoderNode){
                // cancel mobile geocoder
                on(closeMobileGeocoderNode, "click", lang.hitch(this, function () {
                    this._hideMobileGeocoder();
                }));
            }
        },
        // hide map loading spinner
        _hideLoadingIndicator: function () {
            // add loaded class
            domClass.remove(document.body, this.css.appLoading);
        },
        //create a map based on the input web map id
        _createWebMap: function (itemInfo) {
            // popup dijit
            var customPopup = new Popup({}, domConstruct.create("div"));
            // add popup theme
            domClass.add(customPopup.domNode, "calcite");
            customPopup.resize(400,500);

            // set extent from URL Param
            if(this.config.extent){
                var e = this.config.extent.split(',');
                if(e.length === 4){
                    itemInfo.item.extent = [
                        [
                            parseFloat(e[0]),
                            parseFloat(e[1])
                        ],
                        [
                            parseFloat(e[2]),
                            parseFloat(e[3])
                        ]
                    ];
                }
            }
            //can be defined for the popup like modifying the highlight symbol, margin etc.
           // arcgisUtils.createMap(itemInfo, "mapDiv", {

		// Define map and layers:
		webmap = {};
         webmap.item = {
          "title":"Kansas Oil and Gas",
          "snippet": "",
		  "extent": [[-103, 35],[-94, 41]]
        };

        webmap.itemData = {
       		"operationalLayers": [],
          	"baseMap": {
            	"baseMapLayers": [ {
                    "id": "Base Map",
              		"opacity": 1,
              		"visibility": true,
              		"url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
              	}
                ],
            	"title": "World_Terrain_Base"
          	},
          	"version": "1.1"
        };


		// Create map:
			arcgisUtils.createMap(webmap, "mapDiv", {
                mapOptions: {
                    logo: false
                    //infoWindow: customPopup
                    //Optionally define additional map config here for example you can
                    //turn the slider off, display info windows, disable wraparound 180, slider position and more.
                },
                editable: false,
                usePopupManager: true,
                bingMapsKey: this.config.bingmapskey
            }).then(lang.hitch(this, function (response) {
                //Once the map is created we get access to the response which provides important info
                //such as the map, operational layers, popup info and more. This object will also contain
                //any custom options you defined for the template. In this example that is the 'theme' property.
                //Here' we'll use it to update the application to match the specified color theme.

				theMap = response.map;

                this.map = response.map;
                this.layers = response.itemInfo.itemData.operationalLayers;
                //mk this.layers = response.map._layers;
                this.item = response.itemInfo.item;
                this.bookmarks = response.itemInfo.itemData.bookmarks;
                this.layerInfos = arcgisUtils.getLegendLayers(response);

                // window title and config title
                this._setTitle(this.config.title || response.itemInfo.item.title);
                // title bar title
                //this._setTitleBar();

                // dialog modal content
                this._setDialogModalContent(this.config.dialogModalContent || response.itemInfo.item.licenseInfo);

                // map loaded
                if (this.map.loaded) {
                    this._init();
                } else {
                    on.once(this.map, 'load', lang.hitch(this, function () {
                        this._init();
                    }));
                }

                legendLayers = arcgisUtils.getLegendLayers(response);

                // MK additions:

                var scalebar = new Scalebar({
                    map: theMap,
                    attachTo: "bottom-left"
                } );

                // Layers:
                var fieldsLayer = new ArcGISTiledMapServiceLayer(this.config.fieldsServiceURL, { id: "Oil and Gas Fields",  visible: true } );
                var wellsLayer = new ArcGISDynamicMapServiceLayer(this.config.wellsServiceURL, { id: "Oil and Gas Wells", visible: true } );
                wellsLayer.setVisibleLayers([0]);
                var plssLayer = new ArcGISTiledMapServiceLayer(this.config.plssServiceURL, { id: "Section-Township-Range", visible: true } );


                theMap.addLayers( [fieldsLayer, plssLayer, wellsLayer] );

                // Identify:
                var identifyTask = new IdentifyTask(this.config.wellsServiceURL);
                var identifyParams = new IdentifyParameters();
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;
                identifyParams.layerIds = [0, 1]; // wells, fields.
                identifyParams.width = theMap.width;
                identifyParams.height = theMap.height;

                theMap.on("click", executeIdTask);

                function executeIdTask(event) {
                    identifyParams.geometry = event.mapPoint;
                    identifyParams.mapExtent = theMap.extent;

                    var deferred = identifyTask
                        .execute(identifyParams)
                        .addCallback(function (response) {
                            return array.map(response, function (result) {
                                var feature = result.feature;
                                var layId = result.layerId;

                                if (layId === 1) {
                                    var fieldsTemplate = new InfoTemplate();
                                    fieldsTemplate.setTitle("<b>${FIELD_NAME}</b>");
                                    fieldsTemplate.setContent(fieldsContent);
                                    feature.setInfoTemplate(fieldsTemplate);
                                }
                                else if (layId === 0) {
                                    var wellsTemplate = new InfoTemplate();
                                    wellsTemplate.setTitle("<b>${LEASE_NAME} ${WELL_NAME}</b>");
                                    wellsTemplate.setContent(wellsContent);
                                    feature.setInfoTemplate(wellsTemplate);
                                }
                                return feature;
                            } );
                        } );

                    theMap.infoWindow.setFeatures( [deferred] );
                    theMap.infoWindow.show(event.mapPoint);
                    theMap.infoWindow.resize(330, 575);
                    theMap.infoWindow.reposition();
                }

                function fieldsContent(graphic) {
                    var ga = graphic.attributes;
                    var ftyp = ga.FIELD_TYPE !== "Null" ? ga.FIELD_TYPE : "";
                    var sta = ga.STATUS !== "Null" ? ga.STATUS : "";
                    var po = ga.PROD_OIL !== "Null" ? ga.PROD_OIL : "";
                    var co = ga.CUMM_OIL !== "Null" ? ga.CUMM_OIL.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
                    var pg = ga.PROD_GAS !== "Null" ? ga.PROD_GAS : "";
                    var cg = ga.CUMM_GAS !== "Null" ? ga.CUMM_GAS.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
                    var ac = ga.APPROXACRE !== "Null" ? ga.APPROXACRE.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
                    var kid = ga.FIELD_KID !== "Null" ? ga.FIELD_KID : "";

                    var content = "<table cellpadding='4'><tr><td class='pu-label'>Type of Field: </td><td class='pu-data'>" + ftyp + "</td></tr>";
                    content += "<tr><td class='pu-label'>Status: </td><td class='pu-data'>" + sta + "</td></tr>";
                    content += "<tr><td class='pu-label'>Produces Oil: </td><td class='pu-data'>" + po + "</td></tr>";
                    content += "<tr><td class='pu-label'>Cumulative Oil (bbls): </td><td class='pu-data'>" + co + "</td></tr>";
                    content += "<tr><td class='pu-label'>Produces Gas: </td><td class='pu-data'>" + pg + "</td></tr>";
                    content += "<tr><td class='pu-label'>Cumulative Gas (mcf): </td><td class='pu-data'>" + cg + "</td></tr>";
                    content += "<tr><td class='pu-label'>Approximate Acres: </td><td class='pu-data'>" + ac + "</td></tr>";
                    content += "<tr><td colspan='2'><a href='http://chasm.kgs.ku.edu/apex/oil.ogf4.IDProdQuery?FieldNumber=" + kid + "' target='_blank'>Production Information</a></td></tr>";
                    content += "</table>";

                    return content;
                }

                function wellsContent(graphic) {
                    var ga = graphic.attributes;
                    var api = ga.API_NUMBER !== "Null" ? ga.API_NUMBER : "";
                    var currOp = ga.CURR_OPERATOR !== "Null" ? ga.CURR_OPERATOR : "";
                    var type = ga.STATUS_TXT !== "Null" ? ga.STATUS_TXT : "";
                    var stat = ga.WELL_CLASS !== "Null" ? ga.WELL_CLASS : "";
                    var lease = ga.LEASE_NAME !== "Null" ? ga.LEASE_NAME : "";
                    var well = ga.WELL_NAME !== "Null" ? ga.WELL_NAME : "";
                    var fld = ga.FIELD_NAME !== "Null" ? ga.FIELD_NAME : "";
                    var twp = ga.TOWNSHIP !== "Null" ? ga.TOWNSHIP : "";
                    var rng = ga.RANGE !== "Null" ? ga.RANGE : "";
                    var rngd = ga.RANGE_DIRECTION !== "Null" ? ga.RANGE_DIRECTION : "";
                    var sec = ga.SECTION !== "Null" ? ga.SECTION : "";
                    var spt = ga.SPOT !== "Null" ? ga.SPOT : "";
                    var sub4 = ga.SUBDIVISION_4_SMALLEST !== "Null" ? ga.SUBDIVISION_4_SMALLEST : "";
                    var sub3 = ga.SUBDIVISION_3 !== "Null" ? ga.SUBDIVISION_3 : "";
                    var sub2 = ga.SUBDIVISION_2 !== "Null" ? ga.SUBDIVISION_2 : "";
                    var sub1 = ga.SUBDIVISION_1_LARGEST !== "Null" ? ga.SUBDIVISION_1_LARGEST : "";
                    var lon = ga.NAD27_LONGITUDE !== "Null" ? ga.NAD27_LONGITUDE : "";
                    var lat = ga.NAD27_LATITUDE !== "Null" ? ga.NAD27_LATITUDE : "";
                    var co = ga.COUNTY !== "Null" ? ga.COUNTY : "";
                    var pdt = ga.PERMIT_DATE_TXT !== "Null" ? ga.PERMIT_DATE_TXT : "";
                    var sdt = ga.SPUD_DATE_TXT !== "Null" ? ga.SPUD_DATE_TXT : "";
                    var cdt = ga.COMPLETION_DATE_TXT !== "Null" ? ga.COMPLETION_DATE_TXT : "";
                    var pldt = ga.PLUG_DATE_TXT !== "Null" ? ga.PLUG_DATE_TXT : "";
                    var dpth = ga.ROTARY_TOTAL_DEPTH !== "Null" ? ga.ROTARY_TOTAL_DEPTH.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
                    var elev = ga.ELEVATION_KB !== "Null" ? ga.ELEVATION_KB.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
                    var frm = ga.PRODUCING_FORMATION !== "Null" ? ga.PRODUCING_FORMATION : "";
                    var kid = ga.KID !== "Null" ? ga.KID : "";

                    var content = "<table cellpadding='3'><tr><td class='pu-label'>API: </td><td class='pu-data'>" + api + "</td></tr>";
                    content += "<tr><td class='pu-label'>Current Operator: </td><td class='pu-data'>" + currOp + "</td></tr>"
                    content += "<tr><td class='pu-label'>Well Type: </td><td class='pu-data'>" + type + "</td></tr>";
                    content += "<tr><td class='pu-label'>Status: </td><td class='pu-data'>" + stat + "</td></tr>";
                    content += "<tr><td class='pu-label'>Lease: </td><td class='pu-data'>" + lease + "</td></tr>";
                    content += "<tr><td class='pu-label'>Well: </td><td class='pu-data'>" + well + "</td></tr>";
                    content += "<tr><td class='pu-label'>Field: </td><td class='pu-data'>" + fld + "</td></tr>";
                    content += "<tr><td class='pu-label'>Location: </td><td class='pu-data'>T" + twp + "S R" + rng + rngd + " Sec " + sec + "<br>" + spt + " " + sub4 + " " + sub3 + " " + sub2 + " " + sub1 + "</td></tr>";
                    content += "<tr><td class='pu-label'>Coordinates (NAD27): </td><td class='pu-data'>" + lon + ", " + lat + "</td></tr>";
                    content += "<tr><td class='pu-label'>County: </td><td class='pu-data'>" + co + "</td></tr>";
                    content += "<tr><td class='pu-label'>Permit Date: </td><td class='pu-data'>" + pdt + "</td></tr>";
                    content += "<tr><td class='pu-label'>Spud Date: </td><td class='pu-data'>" + sdt + "</td></tr>";
                    content += "<tr><td class='pu-label'>Completion Date: </td><td class='pu-data'>" + cdt + "</td></tr>";
                    content += "<tr><td class='pu-label'>Plug Date: </td><td class='pu-data'>" + pldt + "</td></tr>";
                    content += "<tr><td class='pu-label'>Total Depth (ft): </td><td class='pu-data'>" + dpth + "</td></tr>";
                    content += "<tr><td class='pu-label'>Elevation (KB, ft): </td><td class='pu-data'>" + elev + "</td></tr>";
                    content += "<tr><td class='pu-label'>Producing Formation: </td><td class='pu-data'>" + frm + "</td></tr>";
                    content += "<tr><td colspan='2'><a href='http://chasm.kgs.ku.edu/apex/qualified.well_page.DisplayWell?f_kid=" + kid + "' target='_blank'>Full Record</a></td></tr>";
                    content += "<tr><td colspan='2'><a href='javascript: bufferFeature(" + kid + ");'>Buffer Well</a></td></tr>";
                    content += "<tr><td colspan='2'><a href='javascript: reportBadSpot(" + kid + ");'>Report Location Problem</a></td></tr>";
                    content += "</table>";

                    return content;
                }


                // Kludge to get right icons to show up in geocoder (haven't been able to fix in fontello.css):
                $(".esriGeocoderSearch").addClass("icon-search-1");
                $(".esriGeocoderReset").addClass("icon-cancel-1");

                // Add filter and label links to wells layer in toc:
                // re-examine after fixing TOC after new op layer technique.
                /*$("[title='Oil and Gas Wells']").after("<div id='wells-filter'><a id='wells-filter-link' class='toc-link' href='javascript: void(0);'>Filter</a></div>");
                $("#wells-filter-link").on("click", filterWells);
                $("#wells-filter").after("<div id='label-switch'><a id='labels-link' class='toc-link' href='javascript: void(0);'>Labels</a></div>");
                $("#labels-link").on("click", labelWells);*/

                // Create TOC:
                var tocContent = "";
                var chkd;
                for (var j=theMap.layerIds.length - 1; j>-1; j--) {
                    chkd = theMap.getLayer(theMap.layerIds[j]).visible ? "checked" : "";
                    tocContent += "<div class='toc-item'><label><input type='checkbox' id='tcb-" + j + "' onclick='toggleLayer(" + j + ");'" + chkd + ">" + theMap.layerIds[j] + "</label></div>";
                }
                $("#lyrs-toc").html(tocContent);

                // End MK additions.

			}), this.reportError);

        }
	});
});