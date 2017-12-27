<!--- Write text file containing JSON representation of oil and gas field names for use in auto-completer control of field viewer. --->

<cfsetting requestTimeOut = "3600" showDebugOutput = "yes">

    <cfset output_path = "c:/field_boundaries">
    <cfset file_name = "fields_json.txt">

	<cfquery name="qFields" datasource="plss">
		select distinct field_name from oilgasfields3857_new
		order by field_name
	</cfquery>

	<cffile action="write" file="#output_path#/#file_name#" output='{"identifier": "name",'>
    <cffile action="append" file="#output_path#/#file_name#" output='"items": ['>
	<cfloop query="qFields">
    	<cfif qFields.currentrow neq qFields.recordcount>
			<cffile action="append" file="#output_path#/#file_name#" output='{"name": "#field_name#"},'>
        <cfelse>
        	<!--- omit final comma: --->
        	<cffile action="append" file="#output_path#/#file_name#" output='{"name": "#field_name#"}'>
        </cfif>
	</cfloop>
	<cffile action="append" file="#output_path#/#file_name#" output=']}'>

