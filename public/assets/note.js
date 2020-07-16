const sideMenu = document.querySelector(".sidebar-menu");

async function populateSavedDocsList() {
    let sideMenu = document.querySelector(".sidebar-menu");
    let savedDocs = await fetch("/api/notes").then((resp) => resp.json());

    //clear old documents on the list just in case
    let menuItemsUl = sideMenu.children[0];

    let menuContents = menuItemsUl.children;

    //TODO Replace this with something that only removes the class I desire to remove instead of this.  This is inelegant.
    while (menuContents.length > 3) {
        menuContents[menuContents.length - 1].remove();
    }

    let index = 1;
    let liEl;
    savedDocs.forEach(function (savedDoc) {
        liEl = document.createElement("LI");
        if (savedDoc.noteTitle.length > 40)
            savedDoc.noteTitle = savedDoc.noteTitle.substring(0, 30) + "...";
        liEl.innerHTML = `${index}&nbsp&nbsp&nbsp&nbsp${savedDoc.noteTitle}<i class="fa fa-trash-o" data-uuid="${savedDoc.uuid}" onclick="deleteDoc(event)" aria-hidden="true"></i>`;
        liEl.classList.add("saved-doc");
        liEl.dataset.uuid = savedDoc.uuid;
        liEl.addEventListener("click", loadDoc);
        menuItemsUl.appendChild(liEl);
        index++;
    });
}

async function loadDoc(event) {
    if (event.target.classList.contains("fa")) return;
    let docUuid = event.target.dataset.uuid;

    let savedDoc = await fetch(`/api/notes/${docUuid}`).then((resp) => resp.json());

    populateDoc(savedDoc.noteContents, savedDoc.noteTitle, savedDoc.uuid);
}

function populateDoc(docContents, docTitle, docUuid) {
    document.querySelector("#note-text").value = docContents;
    document.querySelector("#note-title").value = docTitle;
    document.querySelector("#save-button").dataset.uuid = docUuid;
}

async function saveDoc(event) {
    let docUuid = event.target.dataset.uuid ? event.target.dataset.uuid : "";
    let docContents = document.querySelector("#note-text").value;
    let docTitle = document.querySelector("#note-title").value;
    let doc = { uuid: docUuid, noteTitle: docTitle, noteContents: docContents };
    //SEND TO SERVER, GET BACK UUID
    let serverResponse;
    if (docUuid == "") {
        //If there is no uuid, that means this is a new document and it should be posted
        serverResponse = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
        }).then((resp) => resp.json());
    } else {
        //there is already an idea and this should be updated instead with put
        serverResponse = await fetch("/api/notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
        }).then((resp) => resp.json());
    }

    document.querySelector("#save-button").dataset.uuid = serverResponse.uuid;
    populateSavedDocsList();
}

function populateDoc(docContents, docTitle, docUuid) {
    document.querySelector("#note-text").value = docContents;
    document.querySelector("#note-title").value = docTitle;
    document.querySelector("#save-button").dataset.uuid = docUuid;
}

async function saveDoc(event) {
    let docUuid = event.target.dataset.uuid ? event.target.dataset.uuid : "";
    let docContents = document.querySelector("#note-text").value;
    let docTitle = document.querySelector("#note-title").value;
    let doc = { uuid: docUuid, noteTitle: docTitle, noteContents: docContents };
    //SEND TO SERVER, GET BACK UUID
    let serverResponse;
    if (docUuid == "") {
        serverResponse = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
        }).then((resp) => resp.json());
    } else {
        serverResponse = await fetch("/api/notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
        }).then((resp) => resp.json());
    }

    document.querySelector("#save-button").dataset.uuid = serverResponse.uuid;
    populateSavedDocsList();
}

async function deleteDoc(event) {
    event.stopPropagation();

    let docUuid = event.target.dataset.uuid;
    let serverResponse = await fetch(`/api/notes/${docUuid}`, { method: "DELETE" });
    if (document.querySelector("#save-button").dataset.uuid == docUuid) {
        newDoc();
    }
    populateSavedDocsList();
}
async function deleteDocMain(event) {
    event.stopPropagation();

    let docUuid = document.querySelector("#save-button").dataset.uuid;

    if (!(docUuid == undefined)) {
        let serverResponse = await fetch(`/api/notes/${docUuid}`, { method: "DELETE" });
        populateSavedDocsList();
    }

    newDoc();
}

document.querySelector("#ham").addEventListener("click", function (e) {
    if (sideMenu.style.display == "none") {
        sideMenu.style.display = "block";
        sideMenu.classList.add("animate__animated", "animate__fadeIn", "animate__faster");
        setTimeout(function () {
            sideMenu.classList.remove("animate__animated", "animate__fadeIn", "animate__faster");
        }, 510);
    } else {
        sideMenu.classList.add("animate__animated", "animate__fadeOut", "animate__faster");
        setTimeout(function () {
            sideMenu.style.display = "none";
            sideMenu.classList.remove("animate__animated", "animate__fadeOut", "animate__faster");
        }, 500);
    }
});

window.onclick = function (event) {
    if (
        !(event.target.matches("#ham") || event.target.matches(".fa-bars")) &&
        sideMenu.style.display == "block"
    ) {
        sideMenu.classList.add("animate__animated", "animate__fadeOut", "animate__faster");
        setTimeout(function () {
            sideMenu.style.display = "none";
            sideMenu.classList.remove("animate__animated", "animate__fadeOut", "animate__faster");
        }, 500);
    }
};

function newDoc() {
    document.querySelector("#note-text").value = "";
    document.querySelector("#note-title").value = "";
    document.querySelector("#save-button").dataset.uuid = "";
}

document.querySelector("#save-button").addEventListener("click", saveDoc);

document.querySelector("#new-button").addEventListener("click", function () {
    newDoc();
});

document.querySelector('#back-button').addEventListener('click', function(){window.location.href = "./index.html"})

populateSavedDocsList();
