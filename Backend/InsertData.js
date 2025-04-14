const mongoose = require('mongoose')
const express = require('express');
const { strict } = require('assert');
const app = express("express")
const port = 3000;

const mongoURL = 'mongodb://localhost:27017/notesData'

mongoose.connect(mongoURL)
  .then(() => console.log("DB connected"))
  .catch(() => console.log("DB connection failed"))

const Schema = mongoose.Schema

const notesSchema = new Schema({
  id: Number,
  title: String,
  content: String,
  category: String,
  color: String,
  date: String
})

const notesDataSchema = mongoose.model("notes", notesSchema)

mongoose.connect(mongoURL)
  .then(async () => {
    console.log('MongoDB Connected');
    await notesDataSchema.insertMany([
      {
        id: 1,
        title: 'Meeting Notes',
        content: 'Discuss project timeline and deliverables with the team',
        category: 'Work',
        color: 'bg-amber-200',
        date: 'Today, 2:30 PM'
      },
      {
        id: 2,
        title: 'Shopping List',
        content: 'Milk, Eggs, Bread, Fruits, Vegetables',
        category: 'Personal',
        color: 'bg-emerald-200',
        date: 'Yesterday, 6:15 PM'
      },
      {
        id: 3,
        title: 'Book Recommendations',
        content: '1. Atomic Habits\n2. Deep Work\n3. The Psychology of Money',
        category: 'Learning',
        color: 'bg-violet-200',
        date: 'Apr 10, 10:45 AM'
      },
      {
        id: 4,
        title: 'Project Ideas',
        content: 'Build a personal portfolio website with React and Tailwind',
        category: 'Work',
        color: 'bg-amber-200',
        date: 'Apr 9, 4:20 PM'
      }
    ])
    console.log('Data Inserted Successfully');
    process.exit();
  })
  .catch(err => console.log(err));

app.listen(port, () => {
  console.log(`Connected with ${port}`);
})