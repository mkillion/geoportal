
function bufferFeature(kid) {
	// TODO: open a dialog box here so user can select buffer distance.

	var feature = window.theMap.infoWindow.getSelectedFeature();
	console.log(feature.geometry);
	console.log(kid);
}


function filterWells() {
	// TODO: open a dialog box here to multi-select filter options.
	console.log('you clicked filterWells');
}


function labelWells() {
	// TODO: switch labels, look for non-layer-swap solution. client-side labeling?
	console.log('you clicked labelWells');
}

function reportBadSpot(kid) {
	// TODO: add dialog to collect comments and send email to data library.
	console.log(kid);
}


function toggleLayer(chkBoxId) {
	var l = theMap.getLayer(theMap.layerIds[chkBoxId]);
    $( "#tcb-" + chkBoxId ).is( ":checked" ) ? l.show() : l.hide();
}
