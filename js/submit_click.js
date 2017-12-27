function theClick() {
	theYrWhere = "no yr";
	theMoWhere = "no mo";
	theWeekdayWhere = "no weekday";
	theTimeWhere = "no time";
	theCntyWhere = "no cnty";
	theSevWhere = "no sev";
	theVehicleWhere = "no vehicle";
	theCirWhere = "no cir";
	theCtypeWhere = "no ctype";
	theRepWhere = "no rep";
	theOccResWhere = "no occres";
	theDriverWhere = "no driver";
	
	theNS = '';
	
	// year
	theYrWhere = "ACC_YEAR = " + $("#lstYear").val();
	theNS = $("#lstYear").val();
	
	// start and end months
	if ($("#lstsmo").val() == $("#lstemo").val()) {
		theMoWhere = "ACC_MONTH = '" + $("#lstsmo").val() + "'";
		theNSa = theNS + ', ' + theMoWhere;
		theNSb = theNSa.replace("ACC_MONTH = '", "");
		theNS = theNSb.replace("'", "");
	}
	else {
		switch ($("#lstsmo").val()) {
			case "January":
				s_num = 1;
				break;
			case "February":
				s_num = 2;
				break;
			case "March":
				s_num = 3;
				break;
			case "April":
				s_num = 4;
				break;
			case "May":
				s_num = 5;
				break;
			case "June":
				s_num = 6;
				break;
			case "July":
				s_num = 7;
				break;
			case "August":
				s_num = 8;
			break;
			case "September":
				s_num = 9;
				break;
			case "October":
				s_num = 10;
				break;
			case "November":
				s_num = 11;
				break;
			case "December":
				s_num = 12;
				break;									
		}

		switch ($("#lstemo").val()) {
			case "January":
				e_num = 1;
				break;
			case "February":
				e_num = 2;
				break;
			case "March":
				e_num = 3;
				break;
			case "April":
				e_num = 4;
				break;
			case "May":
				e_num = 5;
				break;
			case "June":
				e_num = 6;
				break;
			case "July":
				e_num = 7;
				break;
			case "August":
				e_num = 8;
				break;
			case "September":
				e_num = 9;
				break;
			case "October":
				e_num = 10;
				break;
			case "November":
				e_num = 11;
				break;
			case "December":
				e_num = 12;
				break;									
		}	
			
		theMoWhere1 = "ACC_MONTH in (";
		
		if (s_num > e_num) {
			for (i = s_num; i < 13; i++) {
				theMoWhere1 = theMoWhere1 + "'" + i + "', ";	
			}
			
			for (i = 1; i < e_num + 1; i++) {
				if (i != e_num) {
					theMoWhere1 = theMoWhere1 + "'" + i + "', ";	
				}
				else {
					theMoWhere1 = theMoWhere1 + "'" + i + "'";	
				}
			}
		}
		else {
			for (i = s_num; i < e_num + 1; i++) {
				if (i != e_num) {
					theMoWhere1 = theMoWhere1 + "'" + i + "', ";
				}
				else {
					theMoWhere1 = theMoWhere1 + "'" + i + "'";	
				}
			}
		}
			
		theMoWhere1 = theMoWhere1 + ")";
		theMoWhere2 = theMoWhere1.replace("'1'", "'January'");
		theMoWhere3 = theMoWhere2.replace("'2'", "'February'");
		theMoWhere4 = theMoWhere3.replace("'3'", "'March'");
		theMoWhere5 = theMoWhere4.replace("'4'", "'April'");
		theMoWhere6 = theMoWhere5.replace("'5'", "'May'");
		theMoWhere7 = theMoWhere6.replace("'6'", "'June'");
		theMoWhere8 = theMoWhere7.replace("'7'", "'July'");
		theMoWhere9 = theMoWhere8.replace("'8'", "'August'");
		theMoWhere10 = theMoWhere9.replace("'9'", "'September'");
		theMoWhere11 = theMoWhere10.replace("'10'", "'October'");
		theMoWhere12 = theMoWhere11.replace("'11'", "'November'");
		theMoWhere = theMoWhere12.replace("'12'", "'December'");
		theNSa = theMoWhere.replace("ACC_MONTH in (", "");
		theNSb = theNSa.replace(/'/g, "");
		theNSc = theNSb.replace(")", "");
		if (theNSc !== 'January, February, March, April, May, June, July, August, September, October, November, December') {
			theNS = theNS + ', ' + theNSc;
		}
	}
	
	// start and end weekdays
	if ($("#lstsWeekday").val() == $("#lsteWeekday").val()) {
		theWeekdayWhere = "ACC_DAY_OF_WEEK = '" + $("#lstsWeekday").val() + "'";
		theNSa = theNS + ', ' + theWeekdayWhere;
		theNSb = theNSa.replace("ACC_DAY_OF_WEEK = '", "");
		theNS = theNSb.replace("'", "");
	}
	else {
		var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
		s_day = days.indexOf($("#lstsWeekday").val());
		e_day = days.indexOf($("#lsteWeekday").val());
			 
		if (e_day < s_day) {
			theWeekdayWhere1 = "ACC_DAY_OF_WEEK in (";
			for (i = s_day; i < 7; i++) {
				theWeekdayWhere1 = theWeekdayWhere1 + "'" + days[i] + "', ";
			}
			for (i = 0; i < e_day + 1; i++) {
					
				if (i != e_day) {
					theWeekdayWhere1 = theWeekdayWhere1 + "'" + days[i] + "', ";
				}
				else {
					theWeekdayWhere1 = theWeekdayWhere1 + "'" + days[i] + "'";	
				}
			}
			theWeekdayWhere1 = theWeekdayWhere1 + ")";
			theWeekdayWhere = theWeekdayWhere1;
					
		}
		else {	 
			theWeekdayWhere1 = "ACC_DAY_OF_WEEK in (";
			for (i = s_day; i < e_day + 1; i++) {
				if (i != e_day) {
					theWeekdayWhere1 = theWeekdayWhere1 + "'" + days[i] + "', ";
				}
				else {
					theWeekdayWhere1 = theWeekdayWhere1 + "'" + days[i] + "'";	
				}
			}
			theWeekdayWhere1 = theWeekdayWhere1 + ")";
			theWeekdayWhere = theWeekdayWhere1;
		}
			
		theNSa = theWeekdayWhere.replace("ACC_DAY_OF_WEEK in (", "");
		theNSb = theNSa.replace(/'/g, "");
		theNSc = theNSb.replace(")", "");
		if (theNSc !== 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday') {
			theNS = theNS + ', ' + theNSc;
		}
	}
	
	// start and end time
	s_time = Number($("#lstsTime").val());
	e_time = Number($("#lsteTime").val());
	
	
	if (s_time == e_time) {
		theTimeWhere = "ACC_HOUR = '" + $("#lsteTime").val() + "'";
		theNSa = theNS + ', Hour = ' + theTimeWhere;
		theNSb = theNSa.replace("ACC_HOUR = '", "");
		theNS = theNSb.replace("'", "");
	}
	else if (e_time < s_time) {
		theTimeWhere1 = "ACC_HOUR in (";
		for (i = s_time; i < 24; i++) {
			if (i < 10) {
				theTimeWhere1 = theTimeWhere1 + "'0" + i + "', ";
			}
			else {
				theTimeWhere1 = theTimeWhere1 + "'" + i + "', ";	
			}
		}
		for (i = 0; i < e_time + 1; i++) {
			if (i != e_time) {
				if (i < 10) {
					theTimeWhere1 = theTimeWhere1 + "'0" + i + "', ";
				}
				else {
					theTimeWhere1 = theTimeWhere1 + "'" + i + "', ";	
				}
			}
			else {
				if (i < 10) {
					theTimeWhere1 = theTimeWhere1 + "'0" + i + "'";	
				}
				else {
					theTimeWhere1 = theTimeWhere1 + "'" + i + "'";	
				}
			}
		}
		theTimeWhere1 = theTimeWhere1 + ")";
		theTimeWhere = theTimeWhere1;
		theNSa = theTimeWhere.replace("ACC_HOUR in (", "HOUR: ");
		theNSb = theNSa.replace(/'/g, "");
		theNSc = theNSb.replace(")", "");
		if (theNSc !== '00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23') {
			theNS = theNS + ', ' + theNSc;
		}			
	}
	else if (s_time < e_time ){	 
		theTimeWhere1 = "ACC_HOUR in (";
		for (i = s_time; i < e_time + 1; i++) {
			if (i != e_time) {
				if (i < 10) {
					theTimeWhere1 = theTimeWhere1 + "'0" + i + "', ";
				}
				else {
					theTimeWhere1 = theTimeWhere1 + "'" + i + "', ";
				}
			}
			else {
				if (i < 10) {
					theTimeWhere1 = theTimeWhere1 + "'0" + i + "'";	
				}
				else {
					theTimeWhere1 = theTimeWhere1 + "'" + i + "'";	
				}
			}
		}
		theTimeWhere1 = theTimeWhere1 + ")";
		theTimeWhere = theTimeWhere1;
		theNSa = theTimeWhere.replace("ACC_HOUR in (", "HOUR: ");
		theNSb = theNSa.replace(/'/g, "");
		theNSc = theNSb.replace(")", "");
		if (theNSc !== 'HOUR: 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23') {
			theNS = theNS + ', ' + theNSc;
		}
	}
	
	// county 
	if ($("#lstCounty").val() != 'All') {
		theCntyWhere = "ACC_COUNTY = '" + $("#lstCounty").val().toUpperCase() + "'";
		theNS = theNS + ', ' + $("#lstCounty").val();
	}
	else {
		theCntyWhere = "no cnty";
	}
	
	// severity
	if ($("#lstSever").val() != 'All') {
		theSevWhere = "ACC_SEVERITY = '" + $("#lstSever").val().toUpperCase() + "'";
		theNS = theNS + ', ' + $("#lstSever").val();
	}
	else {
		theSevWhere = "no sev";
	}
	
	// vehicle type
	vehChk = $("#lstVtype").val();
	
	switch (vehChk) {
		case "All CMV":
			theVehicleWhere = "ALL_CMV_ACCS = 1";
			theNS = theNS + ', All CMV';
			break;	
		case "Cross County Bus":
			theVehicleWhere = "CROSS_COUNTRY_BUS_ACCS = 1";
			theNS = theNS + ', Cross Country Bus';
			break;	
		case "Farm Equipment":
			theVehicleWhere = "FARM_EQUIPMENT_ACCS = 1";
			theNS = theNS + ', Farm Equipment';
			break;		
		case "Large Truck":
			theVehicleWhere = "LARGE_TRUCK_ACCS = 1";
			theNS = theNS + ', Large Truck';
			break;
		case "Motorcycle":
			theVehicleWhere = "MOTORCYCLE_ACCS  = 1";
			theNS = theNS + ', Motorcycle';
			break;	
		case "Other Bus":
			theVehicleWhere = "OTHER_BUS_ACCS  = 1";
			theNS = theNS + ', Other Bus';
			break;
		case "Pedal Cyclist":
			theVehicleWhere = "PEDAL_CYCLIST_ACCS = 1";
			theNS = theNS + ', Pedal Cyclist';
			break;
		case "School Bus":
			theVehicleWhere = "SCHOOL_BUS_ACCS = 1";
			theNS = theNS + ', School Bus';
			break;	
		case "Transit Bus":
			theVehicleWhere = "TRANSIT_BUS_ACCS = 1";
			theNS = theNS + ', Transit Bus';
			break;			
		case "All":
			theVehicleWhere = "no vehicle";
			break;								
	}
	
	// circumstance
	cirChk = $("#lstCir").val();
	
	switch (cirChk) {
		case "Driver Fatigue":
			theCirWhere = "DRIVER_FATIGUE_ACCS = 1";
			theNS = theNS + ', Driver Fatigue';
			break;	
		case "Driver Distraction":
			theCirWhere = "DRIVER_DISTRACTION_ACCS = 1";
			theNS = theNS + ', Driver Distraction';
			break;	
		case "Speeding":
			theCirWhere = "SPEED_RELATED_ACCS = 1";
			theNS = theNS + ', Speeding';
			break;		
		case "Snow or Ice":
			theCirWhere = "SNOW_ICE_ACCS = 1";
			theNS = theNS + ', Snow or Ice';
			break;
		case "Work Zone":
			theCirWhere = "WORK_ZONE_ACCS  = 1";
			theNS = theNS + ', Work Zone';
			break;
		case "Visibility Impairment":
			theCirWhere = "VISIBILITY_IMPAIRMENT_ACCS = 1";
			theNS = theNS + ', Visibility Impairment';
			break;
		case "Train Crossing":
			theCirWhere = "TRAIN_CROSSING_ACCS = 1";
			theNS = theNS + ', Train Crossing';
			break;
		case "Red Light Running":
			theCirWhere = "RED_LIGHT_RUNNING_ACCS  = 1";
			theNS = theNS + ', Red Light Running';
			break;
		case "Reckless/Aggressive":
			theCirWhere = "RECKLESS_AGGRESSIVE_ACCS = 1";
			theNS = theNS + ', Reckless/Aggressive';
			break;
		case "Rain/Wet Roads":
			theCirWhere = "RAIN_WET_ROAD_ACCS = 1";
			theNS = theNS + ', Rain/Wet Roads';
			break;
		case "Police Pursuit":
			theCirWhere = "POLICE_PURSUIT_ACCS = 1";
			theNS = theNS + ', Police Pursuit';
			break;
		case "Pedestrian":
			theCirWhere = "PEDESTRIAN_ACCS = 1";
			theNS = theNS + ', Pedestrian';
			break;
		case "Drugs":
			theCirWhere = "DRUG_INVOLVEMENT_ACCS = 1";
			theNS = theNS + ', Drugs';
			break;
		case "Disregard Traffic Control":
			theCirWhere = "DISREGARD_TRAFFIC_CONTROL_ACCS = 1";
			theNS = theNS + ', Disregard Traffic Control';
			break;
		case "Deer":
			theCirWhere = "DEER_ACCS = 1";
			theNS = theNS + ', Deer';
			break;
		case "Alcohol":
			theCirWhere = "ALCOHOL_INVOLVEMENT_ACCS = 1";
			theNS = theNS + ', Alcohol';
			break;												
		case "All":
			theCirWhere = "no cir";
			break;								
	}
	
	// crash type
	if ($("#lstCtype").val() != 'All') {
		theCtypeWhere = "CWOV_FHE_ACC_TYPE = '" + $("#lstCtype").val().toUpperCase() + "'";
		theNS = theNS + ', ' + $("#lstCtype").val();
	}
	else {
		theCtypeWhere = "no ctype";
	}
	
	// reporting agency
	if ($("#lstReportA").val() != 'All') {
		theRepWhere = "REPORTING_AGENCY = '" + $("#lstReportA").val().toUpperCase() + "'";
		theNS = theNS + ', ' + $("#lstReportA").val();
	}
	else {
		theRepWhere = "no rep";
	}
	
	// occupant restraint
	orChk = $("#lstOccRes").val();
	
	switch (orChk) {
		case "Yes":
			theOccResWhere = "OCCUPANT_RESTRAINT_USE = 1";
			theNS = theNS + ', Occupant Restraint';
			break;	
		case "No":
			theOccResWhere = "OCCUPANT_RESTRAINT_USE = 0";
			theNS = theNS + ', No Occupant Restraint';
			break;	
		case "All":
			theOccResWhere = "no occres";
			break;								
	}
		
	 // driver
	 dChk = $("#lstDriver").val();
	  
	 switch (dChk) {
		case "Teen":
			theDriverWhere = "TEEN_DRIVER_ACCS = 1";
			theNS = theNS + ', Teen Driver';
		break;	
		case "Older":
			theDriverWhere = "OLDER_DRIVER_ACCS = 1";
			theNS = theNS + ', Older Driver';
		break;	
		case "All":
			theDriverWhere = "no driver";
		break;								
	}
	
	
	/////////////////////////////////////////////////////////////////////////////////
	
	
	// SET THE WHERE CLAUSE
	
	// year
	defExp = theYrWhere;
	
	// month
	if (theMoWhere != 'no mo') {
		defExp = defExp + " and " + theMoWhere;
	}
	
	// weekday
	if (theWeekdayWhere != 'no weekday') {
		defExp = defExp + " and " + theWeekdayWhere;
	}
	
	// time
	if (theTimeWhere != 'no time') {
		defExp = defExp + " and " + theTimeWhere;
	}
	
	// county
	if (theCntyWhere != 'no cnty') {
		defExp = defExp + " and " + theCntyWhere;
	}
	
	// severity
	if (theSevWhere != 'no sev') {
		defExp = defExp + " and " + theSevWhere;
	}
	
	// vehicle
	if (theVehicleWhere != 'no vehicle') {
		defExp = defExp + " and " + theVehicleWhere;
	}
	
	// circumstance
	if (theCirWhere != 'no cir') {
		defExp = defExp + " and " + theCirWhere;
	}
	
	// crash type
	if (theCtypeWhere != 'no ctype') {
		defExp = defExp + " and " + theCtypeWhere;
	}
	
	// reporting agency
	if (theRepWhere != 'no rep') {
		defExp = defExp + " and " + theRepWhere;
	}
	
	// occupant restraint
	if (theOccResWhere != 'no occres') {
		defExp = defExp + " and " + theOccResWhere;
	}

	// driver
	if (theDriverWhere != 'no driver') {
		defExp = defExp + " and " + theDriverWhere;
	}
	
	$("#theWhereL").html(theNS);	
	$("#theWhereS").html(theNS);
	$("#theWhereT").html(theNS);	

	dojo.forEach(legendLayers, function (item) {
    	if (item.title === "Accidents") {
			var layerDefs = [];
			layerDefs[0] = defExp;
			item.layer.setLayerDefinitions(layerDefs);
		}
  	});
	
	// zoom to
	queryTask = new esri.tasks.QueryTask("http://wfs.ksdot.org/arcgis_web_adaptor/rest/services/Transportation/Accidents/MapServer/0");
	query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.outFields = ["ACC_COUNTY"];
	query.where = defExp;
	queryTask.execute(query,zoomto);
	
}

	function zoomto(results) {
		
		if (results.features.length > 1) {
   			var extent = esri.graphicsExtent(results.features);
			map.setExtent(extent.expand(1.5));
		}
		// setExtent freaks out if there is only one feature to zoom in on
	//	else {
	//		var theLong = results.features[0].attributes.LONGITUDE;
	//		var theLat = results.features[0].attributes.LATITUDE;
		
	//		var geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
    // 		var inputpoint = new esri.geometry.Point(theLong, theLat, new esri.SpatialReference(4267));
     //   	var PrjParams = new esri.tasks.ProjectParameters();
      //		PrjParams.geometries = [inputpoint];
       // 	PrjParams.outSR = new esri.SpatialReference(102100);
            
       // 	geometryService.project(PrjParams, function (outputpoint) {
	//			var mapPt =  new esri.geometry.Point(outputpoint[0].x, outputpoint[0].y, new esri.SpatialReference(102100));
	//			map.centerAndZoom(mapPt,9);
		//	});
	//	}
	}