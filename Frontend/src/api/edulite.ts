import students from '../data/students.json';
import teachers from '../data/teachers.json';
import subjects from '../data/subjects.json';
import classes from '../data/classes.json';
import homework from '../data/homework.json';
import users from '../data/users.json';
import { mockGradesByStudent } from '../data/mockData';
import { Class, Subject } from '../data/mockData';
import parents from '../data/parents.json';
import admin from '../data/admin.json';
type Parent = {
  parent_id: string;
  full_name: string;
  email: string;
  phone: string;
  children_ids: string[];
};
type Student = {
  student_id: string;
  full_name: string;
  email: string;
  grade: string;
  date_of_birth: string;
  address: string;
  parent1_id: string;
  parent2_id: string;
};
type Teacher = { teacher_id: string; full_name: string; email: string; subject_name: string; phone?: string };
type HomeworkType = {
  homework_id: string;
  title: string;
  due_date: string;
  status: string;
  subject_id: string;
  description?: string;
  feedback?: string;
};

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

async function apiFetch(path: string, options: RequestInit = {}) {
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
  if (isMockMode()) {
    const search = params.search?.toLowerCase() || '';
    let filtered = students as Student[];
    if (search) {
      filtered = filtered.filter(s =>
        s.full_name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.grade.toLowerCase().includes(search)
      );
    }
    if (params.noPaginate === 'true') {
      return simulateLatency({ status: 'success', data: filtered, total: filtered.length, error: null }, 200);
    }
    const page = parseInt(params.page || '1', 10);
    const pageSize = parseInt(params.pageSize || '20', 10);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    return simulateLatency({ status: 'success', data: paged, total: filtered.length, error: null }, 200);
  }
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
  if (isMockMode()) {
    const search = params.search?.toLowerCase() || '';
    let filtered = teachers as Teacher[];
    if (search) {
      filtered = filtered.filter(t =>
        t.full_name.toLowerCase().includes(search) ||
        t.email.toLowerCase().includes(search) ||
        t.subject_name.toLowerCase().includes(search)
      );
    }
    if (params.noPaginate === 'true') {
      return simulateLatency({ status: 'success', data: filtered, total: filtered.length, error: null }, 200);
    }
    const page = parseInt(params.page || '1', 10);
    const pageSize = parseInt(params.pageSize || '20', 10);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    return simulateLatency({ status: 'success', data: paged, total: filtered.length, error: null }, 200);
  }
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
    if (params.noPaginate === 'true') {
      return simulateLatency({ status: 'success', data: filtered, total: filtered.length, error: null }, 200);
    }
    const page = parseInt(params.page || '1', 10);
    const pageSize = parseInt(params.pageSize || '20', 10);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    return simulateLatency({ status: 'success', data: paged, total: filtered.length, error: null }, 200);
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
    if (params.noPaginate === 'true') {
      return simulateLatency({ status: 'success', data: filtered, total: filtered.length, error: null }, 200);
    }
    const page = parseInt(params.page || '1', 10);
    const pageSize = parseInt(params.pageSize || '20', 10);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    return simulateLatency({ status: 'success', data: paged, total: filtered.length, error: null }, 200);
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
  if (isMockMode()) {
    // Simulate search and pagination
    const search = params.search?.toLowerCase() || '';
    let filtered = homework;
    if (search) {
      filtered = filtered.filter((hw: HomeworkType) =>
        hw.title.toLowerCase().includes(search) ||
        (hw.description && hw.description.toLowerCase().includes(search))
      );
    }
    if (params.noPaginate === 'true') {
      return simulateLatency({ status: 'success', data: filtered, total: filtered.length, error: null }, 200);
    }
    const page = parseInt(params.page || '1', 10);
    const pageSize = parseInt(params.pageSize || '20', 10);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    return simulateLatency({ status: 'success', data: paged, total: filtered.length, error: null }, 200);
  }
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
  if (isMockMode()) {
    // Admin login
    if ((admin[0].username === username || admin[0].email === username) && admin[0].password === password) {
      return Promise.resolve({
        status: 'success',
        data: {
          token: 'mock-admin-token',
          user: admin[0],
          role: 'admin'
        },
        error: null
      });
    }
    // Parent login (by email)
    const parent = (parents as Parent[]).find((p) => p.email === username && password === 'Parent$1234');
    if (parent) {
      return Promise.resolve({
        status: 'success',
        data: {
          token: 'mock-parent-token',
          user: parent,
          role: 'parent'
        },
        error: null
      });
    }
    // Student login (by email)
    // (Assume students.json is imported as students)
    if (typeof students !== 'undefined') {
      const student = (students as Student[]).find((s) => s.email === username && password === 'Student$1234');
      if (student) {
        return Promise.resolve({
          status: 'success',
          data: {
            token: 'mock-student-token',
            user: student,
            role: 'student'
          },
          error: null
        });
      }
    }
    return Promise.resolve({ status: 'error', data: null, error: 'Invalid credentials' });
  }
  // Real API
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

// Parents
export async function getParents() {
  if (isMockMode()) {
    return simulateLatency({ status: 'success', data: parents, error: null }, 200);
  }
  // Implement real API call if needed
  return apiFetch('/parents');
}

export async function getParentById(parentId: string) {
  if (isMockMode()) {
    const parent = (parents as Parent[]).find((p) => p.parent_id === parentId);
    return Promise.resolve({ status: parent ? 'success' : 'error', data: parent || null, error: parent ? null : 'Parent not found' });
  }
  return apiFetch(`/parents/${parentId}`);
}

export async function getParentByEmail(email: string) {
  if (isMockMode()) {
    const parent = (parents as Parent[]).find((p) => p.email === email);
    return Promise.resolve({ status: parent ? 'success' : 'error', data: parent || null, error: parent ? null : 'Parent not found' });
  }
  // Implement real API call if needed
  return apiFetch(`/parents?email=${encodeURIComponent(email)}`);
}

// Admin
export async function getAdmin() {
  if (isMockMode()) {
    return simulateLatency({ status: 'success', data: admin[0], error: null }, 200);
  }
  // Implement real API call if needed
  return apiFetch('/admin');
}

// Grades (if backend supports it)
export async function getGradesByStudentId(studentId: string) {
  return apiFetch(`/students/${studentId}/grades`);
}

// Add more CRUD as needed for demo (add, update, delete) for students, teachers, homework, etc. 