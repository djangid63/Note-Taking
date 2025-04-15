import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function getFormattedDate(date) {
  return `Today, ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
}

function App() {
  const [notes, setNotes] = useState([]);
  const [searchStr, setSearchStr] = useState('')

  const fetchData = async () => {
    try {
      const getDb = await axios.get('http://localhost:3000/');
      setNotes(getDb.data.notesData)
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  // To delete the data on the basis of _ID
  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:3000/${id}`);

    } catch (error) {
      console.log("Error while deleting", error);
    }
  }

  // To update the data
  const [editingNote, setEditingNote] = useState(null);

  const updateNote = async (id, updatedNote) => {
    try {
      const response = await axios.patch(`http://localhost:3000/${id}`, updatedNote);
      console.log('Updated Note:', response.data);

      //  Show the new updated data
      fetchData()
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
  };

  const handleSaveClick = async () => {
    if (editingNote) {
      await updateNote(editingNote._id, editingNote);
      setEditingNote(null);
    }
  };

  const [activeCategory, setActiveCategory] = useState('All');

  // State for new note
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'Personal',
    color: 'bg-emerald-200'
  });

  // State for showing note form
  const [showNoteForm, setShowNoteForm] = useState(false);


  // Categories with counts
  const categories = [
    { name: 'All', count: notes.length, icon: '📋' },
    { name: 'Work', count: notes.filter(note => note.category === 'Work').length, icon: '💼' },
    { name: 'Personal', count: notes.filter(note => note.category === 'Personal').length, icon: '👤' },
    { name: 'Learning', count: notes.filter(note => note.category === 'Learning').length, icon: '📚' }
  ];

  // Filter notes based on active category
  const filteredNotes = activeCategory === 'All'
    ? notes
    : notes.filter(note => note.category === activeCategory);

  // Searching
  const searchedData = filteredNotes.filter((note) =>
    searchStr != "" ? note.title.toLowerCase().includes(searchStr.toLowerCase()) : filteredNotes
  );

  // Handle adding new note
  const handleAddNote = async () => {
    if (newNote.title.trim() !== '' && newNote.content.trim() !== '') {
      const currentDate = new Date();
      const formattedDate = getFormattedDate(currentDate);

      const newNoteObject = {
        id: Date.now(),
        ...newNote,
        date: formattedDate
      };

      try {
        await axios.post('http://localhost:3000/', newNoteObject);
      } catch (error) {
        console.error("Error while posting", error);
      }
      // Use this for not re-rendering the whole notes obj
      setNotes([newNoteObject, ...notes]);
      // Or use this
      // fetchData()
      setNewNote({
        title: '',
        content: '',
        category: 'Personal',
        color: 'bg-emerald-200'
      });
      setShowNoteForm(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 p-6 bg-white shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">MindMark</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your thoughts organized</p>
        <div className='flex items-center justify-center'>
          <button
            onClick={() => setShowNoteForm(true)}
            className="mt-6 w-12 h-12 rounded-full bg-black hover:bg-blue-700 text-white py-2 px-4 flex items-center justify-center transition-colors"
          >
            <span className="text-3xl mb-1.5 font-extralight ">+</span>
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h2>
          <ul className="space-y-2">
            {categories.map(category => (
              <li key={category.name}>
                <button
                  onClick={() => setActiveCategory(category.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${activeCategory === category.name ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600">{category.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeCategory === 'All' ? 'All Notes' : activeCategory}
            <span className="ml-2 text-gray-400 text-lg">({filteredNotes.length})</span>
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchStr}
              onChange={(e) => { setSearchStr(e.target.value) }}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Note Form */}
        {showNoteForm && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full border-0 border-b border-gray-200 pb-2 text-xl font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full border-0 resize-none h-24 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Learning">Learning</option>
                </select>
                <div className="flex space-x-1">
                  {['bg-amber-200', 'bg-emerald-200', 'bg-violet-200', 'bg-rose-200', 'bg-sky-200'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewNote({ ...newNote, color })}
                      className={`w-5 h-5 rounded-full ${color} ${newNote.color === color ? 'ring-2 ring-blue-500' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNoteForm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.title || !newNote.content}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchedData.map(note => (
            <div key={note.id} className={`${note.color} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg text-gray-800">{note.title}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditClick(note)}
                    className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4 whitespace-pre-line">{note.content}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{note.category}</span>
                <span>{note.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Note Form */}
        {editingNote && (
          <div className="my-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Note title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full border-0 border-b border-gray-200 pb-2 text-xl font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Note content..."
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full border-0 resize-none h-24 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <select
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Learning">Learning</option>
                </select>
                <div className="flex space-x-1">
                  {['bg-amber-200', 'bg-emerald-200', 'bg-violet-200', 'bg-rose-200', 'bg-sky-200'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingNote({ ...editingNote, color })}
                      className={`w-5 h-5 rounded-full ${color} ${editingNote.color === color ? 'ring-2 ring-blue-500' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={!editingNote.title || !editingNote.content}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;