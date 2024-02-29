	function lineStyle(feature){
        switch(feature.properties.ROW_TYPE) {
			case 'BOAT': return { color: "orange", weight: 2 };
			case 'Bridleway': return { color: "blue", weight: 2 };
			case 'Footpath': return { color: "red", weight: 2 };
			default:  return { color: "orangered", weight: 3 };
		}	
	}

	function highlightFeature(e) {	
		var layer = e.target;
		layer.setStyle({
			color: 'lawngreen',
			weight: 6,
		});
		layer.bringToBack();
	}
	
	function resetHighlight(e) {
		var layer = e.target;		
		layer.setStyle(lineStyle(layer.feature));		
	}
	
	function forEachFeature(feature, layer) {	
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
		});			   
		if (feature.properties && feature.properties.Name) {
			var tooltipname = feature.properties.Name.replace('|','');
			layer.bindTooltip(tooltipname, {
				direction: "center",
				permanent: true, 
				opacity: 0.9,
				className: 'tooltipStyle'
			});
		}
	}	
	
	function forEachFeature2(feature, layer) {		
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
		});			   
		if (feature.properties && feature.properties.Name) {
			var tooltipname = feature.properties.Name.replace('|','');
			
			if (feature.properties.ROW_TYPE == "Footpath") {
				layerName = feature.properties.PARISH+"_fo";

			} else if (feature.properties.ROW_TYPE == "BOAT") {
				layerName = feature.properties.PARISH+"_bo";

			} else if (feature.properties.ROW_TYPE == "Bridleway") {
				layerName = feature.properties.PARISH+"_br";
			}

			lat = feature.geometry.coordinates[0][0];
			lon = feature.geometry.coordinates[0][1];
			latlon = +lat+","+lon+","+layerName;
			
			// just pass in one layer if there are multiple
			if(!uniqueLayernames.includes(tooltipname)) {
				arr1.push({label:tooltipname, value:latlon });
			} 
			uniqueLayernames.push(tooltipname);
				
			layer.bindTooltip(tooltipname, {
				direction: "center",
				permanent: true, 
				opacity: 0.9,
				className: 'tooltipStyle'
			});
		}
	}	
	
	