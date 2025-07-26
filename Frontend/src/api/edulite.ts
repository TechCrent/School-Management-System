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
import attendance from '../data/attendance.json';
import classMaterials from '../data/classMaterials.json';
import classAnnouncements from '../data/classAnnouncements.json';
import homeworkSubmissions from '../data/homeworkSubmissions.json';
import homeworkRubrics from '../data/homeworkRubrics.json';
import studentPerformance from '../data/studentPerformance.json';
import studentNotes from '../data/studentNotes.json';
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

type AttendanceType = {
  attendance_id: string;
  class_id: string;
  date: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
};

type ClassMaterialType = {
  material_id: string;
  class_id: string;
  title: string;
  description: string;
  file_type: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  file_size: string;
};

type ClassAnnouncementType = {
  announcement_id: string;
  class_id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
};

type HomeworkSubmissionType = {
  submission_id: string;
  homework_id: string;
  student_id: string;
  submitted_at: string;
  content: string;
  attachments: Array<{
    name: string;
    url: string;
    size: string;
  }>;
  status: 'submitted' | 'graded' | 'late';
  grade: string | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
};

type RubricCriteriaType = {
  name: string;
  description: string;
  max_points: number;
  weight: number;
};

type HomeworkRubricType = {
  rubric_id: string;
  homework_id: string;
  title: string;
  criteria: RubricCriteriaType[];
  total_points: number;
  created_by: string;
  created_at: string;
};

type StudentPerformanceType = {
  performance_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  semester: string;
  overall_grade: string;
  gpa: number;
  attendance_rate: number;
  homework_completion_rate: number;
  participation_score: number;
  last_updated: string;
};

type StudentNoteType = {
  note_id: string;
  student_id: string;
  teacher_id: string;
  note_type: 'observation' | 'concern' | 'improvement' | 'achievement' | 'behavior';
  title: string;
  content: string;
  created_at: string;
  is_private: boolean;
  tags: string[];
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
    // Teacher login (by email)
    const teacher = (teachers as Teacher[]).find((t) => t.email === username && password === 'Teacher$123');
    if (teacher) {
      return Promise.resolve({
        status: 'success',
        data: {
          token: 'mock-teacher-token',
          user: teacher,
          role: 'teacher'
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

// Attendance
export async function getAttendanceByClass(classId: string, date?: string) {
  if (isMockMode()) {
    let filtered = attendance as AttendanceType[];
    filtered = filtered.filter(a => a.class_id === classId);
    if (date) {
      filtered = filtered.filter(a => a.date === date);
    }
    return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
  }
  const query = date ? `?date=${date}` : '';
  return apiFetch(`/classes/${classId}/attendance${query}`);
}

export async function markAttendance(attendanceData: Partial<AttendanceType>) {
  if (isMockMode()) {
    const newAttendance = {
      attendance_id: crypto.randomUUID(),
      ...attendanceData
    };
    (attendance as AttendanceType[]).push(newAttendance as AttendanceType);
    return Promise.resolve({ status: 'success', data: newAttendance, error: null });
  }
  return apiFetch(`/classes/${attendanceData.class_id}/attendance`, {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  });
}

export async function updateAttendance(attendanceId: string, attendanceData: Partial<AttendanceType>) {
  if (isMockMode()) {
    const idx = (attendance as AttendanceType[]).findIndex(a => a.attendance_id === attendanceId);
    if (idx !== -1) {
      (attendance as AttendanceType[])[idx] = { ...(attendance as AttendanceType[])[idx], ...attendanceData };
    }
    return Promise.resolve({ status: 'success', data: attendanceData, error: null });
  }
  return apiFetch(`/attendance/${attendanceId}`, {
    method: 'PUT',
    body: JSON.stringify(attendanceData)
  });
}

// Class Materials
export async function getClassMaterials(classId: string) {
  if (isMockMode()) {
    const filtered = (classMaterials as ClassMaterialType[]).filter(m => m.class_id === classId);
    return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/materials`);
}

export async function addClassMaterial(materialData: Partial<ClassMaterialType>) {
  if (isMockMode()) {
    const newMaterial = {
      material_id: crypto.randomUUID(),
      ...materialData
    };
    (classMaterials as ClassMaterialType[]).push(newMaterial as ClassMaterialType);
    return Promise.resolve({ status: 'success', data: newMaterial, error: null });
  }
  return apiFetch(`/classes/${materialData.class_id}/materials`, {
    method: 'POST',
    body: JSON.stringify(materialData)
  });
}

export async function deleteClassMaterial(materialId: string) {
  if (isMockMode()) {
    const idx = (classMaterials as ClassMaterialType[]).findIndex(m => m.material_id === materialId);
    if (idx !== -1) {
      (classMaterials as ClassMaterialType[]).splice(idx, 1);
    }
    return Promise.resolve({ status: 'success', data: null, error: null });
  }
  return apiFetch(`/materials/${materialId}`, {
    method: 'DELETE'
  });
}

// Class Announcements
export async function getClassAnnouncements(classId: string) {
  if (isMockMode()) {
    const filtered = (classAnnouncements as ClassAnnouncementType[]).filter(a => a.class_id === classId && a.is_active);
    return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/announcements`);
}

export async function addClassAnnouncement(announcementData: Partial<ClassAnnouncementType>) {
  if (isMockMode()) {
    const newAnnouncement = {
      announcement_id: crypto.randomUUID(),
      is_active: true,
      ...announcementData
    };
    (classAnnouncements as ClassAnnouncementType[]).push(newAnnouncement as ClassAnnouncementType);
    return Promise.resolve({ status: 'success', data: newAnnouncement, error: null });
  }
  return apiFetch(`/classes/${announcementData.class_id}/announcements`, {
    method: 'POST',
    body: JSON.stringify(announcementData)
  });
}

export async function updateClassAnnouncement(announcementId: string, announcementData: Partial<ClassAnnouncementType>) {
  if (isMockMode()) {
    const idx = (classAnnouncements as ClassAnnouncementType[]).findIndex(a => a.announcement_id === announcementId);
    if (idx !== -1) {
      (classAnnouncements as ClassAnnouncementType[])[idx] = { ...(classAnnouncements as ClassAnnouncementType[])[idx], ...announcementData };
    }
    return Promise.resolve({ status: 'success', data: announcementData, error: null });
  }
  return apiFetch(`/announcements/${announcementId}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData)
  });
}

export async function deleteClassAnnouncement(announcementId: string) {
  if (isMockMode()) {
    const idx = (classAnnouncements as ClassAnnouncementType[]).findIndex(a => a.announcement_id === announcementId);
    if (idx !== -1) {
      (classAnnouncements as ClassAnnouncementType[])[idx].is_active = false;
    }
    return Promise.resolve({ status: 'success', data: null, error: null });
  }
  return apiFetch(`/announcements/${announcementId}`, {
    method: 'DELETE'
  });
}

// Homework Submissions
export async function getHomeworkSubmissions(homeworkId: string) {
  if (isMockMode()) {
    const filtered = (homeworkSubmissions as HomeworkSubmissionType[]).filter(s => s.homework_id === homeworkId);
    return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
  }
  return apiFetch(`/homework/${homeworkId}/submissions`);
}

export async function getSubmissionById(submissionId: string) {
  if (isMockMode()) {
    const submission = (homeworkSubmissions as HomeworkSubmissionType[]).find(s => s.submission_id === submissionId);
    return Promise.resolve({ 
      status: submission ? 'success' : 'error', 
      data: submission || null, 
      error: submission ? null : 'Submission not found' 
    });
  }
  return apiFetch(`/submissions/${submissionId}`);
}

export async function gradeSubmission(submissionId: string, gradeData: { grade: string; feedback: string }) {
  if (isMockMode()) {
    const idx = (homeworkSubmissions as HomeworkSubmissionType[]).findIndex(s => s.submission_id === submissionId);
    if (idx !== -1) {
      (homeworkSubmissions as HomeworkSubmissionType[])[idx] = {
        ...(homeworkSubmissions as HomeworkSubmissionType[])[idx],
        ...gradeData,
        status: 'graded',
        graded_at: new Date().toISOString(),
        graded_by: JSON.parse(localStorage.getItem('user') || '{}').teacher_id
      };
    }
    return Promise.resolve({ status: 'success', data: gradeData, error: null });
  }
  return apiFetch(`/submissions/${submissionId}/grade`, {
    method: 'PUT',
    body: JSON.stringify(gradeData)
  });
}

// Homework Rubrics
export async function getHomeworkRubric(homeworkId: string) {
  if (isMockMode()) {
    const rubric = (homeworkRubrics as HomeworkRubricType[]).find(r => r.homework_id === homeworkId);
    return Promise.resolve({ 
      status: rubric ? 'success' : 'error', 
      data: rubric || null, 
      error: rubric ? null : 'Rubric not found' 
    });
  }
  return apiFetch(`/homework/${homeworkId}/rubric`);
}

export async function createHomeworkRubric(rubricData: Partial<HomeworkRubricType>) {
  if (isMockMode()) {
    const newRubric = {
      rubric_id: crypto.randomUUID(),
      ...rubricData
    };
    (homeworkRubrics as HomeworkRubricType[]).push(newRubric as HomeworkRubricType);
    return Promise.resolve({ status: 'success', data: newRubric, error: null });
  }
  return apiFetch(`/homework/${rubricData.homework_id}/rubric`, {
    method: 'POST',
    body: JSON.stringify(rubricData)
  });
}

export async function updateHomeworkRubric(rubricId: string, rubricData: Partial<HomeworkRubricType>) {
  if (isMockMode()) {
    const idx = (homeworkRubrics as HomeworkRubricType[]).findIndex(r => r.rubric_id === rubricId);
    if (idx !== -1) {
      (homeworkRubrics as HomeworkRubricType[])[idx] = { ...(homeworkRubrics as HomeworkRubricType[])[idx], ...rubricData };
    }
    return Promise.resolve({ status: 'success', data: rubricData, error: null });
  }
  return apiFetch(`/rubrics/${rubricId}`, {
    method: 'PUT',
    body: JSON.stringify(rubricData)
  });
}

// Homework Analytics
export async function getHomeworkAnalytics(homeworkId: string) {
  if (isMockMode()) {
    const submissions = (homeworkSubmissions as HomeworkSubmissionType[]).filter(s => s.homework_id === homeworkId);
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
    const averageGrade = submissions
      .filter(s => s.grade)
      .reduce((acc, s) => {
        const gradeValue = s.grade === 'A' ? 95 : s.grade === 'A-' ? 90 : s.grade === 'B+' ? 87 : s.grade === 'B' ? 83 : s.grade === 'B-' ? 80 : s.grade === 'C+' ? 77 : s.grade === 'C' ? 73 : s.grade === 'C-' ? 70 : s.grade === 'D+' ? 67 : s.grade === 'D' ? 63 : s.grade === 'D-' ? 60 : 50;
        return acc + gradeValue;
      }, 0) / (submissions.filter(s => s.grade).length || 1);

    return simulateLatency({
      status: 'success',
      data: {
        totalSubmissions,
        gradedSubmissions,
        pendingSubmissions: totalSubmissions - gradedSubmissions,
        averageGrade: Math.round(averageGrade),
        submissionRate: Math.round((totalSubmissions / 25) * 100), // Assuming 25 students per class
        gradeDistribution: {
          'A': submissions.filter(s => s.grade === 'A').length,
          'B': submissions.filter(s => s.grade && s.grade.startsWith('B')).length,
          'C': submissions.filter(s => s.grade && s.grade.startsWith('C')).length,
          'D': submissions.filter(s => s.grade && s.grade.startsWith('D')).length,
          'F': submissions.filter(s => s.grade === 'F').length
        }
      },
      error: null
    }, 200);
  }
  return apiFetch(`/homework/${homeworkId}/analytics`);
}

// Student Performance
export async function getStudentPerformance(studentId: string, classId?: string) {
  if (isMockMode()) {
    const filtered = (studentPerformance as StudentPerformanceType[]).filter(p => 
      p.student_id === studentId && (!classId || p.class_id === classId)
    );
    return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
  }
  return apiFetch(`/students/${studentId}/performance${classId ? `?class_id=${classId}` : ''}`);
}

export async function updateStudentPerformance(performanceId: string, performanceData: Partial<StudentPerformanceType>) {
  if (isMockMode()) {
    const idx = (studentPerformance as StudentPerformanceType[]).findIndex(p => p.performance_id === performanceId);
    if (idx !== -1) {
      (studentPerformance as StudentPerformanceType[])[idx] = { 
        ...(studentPerformance as StudentPerformanceType[])[idx], 
        ...performanceData,
        last_updated: new Date().toISOString()
      };
    }
    return Promise.resolve({ status: 'success', data: performanceData, error: null });
  }
  return apiFetch(`/performance/${performanceId}`, {
    method: 'PUT',
    body: JSON.stringify(performanceData)
  });
}

// Student Notes
export async function getStudentNotes(studentId: string) {
  if (isMockMode()) {
    const filtered = (studentNotes as StudentNoteType[]).filter(n => n.student_id === studentId);
    return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
  }
  return apiFetch(`/students/${studentId}/notes`);
}

export async function addStudentNote(noteData: Partial<StudentNoteType>) {
  if (isMockMode()) {
    const newNote = {
      note_id: crypto.randomUUID(),
      ...noteData,
      created_at: new Date().toISOString()
    };
    (studentNotes as StudentNoteType[]).push(newNote as StudentNoteType);
    return Promise.resolve({ status: 'success', data: newNote, error: null });
  }
  return apiFetch(`/students/${noteData.student_id}/notes`, {
    method: 'POST',
    body: JSON.stringify(noteData)
  });
}

export async function updateStudentNote(noteId: string, noteData: Partial<StudentNoteType>) {
  if (isMockMode()) {
    const idx = (studentNotes as StudentNoteType[]).findIndex(n => n.note_id === noteId);
    if (idx !== -1) {
      (studentNotes as StudentNoteType[])[idx] = { ...(studentNotes as StudentNoteType[])[idx], ...noteData };
    }
    return Promise.resolve({ status: 'success', data: noteData, error: null });
  }
  return apiFetch(`/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(noteData)
  });
}

export async function deleteStudentNote(noteId: string) {
  if (isMockMode()) {
    const idx = (studentNotes as StudentNoteType[]).findIndex(n => n.note_id === noteId);
    if (idx !== -1) {
      (studentNotes as StudentNoteType[]).splice(idx, 1);
    }
    return Promise.resolve({ status: 'success', data: null, error: null });
  }
  return apiFetch(`/notes/${noteId}`, {
    method: 'DELETE'
  });
}

// Student Analytics
export async function getStudentAnalytics(studentId: string) {
  if (isMockMode()) {
    const performance = (studentPerformance as StudentPerformanceType[]).find(p => p.student_id === studentId);
    const notes = (studentNotes as StudentNoteType[]).filter(n => n.student_id === studentId);
    const submissions = (homeworkSubmissions as HomeworkSubmissionType[]).filter(s => s.student_id === studentId);
    
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
    const averageGrade = submissions
      .filter(s => s.grade)
      .reduce((acc, s) => {
        const gradeValue = s.grade === 'A' ? 95 : s.grade === 'A-' ? 90 : s.grade === 'B+' ? 87 : s.grade === 'B' ? 83 : s.grade === 'B-' ? 80 : s.grade === 'C+' ? 77 : s.grade === 'C' ? 73 : s.grade === 'C-' ? 70 : s.grade === 'D+' ? 67 : s.grade === 'D' ? 63 : s.grade === 'D-' ? 60 : 50;
        return acc + gradeValue;
      }, 0) / (submissions.filter(s => s.grade).length || 1);

    return simulateLatency({
      status: 'success',
      data: {
        performance: performance || null,
        totalNotes: notes.length,
        recentNotes: notes.slice(-3),
        totalSubmissions,
        gradedSubmissions,
        averageGrade: Math.round(averageGrade),
        gradeTrend: 'improving', // Mock trend
        attendanceTrend: 'stable',
        participationTrend: 'improving',
        recentAchievements: notes.filter(n => n.note_type === 'achievement').slice(-2),
        areasForImprovement: notes.filter(n => n.note_type === 'concern').slice(-2)
      },
      error: null
    }, 200);
  }
  return apiFetch(`/students/${studentId}/analytics`);
} 

// Teacher-specific endpoints
export async function getTeacherDashboard(teacherId: string) {
  if (isMockMode()) {
    // Mock teacher dashboard data
    const mockData = {
      classes: 3,
      homework: 8,
      pendingSubmissions: 12,
      totalStudents: 45
    };
    return simulateLatency({ status: 'success', data: mockData, error: null }, 200);
  }
  return apiFetch(`/teacher/${teacherId}/dashboard`);
}

export async function getClassStudents(classId: string) {
  if (isMockMode()) {
    const classStudents = (students as Student[]).slice(0, 15); // Mock 15 students per class
    return simulateLatency({ status: 'success', data: classStudents, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/students`);
}

export async function getStudentClasses(studentId: string) {
  if (isMockMode()) {
    const studentClasses = classes.slice(0, 4); // Mock 4 classes per student
    return simulateLatency({ status: 'success', data: studentClasses, error: null }, 200);
  }
  return apiFetch(`/students/${studentId}/classes`);
}

export async function getClassSubjects(classId: string) {
  if (isMockMode()) {
    const classSubjects = subjects.slice(0, 3); // Mock 3 subjects per class
    return simulateLatency({ status: 'success', data: classSubjects, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/subjects`);
}

export async function getSubjectClasses(subjectId: string) {
  if (isMockMode()) {
    const subjectClasses = classes.slice(0, 2); // Mock 2 classes per subject
    return simulateLatency({ status: 'success', data: subjectClasses, error: null }, 200);
  }
  return apiFetch(`/subjects/${subjectId}/classes`);
} 