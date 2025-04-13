const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const port = 3000;
app.use(cors())
app.use(express.json())

const mongoURL = 'mongodb://localhost:27017/notesData'

mongoose.connect(mongoURL)
  .then(() => console.log("DB connected"))
  .catch(() => console.log("DB connection failed"))

const Schema = mongoose.Schema

const notesSchema = new Schema({
  id: Number,
  title: String,
  content: String,
  color: String,
  date: String
})

const notesDataSchema = mongoose.model("notes", notesSchema)

// To display the data
app.get('/', async (req, res) => {
  try {
    const notesData = await notesDataSchema.find();
    res.status(200).json({ notesData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes data" });
  }
});

// To delete the data on the basis of id
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await notesDataSchema.findByIdAndDelete(id)
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete the note" });
  }
})

// To add the data
app.post('/', async (req, res) => {
  try {
    const newNote = new notesDataSchema(req.body);
    const savedNote = await newNote.save()
    res.status(201).json({ message: "Note successfully saved", savedNote });
    res.status(201).json({ newNote: savedNote });
  } catch (error) {
    res.status(500).json({ error: "Failed to save the note" });
  }
})


app.listen(port, () => {
  console.log(`It's running on ${port} server`);
})

