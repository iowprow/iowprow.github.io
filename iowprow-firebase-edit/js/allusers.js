import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js'
// Add Firebase products that you want to use
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js'
import { getFirestore, serverTimestamp, collection, onSnapshot, doc, addDoc, getDoc, getDocs, updateDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js'
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

        async function getAllUsers(email) {
            try {
                let usersTable = $('#usersTable').DataTable({
                    info: false,
                    paging: false,
                    searching: true,
                    retrieve: true,
                    columnDefs: [
                        {
                            targets: [0],
                            className: 'notEditable'
                        },
                        {
                            targets: [1],
                            className: 'role'
                        },
                        {
                            targets: [2],
                            className: 'area',
                        },
                        {
                            targets: [3],
                            searchable: false,
                        }
                    ],
                    columns: [
                        {
                            data: 'id',
                            title: 'user',
                        },
                        {
                            data: 'role',
                            title: 'role',
                        },
                        {
                            data: 'area',
                            title: 'area'
                        },

                    ],
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr('data-docID', data.docID);
                    }
                });

                let tableData = [];
                const usersDB = collection(db, 'users');
                const usersCollection = await getDocs(usersDB);
                usersCollection.forEach((doc) => {
                    //console.log(doc.id, " => ", doc.data());
                    let data = doc.data();
                    tableData.push({
                        "id": doc.id,
                        "role": data.role,
                        "area": data.area,
                        "docID": doc.id
                    });
                });
                //doing something with the results
                usersTable.clear();
                usersTable.rows.add(tableData);
                usersTable.draw();

                //  const editIDs = document.querySelectorAll(".editNote");
            } catch (error) {
                console.log(
                    `There was an error fetching the data in firestore: ${error}`
                );
                console.log("You need to be signed on");
            }
        }

        getAllUsers();

        function buildDropdown(data, id, toBeSelected) {
            if (id != "") {
                var dropdown = "<select id=\"" + id + "\">";
            } else {
                var dropdown = "<select>";
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i] === toBeSelected) {
                    var option = "<option value=\"" + data[i] + "\" selected>" + data[i] + "</option>";
                } else {
                    var option = "<option value=\"" + data[i] + "\">" + data[i] + "</option>";
                }
                dropdown = dropdown + option;
            }
            dropdown = dropdown + "</select>";
            return dropdown;
        }

        $('#filterNotes').on('keyup', function () {
            var usersTable = $('#usersTable').DataTable();
            usersTable.search($(this).val()).draw();
        });

        const roles = ["admin", "editor", "viewer"];
        const parishCodes = [
            "A", "BB", "B", "BS", "CB", "C", "CS", "F", "G", "GL",
            "NC", "N", "NT", "R", "SS", "S", "SW", "T", "V", "Y",
        ];

        $('#usersTable').on('click', '.edit', function (e) {
            let tr = e.target.closest('tr');
            let editID = tr.getAttribute('data-docid');
            $(this).parent().siblings('td').not('.notEditable').each(function () {
                var content = $(this).html();
                var cssClass = $(this).attr('class');
                if (cssClass != 'role') {
                    $(this).html('<input class="' + cssClass + '" value="' + content + '" />');
                } else {
                    $(this).html(buildDropdown(roles, "editRole", content));
                }
            });
            $(this).siblings('.save').show();
            $(this).siblings('.delete').hide();
            $(this).hide();
        });

        $('#usersTable').on('click', '.delete', function (e) {
            console.log("deleting");
            let tr = e.target.closest('tr');
            let editID = tr.getAttribute('data-docid');
            console.log(editID);
            const docRef = doc(db, 'users', editID);
            deleteDoc(docRef)
                .then(() => {
                    console.log("Entire Document has been deleted successfully.")
                })
                .catch(error => {
                    console.log(error);
                })

            $(this).parents('tr').remove();
        });

        $('#usersTable').on('click', '.save', function (e) {
            let tr = e.target.closest('tr');
            let editID = tr.getAttribute('data-docid');
            // console.log('editID = ' + editID);
            var role = document.querySelector(".role select").value;
            var area = document.querySelector("input.area").value;
            const data = {
                role: role,
                area: area
            };
            const docRef = doc(db, 'users', editID);
            updateDoc(docRef, data)
                .then(docRef => {
                    console.log("Value of an existing user has been updated");
                })
                .catch(error => {
                    console.log(error);
                })
            getAllUsers(email);
        });

        $('#usersTable').on('click', '.add', function (e) {
            // Get the modal form window
            console.log("adding new user form");
            var addForm = document.getElementById("addUserModal");
            addForm.classList.toggle("hidden");

            var roleLabel = document.querySelector('label[for="role"]');
            let roleString = buildDropdown(roles, "role", "");
            let rolesNode = fromHTML(roleString);
            roleLabel.appendChild(rolesNode);

            var areaLabel = document.querySelector('label[for="area"]');
            let areaString = buildDropdown(parishCodes, "area", "");
            let areaNode = fromHTML(areaString);
            areaLabel.appendChild(areaNode);
        });

        const addNewUser = async (addID, role, area) => {
            const addUserObj = {
                role: role,
                area: area
            };
            const docRef = doc(db, 'users', addID);
            const newUserRef = setDoc(docRef, addUserObj) // with custom ID
        };

        document.getElementById("addUser").addEventListener('click', (e) => {
            e.preventDefault();
            console.log('add new user');

            const userForm = document.forms["addUserForm"];
            let role = userForm.role.value;
            let area = userForm.area.value;
            let userEmail = userForm.userEmail.value;
            addNewUser(userEmail, role, area);
        })

    } else {
        console.log("You must be logged on");
        var theDiv = document.getElementById("notes");
        var content = document.createTextNode("You must be logged on to view this data");
        theDiv.appendChild(content);
        localStorage.removeItem("signedin");
    }
});

/**
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
 * @param {String} HTML representing a single element.
 * @param {Boolean} flag representing whether or not to trim input whitespace, defaults to true.
 * @return {Element | HTMLCollection | null}
 * 
 * / Example 1: add a div to the page
const div = fromHTML('<div><span>nested</span> <span>stuff</span></div>');
document.body.append(div);

// Example 2: add a bunch of rows to an on-page table
const rows = fromHTML('<tr><td>foo</td></tr><tr><td>bar</td></tr>');
table.append(...rows);

// Example 3: add a single extra row to the same on-page table
const td = fromHTML('<td>baz</td>');
const row = document.createElement(`tr`);
row.append(td);
table.append(row);

 */
function fromHTML(html, trim = true) {
    // Process the HTML string.
    html = trim ? html.trim() : html;
    if (!html) return null;

    // Then set up a new template element.
    const template = document.createElement('template');
    template.innerHTML = html;
    const result = template.content.children;

    // Then return either an HTMLElement or HTMLCollection,
    // based on whether the input HTML had one or more roots.
    if (result.length === 1) return result[0];
    return result;
}
