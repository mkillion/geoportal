define({
    //Default configuration settings for the applciation. This is where you"ll define things like a bing maps key,
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings
    //and url parameters.
    "appid": "",
    "webmap": "",
    "oauthappid": null,
    //Enter the url to the proxy if needed by the applcation. See the "Using the proxy page" help topic for details
    //developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
    "proxyurl": "",
    //Example of a template specific property. If your template had several color schemes
    //you could define the default here and setup configuration settings to allow users to choose a different
    //color theme.
    "title": "Kansas Oil and Gas <span id='kgs-brand'>Kansas Geological Survey</span>",
    "summary": "",
    "defaultPanel": "zoomto",
    "enableDialogModal": false,
    "dialogModalContent": "",
    "dialogModalTitle": "",
    "enableSummaryInfo": true,
    "enableLegendPanel": true,
    "enableAboutPanel": true,
    "enableLayersPanel": true,
    "enableHomeButton": true,
    "enableLocateButton": true,
    "enableBasemapToggle": true,
   	"enableBookmarks": true,
    "enableOverviewMap": true,
    "openOverviewMap": false,
    "enableModifiedDate": true,
    "enableMoreInfo": true,
    "defaultBasemap": "topo",
    "nextBasemap": "hybrid",
    "swipeType": "vertical",
    "swipeInvertPlacement": true,
  	"bitlyLogin": "esri",
    "bitlyKey": "R_65fd9891cd882e2a96b99d4bda1be00e",
    // MK additions:
    "enableZoomToPanel": true,
    "enableToolsPanel": true,
    "fieldsServiceURL": "http://services.kgs.ku.edu/arcgis2/rest/services/oilgas/oilgas_fields/MapServer",
    "wellsServiceURL": "http://services.kgs.ku.edu/arcgis2/rest/services/oilgas/oilgas_general/MapServer",
    "plssServiceURL": "http://services.kgs.ku.edu/arcgis2/rest/services/plss/plss/MapServer",
    // End MK additions.

    //Enter the url to your organizations bing maps key if you want to use bing basemaps
    "bingmapskey": "",
    //Defaults to arcgis.com. Set this value to your portal or organization host name.
    "sharinghost": location.protocol + "//" + "www.arcgis.com",
    //When true the template will query arcgis.com for default settings for helper services, units etc. If you
    "units": null,
    "helperServices": {
        "geometry": {
            "url": null
        },
        "printTask": {
            "url": null
        },
        "elevationSync": {
            "url": null
        },
        "geocode": [{
            "url": null
           }]
    }
});
