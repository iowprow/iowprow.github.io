/*
Thanks to Barry Cornelius for providing council path data as JSON via rowmaps, and to Robert Whittaker for clarifying which councils offer path data as OGL.
David Groom FOI request  https://www.whatdotheyknow.com/request/digitised_version_of_definitive
The data is an interpretation of the definitive map, not a accurate reproduction, so it cannot be used for legal purposes and is provided without warranty or guarantee.
*/

import { prowMapConstants } from "../constants/map-constants.js";
export { prowMapConstants };

export const osm = {
    version: 8,
    glyphs: "fonts/{fontstack}/{range}.pbf",
    sources: {
        osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            crossOrigin: "Anonymous",
        },
    },
    layers: [{
        id: "osm",
        type: "raster",
        source: "osm", // This must match the source key above
    }],
};

export const map = new maplibregl.Map({
    container: "map",
    attributionControl: false,
    preserveDrawingBuffer: true  /*required to create screenshot */,
    style: osm,
    hash: false,
    center: prowMapConstants.center,
    zoom: prowMapConstants.startZoom,
    maxZoom: 18,
    minZoom: 10,
    cooperativeGestures: true, //two fingers to move the map
});


// create a HTML element for each feature
const el = document.createElement('div');
el.className = 'marker'; // see css for styling

export const marker = new maplibregl.Marker({ element: el });
export function resetMap() {
    console.log("resetMap");

    // document.getElementById("query").value = "";
    if (map.getLayer("locationLine")) {
        map.removeLayer("locationLine");
    }
    if (map.getSource("locationLine")) {
        map.removeSource("locationLine");
    }

    if (marker) {
        marker.remove();
    }

}

export function resetAndflyToStart() {
    document.getElementById("query").value = "";
    if (map.getLayer("locationLine")) {
        map.removeLayer("locationLine");
    }
    if (map.getSource("locationLine")) {
        map.removeSource("locationLine");
    }
    map.flyTo({
        center: prowMapConstants.center,
        zoom: prowMapConstants.startZoom
    });
}

/* have to use observer cause the menu is injected */
export function getLegendEvents() {
    console.log("getLegendEvents");
    const showAllParishes = document.getElementById('showAll');
    showAllParishes.addEventListener('click', event => {
        const onoroff = event.target.checked;
        checkUncheck(onoroff);
    });

    const showEachParish = document.querySelectorAll('.viewParish');
    for (let i = 0; i < showEachParish.length; i++) {
        showEachParish[i].addEventListener("change", event => {
            event.preventDefault();
            event.stopPropagation();
            let layerID = event.target.id;
            let labelLayerID = 'label_' + layerID;
            map.setLayoutProperty(
                layerID,
                "visibility",
                event.target.checked ? "visible" : "none"
            );
            map.setLayoutProperty(
                labelLayerID,
                "visibility",
                event.target.checked ? "visible" : "none"
            );
        });
    }
    const showEachProwType = document.querySelectorAll('.viewProwType');
    for (let i = 0; i < showEachProwType.length; i++) {
        showEachProwType[i].addEventListener("change", event => {
            event.preventDefault();
            event.stopPropagation();
            var prowFilterArray = [];
            showEachProwType.forEach(function (elem) {
                if (elem.checked) {
                    prowFilterArray.push(elem.id);
                }
            });
            let prowFilter = ["in", ["get", "ROW_TYPE"], ["literal", prowFilterArray]];
            let layers = map.getStyle().layers;
            let allLayerIds = layers.map(function (layer) {
                return layer.id;
            });

            allLayerIds.forEach((layer) => {
                if (layer != "osm" && layer != "parishBoundaries") {
                    let parishCode = layer.split("-")[1];
                    let origFilter = ["==", ["get", "PARISH"], parishCode];
                    let combinedFilter = ["all", origFilter, prowFilter];
                    map.setFilter(layer, combinedFilter);
                } else if (layer == "parishBoundaries") {
                    map.setLayoutProperty(
                        "parishBoundaries",
                        "visibility",
                        event.target.checked ? "visible" : "none"
                    );
                }
            });
        });
    }
}

// Create function of check/uncheck all by parish 
function checkUncheck(onoroff) {
    let inputs = document.querySelectorAll(".viewParish");

    var layers = map.getStyle().layers;
    var allLayerIds = layers.map(function (layer) {
        return layer.id;
    });

    if (onoroff == true) {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = true;
        }
        allLayerIds.forEach((layer) => {
            if (layer != "osm" && layer != "parishBoundaries") {
                map.setLayoutProperty(layer, "visibility", "visible");
            }
        });
    } else {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }
        allLayerIds.forEach((layer) => {
            if (layer != "osm" && layer != "parishBoundaries") {
                map.setLayoutProperty(layer, "visibility", "none");
            }
        });
    }
}

export function parishBoundaries() {
    map.addLayer({
        id: "parishBoundaries",
        type: "line",
        source: "parishBoundaries",
        paint: prowMapConstants.rowLineStyle,
    });
}

export function byParish(data) {
    data.features.sort(function (a, b) {
        if (a.properties.PARISH < b.properties.PARISH) return -1;
        else if (a.properties.PARISH > b.properties.PARISH) return 1;
    });

    data.features.forEach((feature) => {
        const parishCode = feature.properties["PARISH"];
        const prowType = feature.properties["ROW_TYPE"];
        const layerID = `parish-${parishCode}`;
        const labelLayerID = `label_parish-${parishCode}`;

        var filter_parish_data = ["==", ["get", "PARISH"], parishCode];

        if (!map.getLayer(layerID)) {
            map.addLayer({
                id: layerID,
                type: "line",
                source: "allgeo",
                paint: prowMapConstants.rowLineStyle,
                filter: filter_parish_data,
            });
            prowMapConstants.layerIDs.push(layerID);

            map.addLayer({
                id: labelLayerID,
                type: "symbol",
                source: "allgeo",
                filter: filter_parish_data,
                minzoom: 12,
                layout: {
                    "symbol-placement": "line-center",
                    "text-field": ["get", "Name"],
                    "text-size": {
                        stops: [
                            [12, 10],
                            [14, 12],
                        ],
                    },
                    "text-justify": "center",
                    "text-allow-overlap": true,
                    "text-ignore-placement": true,
                    "text-letter-spacing": 0.05,
                    "text-offset": [0, 1],
                    "text-font": ["Roboto Medium Regular"],
                },
                paint: prowMapConstants.rowTextStyle,
            });
        }
    });
}

const popup = new maplibregl.Popup({
    className: "prow-popup"
});

export function buildPopupHtml(lngLat, selectedFeatures) {
    if (selectedFeatures.length) {
        for (const feature of selectedFeatures) {
            const popupHtml = `<div id=edit-${feature.properties.UNIQUE}><b>Name:</b> ${feature.properties.Name}</div>
            <div><b>Parish:</b> ${feature.properties.PARISH}</div>
            <div><b>Row type:</b> ${feature.properties.ROW_TYPE}</div>
            <div><b>Path #:</b> ${feature.properties.ROUTENO}</div>
            <div><b>Distance:</b> ${feature.properties.DISTANCE}</div>`;
            popup
                .setLngLat(lngLat)
                .setHTML(popupHtml)
                .addTo(map)
        }
    } else {
        // remove features filter
        map.setFilter(['has', 'PARISH']);
    }
}

// Because features come from tiled vector data, feature geometries may be split
// or duplicated across tile boundaries.  As a result, features may appear
// multiple times in query results.
// https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
export function getUniqueFeatures(features, comparatorProperty) {
    const uniqueIds = new Set();
    const uniqueFeatures = [];
    for (const feature of features) {
        const id = feature.properties[comparatorProperty];
        if (!uniqueIds.has(id)) {
            uniqueIds.add(id);
            uniqueFeatures.push(feature);
        }
    }
    return uniqueFeatures;
}
