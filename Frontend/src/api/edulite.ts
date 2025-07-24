import students from '../data/students.json';
import teachers from '../data/teachers.json';
import subjects from '../data/subjects.json';
import classes from '../data/classes.json';
import homework from '../data/homework.json';
import users from '../data/users.json';
import { mockGradesByStudent } from '../data/mockData';
import { Class, Subject } from '../data/mockData';

function isMockMode() {
  const stored = localStorage.getItem('USE_MOCK');
  return stored === null ? true : stored === 'true';
}

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

const API_URL = 'http://localhost:4000';

let token = localStorage.getItem('token') || '';

export function setToken(newToken: string) {
  token = newToken;
  localStorage.setItem('token', newToken);
}

function getAuthHeaders() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, options: any = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    credentials: 'include',
  });
  const data = await res.json();
  return data;
}

// Students
export async function getStudents(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/students${query ? '?' + query : ''}`);
}

export async function getStudentById(id: string) {
  return apiFetch(`/students/${id}`);
}

export async function addStudent(newStudent: Record<string, unknown>) {
  return apiFetch('/students', {
    method: 'POST',
    body: JSON.stringify(newStudent)
  });
}

export async function updateStudent(updatedStudent: Record<string, unknown>) {
  return apiFetch(`/students/${updatedStudent.student_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedStudent)
  });
}

export async function deleteStudent(studentId: string) {
  return apiFetch(`/students/${studentId}`, {
    method: 'DELETE'
  });
}

// Teachers
export async function getTeachers(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/teachers${query ? '?' + query : ''}`);
}

export async function getTeacherById(id: string) {
  return apiFetch(`/teachers/${id}`);
}

export async function addTeacher(newTeacher: Record<string, unknown>) {
  return apiFetch('/teachers', {
    method: 'POST',
    body: JSON.stringify(newTeacher)
  });
}

export async function updateTeacher(updatedTeacher: Record<string, unknown>) {
  return apiFetch(`/teachers/${updatedTeacher.teacher_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedTeacher)
  });
}

export async function deleteTeacher(teacherId: string) {
  return apiFetch(`/teachers/${teacherId}`, {
    method: 'DELETE'
  });
}

// Subjects
export async function getSubjects(params: Record<string, string> = {}) {
  if (isMockMode()) {
    const search = params.search?.toLowerCase() || '';
    let filtered = subjects;
    if (search) {
      filtered = filtered.filter((s: Subject) =>
        s.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search)
      );
    }
    return Promise.resolve({ status: 'success', data: filtered, error: null });
  }
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/subjects${query ? '?' + query : ''}`);
}

export async function addSubject(newSubject: Record<string, unknown>) {
  if (isMockMode()) {
    const subject = {
      subject_id: crypto.randomUUID(),
      name: String(newSubject.name || ''),
      description: String(newSubject.description || '')
    };
    subjects.push(subject);
    return Promise.resolve({ status: 'success', data: subject, error: null });
  }
  return apiFetch('/subjects', {
    method: 'POST',
    body: JSON.stringify(newSubject)
  });
}

export async function updateSubject(updatedSubject: Record<string, unknown>) {
  if (isMockMode()) {
    const idx = subjects.findIndex((s: Subject) => s.subject_id === updatedSubject.subject_id);
    if (idx !== -1) subjects[idx] = { ...subjects[idx], ...updatedSubject };
    return Promise.resolve({ status: 'success', data: updatedSubject, error: null });
  }
  return apiFetch(`/subjects/${updatedSubject.subject_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedSubject)
  });
}

export async function deleteSubject(subjectId: string) {
  if (isMockMode()) {
    const idx = subjects.findIndex((s: Subject) => s.subject_id === subjectId);
    if (idx !== -1) subjects.splice(idx, 1);
    return Promise.resolve({ status: 'success', data: null, error: null });
  }
  return apiFetch(`/subjects/${subjectId}`, {
    method: 'DELETE'
  });
}

// Classes
export async function getClasses(params: Record<string, string> = {}) {
  if (isMockMode()) {
    // Simulate search and pagination
    const search = params.search?.toLowerCase() || '';
    let filtered = classes;
    if (search) {
      filtered = filtered.filter((cls: Class) =>
        cls.name.toLowerCase().includes(search)
      );
    }
    return Promise.resolve({ status: 'success', data: filtered, error: null });
  }
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/classes${query ? '?' + query : ''}`);
}

export async function addClass(newClass: Record<string, unknown>) {
  if (isMockMode()) {
    const cls = {
      class_id: crypto.randomUUID(),
      name: String(newClass.name || ''),
      teacher_id: String(newClass.teacher_id || ''),
      subject_id: String(newClass.subject_id || ''),
      schedule: String(newClass.schedule || ''),
      zoom_link: String(newClass.zoom_link || ''),
      student_count: Number(newClass.student_count || 0)
    };
    classes.push(cls);
    return Promise.resolve({ status: 'success', data: cls, error: null });
  }
  return apiFetch('/classes', {
    method: 'POST',
    body: JSON.stringify(newClass)
  });
}

export async function updateClass(updatedClass: Record<string, unknown>) {
  if (isMockMode()) {
    const idx = classes.findIndex((c: Class) => c.class_id === updatedClass.class_id);
    if (idx !== -1) classes[idx] = { ...classes[idx], ...updatedClass };
    return Promise.resolve({ status: 'success', data: updatedClass, error: null });
  }
  return apiFetch(`/classes/${updatedClass.class_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedClass)
  });
}

export async function deleteClass(classId: string) {
  if (isMockMode()) {
    const idx = classes.findIndex((c: Class) => c.class_id === classId);
    if (idx !== -1) classes.splice(idx, 1);
    return Promise.resolve({ status: 'success', data: null, error: null });
  }
  return apiFetch(`/classes/${classId}`, {
    method: 'DELETE'
  });
}

// Homework (if backend supports it)
export async function getHomework(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/homework${query ? '?' + query : ''}`);
}

export async function addHomework(newHomework: Record<string, unknown>) {
  return apiFetch('/homework', {
    method: 'POST',
    body: JSON.stringify(newHomework)
  });
}

export async function updateHomework(updatedHomework: Record<string, unknown>) {
  return apiFetch(`/homework/${updatedHomework.homework_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedHomework)
  });
}

export async function deleteHomework(homeworkId: string) {
  return apiFetch(`/homework/${homeworkId}`, {
    method: 'DELETE'
  });
}

// Users/Auth
export async function login(username: string, password: string) {
  const res = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (res.status === 'success' && res.data.token) {
    setToken(res.data.token);
  }
  return res;
}

export function logout() {
  setToken('');
}

// Grades (if backend supports it)
export async function getGradesByStudentId(studentId: string) {
  return apiFetch(`/students/${studentId}/grades`);
}

// Add more CRUD as needed for demo (add, update, delete) for students, teachers, homework, etc. 