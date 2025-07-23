const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'supersecretkey'; // In production, use env vars

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'edulite.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    grade TEXT NOT NULL,
    date_of_birth TEXT,
    address TEXT
  );
  CREATE TABLE IF NOT EXISTS teachers (
    teacher_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    date_of_birth TEXT,
    address TEXT
  );
`);

// Demo user (admin)
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'teacher', password: 'teacher123', role: 'teacher' }
];

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role });
});

// Validation schemas
const studentSchema = Joi.object({
  student_id: Joi.string(),
  full_name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  grade: Joi.string().required(),
  date_of_birth: Joi.string().optional(),
  address: Joi.string().optional()
});

const teacherSchema = Joi.object({
  teacher_id: Joi.string(),
  full_name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().optional(),
  date_of_birth: Joi.string().optional(),
  address: Joi.string().optional()
});

// Protect all routes below this middleware
app.use((req, res, next) => {
  if (req.path === '/login') return next();
  authenticateToken(req, res, next);
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Students CRUD
app.get('/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.json(students);
});

app.post('/students', (req, res) => {
  const { error } = studentSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const student = { ...req.body, student_id: req.body.student_id || Date.now().toString() };
  try {
    db.prepare(`INSERT INTO students (student_id, full_name, email, grade, date_of_birth, address) VALUES (?, ?, ?, ?, ?, ?);`).run(
      student.student_id,
      student.full_name,
      student.email,
      student.grade,
      student.date_of_birth || '',
      student.address || ''
    );
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add student', details: err.message });
  }
});

app.put('/students/:id', (req, res) => {
  const { error } = studentSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const id = req.params.id;
  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const updated = { ...student, ...req.body };
  try {
    db.prepare(`UPDATE students SET full_name = ?, email = ?, grade = ?, date_of_birth = ?, address = ? WHERE student_id = ?`).run(
      updated.full_name,
      updated.email,
      updated.grade,
      updated.date_of_birth || '',
      updated.address || '',
      id
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update student', details: err.message });
  }
});

app.delete('/students/:id', (req, res) => {
  const id = req.params.id;
  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  try {
    db.prepare('DELETE FROM students WHERE student_id = ?').run(id);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete student', details: err.message });
  }
});

// Teachers CRUD
app.get('/teachers', (req, res) => {
  const teachers = db.prepare('SELECT * FROM teachers').all();
  res.json(teachers);
});

app.post('/teachers', (req, res) => {
  const { error } = teacherSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const teacher = { ...req.body, teacher_id: req.body.teacher_id || Date.now().toString() };
  try {
    db.prepare(`INSERT INTO teachers (teacher_id, full_name, email, subject, date_of_birth, address) VALUES (?, ?, ?, ?, ?, ?);`).run(
      teacher.teacher_id,
      teacher.full_name,
      teacher.email,
      teacher.subject || '',
      teacher.date_of_birth || '',
      teacher.address || ''
    );
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add teacher', details: err.message });
  }
});

app.put('/teachers/:id', (req, res) => {
  const { error } = teacherSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const id = req.params.id;
  const teacher = db.prepare('SELECT * FROM teachers WHERE teacher_id = ?').get(id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  const updated = { ...teacher, ...req.body };
  try {
    db.prepare(`UPDATE teachers SET full_name = ?, email = ?, subject = ?, date_of_birth = ?, address = ? WHERE teacher_id = ?`).run(
      updated.full_name,
      updated.email,
      updated.subject || '',
      updated.date_of_birth || '',
      updated.address || '',
      id
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update teacher', details: err.message });
  }
});

app.delete('/teachers/:id', (req, res) => {
  const id = req.params.id;
  const teacher = db.prepare('SELECT * FROM teachers WHERE teacher_id = ?').get(id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  try {
    db.prepare('DELETE FROM teachers WHERE teacher_id = ?').run(id);
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete teacher', details: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EduLite Nexus Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app; 