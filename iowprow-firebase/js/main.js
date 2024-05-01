// dynamically import /modules/modals.js
/*
Thanks to Barry Cornelius for providing council path data as JSON via rowmaps, and to Robert Whittaker for clarifying which councils offer path data as OGL.
David Groom FOI request  https://www.whatdotheyknow.com/request/digitised_version_of_definitive
The data is an interpretation of the definitive map, not a accurate reproduction, so it cannot be used for legal purposes and is provided without warranty or guarantee.
*/
function toggleSidebar() {
    const sidebarMenu = document.getElementById("sidebarList");
    sidebarMenu.classList.toggle("hidden");
    const sidebarPanel = document.getElementById("sidebarPanel");
    sidebarPanel.classList.toggle("leftPadded");
}

// Create function of check/uncheck box
function checkUncheck(onoroff) {
    let inputs = document.querySelectorAll(".viewParish");
    var layers = map.getStyle().layers;
    var allLayerIds = layers.map(function (layer) {
        return layer.id;
    });
    if (onoroff == "allOn") {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = true;
        }
        allLayerIds.forEach((layer) => {
            if (layer != "osm") {
                map.setLayoutProperty(layer, "visibility", "visible");
            }
        });
    } else {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }
        allLayerIds.forEach((layer) => {
            if (layer != "osm") {
                map.setLayoutProperty(layer, "visibility", "none");
            }
        });
    }
}

var center = [-1.315, 50.675];
var startZoom = 10.3;
var parishNames = {
    A: "Arreton",
    BB: "Bembridge",
    B: "Brading",
    BS: "Brighstone",
    CB: "Calbourne",
    C: "Chale",
    CS: "Cowes",
    F: "Freshwater",
    G: "Gatcombe",
    GL: "Godshill",
    NC: "Newchurch",
    N: "Newport",
    NT: "Niton",
    R: "Ryde",
    SS: "Sandown/Shanklin",
    S: "Shalfleet",
    SW: "Shorwell",
    T: "Totland",
    V: "Ventnor",
    Y: "Yarmouth",
    parishes: "Parish Boundaries",
};

const rowLineStyle = {
    "line-color": [
        "match",
        ["get", "ROW_TYPE"],
        "Footpath", "red",
        "Bridleway", "blue",
        "BOAT", "orange",
        "black",
    ],
    "line-opacity": 0.75,
    "line-width": 2,
};

const rowTextStyle = {
    "text-color": [
        "match",
        ["get", "ROW_TYPE"],
        "Footpath", "red",
        "Bridleway", "blue",
        "BOAT", "orange",
        "black",
    ],
    "text-halo-color": "mistyrose",
    "text-halo-width": 4,
};

const layerIDs = []; // Will contain a list used to filter against.
const layerRowTypes = []; // Will contain a list used to filter against.
const labelLayerIDs = [];

const osm = {
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
    layers: [
        {
            id: "osm",
            type: "raster",
            source: "osm", // This must match the source key above
        },
    ],
};

const map = new maplibregl.Map({
    container: "map",
    attributionControl: true,
    preserveDrawingBuffer: true /* preserveDrawingBuffer: true  required to create screenshot */,
    style: osm,
    hash: false,
    center: center,
    zoom: startZoom,
    maxZoom: 18,
    minZoom: 10,
    cooperativeGestures: true, //two fingers to move the map
});

map.on("load", async () => {

    map.addControl(
        new ResetMapControl({ resetLngLat: center, resetZoom: startZoom }),
        "top-right"
    );

    map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
    );
    map.addControl(
        new maplibregl.ScaleControl({ maxWidth: 80, unit: "imperial" }),
        "bottom-left"
    );
    map.addControl(new maplibregl.FullscreenControl());
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    const response = await fetch("data/combined.geojson");
    const data = await response.json();
    map.addSource("allgeo", {
        type: "geojson",
        data: "data/combined.geojson",
        attribution: "PROW Data provided by the Isle of Wight Council",
        generateId: true,
        tolerance: 0.00001
    });

    map.addLayer({
        id: "allgeolines",
        type: "line",
        source: "allgeo",
        paint: {
            "line-color": "white",
            "line-opacity": 0.2,
            "line-width": 4,
        },
    });

    map.addSource("parishes", {
        type: "geojson",
        data: "data/parishes.geojson",
    });
    parishBoundaries();
    byParish(data);
    addDataToAutocomplete(data);


    document.querySelector(".maplibregl-ctrl-reset").addEventListener("click", () => {
        //        console.log("clicked");
        if (map.getLayer("locationLine")) {
            map.removeLayer("locationLine");
        }
        if (map.getSource("locationLine")) {
            map.removeSource("locationLine");
        }
    });

    document.getElementById("btn-home").addEventListener("click", () => {
        if (map.getLayer("locationLine")) {
            map.removeLayer("locationLine");
        }
        if (map.getSource("locationLine")) {
            map.removeSource("locationLine");
        }
        map.flyTo({
            center: center,
            zoom: startZoom,
        });
    });


    var menuList = document.getElementById("userMenuContainer");
    menuList.style.display = "none";

    const buttonLogin = document.getElementById("btn-login");
    buttonLogin.addEventListener("click", () => {
        const isActive = buttonLogin.classList.contains("active");
        if (!isActive) {
            import("../modules/modals.js")
                .then(({ openModal }) => {
                    openModal('loginModal');
                })
                .catch(err => console.log(err));
            menuList.style.display = "none";
        } else {
            if (menuList.style.display === "none") {
                menuList.style.display = "block";
            } else {
                menuList.style.display = "none";
            }
        }
    });

    // if cancel cross selected in search clear circle off map and go to start
    document.getElementById("query").addEventListener("search", function (event) {
        if (map.getLayer("locationLine")) {
            map.removeLayer("locationLine");
        }
        if (map.getSource("locationLine")) {
            map.removeSource("locationLine");
        }
        map.flyTo({
            center: center,
            zoom: startZoom,
        });
    });
});

map.on('click', (e) => {
    const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
    ];
    // Find features intersecting the bounding box.
    const selectedFeatures = map.queryRenderedFeatures(bbox, {
        layers: ['allgeolines']
    });

    if (!selectedFeatures.length > 0) { return; }

    // popupform fill in email which was set when user logged on
    const uploadEmail = document.getElementById('uploadEmail');
    const email = uploadEmail.value;
    if (email) {
        console.log('email exists in index html so can pass it to popup');
        console.log(email);
    }
    import('../modules/modals.js')
        .then(({ buildPopupHtml, getDisplayFeatures }) => {
            new maplibregl.Popup({ className: "click-popup" })
                .setLngLat(e.lngLat)
                .setHTML(buildPopupHtml(getDisplayFeatures(selectedFeatures), email))
                .addTo(map)
        })
        .catch(err => console.log(err))
});

// use parent map and id to get it recognized in DOM
document.querySelector("#map").addEventListener("click", (e) => {
    const elEditLink = e.target.closest("#editLink");
    if (!elEditLink) return; // do nothing.
    e.preventDefault();

    import("../modules/modals.js")
        .then(({ openModal }) => {
            openModal('formModal');
        })
        .catch(err => console.log(err));
});

map.on("idle", () => {
    const toggleableLayerIds = ["Footpath", "Bridleway", "BOAT"];
    for (const id of toggleableLayerIds) {
        if (document.getElementById(id)) {
            continue;
        }
        createSidebarDiv(id, "", id, "prow-legend", "viewProw");
    }
});

function parishBoundaries() {
    map.addLayer({
        id: "parishes",
        type: "line",
        source: "parishes",
        paint: rowLineStyle,
    });
}

function byParish(data) {
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
                paint: rowLineStyle,
                filter: filter_parish_data,
            });
            layerIDs.push(layerID);

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
                paint: rowTextStyle,
            });
            createSidebarDiv(
                layerID,
                labelLayerID,
                parishNames[parishCode],
                "filter-parish",
                "viewParish"
            );
        }
    });
}

function createSidebarDiv(layerID, labelLayerID, textContent, appendParent, inputClassName) {
    const div = document.createElement("div");
    const input = document.createElement("input");
    const appendTo = document.getElementById(appendParent);
    input.type = "checkbox";
    input.className = inputClassName;
    input.id = layerID;
    input.checked = true;
    appendTo.appendChild(div);
    div.appendChild(input);

    const label = document.createElement("label");
    label.setAttribute("for", layerID);
    label.textContent = textContent;
    div.appendChild(label);

    if (inputClassName == "viewParish") {
        input.addEventListener("change", (e) => {
            e.preventDefault();
            e.stopPropagation();
            map.setLayoutProperty(
                layerID,
                "visibility",
                e.target.checked ? "visible" : "none"
            );
            map.setLayoutProperty(
                labelLayerID,
                "visibility",
                e.target.checked ? "visible" : "none"
            );
        });
    }

    if (inputClassName == "viewProw") {
        const divbox = document.createElement("div");
        if (layerID == "BOAT") {
            var color = "orange";
        } else if (layerID == "Bridleway") {
            var color = "blue";
        } else if (layerID == "Footpath") {
            var color = "red";
        }
        divbox.className = "legendBox " + color;
        div.appendChild(divbox);
        input.addEventListener("change", (e) => {
            e.preventDefault();
            e.stopPropagation();
            let checkedInputs = document.querySelectorAll(".viewProw:checked");
            var filterArray = [];
            for (i = 0; i < checkedInputs.length; ++i) {
                filterArray.push(checkedInputs[i].id);
            }

            var prowFilter = ["in", ["get", "ROW_TYPE"], ["literal", filterArray]];
            var layers = map.getStyle().layers;
            var allLayerIds = layers.map(function (layer) {
                return layer.id;
            });

            allLayerIds.forEach((layer) => {
                if (layer != "osm" && layer != "parishes") {
                    parishCode = layer.split("-")[1];
                    origFilter = ["==", ["get", "PARISH"], parishCode];
                    var combinedFilter = ["all", origFilter, prowFilter];
                    map.setFilter(layer, combinedFilter);
                }
            });
        });
    }
}

function addDataToAutocomplete(data) {
    data.features.sort(function (a, b) {
        const nameA =
            typeof a["properties"]["Name"] === "string"
                ? a["properties"]["Name"].toUpperCase()
                : a["properties"]["Name"];
        const nameB =
            typeof b["properties"]["Name"] === "string"
                ? b["properties"]["Name"].toUpperCase()
                : b["properties"]["Name"];
        let comparison = 0;
        if (nameA < nameB) {
            comparison = -1;
        } else if (nameA > nameB) {
            comparison = 1;
        }
        return comparison; //default return value (no sorting)
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
        if (map.getLayer("locationLine")) {
            map.removeLayer("locationLine");
        }
        if (map.getSource("locationLine")) {
            map.removeSource("locationLine");
        }

        pathSelect(ui.item.value, ui.item.coord, ui.item.lineCoord);
        ui.item.value = ui.item.value;
    });
}

function pathSelect(value, coord, lineCoord) {
    if (value != "") {
        linestring = turf.lineString(lineCoord);
        var length = turf.length(linestring, { units: 'miles' });
        var halfLength = length / 2;
        var options = { units: 'miles' };
        var ctrPt = turf.along(linestring, halfLength, options);
        map.addLayer({
            id: "locationLine",
            type: "line",
            source: {
                type: "geojson",
                data: linestring,
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

async function screenshot(element_id) {
    return html2canvas(document.getElementById(element_id), {
        useCORS: true,
        logging: false, // set true for debug,
    }).then((canvas) => {
        // Convert to data URL for saving or uploading
        const dataURL = canvas.toDataURL("image/jpeg");
        // Download the screenshot locally
        var a = document.createElement("a");
        a.href = dataURL;
        a.download = `screenshot_${Date.now()}.jpg`;
        a.click();
        return dataURL;
    });
}
async function takeScreenshot(event) {
    console.log(event);
    event.preventDefault();
    const postData = {
        img: await screenshot("page"),
    };
}


// https://codepen.io/sakamies/pen/yzYypW
function LoadingSpinner(form, spinnerHTML) {
    form = form || document

    //Keep track of button & spinner, so there's only one automatic spinner per form
    var button
    var spinner = document.createElement('div')
    spinner.innerHTML = spinnerHTML
    spinner = spinner.firstChild

    //Delegate events to a root element, so you don't need to attach a spinner to each individual button.
    form.addEventListener('click', start)

    //Stop automatic spinner if validation prevents submitting the form
    //Invalid event doesn't bubble, so use capture
    form.addEventListener('invalid', stop, true)

    //Start spinning only when you click a submit button
    function start(event) {
        if (button) stop()
        button = event.target
        if (button.type === 'submit') {
            LoadingSpinner.start(button, spinner)
        }
    }

    function stop() {
        LoadingSpinner.stop(button, spinner)
    }

    function destroy() {
        stop()
        form.removeEventListener('click', start)
        form.removeEventListener('invalid', stop, true)
    }

    return { start: start, stop: stop, destroy: destroy }
}

//I guess these would be called class methods. They're useable without instantianing a new LoadingSpinner so you can start & stop spinners manually on any elements, for ajax and stuff.
LoadingSpinner.start = function (element, spinner) {
    element.classList.add('loading')
    return element.appendChild(spinner)
}

LoadingSpinner.stop = function (element, spinner) {
    element.classList.remove('loading')
    return spinner.remove()
}
