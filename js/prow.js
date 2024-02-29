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
	
	