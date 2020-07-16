const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const db_path = path.join(__dirname + "/notes_db.json");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

//DB INIT
if (!fs.existsSync(db_path)) fs.writeFileSync(db_path, "");

function getDB() {
    return JSON.parse(fs.readFileSync(db_path));
}

function saveDB(db_contents) {
    fs.writeFileSync(db_path, JSON.stringify(db_contents));
}

function generateUuid() {
    return uuidv4();
}

//ROUTES
// get api/notes returns all note names and ids
// get api/notes/:id returns the note
// post api/notes adds note, returns note id, if note already exists it updates it
// delete api/notes/:id deletes note and returns confirmation
app.get("/api/notes/:uuid", function (req, res) {
    console.log('specific note')
    let notes_db = getDB();
    let reqNoteUuid = req.params.uuid;
    db_note_index = notes_db.findIndex((db_note) => db_note.uuid == reqNoteUuid);

    if (db_note_index == -1) {
        res.status(400).send("note not located");
        console.log("note not found for get request");
    } else {
        res.send(notes_db[db_note_index]);
    }
});

app.get("/api/notes", function (req, res) {
    console.log('get')
    let returnContents = [];
    let notes_db = getDB();
    notes_db.forEach(function (note) {
        returnContents.push({ uuid: note.uuid, noteTitle: note.noteTitle });
    });
    res.send(returnContents);
});

app.post("/api/notes", function (req, res) {
    console.log('post')
    let notes_db = getDB();
    let note = req.body;

    if (note.uuid == '') note.uuid = generateUuid()

    db_note_index = notes_db.findIndex((db_note) => db_note.uuid == note.uuid);

    if (db_note_index == -1) {
        notes_db.push(note);
        saveDB(notes_db);
        res.send(note);
    } else {
        console.log("Note already present and post used");
        res.status(303).send("Note already present");
    }

    //checking if this is an update or not
    // if (note.uuid == "") {
    //     note.uuid = generateUuid();
    //     notes_db.push(note);
    //     saveDB(notes_db);
    //     res.send(note.uuid);
    //     console.log('Created new note and saved')
    // } else {
    //     let foundNote = false;

    // db_note = notes_db.filter(db_note => db_note.uuid == note.uuid)

    // notes_db.forEach(function (db_note, index) {
    //     if (note.uuid == db_note.uuid) {
    //         foundNote = true;
    //         notes_db.splice(index, 1, note);
    //         saveDB(notes_db);
    //         res.send(note.uuid);
    //         console.log('Updated a note')
    //     }
    // });
    // if (!foundNote) {
    //     console.log(
    //         "A uuid was returned with a post request but there was no note located with that uuid"
    //     );
    // }
    // }
});

app.put("/api/notes", function (req, res) {
    console.log('put')
    let notes_db = getDB();
    let note = req.body;
    db_note_index = notes_db.findIndex((db_note) => db_note.uuid == note.uuid);
    if (db_note_index == -1) {
        console.log("put request for note not located");
        res.status(404).send("Note not present");
    } else {
        notes_db.splice(db_note_index, 1, note);
        saveDB(notes_db);
        res.send(note)
    }
});

app.delete("/api/notes/:uuid", function (req, res) {
    console.log('delete')
    let notes_db = getDB();
    db_note_index = notes_db.findIndex((db_note) => db_note.uuid == req.params.uuid);
    if (db_note_index == -1) {
        console.log("delete note not found");
        res.status(404).send("Note not found");
    } else {
        notes_db.splice(db_note_index, 1);
        saveDB(notes_db);
        res.send('note deleted')
    }
});

app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});