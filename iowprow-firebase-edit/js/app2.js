import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js'
// Add Firebase products that you want to use
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js'
import { getFirestore, serverTimestamp, collection, onSnapshot, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlaJMTgnI601KqJqOZ_836rtdkDSRyNgs",
    authDomain: "iowprow-2024.firebaseapp.com",
    projectId: "iowprow-2024",
    storageBucket: "iowprow-2024.appspot.com",
    messagingSenderId: "462103683028",
    appId: "1:462103683028:web:5f25e8fa866d49eac98041"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// first check to see if email is authorized then carry on
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        const email = user.email;
        console.log('app2.js auth email exists and user signed on ' + email);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const buttonLogin = document.getElementById('btn-login');
        buttonLogin.classList.add("active");


        async function getUserRole2() {
            try {
                const userRef = doc(db, "users", email);
                const userEmailData = await getDoc(userRef);
                if (userEmailData.exists()) {
                    return userEmailData.get('role');
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.log(error);
            }
        }

        (async function () {
            try {
                const userRef = doc(db, "users", email);
                const userEmailData = await getDoc(userRef);
                if (userEmailData.exists()) {
                    import("../modules/menu.js")
                        .then(({ createMenu }) => {
                            createMenu(userEmailData.get('role'));
                        })
                        .catch(err => console.log(err));
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.log(error);
            }
        })();

        // set login button icon to be unlocked
        buttonLogin.addEventListener("click", () => {
            console.log("buttonLogin");
            const isActive = buttonLogin.classList.contains("active");
            if (isActive) {
                import("../modules/modals.js")
                    .then(({ openModal }) => {
                        openModal('logoutModal');
                    })
                    .catch(err => console.log(err));
            } else {
                console.log("not active");
            }
        });


        //signout with ht modal window
        const userSignOut = () => {
            signOut(auth).then(() => {
                console.log('user signed out successfully');
                window.location.href = "index.html";
            }).catch((error) => {
                // An error happened.
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
        }
        const signOutBtn2 = document.getElementById('signOutBtn2');
        signOutBtn2.addEventListener('click', userSignOut);


        const showSideBarToggle = document.getElementById('showSideBarToggle');
        const userMenu = document.getElementById("userMenu");
        showSideBarToggle.addEventListener("click", (e) => {
            if (e.target.checked == true) {
                console.log('test menu on');
                userMenu.classList.toggle("hidden");
            } else {
                console.log('test menu off');
                userMenu.classList.toggle("hidden");
            }
        });

        const uploadNotesForm = document.querySelector['#uploadNotesForm'];
        const parishName = document.getElementById('parish');
        const pathName = document.getElementById('pathName');
        const pathNote = document.getElementById('pathNote');
        const pathUnique_id = document.getElementById('pathUnique_id');

        const fileUploader = document.getElementById('attach');


        const messageDiv = document.getElementById("loginMessage");
        async function getNotesByEmail(email) {
            try {
                const userEmailRef = doc(db, "users", email);
                const userEmailData = await getDoc(userEmailRef);
                if (userEmailData.exists()) {
                    console.log("Document data saved under user:", userEmailData.data());
                    let appRole = userEmailData.get('role');

                    let notesTable = $('#notesTable').DataTable({
                        info: false,
                        order: [[1, 'asc'], [0, 'asc']],
                        paging: false,
                        searching: true,
                        caption: 'Path notes for ' + email,
                        columnDefs: [
                            {
                                targets: [1, 3, 4, 5],
                                className: 'notEditable'
                            },
                            {
                                targets: [0],
                                className: 'dataAdded'
                            },
                            {
                                type: 'natural',
                                targets: [1],
                                className: 'pathName',
                            },
                            {
                                targets: [2],
                                className: 'pathNote'
                            }
                        ],
                        columns: [
                            {
                                data: 'dataAdded',
                                title: 'Date added',
                            },
                            {
                                data: 'pathName',
                                title: 'Path name',
                                className: 'dt-center'
                            },
                            {
                                data: 'pathNote',
                                title: 'Path note'
                            },
                            {
                                data: 'pathUnique_id',
                                title: 'Unique ID'
                            },
                            {
                                data: 'downloadURLs',
                                title: 'Image',
                                render: function (data, type, row, meta) {
                                    var imageLinks = [];
                                    if (data != "No image added") {
                                        $.each(data, function (index, value) {
                                            const imageRef = ref(storage, value);
                                            let imageLink = '<a class="imageAttach" href="' + value + '">' + imageRef.name + '</a>';
                                            imageLinks.push(imageLink);
                                        });
                                        return imageLinks.join('<br>');
                                    } else {
                                        return data;
                                    }
                                }
                            },
                            {
                                data: 'docID',
                                title: 'Admin',
                                footer: '<button class="add"> Add New Note</button>',
                                render: function (data, type) {
                                    return '<button class="edit"> Edit </button><button button class="save"> Save </button><button class="delete"> Delete </button>'
                                }
                            }
                        ],
                        createdRow: function (row, data, dataIndex) {
                            $(row).attr('data-docID', data.docID);
                        }
                    });

                    let tableData = [];
                    const notesPath = "iowprowNotes/" + userEmailData.data().area + "/" + email;
                    sessionStorage.setItem("notesPath", notesPath);
                    const notesCollectionByEmail = collection(db, notesPath);
                    const notesCollection = await getDocs(notesCollectionByEmail);

                    notesCollection.forEach((doc) => {
                        // console.log(doc.id, " => ", doc.data());
                        let data = doc.data();
                        // https://www.freecodecamp.org/news/how-to-format-dates-in-javascript/
                        const dateOptions = {
                            hour12: false,
                            day: 'numeric', // numeric, 2-digit
                            year: 'numeric', // numeric, 2-digit
                            month: 'short', // numeric, 2-digit, long, short, narrow
                            hour: 'numeric', // numeric, 2-digit
                            minute: 'numeric' // numeric, 2-digit
                        }
                        tableData.push({
                            "dataAdded": data.dataAdded.toDate().toISOString().substring(0, 16).replace('T', ' '),
                            "pathName": data.pathName,
                            "pathNote": data.pathNote,
                            "pathUnique_id": data.pathUnique_id,
                            "downloadURLs": data.downloadURLs,
                            "docID": doc.id
                        });
                    });
                    //doing something with the results
                    notesTable.clear();
                    notesTable.rows.add(tableData);
                    notesTable.draw();
                    const imageLink = document.querySelectorAll(".imageAttach");
                    imageLink.forEach((img) => {
                        var a = img.getElementsByTagName('a');
                        img.addEventListener("click", (e) => {
                            e.preventDefault();
                            var source = e.target.getAttribute("href");
                            openImageModal(source);
                        });
                    });
                    const editIDs = document.querySelectorAll(".editNote");
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.log(
                    `There was an error fetching the data in firestore: ${error}`
                );
                console.log("You need to be signed on");
            }
        }

        getNotesByEmail(email);

        // GetAllDataRealtime(email);

        async function GetAllDataRealtime(email) {
            const userEmailRef = doc(db, "users", email);
            const userEmailData = await getDoc(userEmailRef);
            const notesPath = "iowprowNotes/" + userEmailData.data().area + "/" + email;
            const dbRef = collection(db, notesPath);
            var gymnasts = [];
            onSnapshot(dbRef, (querySnapshot) => {
                querySnapshot.forEach((doc) => {

                });
            });
        }



        // #myInput is a <input type="text"> element
        $('#filterNotes').on('keyup', function () {
            var notesTable = $('#notesTable').DataTable();
            notesTable.search($(this).val()).draw();
        });

        function openImageModal(imageSrc) {
            import("../modules/modals.js")
                .then(({ openModal }) => {
                    openModal('imageModal');
                    let modalImage = document.getElementsByClassName("popupSrc")[0];
                    modalImage.src = imageSrc;
                })
                .catch(err => console.log(err));
        }

        $('#notesTable').on('click', '.edit', function (e) {
            let tr = e.target.closest('tr');
            let editID = tr.getAttribute('data-docid');

            $(this).parent().siblings('td').not('.notEditable').each(function () {
                var content = $(this).html();
                var cssClass = $(this).attr('class');
                $(this).html('<input class="' + cssClass + '" value="' + content + '" />');
            });

            $(this).siblings('.save').show();
            $(this).siblings('.delete').hide();
            $(this).hide();
        });

        $('#notesTable').on('click', '.save', function (e) {
            let tr = e.target.closest('tr');
            let editID = tr.getAttribute('data-docid');
            console.log(editID);
            var dateAdded = document.querySelector("input.dataAdded").value;
            var pathNote = document.querySelector("input.pathNote").value;
            let notesPath = sessionStorage.getItem("notesPath") + "/" + editID;
            const docRef = doc(db, notesPath);
            const data = {
                dataAdded: new Date(dateAdded),
                pathNote: pathNote
            };
            updateDoc(docRef, data)
                .then(docRef => {
                    console.log("Value of an Existing Document Field has been updated");
                })
                .catch(error => {
                    console.log(error);
                })
            $('input').each(function () {
                var content = $(this).val();
                $(this).html(content);
                $(this).contents().unwrap();
            });
            $(this).siblings('.edit').show();
            $(this).siblings('.delete').show();
            $(this).hide();
        });


        $('#notesTable').on('click', '.delete', function (e) {
            let tr = e.target.closest('tr');
            let editID = tr.getAttribute('data-docid');
            console.log(editID);
            let notesPath = sessionStorage.getItem("notesPath") + "/" + editID;
            const docRef = doc(db, notesPath);
            deleteDoc(docRef)
                .then(() => {
                    console.log("Entire Document has been deleted successfully.")
                })
                .catch(error => {
                    console.log(error);
                })

            $(this).parents('tr').remove();
        });


        $('#notesTable').on('click', '.add', function (e) {
            // Get the modal form window
            var addForm = document.getElementById("addNotesModal");

            /* set form inputs */
            const emailInput = document.getElementById("userEmail");
            emailInput.value = email;
            getGPXPathNames();
            addForm.classList.toggle("hidden");

            // addForm.classList.remove('hidden');

            console.log("adding row 1");


        });

        async function getGPXPathNames() {
            console.log('fetching pathnames for autocomplete');
            const response = await fetch("data/combined.geojson");
            const data = await response.json();
            addDataToInput(data);
            console.log('received pathnames');

        }


        function addDataToInput(data) {
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


            $("#pathName").autocomplete({
                source: function (request, response) {
                    var results = [];
                    $.each(data.features, function (k, f) {
                        var props = f.properties;
                        if (props.Name.toLowerCase().indexOf(request.term.toLowerCase()) == 0) {
                            results.push({
                                label: props.Name,
                                value: props.Name,
                                unique_id: props.UNIQUE,
                                parish: props.PARISH,
                                properties: props,
                                id: k,
                            });
                        }
                    });
                    response(results);
                },
                select: function (event, ui) {
                    $("#pathName").val(ui.item.label);
                    $("#pathName").val(ui.item.value);
                    $("#pathUnique_id").val(ui.item.unique_id);
                    $("#parish").val(ui.item.parish);

                },
                response: function (event, ui) {
                    if (!ui.content.length) {
                        var message = { value: "", label: "No results found" };
                        ui.content.push(message);
                    }
                }
            });
        };


        let files;
        let downloadURLs = [];

        fileUploader.addEventListener('change', (e) => {
            files = e.target.files;
        });
        const uploadImage = async () => {
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    let downloadURL = await uploadProcess(
                        files[i],
                        Math.round(Math.random() * 9999) + files[i].name
                    );
                    if (downloadURL) {
                        //fourth
                        console.log("returned download url is " + downloadURL);
                        downloadURLs.push(downloadURL);
                    }
                    if (i === files.length - 1) {
                        // this is the end sixth
                        console.log(files.length + " files uploaded successfully");
                        let user = auth.currentUser;
                        console.log('auth.currentUser');
                        console.log(auth.currentUser);
                        const collectionRef = collection(db, 'iowprowNotes/' + parish.value + '/' + user.email);
                        const notesObj = {
                            dataAdded: serverTimestamp(),
                            pathName: pathName.value,
                            pathNote: pathNote.value,
                            pathUnique_id: pathUnique_id.value,
                            downloadURLs: downloadURLs
                        };
                        const newNoteRef = addDoc(collectionRef, notesObj);
                    }
                }
            } else {
                console.log(" No files chosen");
                let user = auth.currentUser;
                const collectionRef = collection(db, 'iowprowNotes/' + parish.value + '/' + user.email);
                const notesObj = {
                    dataAdded: serverTimestamp(),
                    pathName: pathName.value,
                    pathNote: pathNote.value,
                    pathUnique_id: pathUnique_id.value,
                    downloadURLs: "No image added"
                };

                const newNoteRef = addDoc(collectionRef, notesObj);

            }

            console.log('1 downloadURLs');
            console.log(downloadURLs);
            var notesForm = document.getElementById("addNotesModal");
            notesForm.classList.toggle("hidden");

        };

        const rootRef = ref(storage);

        const uploadProcess = (file, filename) => {
            return new Promise((resolve, reject) => {
                let user = auth.currentUser;
                const parishRef = ref(rootRef, parishName.value);
                const userRef = ref(parishRef, user.email);
                const pathRef = ref(userRef, pathName.value);
                const fileRef = ref(pathRef, file.name);

                const uploadTask = uploadBytesResumable(fileRef, file);

                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        // first
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                // second
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        switch (error.code) {
                            case 'storage/unauthorized':
                                // User doesn't have permission to access the object
                                console.log('User unauthorized');
                                break;
                            case 'storage/cancelled':
                                console.log('Cancelled upload');
                                // User canceled the upload
                                break;
                            case 'storage/unknown':
                                // Unknown error occurred, inspect error.serverResponse
                                console.log('Unknown error in upload');
                                break;
                        }
                    },
                    () => {
                        // Upload completed successfully, now we can get the download URL
                        getDownloadURL(uploadTask.snapshot.ref)
                            .then((downloadURL) => {
                                // third
                                console.log('File available at', downloadURL);
                                resolve(downloadURL);
                            });
                    }
                );

            });

        }

        document.getElementById("addNotes").addEventListener('click', (e) => {
            e.preventDefault();
            uploadImage();
        })

    } else {
        console.log("You must be logged on");
        var theDiv = document.getElementById("notes");
        var content = document.createTextNode("You must be logged on to view this data");
        theDiv.appendChild(content);
        localStorage.removeItem("signedin");
    }
});