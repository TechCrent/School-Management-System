// Environment variable validation - MUST BE FIRST
require('dotenv').config();

const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please create a .env file with the following variables:');
  missingVars.forEach(varName => {
    console.error(`  ${varName}=your-secret-value`);
  });
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
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
  CREATE TABLE IF NOT EXISTS homework (
    homework_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    teacher_id TEXT NOT NULL,
    class_id TEXT,
    subject_id TEXT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
  );
  CREATE TABLE IF NOT EXISTS homework_submissions (
    submission_id TEXT PRIMARY KEY,
    homework_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'submitted',
    grade TEXT,
    feedback TEXT,
    graded_at TEXT,
    graded_by TEXT,
    FOREIGN KEY (homework_id) REFERENCES homework(homework_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (graded_by) REFERENCES teachers(teacher_id)
  );
  CREATE TABLE IF NOT EXISTS attendance (
    attendance_id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  );
  CREATE TABLE IF NOT EXISTS class_materials (
    material_id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_type TEXT,
    file_url TEXT,
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    file_size TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (uploaded_by) REFERENCES teachers(teacher_id)
  );
  CREATE TABLE IF NOT EXISTS class_announcements (
    announcement_id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    created_by TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (created_by) REFERENCES teachers(teacher_id)
  );
  CREATE TABLE IF NOT EXISTS student_notes (
    note_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    note_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_private INTEGER DEFAULT 0,
    tags TEXT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
  );
  CREATE TABLE IF NOT EXISTS student_performance (
    performance_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    semester TEXT NOT NULL,
    overall_grade TEXT,
    gpa REAL,
    attendance_rate REAL,
    homework_completion_rate REAL,
    participation_score REAL,
    last_updated TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
  );
`);

// Insert demo users if not present
const demoUsers = [
  { user_id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { user_id: '2', username: 'teacher', password: 'teacher123', role: 'teacher' }
];

// Use synchronous password hashing for demo users
demoUsers.forEach(user => {
  const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(user.username);
  if (!exists) {
    // For demo purposes, use a simple hash (in production, use proper async hashing)
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.prepare('INSERT INTO users (user_id, username, password, role) VALUES (?, ?, ?, ?)').run(
      user.user_id, user.username, hashedPassword, user.role
    );
  }
});

// Insert sample data for testing
const sampleTeachers = [
  { teacher_id: 'T001', full_name: 'John Smith', email: 'john.smith@school.edu', subject: 'Mathematics' },
  { teacher_id: 'T002', full_name: 'Sarah Johnson', email: 'sarah.johnson@school.edu', subject: 'English' },
  { teacher_id: 'T003', full_name: 'Michael Brown', email: 'michael.brown@school.edu', subject: 'Science' }
];

const sampleStudents = [
  { student_id: 'S001', full_name: 'Alice Johnson', email: 'alice.johnson@student.edu', grade: '10th Grade' },
  { student_id: 'S002', full_name: 'Bob Wilson', email: 'bob.wilson@student.edu', grade: '10th Grade' },
  { student_id: 'S003', full_name: 'Carol Davis', email: 'carol.davis@student.edu', grade: '11th Grade' }
];

const sampleClasses = [
  { class_id: 'C001', name: 'Advanced Mathematics', teacher_id: 'T001' },
  { class_id: 'C002', name: 'English Literature', teacher_id: 'T002' },
  { class_id: 'C003', name: 'Physics', teacher_id: 'T003' }
];

const sampleSubjects = [
  { subject_id: 'SUB001', name: 'Mathematics', description: 'Advanced mathematical concepts' },
  { subject_id: 'SUB002', name: 'English', description: 'Literature and composition' },
  { subject_id: 'SUB003', name: 'Physics', description: 'Physical sciences' }
];

const sampleHomework = [
  { 
    homework_id: 'HW001', 
    title: 'Algebra Practice', 
    description: 'Complete problems 1-20 in Chapter 3', 
    due_date: '2024-01-15', 
    created_at: '2024-01-10', 
    status: 'active', 
    teacher_id: 'T001', 
    class_id: 'C001', 
    subject_id: 'SUB001' 
  },
  { 
    homework_id: 'HW002', 
    title: 'Essay Writing', 
    description: 'Write a 500-word essay on Shakespeare', 
    due_date: '2024-01-20', 
    created_at: '2024-01-12', 
    status: 'active', 
    teacher_id: 'T002', 
    class_id: 'C002', 
    subject_id: 'SUB002' 
  }
];

// Insert sample data if not exists
sampleTeachers.forEach(teacher => {
  const exists = db.prepare('SELECT * FROM teachers WHERE teacher_id = ?').get(teacher.teacher_id);
  if (!exists) {
    db.prepare('INSERT INTO teachers (teacher_id, full_name, email, subject) VALUES (?, ?, ?, ?)').run(
      teacher.teacher_id, teacher.full_name, teacher.email, teacher.subject
    );
  }
});

sampleStudents.forEach(student => {
  const exists = db.prepare('SELECT * FROM students WHERE student_id = ?').get(student.student_id);
  if (!exists) {
    db.prepare('INSERT INTO students (student_id, full_name, email, grade) VALUES (?, ?, ?, ?)').run(
      student.student_id, student.full_name, student.email, student.grade
    );
  }
});

sampleClasses.forEach(cls => {
  const exists = db.prepare('SELECT * FROM classes WHERE class_id = ?').get(cls.class_id);
  if (!exists) {
    db.prepare('INSERT INTO classes (class_id, name, teacher_id) VALUES (?, ?, ?)').run(
      cls.class_id, cls.name, cls.teacher_id
    );
  }
});

sampleSubjects.forEach(subject => {
  const exists = db.prepare('SELECT * FROM subjects WHERE subject_id = ?').get(subject.subject_id);
  if (!exists) {
    db.prepare('INSERT INTO subjects (subject_id, name, description) VALUES (?, ?, ?)').run(
      subject.subject_id, subject.name, subject.description
    );
  }
});

sampleHomework.forEach(hw => {
  const exists = db.prepare('SELECT * FROM homework WHERE homework_id = ?').get(hw.homework_id);
  if (!exists) {
    db.prepare('INSERT INTO homework (homework_id, title, description, due_date, created_at, status, teacher_id, class_id, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      hw.homework_id, hw.title, hw.description, hw.due_date, hw.created_at, hw.status, hw.teacher_id, hw.class_id, hw.subject_id
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

const homeworkSchema = Joi.object({
  homework_id: Joi.string(),
  title: Joi.string().min(1).required(),
  description: Joi.string().optional().allow(''),
  due_date: Joi.string().required(),
  created_at: Joi.string().optional(),
  status: Joi.string().valid('pending', 'active', 'closed').default('pending'),
  teacher_id: Joi.string().required(),
  class_id: Joi.string().optional().allow(null, ''),
  subject_id: Joi.string().optional().allow(null, '')
});

const homeworkSubmissionSchema = Joi.object({
  submission_id: Joi.string(),
  homework_id: Joi.string().required(),
  student_id: Joi.string().required(),
  submitted_at: Joi.string().optional(),
  content: Joi.string().optional().allow(''),
  status: Joi.string().valid('submitted', 'graded', 'late').default('submitted'),
  grade: Joi.string().optional().allow(null, ''),
  feedback: Joi.string().optional().allow(null, ''),
  graded_at: Joi.string().optional().allow(null, ''),
  graded_by: Joi.string().optional().allow(null, '')
});

const attendanceSchema = Joi.object({
  attendance_id: Joi.string(),
  class_id: Joi.string().required(),
  student_id: Joi.string().required(),
  date: Joi.string().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  notes: Joi.string().optional().allow('')
});

const classMaterialSchema = Joi.object({
  material_id: Joi.string(),
  class_id: Joi.string().required(),
  title: Joi.string().min(1).required(),
  description: Joi.string().optional().allow(''),
  file_type: Joi.string().optional().allow(''),
  file_url: Joi.string().optional().allow(''),
  uploaded_at: Joi.string().optional(),
  uploaded_by: Joi.string().required(),
  file_size: Joi.string().optional().allow('')
});

const classAnnouncementSchema = Joi.object({
  announcement_id: Joi.string(),
  class_id: Joi.string().required(),
  title: Joi.string().min(1).required(),
  content: Joi.string().min(1).required(),
  created_at: Joi.string().optional(),
  created_by: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  is_active: Joi.boolean().default(true)
});

const studentNoteSchema = Joi.object({
  note_id: Joi.string(),
  student_id: Joi.string().required(),
  teacher_id: Joi.string().required(),
  note_type: Joi.string().valid('observation', 'concern', 'improvement', 'achievement', 'behavior').required(),
  title: Joi.string().min(1).required(),
  content: Joi.string().min(1).required(),
  created_at: Joi.string().optional(),
  is_private: Joi.boolean().default(false),
  tags: Joi.string().optional().allow('')
});

const studentPerformanceSchema = Joi.object({
  performance_id: Joi.string(),
  student_id: Joi.string().required(),
  class_id: Joi.string().required(),
  subject_id: Joi.string().required(),
  semester: Joi.string().required(),
  overall_grade: Joi.string().optional().allow(''),
  gpa: Joi.number().min(0).max(4).optional(),
  attendance_rate: Joi.number().min(0).max(100).optional(),
  homework_completion_rate: Joi.number().min(0).max(100).optional(),
  participation_score: Joi.number().min(0).max(100).optional(),
  last_updated: Joi.string().optional()
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

// Health check endpoint (unprotected)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
    const students = db.prepare(`SELECT * FROM students WHERE (full_name LIKE ? OR email LIKE ?) LIMIT ? OFFSET ?`).all(searchQuery, searchQuery, pageSize, offset);
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

// Hard delete: remove from database
app.delete('/students/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  try {
    db.prepare('DELETE FROM students WHERE student_id = ?').run(id);
    logAudit('student_delete', { student_id: id });
    res.json(apiSuccess({ message: 'Student deleted successfully' }));
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
    const teachers = db.prepare(`SELECT * FROM teachers WHERE (full_name LIKE ? OR email LIKE ?) LIMIT ? OFFSET ?`).all(searchQuery, searchQuery, pageSize, offset);
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

// Hard delete: remove from database
app.delete('/teachers/:id', requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const teacher = db.prepare('SELECT * FROM teachers WHERE teacher_id = ?').get(id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  try {
    db.prepare('DELETE FROM teachers WHERE teacher_id = ?').run(id);
    logAudit('teacher_delete', { teacher_id: id });
    res.json(apiSuccess({ message: 'Teacher deleted successfully' }));
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

// Homework CRUD
app.get('/homework', requireRole(['admin', 'teacher']), (req, res) => {
  const { page = 1, pageSize = 20, search = '', teacher_id = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const searchQuery = `%${search}%`;
  try {
    let query = 'SELECT * FROM homework WHERE (title LIKE ? OR description LIKE ?)';
    let params = [searchQuery, searchQuery];
    
    // Filter by teacher if specified
    if (teacher_id) {
      query += ' AND teacher_id = ?';
      params.push(teacher_id);
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
    
    const homework = db.prepare(query).all(...params);
    res.json(apiSuccess(homework));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch homework'));
  }
});

app.post('/homework', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = homeworkSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const homework = { 
    ...req.body, 
    homework_id: req.body.homework_id || Date.now().toString(),
    created_at: req.body.created_at || new Date().toISOString()
  };
  try {
    db.prepare(`INSERT INTO homework (homework_id, title, description, due_date, created_at, status, teacher_id, class_id, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      homework.homework_id,
      homework.title,
      homework.description || '',
      homework.due_date,
      homework.created_at,
      homework.status || 'pending',
      homework.teacher_id,
      homework.class_id || null,
      homework.subject_id || null
    );
    logAudit('homework_create', homework);
    res.status(201).json(apiSuccess(homework));
  } catch (err) {
    res.status(400).json(apiError('Failed to add homework', err.message));
  }
});

app.put('/homework/:id', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = homeworkSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const id = req.params.id;
  const homework = db.prepare('SELECT * FROM homework WHERE homework_id = ?').get(id);
  if (!homework) return res.status(404).json({ error: 'Homework not found' });
  const updated = { ...homework, ...req.body };
  try {
    db.prepare(`UPDATE homework SET title = ?, description = ?, due_date = ?, status = ?, class_id = ?, subject_id = ? WHERE homework_id = ?`).run(
      updated.title,
      updated.description || '',
      updated.due_date,
      updated.status || 'pending',
      updated.class_id || null,
      updated.subject_id || null,
      id
    );
    logAudit('homework_update', updated);
    res.json(apiSuccess(updated));
  } catch (err) {
    res.status(400).json(apiError('Failed to update homework', err.message));
  }
});

app.delete('/homework/:id', requireRole(['admin', 'teacher']), (req, res) => {
  const id = req.params.id;
  const homework = db.prepare('SELECT * FROM homework WHERE homework_id = ?').get(id);
  if (!homework) return res.status(404).json({ error: 'Homework not found' });
  try {
    db.prepare('DELETE FROM homework WHERE homework_id = ?').run(id);
    logAudit('homework_delete', { homework_id: id });
    res.json(apiSuccess(homework));
  } catch (err) {
    res.status(400).json(apiError('Failed to delete homework', err.message));
  }
});

// Homework Submissions
app.get('/homework/:id/submissions', requireRole(['admin', 'teacher']), (req, res) => {
  const homeworkId = req.params.id;
  try {
    const submissions = db.prepare('SELECT * FROM homework_submissions WHERE homework_id = ?').all(homeworkId);
    res.json(apiSuccess(submissions));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch homework submissions'));
  }
});

app.post('/homework/:id/submissions', requireRole(['student']), (req, res) => {
  const { error } = homeworkSubmissionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const submission = { 
    ...req.body, 
    submission_id: req.body.submission_id || Date.now().toString(),
    submitted_at: req.body.submitted_at || new Date().toISOString(),
    homework_id: req.params.id
  };
  try {
    db.prepare(`INSERT INTO homework_submissions (submission_id, homework_id, student_id, submitted_at, content, status) VALUES (?, ?, ?, ?, ?, ?)`).run(
      submission.submission_id,
      submission.homework_id,
      submission.student_id,
      submission.submitted_at,
      submission.content || '',
      submission.status || 'submitted'
    );
    logAudit('homework_submission_create', submission);
    res.status(201).json(apiSuccess(submission));
  } catch (err) {
    res.status(400).json(apiError('Failed to submit homework', err.message));
  }
});

app.put('/submissions/:id/grade', requireRole(['admin', 'teacher']), (req, res) => {
  const { grade, feedback } = req.body;
  const submissionId = req.params.id;
  const submission = db.prepare('SELECT * FROM homework_submissions WHERE submission_id = ?').get(submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  
  try {
    db.prepare(`UPDATE homework_submissions SET grade = ?, feedback = ?, status = 'graded', graded_at = ?, graded_by = ? WHERE submission_id = ?`).run(
      grade || null,
      feedback || null,
      new Date().toISOString(),
      req.user.username,
      submissionId
    );
    logAudit('homework_submission_grade', { submission_id: submissionId, grade, feedback });
    res.json(apiSuccess({ submission_id: submissionId, grade, feedback, status: 'graded' }));
  } catch (err) {
    res.status(400).json(apiError('Failed to grade submission', err.message));
  }
});

// Teacher-specific endpoints
app.get('/teacher/:id/dashboard', requireRole(['admin', 'teacher']), (req, res) => {
  const teacherId = req.params.id;
  try {
    // Get teacher's classes
    const classes = db.prepare('SELECT * FROM classes WHERE teacher_id = ?').all(teacherId);
    
    // Get teacher's homework
    const homework = db.prepare('SELECT * FROM homework WHERE teacher_id = ?').all(teacherId);
    
    // Get pending submissions
    const pendingSubmissions = db.prepare(`
      SELECT COUNT(*) as count FROM homework_submissions hs 
      JOIN homework h ON hs.homework_id = h.homework_id 
      WHERE h.teacher_id = ? AND hs.status = 'submitted'
    `).get(teacherId);
    
    // Get total students
    const totalStudents = db.prepare(`
      SELECT COUNT(DISTINCT sc.student_id) as count 
      FROM student_classes sc 
      JOIN classes c ON sc.class_id = c.class_id 
      WHERE c.teacher_id = ?
    `).get(teacherId);
    
    res.json(apiSuccess({
      classes: classes.length,
      homework: homework.length,
      pendingSubmissions: pendingSubmissions.count,
      totalStudents: totalStudents.count
    }));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch teacher dashboard data'));
  }
});

// Attendance management
app.get('/classes/:id/attendance', requireRole(['admin', 'teacher']), (req, res) => {
  const classId = req.params.id;
  const { date } = req.query;
  try {
    let query = 'SELECT a.*, s.full_name as student_name FROM attendance a JOIN students s ON a.student_id = s.student_id WHERE a.class_id = ?';
    let params = [classId];
    
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    
    const attendance = db.prepare(query).all(...params);
    res.json(apiSuccess(attendance));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch attendance'));
  }
});

app.post('/classes/:id/attendance', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = attendanceSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const attendance = { 
    ...req.body, 
    attendance_id: req.body.attendance_id || Date.now().toString(),
    class_id: req.params.id
  };
  try {
    db.prepare(`INSERT INTO attendance (attendance_id, class_id, student_id, date, status, notes) VALUES (?, ?, ?, ?, ?, ?)`).run(
      attendance.attendance_id,
      attendance.class_id,
      attendance.student_id,
      attendance.date,
      attendance.status,
      attendance.notes || ''
    );
    logAudit('attendance_create', attendance);
    res.status(201).json(apiSuccess(attendance));
  } catch (err) {
    res.status(400).json(apiError('Failed to mark attendance', err.message));
  }
});

// Class materials
app.get('/classes/:id/materials', requireRole(['admin', 'teacher']), (req, res) => {
  const classId = req.params.id;
  try {
    const materials = db.prepare('SELECT * FROM class_materials WHERE class_id = ? ORDER BY uploaded_at DESC').all(classId);
    res.json(apiSuccess(materials));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch class materials'));
  }
});

app.post('/classes/:id/materials', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = classMaterialSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const material = { 
    ...req.body, 
    material_id: req.body.material_id || Date.now().toString(),
    class_id: req.params.id,
    uploaded_at: req.body.uploaded_at || new Date().toISOString()
  };
  try {
    db.prepare(`INSERT INTO class_materials (material_id, class_id, title, description, file_type, file_url, uploaded_at, uploaded_by, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      material.material_id,
      material.class_id,
      material.title,
      material.description || '',
      material.file_type || '',
      material.file_url || '',
      material.uploaded_at,
      material.uploaded_by,
      material.file_size || ''
    );
    logAudit('class_material_create', material);
    res.status(201).json(apiSuccess(material));
  } catch (err) {
    res.status(400).json(apiError('Failed to add class material', err.message));
  }
});

// Class announcements
app.get('/classes/:id/announcements', requireRole(['admin', 'teacher']), (req, res) => {
  const classId = req.params.id;
  try {
    const announcements = db.prepare('SELECT * FROM class_announcements WHERE class_id = ? AND is_active = 1 ORDER BY created_at DESC').all(classId);
    res.json(apiSuccess(announcements));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch class announcements'));
  }
});

app.post('/classes/:id/announcements', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = classAnnouncementSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const announcement = { 
    ...req.body, 
    announcement_id: req.body.announcement_id || Date.now().toString(),
    class_id: req.params.id,
    created_at: req.body.created_at || new Date().toISOString()
  };
  try {
    db.prepare(`INSERT INTO class_announcements (announcement_id, class_id, title, content, created_at, created_by, priority, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      announcement.announcement_id,
      announcement.class_id,
      announcement.title,
      announcement.content,
      announcement.created_at,
      announcement.created_by,
      announcement.priority || 'medium',
      1
    );
    logAudit('class_announcement_create', announcement);
    res.status(201).json(apiSuccess(announcement));
  } catch (err) {
    res.status(400).json(apiError('Failed to add class announcement', err.message));
  }
});

// Student notes
app.get('/students/:id/notes', requireRole(['admin', 'teacher']), (req, res) => {
  const studentId = req.params.id;
  try {
    const notes = db.prepare('SELECT * FROM student_notes WHERE student_id = ? ORDER BY created_at DESC').all(studentId);
    res.json(apiSuccess(notes));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch student notes'));
  }
});

app.post('/students/:id/notes', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = studentNoteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const note = { 
    ...req.body, 
    note_id: req.body.note_id || Date.now().toString(),
    student_id: req.params.id,
    created_at: req.body.created_at || new Date().toISOString()
  };
  try {
    db.prepare(`INSERT INTO student_notes (note_id, student_id, teacher_id, note_type, title, content, created_at, is_private, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      note.note_id,
      note.student_id,
      note.teacher_id,
      note.note_type,
      note.title,
      note.content,
      note.created_at,
      note.is_private ? 1 : 0,
      note.tags || ''
    );
    logAudit('student_note_create', note);
    res.status(201).json(apiSuccess(note));
  } catch (err) {
    res.status(400).json(apiError('Failed to add student note', err.message));
  }
});

// Student performance
app.get('/students/:id/performance', requireRole(['admin', 'teacher']), (req, res) => {
  const studentId = req.params.id;
  const { class_id } = req.query;
  try {
    let query = 'SELECT * FROM student_performance WHERE student_id = ?';
    let params = [studentId];
    
    if (class_id) {
      query += ' AND class_id = ?';
      params.push(class_id);
    }
    
    const performance = db.prepare(query).all(...params);
    res.json(apiSuccess(performance));
  } catch (err) {
    res.status(500).json(apiError('Failed to fetch student performance'));
  }
});

app.post('/students/:id/performance', requireRole(['admin', 'teacher']), (req, res) => {
  const { error } = studentPerformanceSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const performance = { 
    ...req.body, 
    performance_id: req.body.performance_id || Date.now().toString(),
    student_id: req.params.id,
    last_updated: req.body.last_updated || new Date().toISOString()
  };
  try {
    db.prepare(`INSERT INTO student_performance (performance_id, student_id, class_id, subject_id, semester, overall_grade, gpa, attendance_rate, homework_completion_rate, participation_score, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      performance.performance_id,
      performance.student_id,
      performance.class_id,
      performance.subject_id,
      performance.semester,
      performance.overall_grade || '',
      performance.gpa || null,
      performance.attendance_rate || null,
      performance.homework_completion_rate || null,
      performance.participation_score || null,
      performance.last_updated
    );
    logAudit('student_performance_create', performance);
    res.status(201).json(apiSuccess(performance));
  } catch (err) {
    res.status(400).json(apiError('Failed to add student performance', err.message));
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
  const server = app.listen(PORT, () => {
    console.log('🚀 EduLite Nexus Backend started successfully!');
    console.log(`📍 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`🔐 JWT Secret: ${JWT_SECRET ? 'Configured' : 'Missing!'}`);
    console.log(`💾 Database: ${process.env.DB_PATH || 'edulite.db'}`);
    console.log('✅ Ready to accept requests...\n');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

module.exports = app; 