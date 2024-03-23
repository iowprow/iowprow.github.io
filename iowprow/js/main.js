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

const circleRadius = 0.25; // quarter kilometer
var circleOptions = {
  steps: 64,
  units: "kilometers",
  //  properties: {foo: 'bar'},
};

const layerIDs = []; // Will contain a list used to filter against.
const layerRowTypes = []; // Will contain a list used to filter against.
const labelLayerIDs = [];

const osm = {
  version: 8,
  glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
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
  attributionControl: false,
  preserveDrawingBuffer: true /* preserveDrawingBuffer: true  required to create screenshot */,
  style: osm,
  hash: false,
  center: center,
  zoom: startZoom,
  maxZoom: 16,
  minZoom: 10,
  cooperativeGestures: true, //two fingers to move the map
});

map.on("load", async () => {
	console.log("Loaded");
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
  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: "PROW Data provided by the Isle of Wight Council",
    }),
    "bottom-right"
  );

  const response = await fetch("/iowprow/data/combined.geojson");
  const data = await response.json();
  map.addSource("allgeo", {
    type: "geojson",
    data: "/iowprow/data/combined.geojson",
    attribution: "PROW Data provided by the Isle of Wight Council",
  });
  map.addSource("parishes", {
    type: "geojson",
    data: "/iowprow/data/parishes.geojson",
  });
  parishBoundaries();
  byParish(data);
  addDataToAutocomplete(data);

  document.getElementById("btn-home").addEventListener("click", () => {
    map.flyTo({
      center: center,
      zoom: startZoom,
    });
  });
  // if cancel cross selected in search clear circle off map and go to start
  document.getElementById("query").addEventListener("search", function (event) {
    if (map.getLayer("locationCircle")) {
      map.removeLayer("locationCircle");
    }
    if (map.getSource("locationCircle")) {
      map.removeSource("locationCircle");
    }
    map.flyTo({
      center: center,
      zoom: startZoom,
    });
  });
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
          "text-letter-spacing": 0.05,
          "text-offset": [0, 1],
          "text-font": ["Open Sans Regular"],
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
          });
        }
      });
      response(results);
    },
    select: function (event, ui) {
      $("#query").val(ui.item.label);
      $("#query").val(ui.item.value);
      $("#path-coords").val(ui.item.coord);
    },
    response: function (event, ui) {
      if (!ui.content.length) {
        var message = { value: "", label: "No results found" };
        ui.content.push(message);
      }
    },
  });
  $("#query").on("autocompleteselect", function (event, ui) {
    if (map.getLayer("locationCircle")) {
      map.removeLayer("locationCircle");
    }
    if (map.getSource("locationCircle")) {
      map.removeSource("locationCircle");
    }

    pathSelect(ui.item.value, ui.item.coord);
    ui.item.value = ui.item.value;
  });
}

function pathSelect(value, coord) {
  if (value != "") {
    circle = turf.circle(coord, circleRadius, circleOptions);
    map.addLayer({
      id: "locationCircle",
      type: "fill",
      source: {
        type: "geojson",
        data: circle,
      },
      paint: {
        "fill-color": "steelblue",
        "fill-opacity": 0.2,
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
