require([
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
    "dojo/window",
    "dojo/_base/array",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dijit/form/ComboBox",
	"application/Drawer",
    "application/DrawerMenu",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "esri/widgets/Search",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/PopupTemplate",
    "esri/widgets/Popup",
    "esri/tasks/IdentifyTask",
    "esri/tasks/support/IdentifyParameters",
    "esri/tasks/FindTask",
    "esri/tasks/support/FindParameters",
    "esri/geometry/Point",
    "esri/geometry/SpatialReference",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleLineSymbol",
    "esri/Graphic",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "esri/geometry/support/webMercatorUtils",
    "esri/layers/ImageryLayer",
	"esri/geometry/geometryEngine",
	"esri/symbols/SimpleFillSymbol",
	"esri/geometry/Polygon",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/widgets/ScaleBar",
	"esri/widgets/Legend",
    "dojo/domReady!"
],
function(
	lang,
	on,
	dom,
    win,
    arrayUtils,
    Memory,
    domConstruct,
    ComboBox,
	Drawer,
	DrawerMenu,
    Map,
    MapView,
    TileLayer,
    MapImageLayer,
    Search,
    Home,
    Locate,
    PopupTemplate,
    Popup,
    IdentifyTask,
    IdentifyParameters,
    FindTask,
    FindParameters,
    Point,
    SpatialReference,
    SimpleMarkerSymbol,
    GraphicsLayer,
    SimpleLineSymbol,
    Graphic,
    GeometryService,
    ProjectParameters,
    webMercatorUtils,
    ImageryLayer,
	geometryEngine,
	SimpleFillSymbol,
	Polygon,
	QueryTask,
	Query,
	ScaleBar,
	Legend
) {
    var isMobile = WURFL.is_mobile;
	var idDef = [];
	var wmSR = new SpatialReference(3857);
	var urlParams, listCount, hilite, bufferGraphic;


    // Set up basic frame:
    window.document.title = "KGS Geology Portal";
    $("#title").html("KGS Geology Portal<a id='kgs-brand' href='http://www.kgs.ku.edu'>Kansas Geological Survey</a>");

    var showDrawerSize = 850;

	var drawer = new Drawer( {
        showDrawerSize: showDrawerSize,
        borderContainer: 'bc_outer',
        contentPaneCenter: 'cp_outer_center',
        contentPaneSide: 'cp_outer_left',
        toggleButton: 'hamburger_button'
    } );
    drawer.startup();

    // Broke the template drawer open/close behavior when paring down the code, so...
    $("#hamburger_button").click(function(e) {
        e.preventDefault();
        if ($("#cp_outer_left").css("width") === "293px") {
            $("#cp_outer_left").css("width", "0px");
        } else {
            $("#cp_outer_left").css("width", "293px");
        }
    } );

    createMenus();
    popCountyDropdown();

    // Combo boxes:
    var autocomplete =  (isMobile) ? false : true; // auto-complete doesn't work properly on mobile (gets stuck on a name and won't allow further typing), so turn it off.
    $.get("fields_json.txt", function(response) {
		// fields_json.txt is updated as part of the og fields update process.
        var fieldNames = JSON.parse(response).items;
        var fieldStore = new Memory( {data: fieldNames} );
        var comboBox = new ComboBox( {
            id: "field-select",
            store: fieldStore,
            searchAttr: "name",
            autoComplete: autocomplete
        }, "field-select").startup();
    } );

	$.get("operators_json.txt", function(response) {
		// operators_json.txt is updated as part of the monthly maintenance tasks.
        var ops = JSON.parse(response).items;
        var opsStore = new Memory( {data: ops} );
        var comboBox = new ComboBox( {
            id: "operators",
            store: opsStore,
            searchAttr: "name",
            autoComplete: autocomplete
        }, "operators").startup();
    } );

    // End framework.

    // Create map and map widgets:
    var wwc5GeneralServiceURL = "http://services.kgs.ku.edu/arcgis8/rest/services/wwc5/wwc5_general/MapServer";
    var identifyTask, identifyParams;
    var findTask = new FindTask(wwc5GeneralServiceURL);
    var findParams = new FindParameters();
	findParams.returnGeometry = true;

    var basemapLayer = new TileLayer( {url:"http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer", id:"Base Map"} );
    var plssLayer = new TileLayer( {url:"http://services.kgs.ku.edu/arcgis8/rest/services/plss/plss/MapServer", id:"Section-Township-Range"} );
    var wwc5Layer = new MapImageLayer( {url:"http://services.kgs.ku.edu/arcgis8/rest/services/wwc5/wwc5_general/MapServer", sublayers:[{id:8}], id:"WWC5 Water Wells", visible:true} );
    // var topoLayer = new TileLayer( {url:"https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer", id:"Topo", visible:false} );
	var topoLayer = new TileLayer( {url:"http://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer", id:"Topo", visible:false} );
	var latestAerialsLayer = new ImageryLayer( {url:"http://services.kgs.ku.edu/arcgis7/rest/services/IMAGERY_STATEWIDE/FSA_NAIP_2015_Color/ImageServer", id:"2015 Aerials", visible:false} );
    var doqq2002Layer = new ImageryLayer( {url:"http://services.kgs.ku.edu/arcgis7/rest/services/IMAGERY_STATEWIDE/Kansas_DOQQ_2002/ImageServer", id:"2002 Aerials", visible:false} );
    var doqq1991Layer = new ImageryLayer( {url:"http://services.kgs.ku.edu/arcgis7/rest/services/IMAGERY_STATEWIDE/Kansas_DOQQ_1991/ImageServer", id:"1991 Aerials", visible:false} );
	var hroImageryLayer = new ImageryLayer( {url:"http://services.kansasgis.org/arcgis7/rest/services/IMAGERY_STATEWIDE/Kansas_HRO_2014_Color/ImageServer", id:"2014 1ft Aerials", visible:false} );

    var map = new Map( {
        // Not defining basemap here for TOC toggle reasons.
        //basemap: "topo",
        layers: [basemapLayer, doqq1991Layer, doqq2002Layer, hroImageryLayer, latestAerialsLayer, topoLayer, plssLayer, wwc5Layer]
    } );

    var graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    var view = new MapView( {
        map: map,
        container: "mapDiv",
        center: [-98, 38],
        zoom: 7,
        ui: { components: ["zoom"] },
		constraints: { rotationEnabled: false }
    } );

    view.then(function() {
		createTOC();
		createDialogs();

        on(view, "click", executeIdTask);

        identifyTask = new IdentifyTask(wwc5GeneralServiceURL);
        identifyParams = new IdentifyParameters();
		identifyParams.returnGeometry = true;
        identifyParams.tolerance = (isMobile) ? 9 : 3;
        identifyParams.layerIds = [0, 13, 8, 1];
        identifyParams.layerOption = "visible";
        identifyParams.width = view.width;
        identifyParams.height = view.height;

        // Define additional popup actions:
        var fullInfoAction = {
            title: "Full Report",
            id: "full-report",
            className: "esri-icon-documentation pu-icon"
        };
        view.popup.actions.push(fullInfoAction);

        var bufferFeatureAction = {
            title: "Buffer Feature",
            id: "buffer-feature",
            className: "esri-icon-radio-checked pu-icon"
        };
        view.popup.actions.push(bufferFeatureAction);

        var reportErrorAction = {
            title: "Report a Location or Data Problem",
            id: "report-error",
            className: "esri-icon-contact pu-icon"
        };
        view.popup.actions.push(reportErrorAction);

        view.popup.on("trigger-action", function(evt) {
            if(evt.action.id === "full-report") {
                showFullInfo();
            } else if (evt.action.id === "buffer-feature") {
				$("#buff-dia").dialog("open");
            } else if (evt.action.id === "report-error") {
                $("#prob-dia").dialog("open");
            }
        } );
    } );

	var searchWidget = new Search({
		view: view,
		popupEnabled: false
	}, "srch" );

    /*$("#mobileGeocoderIconContainer").click(function() {
        $("#lb").toggleClass("small-search");
    } );*/

	var homeBtn = new Home({
        view: view
	} );
	view.ui.add(homeBtn, {
    	position: "top-left",
        index: 1
     } );

	 var scaleBar = new ScaleBar( {
        view: view,
        unit: "dual"
      } );
      view.ui.add(scaleBar, {
        position: "bottom-left"
      } );

	var locateBtn = new Locate( {
        view: view
	}, "LocateButton" );
	view.ui.add(locateBtn, {
    	position: "top-left",
        index: 2
     } );

	 var legend = new Legend( {
 	 	view: view,
 	  	layerInfos: [
 		{
 			layer: wwc5Layer,
 			title: "WWC5 Water Wells"
 		}
 		]
 	}, "legend-content" );

    // End map and map widgets.

	urlParams = location.search.substr(1);
    urlZoom(urlParams);

    // Miscellaneous click handlers:
    $(".find-header").click(function() {
        $("[id^=find]").fadeOut("fast");
        $(".find-header").removeClass("esri-icon-down-arrow");
        $(this).addClass("esri-icon-down-arrow");
        var findBody = $(this).attr("id");
        $("#find-"+findBody).fadeIn("fast");
    } );

    $(".esri-icon-erase").click(function() {
		graphicsLayer.removeAll();
    } );

	$("#buff-tool").click(function() {
        $("#buff-dia").dialog("open");
    } );

	$("#buff-opts-btn").click(function() {
		$("#buff-opts").toggleClass("show");
	} );

	// $("#meas-tool").click(function() {
    //     $("#meas-dia").dialog("open");
    // } );


    function popCountyDropdown() {
        var cntyArr = new Array("Allen", "Anderson", "Atchison", "Barber", "Barton", "Bourbon", "Brown", "Butler", "Chase", "Chautauqua", "Cherokee", "Cheyenne", "Clark", "Clay", "Cloud", "Coffey", "Comanche", "Cowley", "Crawford", "Decatur", "Dickinson", "Doniphan", "Douglas", "Edwards", "Elk", "Ellis", "Ellsworth", "Finney", "Ford", "Franklin", "Geary", "Gove", "Graham", "Grant", "Gray", "Greeley", "Greenwood", "Hamilton", "Harper", "Harvey", "Haskell", "Hodgeman", "Jackson", "Jefferson", "Jewell", "Johnson", "Kearny", "Kingman", "Kiowa", "Labette", "Lane", "Leavenworth", "Lincoln", "Linn", "Logan", "Lyon", "McPherson", "Marion", "Marshall", "Meade", "Miami", "Mitchell", "Montgomery", "Morris", "Morton", "Nemaha", "Neosho", "Ness", "Norton", "Osage", "Osborne", "Ottawa", "Pawnee", "Phillips", "Pottawatomie", "Pratt", "Rawlins", "Reno", "Republic", "Rice", "Riley", "Rooks", "Rush", "Russell", "Saline", "Scott", "Sedgwick", "Seward", "Shawnee", "Sheridan", "Sherman", "Smith", "Stafford", "Stanton", "Stevens", "Sumner", "Thomas", "Trego", "Wabaunsee", "Wallace", "Washington", "Wichita", "Wilson", "Woodson", "Wyandotte");

        for(var i=0; i<cntyArr.length; i++) {
            theCnty = cntyArr[i];
            $('#lstCounty').append('<option value="' + theCnty + '">' + theCnty + '</option>');
        }
    }


    function createDialogs() {
        // Earthquake filter:
        var magOptions = "<option value='all'>All</option><option value='2'>2.0 to 2.9</option><option value='3'>3.0 to 3.9</option><option value='4'>4.0 +</option>";
        var eqF = "<span class='filter-hdr'>By Day:</span><br>";
        eqF += "<table><tr><td class='find-label'>From:</td><td><input type='text' size='12' id='eq-from-date' placeholder='mm/dd/yyyy'></td></tr>";
        eqF += "<tr><td class='find-label'>To:</td><td><input type='text' size='12' id='eq-to-date' placeholder='mm/dd/yyyy'></td></tr>";
        eqF += "<tr><td class='find-label'>Magnitude:</td><td><select name='day-mag' id='day-mag'>";
        eqF += magOptions;
        eqF += "</select></td></tr><tr><td></td><td><button class='find-button' id='day-btn' onclick='filterQuakes(this.id);'>Apply Filter</button></td></tr></table><hr>";
        eqF += "<span class='filter-hdr'>By Year</span><br>";
        eqF += "<table><tr><td class='find-label'>Year:</td><td><select name='year' id='year'><option value='all'>All</option>";
        for (var y=2016; y>2012; y--) {
            eqF += "<option value='" + y + "'>" + y + "</option>";
        }
        eqF += "</select></td></tr>";
        eqF += "<tr><td class='find-label'>Magnitude:</td><td><select name='year-mag' id='year-mag'>";
        eqF += magOptions;
        eqF += "</select></td></tr>";
        eqF += "<tr><td></td><td><button class='find-button' id='year-btn' onclick='filterQuakes(this.id);'>Apply Filter</button></td></tr></table><hr>";
        eqF += "<button onclick='filterQuakesLast();'>Show Last Event in Kansas</button><hr>";
        eqF += "<button onclick='clearQuakeFilter();' autofocus>Clear Filter</button>";

        var eqN = domConstruct.create("div", { id: "eq-filter", class: "filter-dialog", innerHTML: eqF } );
        $("body").append(eqN);

        $("#eq-filter").dialog( {
            autoOpen: false,
            dialogClass: "dialog",
			title: "Filter Earthquakes",
            width: 270
        } );

		// if (!isMobile) {
		// 	$("#eq-from-date").datepicker( {
	    //         minDate: new Date("01/01/2013")
	    //     } );
	    //     $("#eq-to-date").datepicker();
		// }

        // WWC5 wells filter:
		var wwc5Status = ["Constructed","Plugged","Reconstructed"];
		var wwc5UseNames = {
			"Air Conditioning": "Air Conditioning",
			"Cathodic Protection Borehole": "Cathodic Protection",
			"Dewatering": "Dewatering",
			"Domestic": "Domestic",
			"Lawn and Garden - domestic only": "Domestic-Lawn and Garden",
			"Domestic, Livestock": "Domestic-Livestock",
			"Domestic, changed from Irrigation": "Domestic-was irrig",
			"Domestic, changed from Oil Field Water Supply": "Domestic-was Oil Field supply",
			"Feedlot": "Feedlot",
			"Feedlot/Livestock/Windmill": "Feedlot/Livestock/Windmill",
			"Geothermal, Closed Loop, Horizontal": "Geothermal-Closed-Horiz",
			"Geothermal, Closed Loop, Vertical": "Geothermal-Closed-Vert",
			"Heat Pump (Closed Loop/Disposal)": "Geothermal/Heat Pump",
			"Geothermal, Open Loop, Inj. of Water": "Geothermal Open-inj Water",
			"Geothermal, Open Loop, Surface Discharge": "Geothermal-Open-Surf Discharge",
			"Industrial": "Industrial",
			"Irrigation": "Irrigation",
			"Monitoring well/observation/piezometer": "Monitor/Observe/Piezometer",
			"Oil Field Water Supply": "Oil Field Water Supply",
			"Other": "Other",
			"Pond/Swimming Pool/Recreation": "Pond/Pool/Recreation",
			"Public Water Supply": "Public Water Supply",
			"Recharge Well": "Recharge",
			"Environmental Remediation, Air Sparge": "Remediation-Air Sparge",
			"Environmental Remediation, Injection": "Remediation-Injection",
			"Injection well/air sparge (AS)/shallow": "Remediation-inject/Air Sparge",
			"Environmental Remediation, Recovery": "Remediation-Recovery",
			"Recovery/Soil Vapor Extraction/Soil Vent": "Remediation-Recovery/SVE",
			"Environmental Remediation, Soil Vapor Extraction": "Remediation-Soil Vapor Extr",
			"Road Construction": "Road Construction",
			"Test Hole, Cased": "Test Hole, Cased",
			"Test Hole, Geotechnical": "Test Hole, Geotechnical",
			"Test Hole, Uncased": "Test Hole, Uncased",
			"Test hole/well": "Test Hole/Well",
			"(unstated)/abandoned": "Unstated/Abandoned"
		}

		var wwc5F = "<span class='filter-hdr'>Completion Date:</span><br>";
        wwc5F += "<table><tr><td class='find-label'>From:</td><td><input type='text' size='12' id='wwc5-from-date' placeholder='mm/dd/yyyy'></td></tr>";
        wwc5F += "<tr><td class='find-label'>To:</td><td><input type='text' size='12' id='wwc5-to-date' placeholder='mm/dd/yyyy'></td></tr></table>";
		wwc5F += "<span class='filter-hdr'>Construction Status:</span><br><table>";
		for (var i = 0; i < wwc5Status.length; i++) {
			wwc5F += "<tr><td><input type='checkbox' name='const-status' value='" + wwc5Status[i] + "'>" + wwc5Status[i] + "</td></tr>"
		}
		wwc5F += "</table>"
		wwc5F += "<span class='filter-hdr'>Well Use:</span><br>";
		wwc5F += "<table><tr><td><select id='well-use' multiple size='6'>";
		if (!isMobile) {
			wwc5F += "<option value='' class='opt-note'>select one or many (ctrl or cmd)</option>";
		}
		for (var key in wwc5UseNames) {
  			if (wwc5UseNames.hasOwnProperty(key) ) {
				wwc5F += "<option value='" + key + "'>" + wwc5UseNames[key] + "</option>";
  			}
		}
		wwc5F += "</select></td></tr>";
		wwc5F += "<tr><td colspan='2'><button class='find-button' id='wwc5-go-btn' onclick='filterWWC5();'>Apply Filter</button>&nbsp;&nbsp;<button class='find-button' onclick='clearwwc5F();' autofocus>Clear Filter</button></td></tr>";
		wwc5F += "</table>";

        var wwc5N = domConstruct.create("div", { id: "wwc5-filter", class: "filter-dialog", innerHTML: wwc5F } );
        $("body").append(wwc5N);

		var wwc5Width = (WURFL.form_factor === "Smartphone") ? 315 : 345;

        $("#wwc5-filter").dialog( {
            autoOpen: false,
            dialogClass: "dialog",
			title: "Filter Water Wells",
            width: wwc5Width
        } );

		// if (!isMobile) {
		// 	//$("#wwc5-from-date").datepicker();
	    //     //$("#wwc5-to-date").datepicker();
		// }

        // OG wells filter:
		var wellType = ["Coal Bed Methane","Coal Bed Methane, Plugged","Dry and Abandoned","Enhanced Oil Recovery","Enhanced Oil Recovery, Plugged","Gas","Gas, Plugged","Injection","Injection, Plugged","Intent","Location","Oil","Oil and Gas","Oil and Gas, Plugged","Oil, Plugged","Other","Other, Plugged","Salt Water Disposal","Salt Water Disposal, Plugged"];
		var ogF = "<span class='filter-hdr'>Well Type:</span><br>";
		ogF += "<table><tr><td><select id='og-well-type' class='og-select' multiple size='4'>";
		if (!isMobile) {
			ogF += "<option value='' class='opt-note'>select one or many (ctrl or cmd)</option>";
		}
		for (var j = 0; j < wellType.length; j++) {
			ogF += "<option value='" + wellType[j] + "'>" + wellType[j] + "</option>";
		}
		ogF += "</select></td></tr></table>";
		ogF += "<span class='filter-hdr'>Completion Date:</span><br>";
		ogF += "<table><tr><td class='find-label'>From:</td><td><input type='text' size='12' id='og-from-date' class='og-input' placeholder='mm/dd/yyyy'></td></tr>";
        ogF += "<tr><td class='find-label'>To:</td><td><input type='text' size='12' id='og-to-date' class='og-input' placeholder='mm/dd/yyyy'></td></tr></table>";
		ogF += "<table><tr><td class='filter-hdr' style='padding-left:0'>Operator:</td><td><input id='operators'></td></tr></table>";
		ogF += "<table><tr><td class='filter-hdr' style='padding-left:0'>Has:</td><td><input type='checkbox' name='og-has' value='paper-log'>Paper Logs</td></tr>";
		ogF += "<tr><td></td><td><input type='checkbox' name='og-has' value='scan-log'>Scanned Logs</td></tr>";
		ogF += "<tr><td></td><td><input type='checkbox' name='og-has' value='las'>LAS File</td></tr>";
		ogF += "<tr><td></td><td><input type='checkbox' name='og-has' value='core'>Core</td></tr>";
		ogF += "<tr><td></td><td><input type='checkbox' name='og-has' value='cuttings'>Cuttings</td></tr></table>";
		ogF += "<table><tr><td class='filter-hdr' style='padding-left:0'>Injection Wells:</td>";
		ogF += "<td><select id='inj' class='og-select'><option value=''></option><option value='inj-1'>Class I</option><option value='inj-2'>Class II</option></select></td></tr>";
		ogF += "<tr><td class='filter-hdr'style='padding-left:0'>Horizontal Wells:</td><td><input type='checkbox' id='hrz'></td></tr></table>";
		ogF += "<span class='filter-hdr'>Total Depth (ft):</span><br>";
		ogF += "<table><tr><td>Greater Than or Equal:</td><td><input type='text' size='4' id='og-gt-depth' class='og-input'></td></tr>";
        ogF += "<tr><td>Less Than or Equal:</td><td><input type='text' size='4' id='og-lt-depth' class='og-input'></td></tr></table>";
		ogF += "<hr><button class='find-button' id='wwc5-go-btn' onclick='filterOG();'>Apply Filter</button>&nbsp;&nbsp;&nbsp;";
		ogF += "<button class='find-button' onclick='clearOgFilter();' autofocus>Clear Filter</button>";

		var ogN = domConstruct.create("div", { id: "og-filter", class: "filter-dialog", innerHTML: ogF } );
        $("body").append(ogN);

        $("#og-filter").dialog( {
            autoOpen: false,
            dialogClass: "dialog",
			title: "Filter Oil and Gas Wells",
            width: 320
        } );

		// if (!isMobile) {
		// 	//$("#og-from-date").datepicker();
	    //     //$("#og-to-date").datepicker();
		// }

		// Buffer dialog:
		var units = ["feet","yards","meters","kilometers","miles"];
		var buffDia = '<table><tr><td class="find-label">Distance:</td><td><input type="text" size="4" id="buff-dist"></td></tr>';
		buffDia += '<tr><td class="find-label">Units:</td><td><select id="buff-units">';
		for (var j = 0; j < units.length; j++) {
			buffDia += "<option value='" + units[j] + "'>" + units[j] + "</option>";
		}
		buffDia += '</select></td></tr>';
		buffDia += '<tr><td></td><td><button id="buff-opts-btn" class="find-button" onclick=$(".buff-opts").toggleClass("hide")>Options</button></td></tr>';
		buffDia += '<tr class="buff-opts hide"><td colspan="2">List Wells Within Buffer:</td><td></td></tr>';
		buffDia += '<tr class="buff-opts hide"><td></td><td><input type="radio" name="buffwelltype" value="Oil and Gas"> Oil and Gas</td></tr>';
		buffDia += '<tr class="buff-opts hide"><td></td><td><input type="radio" name="buffwelltype" value="Water"> Water (WWC5)</td></tr>';
		buffDia += '<tr class="buff-opts hide"><td></td><td><input type="radio" name="buffwelltype" value="none" checked> Don&#39;t List</td></tr>';
		buffDia += '<tr><td></td><td><button class="find-button" onclick="bufferFeature()">Create Buffer</button></td></tr></table>';

		var buffN = domConstruct.create("div", { id: "buff-dia", class: "filter-dialog", innerHTML: buffDia } );
        $("body").append(buffN);

        $("#buff-dia").dialog( {
            autoOpen: false,
            dialogClass: "dialog",
			title: "Buffer Features"
        } );

		// Report problem dialog:
		var probDia = "<table><tr><td class='find-label'>Message:</td><td><textarea rows='4' cols='25' id='prob-msg' placeholder='Feature ID is automatically appended. Messages are anonymous unless contact info is included.'></textarea></td></tr>";
		probDia += "<tr><td></td><td><button class='find-button' onclick='sendProblem()'>Send</button></td></tr>";
		probDia += "<tr><td colspan='2'><span class='toc-note'>(report website problems <a href='mailto:killion@kgs.ku.edu'>here)</a></span></td></tr></table>";

		var problemN = domConstruct.create("div", { id: "prob-dia", class: "filter-dialog", innerHTML: probDia } );
        $("body").append(problemN);

        $("#prob-dia").dialog( {
            autoOpen: false,
            dialogClass: "dialog",
			title: "Report a location or data error",
			width: 375
        } );
    }


	sendProblem = function() {
		var sfa = view.popup.selectedFeature.attributes;
		if (sfa.hasOwnProperty('INPUT_SEQ_NUMBER')) {
			var fId = sfa.INPUT_SEQ_NUMBER;
			var fName = sfa.OWNER_NAME;
			var fType = "wwc5";
			var otherId = "";
		} else if (sfa.hasOwnProperty('API_NUMBER')) {
			var fId = sfa.KID;
			var fName = sfa.LEASE_NAME + " " + sfa.WELL_NAME;
			var fType = "ogwell";
			var otherId = sfa.API_NUMBER;
		} else if (sfa.hasOwnProperty('MAG')) {
			var fId = sfa.ID;
			var fName = "";
			var fType = "earthquake";
			var otherId = "";
		} else if (sfa.hasOwnProperty('FIELD_KID')) {
			var fId = sfa.FIELD_KID;
			var fName = sfa.FIELD_NAME;
			var fType = "field";
			var otherId = "";
		}

		$.ajax( {
		  type: "post",
		  url: "reportProblem.cfm",
		  data: {
			  "id": fId,
			  "name": fName,
			  "type": fType,
			  "otherId": otherId,
			  "msg": $("#prob-msg").val()
		  }
		} );
		$("#prob-dia").dialog("close");
	}


	filterOG = function() {
		var def = [];
		var theWhere = "";
		var typeWhere = "";
		var dateWhere = "";
		var opWhere = "";
		var injWhere = "";
		var hrzWhere = "";
		var depthWhere = "";
		var paperLogWhere = "";
		var scanLogWhere = "";
		var lasWhere = "";
		var coreWhere = "";
		var cuttingsWhere = "";
		var ogType = $("#og-well-type").val();
		var fromDate = dom.byId("og-from-date").value;
		var toDate = dom.byId("og-to-date").value;
		var op = dom.byId(operators).value;
		var ogHas = $('input[name="og-has"]:checked').map(function() {
		    return this.value;
		} ).get();
		var inj = dom.byId("inj").value;
		var depthGT = dom.byId("og-gt-depth").value;
		var depthLT = dom.byId("og-lt-depth").value;

		if (ogType) {
			var typeList = "'" + ogType.join("','") + "'";
			typeWhere = "status_txt in (" + typeList +")";
		}

		if (fromDate && toDate) {
			dateWhere = "completion_date >= to_date('" + fromDate + "','mm/dd/yyyy') and completion_date < to_date('" + toDate + "','mm/dd/yyyy') + 1";
		} else if (fromDate && !toDate) {
			dateWhere = "completion_date >= to_date('" + fromDate + "','mm/dd/yyyy')";
		} else if (!fromDate && toDate) {
			dateWhere = "completion_date < to_date('" + toDate + "','mm/dd/yyyy') + 1";
		}

		if (op) {
			opWhere = "curr_operator = '" + op + "'";
		}

		if (inj) {
			if (inj === "inj-1") {
				injWhere = "well_type = 'CLASS1'";
			} else {
				injWhere = "status in ('SWD','EOR','INJ')";
			}
		}

		if (dom.byId(hrz).checked) {
			hrzWhere = "substr(api_workovers, 1, 2) <> '00'";
		}

		if (depthGT && depthLT) {
			if (parseInt(depthLT) < parseInt(depthGT)) {
				alert("Invalid depth values: less-than value must be larger than greater-than value.");
			} else {
				depthWhere = "rotary_total_depth >= " + depthGT + " and rotary_total_depth <= " + depthLT;
			}
		} else if (depthGT && !depthLT) {
			depthWhere = "rotary_total_depth >= " + depthGT;
		} else if (!depthGT && depthLT) {
			depthWhere = "rotary_total_depth <= " + depthLT;
		}

		for (var y=0; y<ogHas.length; y++) {
			switch (ogHas[y]) {
				case "paper-log":
					paperLogWhere = "kid in (select well_header_kid from elog.log_headers)";
					break;
				case "scan-log":
					scanLogWhere = "kid in (select well_header_kid from elog.scan_urls)";
					break;
				case "las":
					lasWhere = "kid in (select well_header_kid from las.well_headers where proprietary = 0)";
					break;
				case "core":
					coreWhere = "kid in (select well_header_kid from core.core_headers)";
					break;
				case "cuttings":
					cuttingsWhere = "kid in (select well_header_kid from cuttings.boxes)";
					break;
			}
		}

		if (typeWhere !== "") {
			theWhere += typeWhere + " and ";
		}
		if (dateWhere !== "") {
			theWhere += dateWhere + " and ";
		}
		if (opWhere !== "") {
			theWhere += opWhere + " and ";
		}
		if (injWhere !== "") {
			theWhere += injWhere + " and ";
		}
		if (hrzWhere !== "") {
			theWhere += hrzWhere + " and ";
		}
		if (depthWhere !== "") {
			theWhere += depthWhere + " and ";
		}
		if (paperLogWhere !== "") {
			theWhere += paperLogWhere + " and ";
		}
		if (scanLogWhere !== "") {
			theWhere += scanLogWhere + " and ";
		}
		if (lasWhere !== "") {
			theWhere += lasWhere + " and ";
		}
		if (coreWhere !== "") {
			theWhere += coreWhere + " and ";
		}
		if (cuttingsWhere !== "") {
			theWhere += cuttingsWhere + " and ";
		}
		if (theWhere.substr(theWhere.length - 5) === " and ") {
			theWhere = theWhere.slice(0,theWhere.length - 5);
		}

		def[0] = theWhere;
		idDef[0] = def[0];
		wellsLayer.sublayers[0].definitionExpression = def[0];
	}


	clearOgFilter = function() {
		dom.byId("operators").value = "";
		$(".og-input").val("");
		$('input[name="og-has"]').removeAttr("checked");
		$('select.og-select option').removeAttr("selected");
		dom.byId("hrz").checked = false;
		wellsLayer.sublayers[0].definitionExpression = null;
		idDef[0] = "";
	}


	filterWWC5 = function() {
		var def = [];
		var theWhere = "";
		var dateWhere = "";
		var statusWhere = "";
		var useWhere = "";
		var conStatus = $('input[name="const-status"]:checked').map(function() {
		    return this.value;
		} ).get();
		var wellUse = $("#well-use").val();
		var wwc5FromDate = dom.byId("wwc5-from-date").value;
		var wwc5ToDate = dom.byId("wwc5-to-date").value;

		if (wwc5FromDate && wwc5ToDate) {
			dateWhere = "completion_date >= to_date('" + wwc5FromDate + "','mm/dd/yyyy') and completion_date < to_date('" + wwc5ToDate + "','mm/dd/yyyy') + 1";
		} else if (wwc5FromDate && !wwc5ToDate) {
			dateWhere = "completion_date >= to_date('" + wwc5FromDate + "','mm/dd/yyyy')";
		} else if (!wwc5FromDate && wwc5ToDate) {
			dateWhere = "completion_date < to_date('" + wwc5ToDate + "','mm/dd/yyyy') + 1";
		}

		if (conStatus.length > 0) {
			var conList = "'" + conStatus.join("','") + "'";
			statusWhere = "status in (" + conList +")";
		}

		if (wellUse) {
			var useList = "'" + wellUse.join("','") + "'";
			useWhere = "use_desc in (" + useList +")";
		}

		if (dateWhere !== "") {
			theWhere += dateWhere + " and ";
		}
		if (statusWhere !== "") {
			theWhere += statusWhere + " and ";
		}
		if (useWhere !== "") {
			theWhere += useWhere;
		}
		if (theWhere.substr(theWhere.length - 5) === " and ") {
			theWhere = theWhere.slice(0,theWhere.length - 5);
		}

		def[8] = theWhere;
		idDef[8] = def[8];
		wwc5Layer.sublayers[8].definitionExpression = def[8];
	}


	clearwwc5F = function() {
		dom.byId("wwc5-from-date").value = "";
        dom.byId("wwc5-to-date").value = "";
		$('input[name="const-status"]').removeAttr("checked");
		$('select#well-use option').removeAttr("selected");
		wwc5Layer.sublayers[8].definitionExpression = null;
		idDef[8] = "";
	}


    filterQuakes = function(btn) {
        var def = [];
        var lMag, uMag;
        if (btn === "day-btn") {
            lMag = dom.byId("day-mag").value;
            uMag = parseInt(lMag) + 0.99;
			var fromDate = dom.byId('eq-from-date').value;
			var toDate = dom.byId('eq-to-date').value;
			var fromWhr = "central_standard_time >= to_date('" + fromDate + "','mm/dd/yyyy')";
			var toWhr = "central_standard_time < to_date('" + toDate + "','mm/dd/yyyy') + 1";
			var netWhr = " and net in ('us', ' ', 'US')";

            if (lMag !== "all") {
				if (fromDate && toDate) {
                	def[13] = fromWhr + " and " + toWhr + " and mag >= " + lMag + " and mag <= " + uMag + netWhr;
				} else if (fromDate && !toDate) {
					def[13] = fromWhr + " and mag >= " + lMag + " and mag <= " + uMag + netWhr;
				} else if (!fromDate && toDate) {
					def[13] = toWhr + " and mag >= " + lMag + " and mag <= " + uMag + netWhr;
				}
            } else {
				if (fromDate && toDate) {
                	def[13] = fromWhr + " and " + toWhr + netWhr;
				} else if (fromDate && !toDate) {
					def[13] = fromWhr + netWhr;
				} else if (!fromDate && toDate) {
					def[13] = toWhr + netWhr;
				}
            }
        } else {
            var year = dom.byId("year").value;
            var nextYear = parseInt(year) + 1;

            lMag = dom.byId("year-mag").value;
            uMag = parseInt(lMag) + 0.99;

            if (year !== "all") {
				var whr = "central_standard_time >= to_date('01/01/" + year + "','mm/dd/yyyy') and central_standard_time < to_date('01/01/" + nextYear + "','mm/dd/yyyy') and net in ('us', ' ', 'US')";
                if (lMag !== "all") {
                    def[13] = whr + " and mag >= " + lMag + " and mag <= " + uMag;
                } else {
                    def[13] = whr;
                }
            } else {
                if (lMag !== "all") {
                    def[13] = " mag >= " + lMag + " and mag <= " + uMag;
                } else {
                    def[13] = "";
                }
            }
        }
		idDef[13] = def[13];
		usgsEventsLayer.sublayers[13].definitionExpression = def[13];
    }


    clearQuakeFilter = function() {
        usgsEventsLayer.sublayers[13].definitionExpression = null;
        dom.byId("year").options[0].selected="selected";
        dom.byId("year-mag").options[0].selected="selected";
        dom.byId("day-mag").options[0].selected="selected";
        dom.byId("eq-from-date").value = "";
        dom.byId("eq-to-date").value = "";
		idDef[13] = "";
    }


    filterQuakesLast = function() {
        var def = [];
        def[13] = "state = 'KS' and net in ('us', ' ', 'US') and the_date = (select max(the_date) from earthquakes where state = 'KS' and net in ('us', ' ', 'US'))";
		idDef[13] = def[13];
		usgsEventsLayer.sublayers[13].definitionExpression = def[13];
    }


	bufferFeature = function() {
		// var listOption = $("input:radio[name=buffwelltype]:checked").val();
		// if (view.zoom <= 13 && listOption !== 'none') {
		// 	alert("Must zoom-in at least one level to list wells within buffer.")
		// }

		graphicsLayer.remove(bufferGraphic);

		var f = view.popup.selectedFeature;

		if (f.geometry.type === "point") {
			var buffFeature = new Point( {
			    x: f.geometry.x,
			    y: f.geometry.y,
			    spatialReference: wmSR
			 } );
		} else {
			var buffFeature = new Polygon( {
			    rings: f.geometry.rings,
			    spatialReference: wmSR
			 } );
		}

		var buffPoly = geometryEngine.geodesicBuffer(buffFeature, dom.byId('buff-dist').value, dom.byId('buff-units').value);
		var fillSymbol = new SimpleFillSymbol( {
			color: [102, 205, 170, 0.4],
			outline: new SimpleLineSymbol( {
				color: [0, 0, 0],
			  	width: 1
			} )
		} );
		bufferGraphic = new Graphic( {
			geometry: buffPoly,
			symbol: fillSymbol
		} );

		graphicsLayer.add(bufferGraphic);

		$("#buff-dia").dialog("close");

		// List wells w/in buffer:
		var selectBuffWellType = $("input:radio[name=buffwelltype]:checked").val();
		if (selectBuffWellType !== "none") {
			var idTask = new IdentifyTask(wwc5GeneralServiceURL);
	        var idParams = new IdentifyParameters();
			var arrFeatures = [];
			var twn, rng, dir, sec, count, what;
			idParams.geometry = buffPoly;
			idParams.layerIds = (selectBuffWellType === "Oil and Gas") ? [0] : [8];
			idParams.returnGeometry = true;
			idParams.tolerance = 0;
			idParams.mapExtent = view.extent;
			idTask.execute(idParams).then(function(response) {
				for (var i=0; i<response.results.length; i++) {
					arrFeatures.push(response.results[i].feature);
				}
				var objFeatures = {
						features: arrFeatures
				};
				createWellsList(objFeatures, selectBuffWellType, twn, rng, dir, sec, count, what);
			} );
		}
	}


    function openPopup(feature) {
		dom.byId("mapDiv").style.cursor = "auto";
		view.popup.features = feature;
		view.popup.dockEnabled = true;
		view.popup.dockOptions = {
			buttonEnabled: false,
			position: "bottom-right"
		};
		view.popup.visible = true;
    }


    function urlZoom(urlParams) {
        var items = urlParams.split("&");
        if (items.length > 1) {
            var extType = items[0].substring(11);
            var extValue = items[1].substring(12);

            findParams.contains = false;

            switch (extType) {
                case "well":
                    findParams.layerIds = [0];
                    findParams.searchFields = ["kid"];
                    break;
                case "field":
                    findParams.layerIds = [1];
                    findParams.searchFields = ["field_kid"];
					fieldsLayer.visible = true;
	                $("#Oil-and-Gas-Fields input").prop("checked", true);
                    break;
            }

            findParams.searchText = extValue;
            findTask.execute(findParams)
            .then(function(response) {
				return addPopupTemplate(response.results);
            } )
            .then(function(feature) {
				if (feature.length > 0) {
					openPopup(feature);
	                zoomToFeature(feature);
				}
            } );
        }
    }


    function zoomToFeature(features) {
        var f = features[0] ? features[0] : features;
		if (f.geometry.type === "point") {
            view.center = new Point(f.geometry.x, f.geometry.y, wmSR);;
            view.scale = 24000;
		} else {
			view.extent = f.geometry.extent;
		}
		highlightFeature(f);
    }


    function highlightFeature(features) {
		///graphicsLayer.removeAll();
		graphicsLayer.remove(hilite);
        var f = features[0] ? features[0] : features;
        switch (f.geometry.type) {
            case "point":
                var marker = new SimpleMarkerSymbol( {
                    color: [255, 255, 0, 0],
                    size: 20,
                    outline: new SimpleLineSymbol( {
                        color: "yellow",
                        width: 7
                    } )
                } );
				var sym = marker;
                break;
            case "polygon":
				var fill = new SimpleFillSymbol( {
					style: "none",
					outline: new SimpleLineSymbol( {
                        color: "yellow",
                        width: 5
                    } )
				} );
				var sym = fill;
                break;
        }
		hilite = new Graphic( {
			geometry: f.geometry,
			symbol: sym
		} );
		graphicsLayer.add(hilite);
    }


    jumpFocus = function(nextField,chars,currField) {
        if (dom.byId(currField).value.length == chars) {
            dom.byId(nextField).focus();
        }
    }


    findIt = function(what) {
		searchWidget.clear();
		graphicsLayer.removeAll();

        switch (what) {
            case "plss":
                var plssText;

                if (dom.byId('rngdir-e').checked == true) {
                    var dir = 'E';
                }
                else {
                    var dir = 'W';
                }

                if (dom.byId('sec').value !== "") {
                    plssText = 'S' + dom.byId('sec').value + '-T' + dom.byId('twn').value + 'S-R' + dom.byId('rng').value + dir;
                    findParams.layerIds = [3];
                    findParams.searchFields = ["s_r_t"];
                }
                else {
                    plssText = 'T' + dom.byId('twn').value + 'S-R' + dom.byId('rng').value + dir;
                    findParams.layerIds = [4];
                    findParams.searchFields = ["t_r"];
                }
                findParams.searchText = plssText;
                break;
            case "api":
                var apiText = dom.byId('api_state').value + "-" + dom.byId('api_county').value + "-" + dom.byId('api_number').value;

                if (dom.byId('api_extension').value != "") {
                    apiText = apiText + "-" + dom.byId('api_extension').value;
                }
                findParams.layerIds = [0];
                findParams.searchFields = ["api_number"];
                findParams.searchText = apiText;
				findParams.contains = false;
                break;
            case "county":
                findParams.layerIds = [2];
                findParams.searchFields = ["county"];
                findParams.searchText = dom.byId("lstCounty").value;
                break;
            case "field":
                findParams.layerIds = [1];
                findParams.searchFields = ["field_name"];
                findParams.contains = false;
                findParams.searchText = dom.byId("field-select").value;
                fieldsLayer.visible = true;
                $("#Oil-and-Gas-Fields input").prop("checked", true);
			case "kgsnum":
				findParams.layerIds = [8];
				findParams.searchFields = ["input_seq_number"];
				findParams.searchText = dom.byId("kgs-id-num").value;
				break;
        }
        findTask.execute(findParams).then(function(response) {
            zoomToFeature(response.results[0].feature);

			var query = new Query();
			query.returnGeometry = true;
			var selectWellType = $("input:radio[name=welltype]:checked").val();

			if (what === "plss") {
				if (selectWellType !== "none") {
					if (selectWellType === "Oil and Gas") {
						var lyrID = "/0";
						// Attributes to be included in download file:
						query.outFields = ["KID","API_NUMBER","LEASE_NAME","WELL_NAME","STATE_CODE","COUNTY","FIELD_NAME","FIELD_KID","TOWNSHIP","TOWNSHIP_DIRECTION","RANGE","RANGE_DIRECTION","SECTION","SUBDIVISION_1_LARGEST","SUBDIVISION_2","SUBDIVISION_3","SUBDIVISION_4_SMALLEST","SPOT","FEET_NORTH_FROM_REFERENCE","FEET_EAST_FROM_REFERENCE","REFERENCE_CORNER","ROTARY_TOTAL_DEPTH","ELEVATION_KB","ELEVATION_GL","ELEVATION_DF","PRODUCING_FORMATION","NAD27_LATITUDE","NAD27_LONGITUDE","OPERATOR_NAME","CURR_OPERATOR","PERMIT_DATE_TXT","SPUD_DATE_TXT","COMPLETION_DATE_TXT","PLUG_DATE_TXT","STATUS_TXT"];
						wellsLayer.visible = true;
	                    $("#Oil-and-Gas-Wells input").prop("checked", true);
					} else {
						// water.
						var lyrID = "/8";
						query.outFields = ["INPUT_SEQ_NUMBER","OWNER_NAME","USE_DESC","DWR_APPROPRIATION_NUMBER","MONITORING_NUMBER","COUNTY","TOWNSHIP","TOWNSHIP_DIRECTION","RANGE","RANGE_DIRECTION","SECTION","QUARTER_CALL_1_LARGEST","QUARTER_CALL_2","QUARTER_CALL_3","NAD27_LATITUDE","NAD27_LONGITUDE","DEPTH_TXT","ELEV_TXT","STATIC_LEVEL_TXT","YIELD_TXT","STATUS","COMP_DATE_TXT","CONTRACTOR"];
						wwc5Layer.visible = true;
	                    $("#WWC5-Water-Wells input").prop("checked", true);
					}

					query.where = "township="+dom.byId('twn').value+" and township_direction='S' and range="+dom.byId('rng').value+" and range_direction='"+dir+"'";
					if (dom.byId('sec').value !== "") {
						query.where += " and section=" + dom.byId('sec').value;
					}
				} else {
					$("#wells-tbl").html("");
				}
			} else if (what === "field") {
				if ( $("#field-list-wells").prop("checked") ) {
					query.where = "FIELD_KID = " + response.results[0].feature.attributes.FIELD_KID;
					query.outFields = ["KID","API_NUMBER","LEASE_NAME","WELL_NAME","STATE_CODE","COUNTY","FIELD_NAME","FIELD_KID","TOWNSHIP","TOWNSHIP_DIRECTION","RANGE","RANGE_DIRECTION","SECTION","SUBDIVISION_1_LARGEST","SUBDIVISION_2","SUBDIVISION_3","SUBDIVISION_4_SMALLEST","SPOT","FEET_NORTH_FROM_REFERENCE","FEET_EAST_FROM_REFERENCE","REFERENCE_CORNER","ROTARY_TOTAL_DEPTH","ELEVATION_KB","ELEVATION_GL","ELEVATION_DF","PRODUCING_FORMATION","NAD27_LATITUDE","NAD27_LONGITUDE","OPERATOR_NAME","CURR_OPERATOR","PERMIT_DATE_TXT","SPUD_DATE_TXT","COMPLETION_DATE_TXT","PLUG_DATE_TXT","STATUS_TXT"];
					var lyrID = "/0";
					selectWellType = "Oil and Gas";
				}
			}

			var queryTask = new QueryTask( {
				url: wwc5GeneralServiceURL + lyrID
			} );

			queryTask.executeForCount(query).then(function(count) {
				listCount = count;
			} );

			queryTask.execute(query).then(function(results) {
				createWellsList(results, selectWellType, dom.byId('twn').value, dom.byId('rng').value, dir, dom.byId('sec').value, listCount, what);
			} );

			return addPopupTemplate(response.results);
        } ).then(function(feature) {
			if (what === "api" || what === "field") {
				openPopup(feature);
			}
		} );
    }


	function sortList(a, b) {
		var att =  (a.attributes.API_NUMBER) ? "API_NUMBER" : "OWNER_NAME";
        var numA = a.attributes[att];
        var numB = b.attributes[att];
        if (numA < numB) { return -1 }
        if (numA > numB) { return 1 }
        return 0;
    }


	function createWellsList(fSet, wellType, twn, rng, dir, sec, count, what) {
		if (sec) {
			var locationString = "S" + sec + " - T" + twn + "S - R" + rng + dir;
		} else if (twn) {
			var locationString = "T" + twn + "S - R" + rng + dir;
		} else {
			var locationString = "buffer";
		}

		if (what === "field") {
			var wellsLst = "<div class='panel-sub-txt' id='list-txt'>List</div><div class='download-link'></div><div class='toc-note' id='sect-desc'>Oil and Gas Wells assigned to " + fSet.features[0].attributes.FIELD_NAME + "</div>";
		} else {
			var wellsLst = "<div class='panel-sub-txt' id='list-txt'>List</div><div class='download-link'></div><div class='toc-note' id='sect-desc'>" + wellType + " Wells in " + locationString + "</div>";
		}

		$("#wells-tbl").html(wellsLst);
		if (count > 2000) {
			$("#wells-tbl").append("&nbsp;&nbsp;&nbsp;(listing 2000 of " + count + " records)");
		}

		var apiNums = [];
		var seqNums = [];
		var apis,seqs;

		if (fSet.features.length > 0) {
			fSet.features.sort(sortList);

			var downloadIcon = "<img id='loader' class='hide' src='images/ajax-loader.gif'><a class='esri-icon-download' title='Download List to Text File'></a>";
			$("#list-txt").append(downloadIcon);
			if (wellType === "Oil and Gas") {
				var wellsTbl = "<table class='striped-tbl well-list-tbl' id='og-tbl'><tr><th>Name</th><th>API</th></tr>";
				for (var i=0; i<fSet.features.length; i++) {
					wellsTbl += "<tr><td style='width:48%'>" + fSet.features[i].attributes.LEASE_NAME + " " + fSet.features[i].attributes.WELL_NAME + "</td><td style='width:52%'>" + fSet.features[i].attributes.API_NUMBER + "</td><td class='hide'>" + fSet.features[i].attributes.KID + "</td></tr>";
					apiNums.push(fSet.features[i].attributes.API_NUMBER);
				}
			} else {
				var wellsTbl = "<table class='striped-tbl well-list-tbl' id='wwc5-tbl'><tr><th>Owner</th><th>Use</th></tr>";
				for (var i=0; i<fSet.features.length; i++) {
					wellsTbl += "<tr><td>" + fSet.features[i].attributes.OWNER_NAME + "</td><td>" + fSet.features[i].attributes.USE_DESC + "</td><td class='hide'>" + fSet.features[i].attributes.INPUT_SEQ_NUMBER + "</td></tr>";
					seqNums.push(fSet.features[i].attributes.INPUT_SEQ_NUMBER);
				}
				wwc5Layer.visible = true;
				$("#WWC5-Water-Wells input").prop("checked", true);
			}
			wellsTbl += "</table>";
		} else {
			if (view.zoom <= 13) {
				var wellsTbl = "<div class='toc-note'>Zoom in and re-run buffer to list wells</div>";
			} else {
				var wellsTbl = "<div class='toc-note'>No wells found</div>";
			}
		}

		$("#wells-tbl").append(wellsTbl);

		if (apiNums.length > 0) {
			apis = apiNums.join(",");
		}
		if (seqNums.length > 0) {
			seqs = seqNums.join(",");
		}

		var cfParams = { "twn": twn, "rng": rng, "dir": dir, "sec": sec, "type": wellType, "apis": apis, "seqs": seqs };
		$(".esri-icon-download").click( {cf:cfParams}, downloadList);

		// Open tools drawer-menu:
		$(".item").removeClass("item-selected");
		$(".panel").removeClass("panel-selected");
		$(".icon-wrench").closest(".item").addClass("item-selected");
		$("#tools-panel").closest(".panel").addClass("panel-selected");

		// Select a well by clicking on table row:
		$('.striped-tbl').find('tr').click(function() {
			$(this).closest("tr").siblings().removeClass("highlighted");
    		$(this).toggleClass("highlighted");

			// Get id for that well from the table cell (KGS id numbers are in a hidden third column referenced by index = 2):
			var kgsID =  $(this).find('td:eq(2)').text();

			if (wellType === "Oil and Gas" || what === "field") {
				findParams.layerIds = [0];
				findParams.searchFields = ["KID"];
		        findParams.searchText = kgsID;
			} else {
				findParams.layerIds = [8];
				findParams.searchFields = ["INPUT_SEQ_NUMBER"];
		        findParams.searchText = kgsID;
			}

			findTask.execute(findParams).then(function(response) {
				return addPopupTemplate(response.results);
	        } ).then(function(feature) {
				if (feature.length > 0) {
					view.goTo( {
						target: feature[0].geometry,
						zoom: 16
					}, {duration: 750} ).then(function() {
						highlightFeature(feature[0]);
			            openPopup(feature);
					} );
				}
	        } );
		} );
	}


	downloadList = function(evt) {
		$("#loader").show();

		var plssStr = "";
		var data = {};

		if (evt.data.cf.sec) {
			plssStr += "twn=" + evt.data.cf.twn + "&rng=" + evt.data.cf.rng + "&dir=" + evt.data.cf.dir + "&sec=" + evt.data.cf.sec + "&type=" + evt.data.cf.type;
		} else if (evt.data.cf.twn) {
			plssStr += "twn=" + evt.data.cf.twn + "&rng=" + evt.data.cf.rng + "&dir=" + evt.data.cf.dir + "&type=" + evt.data.cf.type;
		} else {
			// Download from buffer.
			data = {"type": evt.data.cf.type, "apis": evt.data.cf.apis, "seqs": evt.data.cf.seqs};
		}

		$.post( "downloadPointsInPoly.cfm?" + plssStr, data, function(response) {
			$(".download-link").html(response);
			$("#loader").hide();
		} );
	}


    zoomToLatLong = function() {
		graphicsLayer.removeAll();

        var lat = dom.byId("lat").value;
        var lon = dom.byId("lon").value;
        var datum = dom.byId("datum").value;

        var gsvc = new GeometryService("http://services.kgs.ku.edu/arcgis8/rest/services/Utilities/Geometry/GeometryServer");
        var params = new ProjectParameters();
        var wgs84Sr = new SpatialReference( { wkid: 4326 } );

        if (lon > 0) {
            lon = 0 - lon;
        }

		switch (datum) {
			case "nad27":
				var srId = 4267;
				break;
			case "nad83":
				var srId = 4269;
				break;
			case "wgs84":
				var srId = 4326;
				break;
		}

        var p = new Point(lon, lat, new SpatialReference( { wkid: srId } ) );
        params.geometries = [p];
        params.outSR = wgs84Sr;

        gsvc.project(params).then( function(features) {
            var pt84 = new Point(features[0].x, features[0].y, wgs84Sr);
            var wmPt = webMercatorUtils.geographicToWebMercator(pt84);

            var ptSymbol = new SimpleMarkerSymbol( {
                style: "x",
                size: 22,
                outline: new SimpleLineSymbol( {
                  color: [255, 0, 0],
                  width: 4
                } )
            } );

            var pointGraphic = new Graphic( {
                geometry: wmPt,
                symbol: ptSymbol
            } );

			view.goTo( {
				target: wmPt,
				zoom: 16
			}, {duration: 750} ).then(function() {
	            graphicsLayer.add(pointGraphic);
			} );
        } );
    }


	resetFinds = function() {
		searchWidget.clear();
		$("#twn, #rng, #sec, #datum, #lstCounty").prop("selectedIndex", 0);
		$("#rngdir-w").prop("checked", "checked");
		$("[name=welltype]").filter("[value='none']").prop("checked",true);
		$("#api_state, #api_county, #api_number, #api_extension, #lat, #lon, #field-select, #kgs-id-num").val("");
	}


	originalLocation = function() {
		urlZoom(urlParams);
	}


	addBookmark = function() {
		console.log("add bookmark");
	}


    function createMenus() {
    	var drawerMenus = [];
        var content, menuObj;

		// Layers panel:
        content = '';
        content += '<div class="panel-container">';
        content += '<div class="panel-header">Display*</div>';
        content += '<div id="lyrs-toc"></div>';
        content += '</div>';

        menuObj = {
            label: '<div class="icon-layers"></div><div class="icon-text">Display</div>',
            content: content
        };
        drawerMenus.push(menuObj);

        // Find panel:
        content = '';
        content += '<div class="panel-container">';
        content += '<div class="panel-header">Find <span id="reset-finds"><button onclick="resetFinds()">Reset</button></span></div>';
        content += '<div class="panel-padding">';
        // address:
        content += '<div class="find-header esri-icon-right-triangle-arrow" id="address"><span class="find-hdr-txt"> Address or Place<span></div>';
        content += '<div class="find-body hide" id="find-address">';
        content += '<div id="srch"></div>';
        content += '</div>';
        // plss:
        content += '<div class="find-header esri-icon-right-triangle-arrow" id="plss"><span class="find-hdr-txt"> Section-Township-Range</span></div>';
        content += '<div class="find-body hide" id="find-plss">';
        content += '<table><tr><td class="find-label">Township:</td><td><select id="twn"><option value=""></option>';
        for (var i=1; i<36; i++) {
            content += '<option value="' + i + '"">' + i + '</option>';
        }
        content += '</select> South</td></tr>';
        content += '<tr><td class="find-label">Range:</td><td style="white-space: nowrap"><select id="rng"><option value=""></option>';
        for (var i=1; i<44; i++) {
            content += '<option value="' + i + '"">' + i + '</option>';
        }
        content += '</select> East: <input type="radio" name="rngdir" id="rngdir-e" value="e"> West: <input type="radio" name="rngdir" id="rngdir-w" value="w" checked></td></tr>';
        content += '<tr><td class="find-label">Section:</td><td><select id="sec"><option value=""></option>';
        for (var i=1; i<37; i++) {
            content += '<option value="' + i + '"">' + i + '</option>';
        }
        content += '</select><span class="toc-note">(optional)</td></tr>';
		content += '<tr><td></td><td><button class="find-button" onclick=$(".list-opts").toggleClass("hide")>Options</button>';
		content += '<tr class="list-opts hide"><td colspan="2">List wells in this section:</td></tr>';
		// content += '<tr class="list-opts hide"><td></td><td><input type="radio" name="welltype" value="Oil and Gas"> Oil and Gas</td></tr>';
		content += '<tr class="list-opts hide"><td></td><td><input type="radio" name="welltype" value="Water"> Water (WWC5)</td></tr>';
		content += '<tr class="list-opts hide"><td></td><td><input type="radio" name="welltype" value="none" checked> Don&#39;t List</td></tr>';
        content += '<tr><td></td><td><button class="find-button" onclick=findIt("plss")>Find</button></td></tr>';
        content += '</table></div>';
		// KGS ID:
		content += '<div class="find-header esri-icon-right-triangle-arrow" id="kgsid"><span class="find-hdr-txt"> KGS ID Number</span></div>';
        content += '<div class="find-body hide" id="find-kgsid">';
        content += 'KGS ID Number: <input type="text" id="kgs-id-num" size="8" />';
		content += '<button class=find-button onclick=findIt("kgsnum")>Find</button>';
        content += '</div>';
        // api:
        // content += '<div class="find-header esri-icon-right-triangle-arrow" id="api"><span class="find-hdr-txt"> Well API</span></div>';
        // content += '<div class="find-body hide" id="find-api">';
        // content += 'API Number (extension optional):<br>';
        // content += '<input type="text" id="api_state" size="2" onKeyUp="jumpFocus(api_county, 2, this.id)"/>-';
        // content += '<input type="text" id="api_county" size="3" onKeyUp="jumpFocus(api_number, 3, this.id)"/>-';
        // content += '<input type="text" id="api_number" size="5" onKeyUp="jumpFocus(api_extension, 5, this.id)"/>-';
        // content += '<input type="text" id="api_extension" size="4"/>';
        // content += '<button class=find-button onclick=findIt("api")>Find</button>';
        // content += '</div>';
        // lat-lon:
        content += '<div class="find-header esri-icon-right-triangle-arrow" id="latlon"><span class="find-hdr-txt"> Latitude-Longitude</span></div>';
        content += '<div class="find-body hide" id="find-latlon">';
        content += '<table><tr><td class="find-label">Latitude:</td><td><input type="text" id="lat" placeholder="e.g. 38.12345"></td></tr>';
        content += '<tr><td class="find-label">Longitude:</td><td><input type="text" id="lon" placeholder="e.g. -98.12345"></td></tr>';
        content += '<tr><td class="find-label">Datum:</td><td><select id="datum"><option value="nad27">NAD27</option><option value="nad83">NAD83</option><option value="wgs84">WGS84</option><td></td></tr>';
        content += '<tr><td></td><td><button class="find-button" onclick="zoomToLatLong();">Find</button></td></tr>';
        content += '</table></div>';
        // field:
        // content += '<div class="find-header esri-icon-right-triangle-arrow" id="field"><span class="find-hdr-txt"> Field</span></div>';
        // content += '<div class="find-body hide" id="find-field">';
        // content += '<table><tr><td class="find-label">Name:</td><td><input id="field-select"></td></tr>';
		// content += '<tr><td colspan="2"><input type="checkbox" id="field-list-wells">List wells assigned to this field</td></tr>';
		// content += '<tr><td></td><td><button class=find-button onclick=findIt("field")>Find</button></td></tr></table>';
        // content += '</div>';
        // county:
        content += '<div class="find-header esri-icon-right-triangle-arrow" id="county"><span class="find-hdr-txt"> County</span></div>';
        content += '<div class="find-body hide" id="find-county">';
        content += '<table><tr><td class="find-label">County:</td><td><select id="lstCounty"></select></td><td><button class=find-button onclick=findIt("county")>Find</button></td></tr></table>';
        content += '</div>';
		// bookmarks
		content += '<div class="panel-sub-txt">Bookmarks <span class="esri-icon-plus-circled" id="add-bookmark" title="Add Bookmark" onclick="addBookmark()"></span></div>';
		content += '<div class="bookmark-link"><span onclick="originalLocation()">Original Location</div>';
        content += '</div>';
        content += '</div>';

        menuObj = {
            label: '<div class="icon-zoom-in"></div><div class="icon-text">Find</div>',
            content: content
        };
        drawerMenus.push(menuObj);


        // Tools panel:
        content = '';
        content += '<div class="panel-container" id="tools-panel">';
        content += '<div class="panel-header">Tools </div>';
        content += '<div class="panel-padding">';
        content += '<div class="find-header tools-icon esri-icon-radio-checked" id="buff-tool"><span class="find-hdr-txt tools-txt"> Buffer and Select</span></div>';
		//content += '<div class="find-header tools-icon esri-icon-minus" id="meas-tool"><span class="find-hdr-txt tools-txt"> Measure Distance</span></div>';
		content += '</div>';
		content += '<div id="wells-tbl"></div>';
        content += '</div>';

        menuObj = {
            label: '<div class="icon-wrench"></div><div class="icon-text">Tools</div>',
            content: content
        };
        drawerMenus.push(menuObj);

		// Legend/links panel:
        content = '';
        content += '<div class="panel-container">';
		content += '<div class="panel-header">Links</div>';
		content += '<div>';
		content += '<a href="http://www.kdheks.gov/waterwell/index.html" target="_blank">KDHE Water Well Program Home Page</a><p>';
		content += '<a href="http://www.kgs.ku.edu" target="_blank">KGS Home Page</a><p>';
		content += '<a href="http://maps.kgs.ku.edu/oilgas" target="_blank">KGS Oil and Gas Mapper</a><p>';
		content += '<a href="http://www.kgs.ku.edu/Hydro/hydroIndex.html" target="_blank">KGS Water Resources Home Page</a><p>';
		content += '<a href="https://pubs.usgs.gov/gip/TopographicMapSymbols/topomapsymbols.pdf" target="_blank">Topographic Map Symbols</a><p>';
		content += '<a href="http://hercules.kgs.ku.edu/geohydro/wimas/index.cfm" target="_blank">WIMAS Database Home Page</a><p>';
		content += '<a href="http://www.kgs.ku.edu/Magellan/WaterLevels/index.html" target="_blank">WIZARD Database Home Page</a><p>';
		content += '<a href="http://www.kgs.ku.edu/Magellan/WaterWell/index.html" target="_blank">WWC5 Database Home Page</a><p>';
		content += "</div>";
        content += '<div class="panel-header">Legend </div>';
        content += '<div class="panel-padding">';
        content += '<div id="legend-content"></div>';
        content += '</div>';
        content += '</div>';

        menuObj = {
            label: '<div class="icon-list"></div><div class="icon-text">Links/Legend</div>',
            content: content
        };
        drawerMenus.push(menuObj);

        var drawerMenu = new DrawerMenu({
            menus: drawerMenus
        }, dom.byId("drawer_menus"));
        drawerMenu.startup();
    }


    function showFullInfo() {
        var popupTitle = $(".esri-title").html();
        if (popupTitle.indexOf("Field:") > -1) {
			var url = "http://chasm.kgs.ku.edu/apex/oil.ogf4.IDProdQuery?FieldNumber=" + $("#field-kid").html();
        } else if (popupTitle.indexOf("Well:") > -1) {
            var url = "http://chasm.kgs.ku.edu/apex/qualified.well_page.DisplayWell?f_kid=" + $("#well-kid").html();
        } else if (popupTitle.indexOf("Earthquake") > -1) {
            var url = "http://earthquake.usgs.gov/earthquakes/eventpage/" + $("#usgs-id").html();
        } else if (popupTitle.indexOf("(WWC5)") > -1) {
            var url = "http://chasm.kgs.ku.edu/ords/wwc5.wwc5d2.well_details?well_id=" + $("#seq-num").html();
        }
		var win = window.open(url, "target='_blank'");
    }


	function createTOC() {
        var lyrs = map.layers;
        var chkd, tocContent = "";
		var aerialTocContent = "";
		// var ungroupedTocContent = "";
		var aerialGroup = ["2015-Aerials","2014-1ft-Aerials","2002-Aerials","1991-Aerials"];
		// var ungroupedLayers = ["Section-Township-Range","WWC5-Water-Wells","Topo"];
        var transparentLayers = ["Topo","2015 Aerials","2014 1ft Aerials","2002 Aerials","1991 Aerials"];

        for (var j=lyrs.length - 1; j>-1; j--) {
            var layerID = lyrs._items[j].id;
            chkd = map.findLayerById(layerID).visible ? "checked" : "";
			var htmlID = layerID.replace(/ /g, "-");

			if (layerID.indexOf("-layer-") === -1 && aerialGroup.indexOf(htmlID) === -1 && layerID.indexOf("Base Map") === -1) {
                // ^ Excludes default graphics layer from the TOC and separates grouped and ungrouped layers.
                tocContent += "<div class='toc-item' id='" + htmlID + "'><label><input type='checkbox' id='tcb-" + j + "' onclick='toggleLayer(" + j + ");'" + chkd + ">" + layerID + "</label>";

                if ($.inArray(layerID, transparentLayers) !== -1) {
                    // Add transparency control buttons to specified layers.
                    tocContent += "</span><span class='esri-icon-forward toc-icon' title='Make Layer Opaque' onclick='changeOpacity(&quot;" + layerID + "&quot;,&quot;up&quot;);'></span><span class='esri-icon-reverse toc-icon' title='Make Layer Transparent' onclick='changeOpacity(&quot;" + layerID + "&quot;,&quot;down&quot;);'>";
                }

                tocContent += "</div>";
            }

			if (aerialGroup.indexOf(htmlID) > -1) {
				aerialTocContent += "<div class='toc-sub-item' id='" + htmlID + "'><label><input type='checkbox' class='filterable' value='" + layerID + "' id='tcb-" + j + "' onclick='toggleLayer(" + j + ");'" + chkd + ">" + layerID + "</label><span class='esri-icon-forward toc-icon' title='Make Layer Opaque' onclick='changeOpacity(&quot;" + layerID + "&quot;,&quot;up&quot;);'></span><span class='esri-icon-reverse toc-icon' title='Make Layer Transparent' onclick='changeOpacity(&quot;" + layerID + "&quot;,&quot;down&quot;);'></span></div>";
			}

			if (layerID.indexOf("Base Map") > -1) {
            	var basemapTocContent = "<div class='toc-item' id='" + htmlID + "'><label><input type='checkbox' id='tcb-" + j + "' onclick='toggleLayer(" + j + ");'" + chkd + ">" + layerID + "</label>";
			}

        }
		tocContent += '<div class="find-header esri-icon-right-triangle-arrow group-hdr" id="aerial-group"><span class="find-hdr-txt"> Aerials</div>';
		tocContent += '<div class="find-body hide" id="aerial-group-body"></div>';
		tocContent += basemapTocContent + "</div>";

        tocContent += "<span class='toc-note'>* Some layers only visible when zoomed in</span>";
        $("#lyrs-toc").html(tocContent);
		$("#aerial-group-body").html(aerialTocContent);

		// Click handlers for TOC groups:
		$(".group-hdr").click(function() {
			var group = $(this).attr("id");
			if ( $(this).hasClass("esri-icon-down-arrow") ) {
				$("#" + group + "-body").fadeOut("fast");
			} else {
				$("#" + group + "-body").fadeIn("fast");
			}
			$(this).toggleClass("esri-icon-down-arrow esri-icon-right-triangle-arrow no-border");
		} );

		// Click handler for TOC checkboxes:
		// $("[id^='tcb-']").change(function() {
		// 	saveTocPrefs(this.id);
		// } );
        //
		// // Click handler for TOC basemap radios:
		// $("[name='bm']").change(function() {
		// 	saveRadioPrefs("bas-" + this.value);
		// } );
    }


    labelWells = function(type) {
        // TODO:
    }


    changeOpacity = function(id, dir) {
        var lyr = map.findLayerById(id);
        var incr = (dir === "down") ? -0.2 : 0.2;
        lyr.opacity = lyr.opacity + incr;
    }


    function executeIdTask(event) {
        identifyParams.geometry = event.mapPoint;
        identifyParams.mapExtent = view.extent;
		identifyParams.layerDefinitions = idDef;
        dom.byId("mapDiv").style.cursor = "wait";

        identifyTask.execute(identifyParams).then(function(response) {
			return addPopupTemplate(response.results);
        } ).then(function(feature) {
			if (feature.length > 0) {
            	openPopup(feature);

				// Highlight row in wells list table:
				var fAtts = feature[0].attributes;
				if (fAtts.hasOwnProperty('INPUT_SEQ_NUMBER')) {
					var ptID = fAtts.INPUT_SEQ_NUMBER;
				} else if (fAtts.hasOwnProperty('KID')) {
					var ptID = fAtts.KID;
				}
				$(".well-list-tbl tr").removeClass("highlighted");
				$(".well-list-tbl tr:contains(" + ptID + ")").toggleClass("highlighted");

            	highlightFeature(feature);
			} else {
				dom.byId("mapDiv").style.cursor = "auto";
			}
        } );
    }


	function addPopupTemplate(response) {
		return arrayUtils.map(response, function(result) {
			var feature = result.feature;
			var layerName = result.layerName;

			if (layerName === 'OG_WELLS') {
				var ogWellsTemplate = new PopupTemplate( {
					title: "<span class='pu-title'>Well: {WELL_LABEL} </span><span class='pu-note'>{API_NUMBER}</span>",
					content: wellContent(feature)
				} );
				feature.popupTemplate = ogWellsTemplate;
			}
			else if (layerName === 'OG_FIELDS') {
				var ogFieldsTemplate = new PopupTemplate( {
					title: "Field: {FIELD_NAME}",
					content: fieldContent(feature)
					} );
				feature.popupTemplate = ogFieldsTemplate;
			}
			else if (layerName === 'WWC5_WELLS') {
				var wwc5Template = new PopupTemplate( {
					title: "Water Well (WWC5): ",
					content: wwc5Content(feature)
				} );
				feature.popupTemplate = wwc5Template;
			}
			else if (layerName === 'EARTHQUAKES') {
				var earthquakeTemplate = new PopupTemplate( {
					title: "Earthquake Event: ",
					content: earthquakeContent(feature)
				} );
				feature.popupTemplate = earthquakeTemplate;
			}
			return feature;
		} );
	}


    function earthquakeContent(feature) {
        var date = feature.attributes.CENTRAL_STANDARD_TIME !== "Null" ? feature.attributes.CENTRAL_STANDARD_TIME : "";
        var content = "<table id='popup-tbl'><tr><td>Magnitude: </td><td>{MAG}</td></tr>";
        content += "<tr><td>Date/Time (CST): </td><td>" + date + "</td></tr>";
        content += "<tr><td>Latitude: </td><td>{LATITUDE}</td></tr>";
        content += "<tr><td>Longitude: </td><td>{LONGITUDE}</td></tr>";
        content += "<tr><td>Depth: </td><td>{DEPTH} km</td></tr>";
        content += "<tr><td>Magnitude Type: </td><td>{MAGTYPE}</td></tr>";
        content += "<tr><td>Data Source: </td><td>{SOURCE}</td></tr>";
        content += "<span id='usgs-id' class='hide'>{ID}</span></table>";

        return content;
    }


    function wwc5Content(feature) {
        var content = "<table id='popup-tbl'><tr><td>County:</td><td>{COUNTY}</td></tr>";
        content += "<tr><td>Section:</td><td>T{TOWNSHIP}S&nbsp;&nbsp;R{RANGE}{RANGE_DIRECTION}&nbsp;&nbsp;Sec {SECTION}</td></tr>";
        content += "<tr><td>Quarter Section:</td><td>{QUARTER_CALL_3}&nbsp;&nbsp;{QUARTER_CALL_2}&nbsp;&nbsp;{QUARTER_CALL_1_LARGEST}</td></tr>";
		content += "<tr><td>Latitude, Longitude (NAD27):</td><td>{NAD27_LATITUDE},&nbsp;&nbsp;{NAD27_LONGITUDE}</td></tr>";
		content += "<tr><td>Owner:</td><td>{OWNER_NAME}</td></tr>";
        content += "<tr><td>Status:</td><td>{STATUS}</td></tr>";
        content += "<tr><td>Depth (ft):</td><td>{DEPTH_TXT}</td></tr>";
        content += "<tr><td>Static Water Level (ft):</td><td>{STATIC_LEVEL_TXT}</td></tr>";
        content += "<tr><td>Estimated Yield (gpm):</td><td>{YIELD_TXT}</td></tr>";
        content += "<tr><td>Elevation (ft):</td><td>{ELEV_TXT}</td></tr>";
        content += "<tr><td>Use:</td><td style='white-space:normal'>{USE_DESC}</td></tr>";
        content += "<tr><td>Completion Date:</td><td>{COMP_DATE_TXT}</td></tr>";
        content += "<tr><td>Driller:</td><td style='white-space:normal'>{CONTRACTOR}</td></tr>";
        content += "<tr><td>DWR Application Number:</td><td>{DWR_APPROPRIATION_NUMBER}</td></tr>";
        content += "<tr><td>Other ID:</td><td>{MONITORING_NUMBER}</td></tr>";
        content += "<tr><td>KGS Record Number:</td><td id='seq-num'>{INPUT_SEQ_NUMBER}</td></tr></table>";

        return content;
    }


    function fieldContent(feature) {
        var f = feature.attributes;
        var po = f.PROD_OIL !== "Null" ? f.PROD_OIL : "";
        var co = f.CUMM_OIL !== "Null" ? f.CUMM_OIL.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
        var pg = f.PROD_GAS !== "Null" ? f.PROD_GAS : "";
        var cg = f.CUMM_GAS !== "Null" ? f.CUMM_GAS.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
        var ac = f.APPROXACRE !== "Null" ? f.APPROXACRE.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
        var frm = f.FORMATIONS.split(",");
        var pf = "";
        for (var i=0; i<frm.length; i++) {
            pf += frm[i] + "<br>";
        }

        var content = "<table id='popup-tbl'><tr><td>Type of Field:</td><td>{FIELD_TYPE}</td></tr>";
        content += "<tr><td>Status:</td><td>{STATUS}</td></tr>";
        content += "<tr><td>Produces Oil:</td><td>" + po + "</td></tr>";
        content += "<tr><td>Cumulative Oil (bbls):</td><td>" + co + "</td></tr>";
        content += "<tr><td>Produces Gas:</td><td>" + pg + "</td></tr>";
        content += "<tr><td>Cumulative Gas (mcf):</td><td>" + cg + "</td></tr>";
        content += "<tr><td>Approximate Acres:</td><td>" + ac + "</td></tr>";
        content += "<tr><td>Producing Formations:</td><td>" + pf + "</td></tr>";
        content += "<span id='field-kid' class='hide'>{FIELD_KID}</span></table>";

        return content;
    }


    function wellContent(feature) {
        var f = feature.attributes;

        var dpth = f.ROTARY_TOTAL_DEPTH !== "Null" ? f.ROTARY_TOTAL_DEPTH.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";
        var elev = f.ELEVATION_KB !== "Null" ? f.ELEVATION_KB.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : "";

        var content = "<table id='popup-tbl'><tr><td>API:</td><td>{API_NUMBER}</td></tr>";
		content += "<tr><td>Original Operator:</td><td>{OPERATOR_NAME}</td></tr>";
        content += "<tr><td>Current Operator:</td><td>{CURR_OPERATOR}</td></tr>";
        content += "<tr><td>Well Type:</td><td>{STATUS_TXT}</td></tr>";
        content += "<tr><td>Status:</td><td>{WELL_CLASS}</td></tr>";
        content += "<tr><td>Lease:</td><td>{LEASE_NAME}</td></tr>";
        content += "<tr><td>Well:</td><td>{WELL_NAME}</td></tr>";
        content += "<tr><td>Field:</td><td>{FIELD_NAME}</td></tr>";
        content += "<tr><td>Location:</td><td>T{TOWNSHIP}S&nbsp;&nbsp;R{RANGE}{RANGE_DIRECTION}&nbsp;&nbsp;Sec {SECTION}<br>{SPOT}&nbsp;{SUBDIVISION_4_SMALLEST}&nbsp;{SUBDIVISION_3}&nbsp;{SUBDIVISION_2}&nbsp;{SUBDIVISION_1_LARGEST}</td></tr>";
        content += "<tr><td>Latitude, Longitude (NAD27):</td><td>{NAD27_LATITUDE},&nbsp;&nbsp;{NAD27_LONGITUDE}</td></tr>";
        content += "<tr><td>County:</td><td>{COUNTY}</td></tr>";
        content += "<tr><td>Permit Date:</td><td>{PERMIT_DATE_TXT}</td></tr>";
        content += "<tr><td>Spud Date:</td><td>{SPUD_DATE_TXT}</td></tr>";
        content += "<tr><td>Completion Date:</td><td>{COMPLETION_DATE_TXT}</td></tr>";
        content += "<tr><td>Plug Date:</td><td>{PLUG_DATE_TXT}</td></tr>";
        content += "<tr><td>Total Depth (ft):</td><td>" + dpth + "</td></tr>";
        content += "<tr><td>Elevation (KB, ft):</td><td>" + elev + "</td></tr>";
        content += "<tr><td>Producing Formation:</td><td>{PRODUCING_FORMATION}</td></tr>";
        content += "<span id='well-kid' class='hide'>{KID}</span></table>";

        return content;
    }


    toggleLayer = function(j) {
        var l = map.findLayerById(map.layers._items[j].id);
        l.visible = $("#tcb-" + j).is(":checked") ? true : false;
    }

} );
