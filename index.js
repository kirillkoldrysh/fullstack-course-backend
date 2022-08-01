require('dotenv').config();
const { response } = require('express');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGODB_URI);

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
});

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Note = mongoose.model('Note', noteSchema);

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.static('build'));

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  Note.findOne({_id: id}).then(note => {
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
  })
});

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter(note => note.id !== id);

  response.status(204).end();
});

app.post('/api/notes/', (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

app.put('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const noteIndex = notes.findIndex(note => note.id === id);

  if (noteIndex < 0) {
    response.status(400).json({
      error: 'note doesnt exist'
    });
  }

  const body = request.body;

  notes[noteIndex].important = body.important;
  notes[noteIndex].content = body.content;

  response.json(notes[noteIndex]);
});

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0;

  return maxId + 1;
};

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
