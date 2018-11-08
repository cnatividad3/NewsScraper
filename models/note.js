const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// create a new NoteSchema object
const NoteSchema = new Schema({
  name: String,
  body: String
});

const Note = mongoose.model("Note", NoteSchema);

module.exports = Note;