const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

function logAudit(action, details) {
  const entry = `[${new Date().toISOString()}] ${action}: ${JSON.stringify(details)}\n`;
  fs.appendFile('audit.log', entry, err => { if (err) console.error('Audit log error:', err); });
}

function apiSuccess(data) {
  return { status: 'success', data, error: null };
}
function apiError(error, data = null) {
  return { status: 'error', data, error };
}

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// For local development, allow any localhost port with credentials (not for production!)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts, please try again later.' });
app.use('/login', loginLimiter);
app.use(apiLimiter);

// Initialize SQLite database
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'edulite.db'));

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
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    reset_token TEXT,
    reset_token_expiry TEXT
  );
  CREATE TABLE IF NOT EXISTS classes (
    class_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
  );
  CREATE TABLE IF NOT EXISTS subjects (
    subject_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS student_classes (
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    PRIMARY KEY (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
  );
  CREATE TABLE IF NOT EXISTS class_subjects (
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    teacher_id TEXT,
    PRIMARY KEY (class_id, subject_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
  );
`);

// Insert demo users if not present
const demoUsers = [
  { user_id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { user_id: '2', username: 'teacher', password: 'teacher123', role: 'teacher' }
];
demoUsers.forEach(async user => {
  const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(user.username);
  if (!exists) {
    // Hash password if not already hashed
    let hashedPassword = user.password;
    if (!user.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(user.password, salt);
    }
    db.prepare('INSERT INTO users (user_id, username, password, role) VALUES (?, ?, ?, ?)').run(
      user.user_id, user.username, hashedPassword, user.role
    );
  }
});

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

// Role-based access control middleware
function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    logAudit('login_failed', { username });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    logAudit('login_failed', { username });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  logAudit('login_success', { username });
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

const classSchema = Joi.object({
  class_id: Joi.string(),
  name: Joi.string().min(1).required(),
  teacher_id: Joi.string().optional().allow(null, '')
});

const subjectSchema = Joi.object({
  subject_id: Joi.string(),
  name: Joi.string().min(1).required(),
  description: Joi.string().optional().allow('')
});

const studentClassSchema = Joi.object({
  student_id: Joi.string().required(),
  class_id: Joi.string().required()
});

const classSubjectSchema = Joi.object({
  class_id: Joi.string().required(),
  subject_id: Joi.string().required(),
  teacher_id: Joi.string().optional().allow(null, '')
});

// Valid roles
const VALID_ROLES = ['admin', 'teacher', 'student', 'parent'];

// User validation schema
const userSchema = Joi.object({
  user_id: Joi.string(),
  username: Joi.string().min(2).required(),
  password: Joi.string().min(6), // required on create, optional on update
  role: Joi.string().valid(...VALID_ROLES).required(),
  active: Joi.boolean().optional()
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
app.get('/students', requireRole(['admin', 'teacher']), (req, res) => {
  const { page = 1, pageSize = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const searchQuery = `%${search}%`;
  try {
    const students = db.prepare(`SELECT * FROM students WHERE (full_name LIKE ? OR email LIKE ?) AND (active IS NULL OR active = 1) LIMIT ? OFFSET ?`).all(searchQuery, searchQuery, pageSize, offset);
    res.json(apiSuccess(students));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch students'));
  }
});

app.post('/students', requireRole(['admin']), (req, res) => {
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
    logAudit('student_create', student);
    res.status(201).json(apiSuccess(student));
  } catch (err) {
    res.status(400).json(apiError('Failed to add student', err.message));
  }
});

app.put('/students/:id', requireRole(['admin']), (req, res) => {
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
    logAudit('student_update', updated);
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(400).json(apiError('Failed to update student', err.message));
  }
});

// Soft delete: mark as inactive
app.delete('/students/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  try {
    db.prepare('UPDATE students SET active = 0 WHERE student_id = ?').run(id);
    logAudit('student_delete', { student_id: id });
    res.json(apiSuccess({ ...student, active: 0 }));
  } catch (err) {
    res.status(400).json(apiError('Failed to delete student', err.message));
  }
});

// Teachers CRUD
app.get('/teachers', requireRole(['admin', 'teacher']), (req, res) => {
  const { page = 1, pageSize = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const searchQuery = `%${search}%`;
  try {
    const teachers = db.prepare(`SELECT * FROM teachers WHERE (full_name LIKE ? OR email LIKE ?) AND (active IS NULL OR active = 1) LIMIT ? OFFSET ?`).all(searchQuery, searchQuery, pageSize, offset);
    res.json(apiSuccess(teachers));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch teachers'));
  }
});

app.post('/teachers', requireRole(['admin']), (req, res) => {
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
    logAudit('teacher_create', teacher);
    res.status(201).json(apiSuccess(teacher));
  } catch (err) {
    res.status(400).json(apiError('Failed to add teacher', err.message));
  }
});

app.put('/teachers/:id', requireRole(['admin']), (req, res) => {
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
    logAudit('teacher_update', updated);
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(400).json(apiError('Failed to update teacher', err.message));
  }
});

// Soft delete: mark as inactive
app.delete('/teachers/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const teacher = db.prepare('SELECT * FROM teachers WHERE teacher_id = ?').get(id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  try {
    db.prepare('UPDATE teachers SET active = 0 WHERE teacher_id = ?').run(id);
    logAudit('teacher_delete', { teacher_id: id });
    res.json(apiSuccess({ ...teacher, active: 0 }));
  } catch (err) {
    res.status(400).json(apiError('Failed to delete teacher', err.message));
  }
});

// Classes CRUD
app.get('/classes', requireRole(['admin', 'teacher']), (req, res) => {
  const { page = 1, pageSize = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const searchQuery = `%${search}%`;
  try {
    const classes = db.prepare(`SELECT * FROM classes WHERE name LIKE ? LIMIT ? OFFSET ?`).all(searchQuery, pageSize, offset);
    res.json(apiSuccess(classes));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch classes'));
  }
});

app.post('/classes', requireRole(['admin']), (req, res) => {
  const { error } = classSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const classObj = { ...req.body, class_id: req.body.class_id || Date.now().toString() };
  try {
    db.prepare('INSERT INTO classes (class_id, name, teacher_id) VALUES (?, ?, ?)').run(
      classObj.class_id,
      classObj.name,
      classObj.teacher_id || null
    );
    logAudit('class_create', classObj);
    res.status(201).json(apiSuccess(classObj));
  } catch (err) {
    res.status(400).json(apiError('Failed to add class', err.message));
  }
});

app.put('/classes/:id', requireRole(['admin']), (req, res) => {
  const { error } = classSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const id = req.params.id;
  const classObj = db.prepare('SELECT * FROM classes WHERE class_id = ?').get(id);
  if (!classObj) return res.status(404).json({ error: 'Class not found' });
  const updated = { ...classObj, ...req.body };
  try {
    db.prepare('UPDATE classes SET name = ?, teacher_id = ? WHERE class_id = ?').run(
      updated.name,
      updated.teacher_id || null,
      id
    );
    logAudit('class_update', updated);
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(400).json(apiError('Failed to update class', err.message));
  }
});

app.delete('/classes/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const classObj = db.prepare('SELECT * FROM classes WHERE class_id = ?').get(id);
  if (!classObj) return res.status(404).json({ error: 'Class not found' });
  try {
    db.prepare('DELETE FROM classes WHERE class_id = ?').run(id);
    logAudit('class_delete', { class_id: id });
    res.json(apiSuccess(classObj));
  } catch (err) {
    res.status(400).json(apiError('Failed to delete class', err.message));
  }
});

// Subjects CRUD
app.get('/subjects', requireRole(['admin', 'teacher']), (req, res) => {
  const { page = 1, pageSize = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const searchQuery = `%${search}%`;
  try {
    const subjects = db.prepare(`SELECT * FROM subjects WHERE name LIKE ? LIMIT ? OFFSET ?`).all(searchQuery, pageSize, offset);
    res.json(apiSuccess(subjects));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch subjects'));
  }
});

app.post('/subjects', requireRole(['admin']), (req, res) => {
  const { error } = subjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const subject = { ...req.body, subject_id: req.body.subject_id || Date.now().toString() };
  try {
    db.prepare('INSERT INTO subjects (subject_id, name, description) VALUES (?, ?, ?)').run(
      subject.subject_id,
      subject.name,
      subject.description || ''
    );
    logAudit('subject_create', subject);
    res.status(201).json(apiSuccess(subject));
  } catch (err) {
    res.status(400).json(apiError('Failed to add subject', err.message));
  }
});

app.put('/subjects/:id', requireRole(['admin']), (req, res) => {
  const { error } = subjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const id = req.params.id;
  const subject = db.prepare('SELECT * FROM subjects WHERE subject_id = ?').get(id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  const updated = { ...subject, ...req.body };
  try {
    db.prepare('UPDATE subjects SET name = ?, description = ? WHERE subject_id = ?').run(
      updated.name,
      updated.description || '',
      id
    );
    logAudit('subject_update', updated);
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(400).json(apiError('Failed to update subject', err.message));
  }
});

app.delete('/subjects/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const subject = db.prepare('SELECT * FROM subjects WHERE subject_id = ?').get(id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  try {
    db.prepare('DELETE FROM subjects WHERE subject_id = ?').run(id);
    logAudit('subject_delete', { subject_id: id });
    res.json(apiSuccess(subject));
  } catch (err) {
    res.status(400).json(apiError('Failed to delete subject', err.message));
  }
});

// Admin: Create user
app.post('/users', requireRole(['admin']), async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { username, password, role } = req.body;
  const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (exists) return res.status(400).json({ error: 'Username already exists' });
  const user_id = req.body.user_id || Date.now().toString();
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    db.prepare('INSERT INTO users (user_id, username, password, role, active) VALUES (?, ?, ?, ?, 1)').run(
      user_id, username, hashedPassword, role
    );
    logAudit('user_create', { user_id, username, role, active: 1 });
    res.status(201).json(apiSuccess({ user_id, username, role, active: 1 }));
  } catch (err) {
    res.status(400).json(apiError('Failed to create user', err.message));
  }
});

// Admin: Update user (role, active, password)
app.put('/users/:id', requireRole(['admin']), async (req, res) => {
  const { error } = userSchema.fork(['password'], field => field.optional()).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const id = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const updated = { ...user, ...req.body };
  let hashedPassword = user.password;
  if (req.body.password) {
    hashedPassword = await bcrypt.hash(req.body.password, 10);
  }
  try {
    db.prepare('UPDATE users SET username = ?, password = ?, role = ?, active = ? WHERE user_id = ?').run(
      updated.username,
      hashedPassword,
      updated.role,
      updated.active !== undefined ? (updated.active ? 1 : 0) : user.active,
      id
    );
    logAudit('user_update', updated);
    res.json(apiSuccess({ user_id: id, username: updated.username, role: updated.role, active: updated.active !== undefined ? updated.active : user.active }));
  } catch (err) {
    res.status(400).json(apiError('Failed to update user', err.message));
  }
});

// Admin: Deactivate user
app.delete('/users/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  try {
    db.prepare('UPDATE users SET active = 0 WHERE user_id = ?').run(id);
    logAudit('user_delete', { user_id: id });
    res.json(apiSuccess({ user_id: id, deactivated: true }));
  } catch (err) {
    res.status(400).json(apiError('Failed to deactivate user', err.message));
  }
});

// --- Student-Class Assignment ---
// Assign student to class
app.post('/student-classes', requireRole(['admin']), (req, res) => {
  const { error } = studentClassSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { student_id, class_id } = req.body;
  try {
    db.prepare('INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)').run(student_id, class_id);
    logAudit('student_class_assign', { student_id, class_id });
    res.status(201).json(apiSuccess({ student_id, class_id }));
  } catch (err) {
    res.status(400).json(apiError('Failed to assign student to class', err.message));
  }
});

// Unassign student from class
app.delete('/student-classes', requireRole(['admin']), (req, res) => {
  const { error } = studentClassSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { student_id, class_id } = req.body;
  try {
    db.prepare('DELETE FROM student_classes WHERE student_id = ? AND class_id = ?').run(student_id, class_id);
    logAudit('student_class_unassign', { student_id, class_id });
    res.json(apiSuccess({ student_id, class_id, unassigned: true }));
  } catch (err) {
    res.status(400).json(apiError('Failed to unassign student from class', err.message));
  }
});

// List all students in a class
app.get('/classes/:id/students', requireRole(['admin', 'teacher']), (req, res) => {
  const class_id = req.params.id;
  try {
    const students = db.prepare(`SELECT s.* FROM students s JOIN student_classes sc ON s.student_id = sc.student_id WHERE sc.class_id = ?`).all(class_id);
    res.json(apiSuccess(students));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch students for class'));
  }
});

// List all classes for a student
app.get('/students/:id/classes', requireRole(['admin', 'teacher', 'student', 'parent']), (req, res) => {
  const student_id = req.params.id;
  try {
    const classes = db.prepare(`SELECT c.* FROM classes c JOIN student_classes sc ON c.class_id = sc.class_id WHERE sc.student_id = ?`).all(student_id);
    res.json(apiSuccess(classes));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch classes for student'));
  }
});

// --- Class-Subject-Teacher Assignment ---
// Assign subject (and teacher) to class
app.post('/class-subjects', requireRole(['admin']), (req, res) => {
  const { error } = classSubjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { class_id, subject_id, teacher_id } = req.body;
  try {
    db.prepare('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)').run(class_id, subject_id, teacher_id || null);
    logAudit('class_subject_assign', { class_id, subject_id, teacher_id });
    res.status(201).json(apiSuccess({ class_id, subject_id, teacher_id }));
  } catch (err) {
    res.status(400).json(apiError('Failed to assign subject to class', err.message));
  }
});

// Unassign subject from class
app.delete('/class-subjects', requireRole(['admin']), (req, res) => {
  const { error } = classSubjectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { class_id, subject_id } = req.body;
  try {
    db.prepare('DELETE FROM class_subjects WHERE class_id = ? AND subject_id = ?').run(class_id, subject_id);
    logAudit('class_subject_unassign', { class_id, subject_id });
    res.json(apiSuccess({ class_id, subject_id, unassigned: true }));
  } catch (err) {
    res.status(400).json(apiError('Failed to unassign subject from class', err.message));
  }
});

// List all subjects (with teachers) in a class
app.get('/classes/:id/subjects', requireRole(['admin', 'teacher']), (req, res) => {
  const class_id = req.params.id;
  try {
    const subjects = db.prepare(`SELECT s.*, cs.teacher_id, t.full_name as teacher_name FROM subjects s JOIN class_subjects cs ON s.subject_id = cs.subject_id LEFT JOIN teachers t ON cs.teacher_id = t.teacher_id WHERE cs.class_id = ?`).all(class_id);
    res.json(apiSuccess(subjects));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch subjects for class'));
  }
});

// List all classes for a subject
app.get('/subjects/:id/classes', requireRole(['admin', 'teacher']), (req, res) => {
  const subject_id = req.params.id;
  try {
    const classes = db.prepare(`SELECT c.* FROM classes c JOIN class_subjects cs ON c.class_id = cs.class_id WHERE cs.subject_id = ?`).all(subject_id);
    res.json(apiSuccess(classes));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch classes for subject'));
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'EduLite Nexus API',
    version: '1.0.0',
    description: 'API documentation for the School Management System backend.'
  },
  servers: [
    { url: 'http://localhost:' + PORT }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EduLite Nexus Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app; 