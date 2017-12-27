{"configurationSettings":[
   	{
		"category":"<b>Map</b>",
      	"fields":[
        {
        	"type":"webmap",
           	"label":"Select a map"
     	}
     	]
 	},
  	{
         "category":"<b>Choose Swipe Layer</b>",
         "fields":[
            {
               "type":"paragraph",
               "value":"Select layer to be swiped."
            },
            {
               "type":"layerAndFieldSelector",
               "fieldName":"swipeLayer",
               "label":"Swipe Layer"
            },
            {
               "type":"string",
               "fieldName":"swipeType",
               "tooltip":"Type",
               "label":"Type",
               "options":[
                  {
                     "label":"Vertical",
                     "value":"vertical"
                  },
                  {
                     "label":"Horizontal",
                     "value":"horizontal"
                  },
                  {
                     "label":"Scope",
                     "value":"scope"
                  }
               ]
            },
            {
               "type":"boolean",
               "fieldName":"swipeInvertPlacement",
               "label":"Invert Swipe Placement"
            }
         ]
      },
      {
         "category":"<b>General</b>",
         "fields":[
            {
               "type":"string",
               "fieldName":"title",
               "label":"Application Title",
               "tooltip":"Application Title",
               "placeHolder":"My Map"
            },
            {
               "type":"string",
               "fieldName":"summary",
               "stringFieldOption":"richtext",
               "label":"Application Summary",
               "tooltip":"Map Summary",
               "placeHolder":"My Map"
            },
            {
               "type":"string",
               "fieldName":"defaultPanel",
               "tooltip":"Default Menu Panel",
               "label":"Default Menu Panel",
               "options":[
                  {
                     "label":"Legend",
                     "value":"legend"
                  },
                  {
                     "label":"Select",
                     "value":"about"
                  },
                  {
                     "label":"Layers",
                     "value":"layers"
                  }
               ]
            }
         ]
      },
      {
         "category":"<b>Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"enableLegendPanel",
               "label":"Enable Legend Panel",
               "tooltip":"Enable Legend"
            },
            {
               "type":"boolean",
               "fieldName":"enableAboutPanel",
               "label":"Enable About Panel",
               "tooltip":"Enable About Panel"
            },
            {
               "type":"boolean",
               "fieldName":"enableLayersPanel",
               "label":"Enable Layers Panel",
               "tooltip":"Enable Layers Panel"
            },
            {
               "type":"boolean",
               "fieldName":"enableHomeButton",
               "label":"Enable Home Button",
               "tooltip":"Enable Home Button"
            },
            {
               "type":"boolean",
               "fieldName":"enableLocateButton",
               "label":"Enable Locate Button",
               "tooltip":"Enable Locate Button"
            },
            {
               "type":"boolean",
               "fieldName":"enableBasemapToggle",
               "label":"Enable Basemap Toggle",
               "tooltip":"Enable Basemap Toggle"
            },
          	{
               "type":"boolean",
               "fieldName":"enableBookmarks",
               "label":"Enable Bookmarks",
               "tooltip":"Enable Bookmarks"
            },
            {
               "type":"boolean",
               "fieldName":"enableOverviewMap",
               "label":"Enable OverviewMap widget",
               "tooltip":"Enable OverviewMap widget"
            },
            {
               "type":"boolean",
               "fieldName":"openOverviewMap",
               "label":"Open Overview Map Widget by default",
               "tooltip":"Open Overview Map Widget by default"
            }
         ]
      },
      {
         "category":"<b>Basemap Widget</b>",
         "fields":[
            {
               "type":"string",
               "fieldName":"defaultBasemap",
               "tooltip":"Default selected basemap for this map.",
               "label":"Default Basemap",
               "options":[
                  {
                     "label":"Streets",
                     "value":"streets"
                  },
                  {
                     "label":"Satellite",
                     "value":"satellite"
                  },
                  {
                     "label":"Hybrid",
                     "value":"hybrid"
                  },
                  {
                     "label":"Topographic",
                     "value":"topo"
                  },
                  {
                     "label":"Gray",
                     "value":"gray"
                  },
                  {
                     "label":"Oceans",
                     "value":"oceans"
                  },
                  {
                     "label":"National Geographic",
                     "value":"national-geographic"
                  },
                  {
                     "label":"OpenStreetMap",
                     "value":"osm"
                  }
               ]
            },
            {
               "type":"string",
               "fieldName":"nextBasemap",
               "tooltip":"Next selected basemap for this map.",
               "label":"Next Basemap",
               "options":[
                  {
                     "label":"Streets",
                     "value":"streets"
                  },
                  {
                     "label":"Satellite",
                     "value":"satellite"
                  },
                  {
                     "label":"Hybrid",
                     "value":"hybrid"
                  },
                  {
                     "label":"Topographic",
                     "value":"topo"
                  },
                  {
                     "label":"Gray",
                     "value":"gray"
                  },
                  {
                     "label":"Oceans",
                     "value":"oceans"
                  },
                  {
                     "label":"National Geographic",
                     "value":"national-geographic"
                  },
                  {
                     "label":"OpenStreetMap",
                     "value":"osm"
                  }
               ]
            }
         ]
      }
   ],
   "values":{
      "title":"",
      "enableLegendPanel":true,
      "defaultPanel":"legend",
      "enableAboutPanel":true,
      "enableHomeButton":true,
      "enableLocateButton":true,
      "enableBasemapToggle":true,
  	  "enableBookmarks":true,
      "enableOverviewMap":true,
      "openOverviewMap":false,
      "nextBasemap":"hybrid",
      "defaultBasemap":"topo",
      "swipeType":"vertical",
      "swipeInvertPlacement":false
   }
}