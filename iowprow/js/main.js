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
        "Footpath",
        "red",
        "Bridleway",
        "blue",
        "BOAT",
        "orange",
        "black",
    ],
    "line-opacity": 0.75,
    "line-width": 2,
};

const rowTextStyle = {
    "text-color": [
        "match",
        ["get", "ROW_TYPE"],
        "Footpath",
        "red",
        "Bridleway",
        "blue",
        "BOAT",
        "orange",
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
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
    );
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.addControl(
        new maplibregl.ScaleControl({ maxWidth: 80, unit: "imperial" }),
        "bottom-left"
    );
    map.addControl(new maplibregl.FullscreenControl());
    // Add geolocate control to the map.
    // map.addControl(
    //  new maplibregl.GeolocateControl({
    //    positionOptions: {
    //      enableHighAccuracy: true
    //    },
    //    trackUserLocation: true
    // })
    // );

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
    // Limit the number of properties we're displaying for legibility and performance
    const displayProperties = [
        'UNIQUE',
        'Name',
        'ROW_TYPE',
        'PARISH',
        'ROUTENO',
        'DISTANCE'
    ];

    const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
    ];

    // Find features intersecting the bounding box.
    const selectedFeatures = map.queryRenderedFeatures(bbox, {
        layers: ['allgeolines']
    });

    if (!selectedFeatures.length > 0) { return; }
    const displayFeatures = selectedFeatures.map((feat) => {
        const displayFeat = {};
        displayProperties.forEach((prop) => {
            displayFeat[prop] = feat.properties[prop];
            displayFeat['geom'] = feat.geometry.coordinates;
        });
        return displayFeat;
    });

    filebtn.innerHTML = 'Send';
    document.getElementById("pathNote").value = "";

    /* set modal popup form inputs */
    const pathName = document.getElementById("pathName");
    pathName.value = displayFeatures[0].Name;
    const pathUnique_id = document.getElementById("pathUnique_id");
    pathUnique_id.value = displayFeatures[0].UNIQUE;

    let popup = new maplibregl.Popup({ className: "click-popup" })
        .setLngLat(e.lngLat)
        .setHTML('<div id=edit-' + displayFeatures[0].UNIQUE + '><b>Name:</b> ' + displayFeatures[0].Name + '</div>' +
            '<div><b>Parish:</b> ' + displayFeatures[0].PARISH + '</div>' +
            '<div><b>ROUTENO:</b> ' + displayFeatures[0].ROUTENO + '</div>' +
            '<div><b>Row type:</b> ' + displayFeatures[0].ROW_TYPE + '</div>' +
            '<div><b>Distance:</b> ' + displayFeatures[0].DISTANCE + '</div>' +
            '<div><b>Parish:</b> ' + displayFeatures[0].PARISH + '</div>' +
            '<div><a id="editLink" href="#" onClick="openModalForm()">Add note</a></div>')
        .addTo(map);

});

function openModalForm() {
    // Get the modal form window
    var modal = document.getElementById("formModal");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

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

function createSidebarDiv(
    layerID,
    labelLayerID,
    textContent,
    appendParent,
    inputClassName
) {
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

const addImageHandler = async ({ currentTarget: { files } }) => {
    var preview = document.getElementById("previewBox");

    const uploads = Array.from(files);
    const payload = {};
    const urls = [];
    //https://www.linkedin.com/pulse/upload-display-dynamic-images-interactively-just-only-adnan
    uploads.forEach(image => {
        const reader = new FileReader();
        reader.readAsDataURL(image);

        const url = new Promise((resolve, reject) => {
            reader.onload = () => {
                var listItem = document.createElement("div");
                listItem.innerHTML = '<img class="preview" src="' + reader.result + '" />';
                preview.append(listItem);
                payload[image.name] = reader.result;
                resolve();
            };
        });

        urls.push(url);
    });
    await Promise.all(urls);

    let length = 0;
    for (const [key, value] of Object.entries(payload)) {

        length++;
        document.getElementById('fileCount').value = length;

        var inputvalue = document.createElement("input");
        inputvalue.setAttribute("type", "hidden");
        inputvalue.setAttribute("name", "fileContent_" + length);
        inputvalue.setAttribute("value", value);
        document.getElementById("gsheetForm").appendChild(inputvalue);

        var inputname = document.createElement("input");
        inputname.setAttribute("type", "hidden");
        inputname.setAttribute("name", "filename_" + length);
        inputname.setAttribute("value", key);
        document.getElementById("gsheetForm").appendChild(inputname);
    }
}

document.getElementById('attach').addEventListener("change", addImageHandler);

const filebtn = document.querySelector("#sendgSheet");

const postForm = async function (e, gsheetForm, gsheetURL) {
    try {
        // prevent ALL clicks from navigating
        e.preventDefault();
        const response = await fetch(gsheetURL, {
            method: 'POST',
            body: new FormData(gsheetForm),
        });

        if (!response.ok) {
            // Custom message for failed HTTP codes
            if (response.status === 404) throw new Error('404, Not found');
            if (response.status === 500) throw new Error('500, internal server error');
            // For any other server error
            throw new Error('Problem getting sheet data.')
        }
        const data = await response.json();
        console.log("result " + data.result);
        filebtn.classList.remove("button--loading");
        filebtn.innerHTML = 'Sent';
        setTimeout(() => {
            document.getElementById("formModal").style.display = "none";
        }, 1000);
    } catch (error) {
        console.error(`Something went wrong! ${error.message}`)
    }
}

// google spreadsheet iowprow updating sheet=notes
const gsheetURL = 'https://script.google.com/macros/s/AKfycbxU5hQyl-V_GsGhEqp9myjvaEGu_BdtvBTL5Yte-amZGBoTBSSnuRCVtazV9L__1c-wxA/exec';
const gsheetForm = document.forms['gsheetForm'];
gsheetForm.addEventListener('submit', e => {
    // https://dev.to/dcodeyt/create-a-button-with-a-loading-spinner-in-html-css-1c0h
    filebtn.classList.add("button--loading");
    filebtn.innerHTML = 'Sending';
    postForm(e, gsheetForm, gsheetURL);
})
