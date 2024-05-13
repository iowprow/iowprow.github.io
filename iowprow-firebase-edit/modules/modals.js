// Limit the number of properties we're displaying for legibility and performance
export const displayProperties = [
    'UNIQUE',
    'Name',
    'ROW_TYPE',
    'PARISH',
    'ROUTENO',
    'DISTANCE'
];

export function getDisplayFeatures(selectedFeatures) {
    const displayFeatures = selectedFeatures.map((feat) => {
        const displayFeat = {};
        displayProperties.forEach((prop) => {
            displayFeat[prop] = feat.properties[prop];
            displayFeat['geom'] = feat.geometry.coordinates;
        });
        return displayFeat;
    });
    return displayFeatures;
}

export function buildPopupHtml(displayFeatures, email) {
    /* set modal popup form inputs */
    const pathName = document.getElementById("pathName");
    pathName.value = displayFeatures[0].Name;

    const pathNote = document.getElementById("pathNote");
    pathNote.value = "";

    const pathUnique_id = document.getElementById("pathUnique_id");
    pathUnique_id.value = displayFeatures[0].UNIQUE;

    const parish = document.getElementById("parish");
    parish.value = displayFeatures[0].PARISH;

    let editLink = "";
    if (email) {
        editLink = '<div><a id="editLink" href="#">Add note</a></div>';
    }
    let popupHtml = '<div id=edit-' + displayFeatures[0].UNIQUE + '><b>Name:</b> ' + displayFeatures[0].Name + '</div>' +
        '<div><b>Parish:</b> ' + displayFeatures[0].PARISH + '</div>' +
        '<div><b>Row type:</b> ' + displayFeatures[0].ROW_TYPE + '</div>' +
        '<div><b>Path #:</b> ' + displayFeatures[0].ROUTENO + '</div>' +
        '<div><b>Distance:</b> ' + displayFeatures[0].DISTANCE + '</div>' +
        editLink;

    return popupHtml;
}

// open modal by id
export function openModal(id) {
    console.log("Modal.js Open " + id);
    // Get the modal form window
    var modal = document.getElementById(id);
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
    // When the user clicks anywhere in the modal, close it
    window.onclick = function (event) {
        let modal = event.target.closest(".modal");
        if (modal && event.target.tagName != "INPUT") {
            modal.style.display = "none";
        }
    }
}