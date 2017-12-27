function theExport() {
	
	if (typeof defExp === 'undefined'){
   		theExportDef = 'ACC_YEAR = 2014';
 	}
 	else {
 		theExportDef = defExp;
 	}

	queryTask = new esri.tasks.QueryTask("http://wfs.ksdot.org/arcgis_web_adaptor/rest/services/Transportation/Accidents/MapServer/0");
	query = new esri.tasks.Query();
	query.returnGeometry = false;
	query.outFields = ["ACC_COUNTY, REPORTING_AGENCY, ACC_HOUR, ACC_DAY_OF_WEEK, ACC_MONTH, ACC_YEAR, ACC_SEVERITY"];
	query.where = theExportDef;
	queryTask.execute(query,makeCSV);
}

function makeCSV(results) {
	var csv = "ACC_COUNTY, REPORTING_AGENCY, ACC_HOUR, ACC_DAY_OF_WEEK, ACC_MONTH, ACC_YEAR, ACC_SEVERITY\n";
	
	var thelink = $("#dataLink");	
	
	var features = results.features;

	for (var i=0, il=features.length; i<il; i++) {
		var county = features[i].attributes.ACC_COUNTY;
		var agency = features[i].attributes.REPORTING_AGENCY;
		var hour = features[i].attributes.ACC_HOUR;
		var day = features[i].attributes.ACC_DAY_OF_WEEK;
		var month = features[i].attributes.ACC_MONTH;
		var year = features[i].attributes.ACC_YEAR;
		var severity = features[i].attributes.ACC_SEVERITY;
		
		csv += county + "," + agency + "," + hour + "," + day + "," + month + "," + year + "," + severity + "\n";
	}
		
	// console.log(csv);
		
	thelink.attr("href", 'data:Application/octet-stream,' + encodeURIComponent(csv))[0].click();
}