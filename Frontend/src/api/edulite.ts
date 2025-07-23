import students from '../data/students.json';
import teachers from '../data/teachers.json';
import subjects from '../data/subjects.json';
import classes from '../data/classes.json';
import homework from '../data/homework.json';
import users from '../data/users.json';
import { mockGradesByStudent } from '../data/mockData';

function simulateLatency(result, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

function success(data) {
  return { status: 'success', data, error: null };
}

function fail(error) {
  return { status: 'error', data: null, error };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  error: string | null;
}

// Students
export async function getStudents() {
  return simulateLatency(success(students));
}

export async function getStudentById(id) {
  const student = students.find(s => s.student_id === id);
  return simulateLatency(student ? success(student) : fail('Student not found'));
}

const studentsData = [...students];

export async function addStudent(newStudent) {
  studentsData.push(newStudent);
  return simulateLatency(success(newStudent));
}

export async function updateStudent(updatedStudent) {
  const idx = studentsData.findIndex(s => s.student_id === updatedStudent.student_id);
  if (idx !== -1) {
    studentsData[idx] = { ...studentsData[idx], ...updatedStudent };
    return simulateLatency(success(studentsData[idx]));
  }
  return simulateLatency(fail('Student not found'));
}

export async function deleteStudent(studentId) {
  const idx = studentsData.findIndex(s => s.student_id === studentId);
  if (idx !== -1) {
    const deleted = studentsData.splice(idx, 1)[0];
    return simulateLatency(success(deleted));
  }
  return simulateLatency(fail('Student not found'));
}

// Teachers
export async function getTeachers() {
  return simulateLatency(success(teachers));
}

export async function getTeacherById(id) {
  const teacher = teachers.find(t => t.teacher_id === id);
  return simulateLatency(teacher ? success(teacher) : fail('Teacher not found'));
}

// Subjects
export async function getSubjects() {
  return simulateLatency(success(subjects));
}

// Classes
export async function getClasses() {
  return simulateLatency(success(classes));
}

// Homework
export async function getHomework() {
  return simulateLatency(success(homework));
}

const homeworkData = [...homework];

export async function addHomework(newHomework) {
  homeworkData.push(newHomework);
  return simulateLatency(success(newHomework));
}

export async function updateHomework(updatedHomework) {
  const idx = homeworkData.findIndex(hw => hw.homework_id === updatedHomework.homework_id);
  if (idx !== -1) {
    homeworkData[idx] = { ...homeworkData[idx], ...updatedHomework };
    return simulateLatency(success(homeworkData[idx]));
  }
  return simulateLatency(fail('Homework not found'));
}

export async function deleteHomework(homeworkId) {
  const idx = homeworkData.findIndex(hw => hw.homework_id === homeworkId);
  if (idx !== -1) {
    const deleted = homeworkData.splice(idx, 1)[0];
    return simulateLatency(success(deleted));
  }
  return simulateLatency(fail('Homework not found'));
}

// Users/Auth
export async function login(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userData } = user;
    return simulateLatency(success({ token: 'mock-token', user: userData, role: user.role }));
  }
  return simulateLatency(fail('Invalid credentials'));
}

export async function getGradesByStudentId(studentId) {
  const grades = mockGradesByStudent[studentId] || [];
  return simulateLatency(success(grades));
}

// Add more CRUD as needed for demo (add, update, delete) for students, teachers, homework, etc. 