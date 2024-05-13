var menu = document.querySelector("#userMenu ul");

const adminMenu = [{
    title: 'Admin users',
    link: 'allusers2.html'
}, {
    title: 'View all data',
    link: 'alldata.html'
}, {
    title: 'Signout',
    link: 'id="signOutBtn" href="javascript:void(0)"'
}];

const editorMenu = [{
    title: 'Map',
    link: 'index.html'
}, {
    title: 'Signout',
    link: 'id="signOutBtn" href="javascript:void(0)"'
}];

// create menu by role
export function createMenu(role) {
    switch (role) {
        case "admin":
            console.log("create admin menu");
            adminMenu.forEach(itm => {
                let li = document.createElement("li");
                let link = document.createElement("a");
                link.href = itm.link;
                link.text = itm.title
                li.appendChild(link)
                menu.appendChild(li)
            })

            break;

        case "editor":
            console.log("create editor menu");
            editorMenu.forEach(itm => {
                let li = document.createElement("li");
                let link = document.createElement("a");
                link.href = itm.link;
                link.text = itm.title
                li.appendChild(link)
                menu.appendChild(li)
            })
            break;

        default:
            console.log("no menu");
    }
}