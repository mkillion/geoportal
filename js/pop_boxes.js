function populateList(results) {
	
	// reporting agency
	var features = results.features;

	for (var i=0, il=features.length; i<il; i++) {
	 
		theReportA1 = features[i].attributes.REPORTING_AGENCY;
		theReportA = proper(theReportA1);
		
		var exists_report = 'no';
		
		if (theReportA != null) {
			$('#lstReportA option').each(function(){
				if (this.value == theReportA) {
					exists_report = 'yes';
					return false;
				}
			});
		}
		else {
			exists_report = 'yes';
		}
		
		if (exists_report == 'no') {
			$('#lstReportA').append('<option value="' + theReportA + '">' + theReportA + '</option>');
		}
	}
		
	sortlist('#lstReportA');
	$('#lstReportA').prepend("<option value='All'>All</option>");
	$('#lstReportA').val('All');
	
	
	// county
	var cntyArr = new Array("All", "Allen", "Anderson", "Atchison", "Barber", "Barton", "Bourbon", "Brown", "Butler", "Chase", "Chautauqua", "Cherokee", "Cheyenne", "Clark", "Clay", "Cloud", "Coffey", "Comanche", "Cowley", "Crawford", "Decatur", "Dickinson", "Doniphan", "Douglas", "Edwards", "Elk", "Ellis", "Ellsworth", "Finney", "Ford", "Franklin", "Geary", "Gove", "Graham", "Grant", "Gray", "Greeley", "Greenwood", "Hamilton", "Harper", "Harvey", "Haskell", "Hodgeman", "Jackson", "Jefferson", "Jewell", "Johnson", "Kearny", "Kingman", "Kiowa", "Labette", "Lane", "Leavenworth", "Lincoln", "Linn", "Logan", "Lyon", "McPherson", "Marion", "Marshall", "Meade", "Miami", "Mitchell", "Montgomery", "Morris", "Morton", "Nemaha", "Neosho", "Ness", "Norton", "Osage", "Osborne", "Ottawa", "Pawnee", "Phillips", "Pottawatomie", "Pratt", "Rawlins", "Reno", "Republic", "Rice", "Riley", "Rooks", "Rush", "Russell", "Saline", "Scott", "Sedgwick", "Seward", "Shawnee", "Sheridan", "Sherman", "Smith", "Stafford", "Stanton", "Stevens", "Sumner", "Thomas", "Trego", "Wabaunsee", "Wallace", "Washington", "Wichita", "Wilson", "Woodson", "Wyandotte");
	
	for(i=0; i<cntyArr.length; i++) {  
		theCnty = cntyArr[i];
		$('#lstCounty').append('<option value="' + theCnty + '">' + theCnty + '</option>');
	}
	
	// year
	var yearArr = new Array(2014, 2013, 2012, 2011, 2010, 2009);
	for(i=0; i<yearArr.length; i++) {  
		theYr = yearArr[i];
		$('#lstYear').append('<option value="' + theYr + '">' + theYr + '</option>');
	}
	
	// month
	var moArr = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
	for(i=0; i<moArr.length; i++) {  
		theMo = moArr[i];
		$('#lstsmo').append('<option value="' + theMo + '">' + theMo + '</option>');
		$('#lstemo').append('<option value="' + theMo + '">' + theMo + '</option>');
	}
	$('#lstemo').val('December');
	
	// weekday
	var wkdayArr = new Array("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
	for(i=0; i<wkdayArr.length; i++) {  
		theWkDay = wkdayArr[i];
		$('#lstsWeekday').append('<option value="' + theWkDay + '">' + theWkDay + '</option>');
		$('#lsteWeekday').append('<option value="' + theWkDay + '">' + theWkDay + '</option>');
	}
	$('#lsteWeekday').val('Sunday');
	
	// time
	var timeSArr = new Array("12:00AM", "01:00AM", "02:00AM", "03:00AM", "04:00AM", "05:00AM", "06:00AM", "07:00AM", "08:00AM", "09:00AM", "10:00AM", "11:00AM", "12:00PM", "01:00PM", "02:00PM", "03:00PM", "04:00PM", "05:00PM", "06:00PM", "07:00PM", "08:00PM", "09:00PM", "10:00PM", "11:00PM");
	for(i=0; i<timeSArr.length; i++) {  
		theTimeS = timeSArr[i];
		$('#lstsTime').append('<option value="' + i + '">' + theTimeS + '</option>');
	}
	
	var timeEArr = new Array("12:59AM", "01:59AM", "02:59AM", "03:59AM", "04:59AM", "05:59AM", "06:59AM", "07:59AM", "08:59AM", "09:59AM", "10:59AM", "11:59AM", "12:59PM", "01:59PM", "02:59PM", "03:59PM", "04:59PM", "05:59PM", "06:59PM", "07:59PM", "08:59PM", "09:59PM", "10:59PM", "11:59PM");
	for(i=0; i<timeEArr.length; i++) {  
		theTimeE = timeEArr[i];
		$('#lsteTime').append('<option value="' + i + '">' + theTimeE + '</option>');
	}
	$('#lsteTime').val('23');
	
	
	// severity
	var sevArr = new Array("All", "Fatal", "Injury", "Property Damage Only");
	for(i=0; i<sevArr.length; i++) {  
		theSev = sevArr[i];
		$('#lstSever').append('<option value="' + theSev + '">' + theSev + '</option>');
	}
	
	// Ctype
	var ctypeArr = new Array("All", "Angle - Side Impact", "Backed Into", "Head On", "Other", "Rear End", "Sideswipe: Opposite Direction", "Sideswipe: Same Direction", "Unknown");
	for(i=0; i<ctypeArr.length; i++) {  
		theCT = ctypeArr[i];
		$('#lstCtype').append('<option value="' + theCT + '">' + theCT + '</option>');
	}
	
	// vehicle type
	var vehArr = new Array ("All", "All CMV", "Cross Country Bus", "Farm Equipment", "Large Truck", "Motorcycle", "Other Bus", "Pedal Cyclist", "School Bus", "Transit Bus");
	for(i=0; i<vehArr.length; i++) {  
		theVeh = vehArr[i];
		$('#lstVtype').append('<option value="' + theVeh + '">' + theVeh + '</option>');
	}
	
	// circumstance
	var cirArr = new Array ("All", "Alcohol", "Deer", "Disregard Traffic Control", "Driver Distraction", "Driver Fatigue", "Drugs", "Pedestrian", "Police Pursuit", "Rain/Wet Roads", "Reckless/Aggressive", "Red Light Running", "Snow or Ice", "Speeding", "Train Crossing", "Visibility Impairment", "Work Zone");
	for(i=0; i<cirArr.length; i++) {  
		theCir = cirArr[i];
		$('#lstCir').append('<option value="' + theCir + '">' + theCir + '</option>');
	}
	
	// occupant restraint
	var occArr = new Array("All", "Yes", "No");
	for(i=0; i<occArr.length; i++) {  
		theOcc = occArr[i];
		$('#lstOccRes').append('<option value="' + theOcc + '">' + theOcc + '</option>');
	}
	
	// driver
	var driverArr = new Array("All", "Teen", "Older");
	for(i=0; i<driverArr.length; i++) {  
		theDriver = driverArr[i];
		$('#lstDriver').append('<option value="' + theDriver + '">' + theDriver + '</option>');
	}
}
	
function sortlist(name) {
	// get the select
	var $dd = $(name);
	if ($dd.length > 0) { // make sure we found the select we were looking for

		// get the options and loop through them
		var $options = $('option', $dd);
		var arrVals = [];
		$options.each(function(){
			// push each option value and text into an array
			arrVals.push({
				val: $(this).val(),
				text: $(this).text()
			});
		});

		// sort the array by the value (change val to text to sort by text instead)
		arrVals.sort(function(a, b){
			if(a.val>b.val){
				return 1;
			}
			else if (a.val==b.val){
				return 0;
			}
			else {
				return -1;
			}
		});

		// loop through the sorted array and set the text/values to the options
		for (var i = 0, l = arrVals.length; i < l; i++) {
			$($options[i]).val(arrVals[i].val).text(arrVals[i].text);
		}
	}
}

function proper(string) {
	theLC = string.toLowerCase();
	
    var i, j, str, uppers;
  	str = theLC.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  	});

  	// Certain words should be left uppercase
  	uppers = ['Khp', 'Usd'];
  	for (i = 0, j = uppers.length; i < j; i++)
     	str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), 
       	uppers[i].toUpperCase()
	);

  	return str;
}