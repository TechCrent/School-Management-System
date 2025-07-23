const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data
let students = [];
let teachers = [];

// Students CRUD
app.get('/students', (req, res) => {
  res.json(students);
});

app.post('/students', (req, res) => {
  const student = { ...req.body, student_id: req.body.student_id || Date.now().toString() };
  students.push(student);
  res.status(201).json(student);
});

app.put('/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.student_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  students[idx] = { ...students[idx], ...req.body };
  res.json(students[idx]);
});

app.delete('/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.student_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  const removed = students.splice(idx, 1);
  res.json(removed[0]);
});

// Teachers CRUD
app.get('/teachers', (req, res) => {
  res.json(teachers);
});

app.post('/teachers', (req, res) => {
  const teacher = { ...req.body, teacher_id: req.body.teacher_id || Date.now().toString() };
  teachers.push(teacher);
  res.status(201).json(teacher);
});

app.put('/teachers/:id', (req, res) => {
  const idx = teachers.findIndex(t => t.teacher_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });
  teachers[idx] = { ...teachers[idx], ...req.body };
  res.json(teachers[idx]);
});

app.delete('/teachers/:id', (req, res) => {
  const idx = teachers.findIndex(t => t.teacher_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });
  const removed = teachers.splice(idx, 1);
  res.json(removed[0]);
});

app.listen(PORT, () => {
  console.log(`EduLite Nexus Backend running on http://localhost:${PORT}`);
}); 