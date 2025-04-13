const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const port = 3000;
app.use(cors())

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

app.get('/', async (req, res) => {
  try {
    const notesData = await notesDataSchema.find();
    res.status(200).json({ notesData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes data" });
  }
});


app.listen(port, () => {
  console.log(`It's running on ${port} server`);
})

