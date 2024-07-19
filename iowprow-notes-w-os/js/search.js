import { map, resetMap, marker } from "./map.js";
import OsGridRef, { LatLon, Dms } from 'https://cdn.jsdelivr.net/npm/geodesy@2/osgridref.js';
// add turf.js to create highlited path line
const scriptTag = document.createElement("script");
scriptTag.src = "js/turf.min.js";
document.body.appendChild(scriptTag);

export function addDataToAutocomplete(data) {
    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    data.features.sort(function (a, b) {
        const nameA =
            typeof a["properties"]["Name"] === "string"
                ? a["properties"]["Name"].toUpperCase()
                : a["properties"]["Name"];
        const nameB =
            typeof b["properties"]["Name"] === "string"
                ? b["properties"]["Name"].toUpperCase()
                : b["properties"]["Name"];
        return collator.compare(nameA, nameB);
    });
    $("#query").autocomplete({
        source: function (request, response) {
            var results = [];
            $.each(data.features, function (k, f) {
                var props = f.properties;
                var geom = f.geometry;
                if (props.Name.toLowerCase().indexOf(request.term.toLowerCase()) == 0) {
                    results.push({
                        label: props.Name,
                        value: props.Name,
                        properties: props,
                        id: k,
                        coord: geom.coordinates[0][0],
                        lineCoord: geom.coordinates[0],
                    });
                }
            });
            response(results);
        },
        select: function (event, ui) {
            $("#query").val(ui.item.label);
            $("#query").val(ui.item.value);
            $("#path-coords").val(ui.item.coord);
            $("#line-coords").val(ui.item.lineCoord);
        },
        response: function (event, ui) {
            if (!ui.content.length) {
                var message = { value: "", label: "No results found" };
                ui.content.push(message);
            }
        },
    });

    $("#query").on("autocompleteselect", function (event, ui) {
        resetMap();
        hilightPathSelect(ui.item.value, ui.item.coord, ui.item.lineCoord);
        ui.item.value = ui.item.value;
    });
}

function hilightPathSelect(value, coord, lineCoord) {
    if (value != "") {
        var pathLinestring = turf.lineString(lineCoord);
        var pathLength = turf.length(pathLinestring, { units: 'miles' });
        var halfLength = pathLength / 2;
        var options = { units: 'miles' };
        var ctrPt = turf.along(pathLinestring, halfLength, options);
        map.addLayer({
            id: "locationLine",
            type: "line",
            source: {
                type: "geojson",
                data: pathLinestring,
            },
            paint: {
                "line-width": 4,
                "line-color": "yellow",
                "line-gap-width": 4,
                "line-opacity": 0.7,
            },
        });
        map.flyTo({
            center: coord,
            zoom: 15,
        });
    }
}

export function searchBy(searchBy, combinedProwData) {
    if (searchBy == 'searchByosgrid') {
        $("#query").autocomplete("destroy");
        document.getElementById('query').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                resetMap();
                //eg SZ 56323 77320 Ventnor pump station ten-figure grid reference, indicates a 1 m by 1 m square on the map
                const searchValue = document.getElementById('query').value;
                const gridref = OsGridRef.parse(searchValue);
                const coords = gridref.toLatLon(); //SW corner of grid square
                let markerCoords = [coords.lon, coords.lat];
                marker.setLngLat(markerCoords);
                marker.addTo(map);
                map.flyTo({
                    center: markerCoords,
                    zoom: 15,
                });
            }
        })
    } else {
        addDataToAutocomplete(combinedProwData);
    }
}
