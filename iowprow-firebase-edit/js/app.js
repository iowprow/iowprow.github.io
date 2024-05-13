import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js'
// Add Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js'
import { getFirestore, collection, serverTimestamp, addDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

import Dexie, { liveQuery } from 'https://unpkg.com/dexie@^3.2/dist/modern/dexie.min.mjs'

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


const dexieDB = new Dexie("prowUserDB");
dexieDB.version(1).stores({
    users: `id, email, signedin`
});

/*
const usersObservable = liveQuery(
    () => dexieDB.users.toArray()
);
const subscription = usersObservable.subscribe({
    next: (result) => console.log('Got result:', JSON.stringify(result)),
    error: (error) => console.error(error),
});
*/

//https://dev.to/wangonya/displaying-a-css-spinner-on-ajax-calls-with-fetch-api-4ndo
function showSpinner() {
    spinner.className = "show";
}

function hideSpinner() {
    spinner.className = spinner.className.replace("show", "");
}




const markAsSignedin = async (id) => {
    if (id) {
        await dexieDB.users.update(id, { signedin: true })
    }
    else {
        await dexieDB.users.update(id, { signedin: false })
    }
}

const removeUserFromLocal = async (id) => {
    await dexieDB.users.delete(id);
}


async function updateSignedinStatus(id) {
    try {
        const isUpdated = await dexieDB.users.where('id').equals(id).modify({ signedin: false });
        //  console.log('isUpdated');
        // console.log(isUpdated);
        if (!isUpdated) {
            throw new Error('Error updating');
        }
    } catch (error) {
        console.error(error)
    }
}

/*

    getUsersLocal().then(
        function (data) {
            console.log('4 data');
            console.log(data);
        });

var data = getUsersLocal();


getUsersLocal().then(response => {
    if (response) {
        console.log('response getUsersLocal');
        console.log(response);
    } else {
        console.log('response getUsersLocal');
        console.log("no response");
    }
}).catch(error => {
    console.log(error)
})
*/


async function getUsersLocal() {
    const usersArray = await dexieDB.users.toArray();
    return usersArray;
}

function equalsIgnoreCase(email) {
    console.log("equalsIgnoreCase");
    return dexieDB.users.where('email').equalsIgnoreCase('kab.ventnor@gmail.com')
        .each(function (friend) {
            console.log(JSON.stringify(friend));
        });
}



async function getUserLocal(key) {
    return await dexieDB.users.get(key);
}


// add user to indexeddb as signedin
const addUserLocal = async (email, uid) => {
    await dexieDB.users.put({
        id: uid,
        email: email,
        signedin: true
    });
}

//signin
const loginEmail = document.getElementById('loginEmail');
const password = document.getElementById('password');
const spinner = document.getElementById("spinner");
const messageDiv = document.getElementById("loginMessage");
const signedOnAs = document.getElementById('signedOnAs');
const userSignIn = async () => {
    let signInEmail = loginEmail.value;
    let signInPassword = password.value;
    showSpinner();
    signInWithEmailAndPassword(auth, signInEmail, signInPassword)
        .then((userCredential) => {
            console.log("3. Signed on with " + userCredential.user.email);
            // add user as signed on to indexeddb
            addUserLocal(userCredential.user.email, userCredential.user.uid);
            hideSpinner();
            signedOnAs.classList.remove('hidden');
            signedOnAs.textContent = "Signed on as " + userCredential.user.email;
        })
        .catch((error) => {
            console.log(error.code, error);
            hideSpinner();
            messageDiv.textContent = "Problem with your sign on. Please try again."
        });
}
const signInBtn = document.getElementById('signInBtn');
signInBtn.addEventListener('click', userSignIn);

//signout
const userSignOut = () => {
    signOut(auth).then(() => {
        signedOnAs.classList.add('hidden');
        signedOnAs.textContent = "";
        loginEmail.value = "";
        password.value = "";
        console.log('user signed out successfully');
    }).catch((error) => {
        // An error happened.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
    });
}
const signOutBtn = document.getElementById('signOutBtn');

const allmodals = document.getElementsByClassName("modal");
signOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    updateSignedinStatus(user.uid);
    for (var i = 0; i < allmodals.length; i++) {
        allmodals[i].style.display = "none";
    }
    userSignOut();
})



const parishName = document.getElementById('parish');
const pathName = document.getElementById('pathName');
const pathNote = document.getElementById('pathNote');
const pathUnique_id = document.getElementById('pathUnique_id');
const fileUploader = document.getElementById('attach');


//check auth state
onAuthStateChanged(auth, (user) => {
    const uploadEmail = document.getElementById('uploadEmail');
    if (user) {
        const uid = user.uid;
        const email = user.email;
        // popupform fill in email on index.html
        uploadEmail.value = email;

        console.log('1 app.js auth onstatechage with email update index.html form');
        console.log('2 ' + email);

        const db = getFirestore(app);
        const storage = getStorage(app);
        // set login button icon to be unlocked and hide login modal
        document.getElementById("btn-login").classList.add("active");
        document.getElementById("loginModal").style.display = "none";

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
            // console.log('1 downloadURLs');
            //console.log(downloadURLs);
            // close upload form
            var notesForm = document.getElementById("formModal");
            notesForm.style.display = "none";
        };

        const rootRef = ref(storage);
        const uploadProcess = (file, filename) => {
            return new Promise((resolve, reject) => {
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

        document.getElementById("uploadNotes").addEventListener('click', (e) => {
            e.preventDefault();
            uploadImage();
        })

    } else {
        uploadEmail.value = "";
        document.getElementById("btn-login").classList.remove("active");
        document.getElementById("userMenuContainer").style.display = "none";
        console.log('checkAuthState user is signed out and session cleared and form cleared');
        localStorage.removeItem("signedin");
    }
})