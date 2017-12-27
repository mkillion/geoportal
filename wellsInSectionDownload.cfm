<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
</head>
<body>
<cfset TimeStamp = "#hour(now())##minute(now())##second(now())#">
<cfset WellsFileName = "KGS-#url.type#-Wells-#TimeStamp#.csv">
<cfset WellsOutputFile = "\\vmpyrite\d$\webware\Apache\Apache2\htdocs\kgsmaps\oilgas\output\#WellsFileName#">


<cfif #url.type# eq "Oil and Gas">
	<cfset Headers = "KID,API_NUMBER,LEASE_NAME,WELL_NAME,ORIG_OPERATOR,CURR_OPERATOR,FIELD_NAME,TOWNSHIP,TOWNSHIP_DIR,RANGE,RANGE_DIR,SECTION,SPOT,SUBDIVISION_4_SMALLEST,SUBDIVISION_3,SUBDIVISION_2,SUBDIVISION_1_LARGEST,FEET_NORTH,FEET_EAST,REFERENCE_CORNER,NAD27_LONGITUDE,NAD27_LATITUDE,COUNTY,PERMIT_DATE,SPUD_DATE,COMPLETION_DATE,PLUG_DATE,WELL_TYPE,STATUS,TOTAL_DEPTH,ELEVATION_KB,ELEVATION_GL,ELEVATION_DF,PRODUCING_FORMATION">

	<cffile action="write" file="#WellsOutputFile#" output="#Headers#" addnewline="yes">

	<cfquery name="qWellData" datasource="plss">
		select kid, api_number, lease_name, well_name, operator_name, curr_operator, field_name, township, township_direction, range, range_direction, section, spot, subdivision_4_smallest, subdivision_3, subdivision_2, subdivision_1_largest, feet_north_from_reference, feet_east_from_reference, reference_corner, nad27_longitude, nad27_latitude, county, permit_date_txt, spud_date_txt, completion_date_txt, plug_date_txt, status_txt, well_class, rotary_total_depth, elevation_kb, elevation_gl, elevation_df, producing_formation
		from oilgas_wells
		where township = #url.twn# and range = #url.rng# and range_direction = '#url.dir#'
		<cfif isDefined("url.sec")>
			 and section = #url.sec#
		</cfif>
	</cfquery>

	<cfloop query="qWellData">
		<cfset Data = '"#kid#","#api_number#","#lease_name#","#well_name#","#operator_name#","#curr_operator#","#field_name#","#township#","#township_direction#","#range#","#range_direction#","#section#","#spot#","#subdivision_4_smallest#","#subdivision_3#","#subdivision_2#","#subdivision_1_largest#","#feet_north_from_reference#","#feet_east_from_reference#","#reference_corner#","#nad27_longitude#","#nad27_latitude#","#county#","#permit_date_txt#","#spud_date_txt#","#completion_date_txt#","#plug_date_txt#","#status_txt#","#well_class#","#rotary_total_depth#","#elevation_kb#","#elevation_gl#","#elevation_df#","#producing_formation#"'>

		<cffile action="append" file="#WellsOutputFile#" output="#Data#" addnewline="yes">
	</cfloop>

<cfelseif #url.type# eq "Water">
	<cfset Headers = "INPUT_SEQ_NUMBER,OWNER_NAME,USE,DWR_APPROPRIATION_NUMBER,MONITORING_NUMBER,COUNTY,TONWSHIP,TOWNSHIP_DIRECTION,RANGE,RANGE_DIRECTION,SECTION,QUARTER_CALL_1_LARGEST,QUARTER_CALL_2,QUARTER_CALL_3,NAD27_LATITUDE,NAD27_LONGITUDE,DEPTH,ELEVATION,STATIC_LEVEL,YIELD,STATUS,COMPLETION_DATE,CONTRACTOR">

	<cffile action="write" file="#WellsOutputFile#" output="#Headers#" addnewline="yes">

	<cfquery name="qWellData" datasource="gis_webinfo">
		select input_seq_number, owner_name, use_desc, dwr_appropriation_number, monitoring_number, county, township, township_direction, range, range_direction, section, quarter_call_1_largest, quarter_call_2, quarter_call_3, nad27_latitude, nad27_longitude, depth_txt, elev_txt, static_level_txt, yield_txt, status, comp_date_txt, contractor
		from wwc5_wells
		where township = #url.twn# and range = #url.rng# and range_direction = '#url.dir#'
		<cfif isDefined("url.sec")>
			 and section = #url.sec#
		</cfif>
	</cfquery>

	<cfloop query="qWellData">
		<cfset Data = '"#input_seq_number#","#owner_name#","#use_desc#","#dwr_appropriation_number#","#monitoring_number#","#county#","#township#","#township_direction#","#range#","#range_direction#","#section#","#quarter_call_1_largest#","#quarter_call_2#","#quarter_call_3#","#nad27_latitude#","#nad27_longitude#","#depth_txt#","#elev_txt#","#static_level_txt#","#yield_txt#","#status#","#comp_date_txt#","#contractor#"'>

		<cffile action="append" file="#WellsOutputFile#" output="#Data#" addnewline="yes">
	</cfloop>
</cfif>

<cfoutput>
<div class="download-link"><a href="http://vmpyrite.kgs.ku.edu/KgsMaps/oilgas/output/#WellsFileName#">#WellsFileName#</a></div>
</cfoutput>

</body>
</html>
