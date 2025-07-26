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
  created_at?: string;
  children?: Student[];
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
  // Frontend-specific fields for display
  parent1_email?: string;
  parent1_name?: string;
  parent1_contact?: string;
  parent2_email?: string;
  parent2_name?: string;
  parent2_contact?: string;
  status?: 'active' | 'inactive';
  class_id?: string;
};

type Teacher = { 
  teacher_id: string; 
  full_name: string; 
  email: string; 
  subject_name: string; 
  phone?: string 
};

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
  return localStorage.getItem('USE_MOCK') === 'true' || localStorage.getItem('USE_MOCK') === null;
}

function simulateLatency(result: any, ms = 300) {
  return new Promise(resolve => setTimeout(() => resolve(result), ms));
}

function success(data: any) {
  return { status: 'success', data, error: null };
}

function fail(error: string) {
  return { status: 'error', data: null, error };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  error: string | null;
}

let authToken: string | null = null;

export function setToken(newToken: string) {
  authToken = newToken;
}

function getAuthHeaders() {
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  const url = `${baseUrl}${path}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

// Enhanced getStudents function that handles data transformation
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

    // Transform mock data to include parent information
    const transformedStudents = filtered.map(student => {
      const parent1 = parents.find(p => p.parent_id === student.parent1_id);
      const parent2 = parents.find(p => p.parent_id === student.parent2_id);
      
      return {
        ...student,
        parent1_email: parent1?.email || '',
        parent1_name: parent1?.full_name || '',
        parent1_contact: parent1?.phone || '',
        parent2_email: parent2?.email || '',
        parent2_name: parent2?.full_name || '',
        parent2_contact: parent2?.phone || '',
        status: 'active' as const,
        class_id: 'class_1', // Default class for mock data
        grade: `Grade ${student.grade}A` // Format grade for display
      };
    });

    if (params.noPaginate === 'true') {
      return simulateLatency({ 
        status: 'success', 
        data: transformedStudents, 
        total: transformedStudents.length, 
        error: null 
      }, 200);
    }
    
    const page = parseInt(params.page || '1', 10);
    const pageSize = parseInt(params.pageSize || '20', 10);
    const paged = transformedStudents.slice((page - 1) * pageSize, page * pageSize);
    
    return simulateLatency({ 
      status: 'success', 
      data: paged, 
      total: transformedStudents.length, 
      error: null 
    }, 200);
  }

  const query = new URLSearchParams(params).toString();
  const response = await apiFetch(`/students${query ? '?' + query : ''}`);
  
  // Transform backend data to include parent information
  if (response.data) {
    const studentsWithParents = await Promise.all(
      response.data.map(async (student: Student) => {
        try {
          const parent1 = student.parent1_id ? await getParentById(student.parent1_id) : null;
          const parent2 = student.parent2_id ? await getParentById(student.parent2_id) : null;
          
          return {
            ...student,
            parent1_email: parent1?.data?.email || '',
            parent1_name: parent1?.data?.full_name || '',
            parent1_contact: parent1?.data?.phone || '',
            parent2_email: parent2?.data?.email || '',
            parent2_name: parent2?.data?.full_name || '',
            parent2_contact: parent2?.data?.phone || '',
            status: 'active' as const,
            grade: `Grade ${student.grade}A` // Format grade for display
          };
        } catch (error) {
          return {
            ...student,
            parent1_email: '',
            parent1_name: '',
            parent1_contact: '',
            parent2_email: '',
            parent2_name: '',
            parent2_contact: '',
            status: 'active' as const,
            grade: `Grade ${student.grade}A`
          };
        }
      })
    );
    
    return { ...response, data: studentsWithParents };
  }
  
  return response;
}

export async function getStudentById(id: string) {
  return apiFetch(`/students/${id}`);
}

export async function addStudent(newStudent: Record<string, unknown>) {
  // Transform frontend data to backend format
  const backendStudent = {
    student_id: newStudent.student_id || Date.now().toString(),
    full_name: newStudent.full_name,
    email: newStudent.email,
    grade: (newStudent.grade as string)?.replace('Grade ', '').replace('A', '') || '8',
    date_of_birth: newStudent.date_of_birth || '',
    address: newStudent.address || '',
    parent1_id: newStudent.parent1_id || '',
    parent2_id: newStudent.parent2_id || ''
  };

  return apiFetch('/students', {
    method: 'POST',
    body: JSON.stringify(backendStudent)
  });
}

export async function updateStudent(updatedStudent: Record<string, unknown>) {
  // Transform frontend data to backend format
  const backendStudent = {
    student_id: updatedStudent.student_id,
    full_name: updatedStudent.full_name,
    email: updatedStudent.email,
    grade: (updatedStudent.grade as string)?.replace('Grade ', '').replace('A', '') || '8',
    date_of_birth: updatedStudent.date_of_birth || '',
    address: updatedStudent.address || '',
    parent1_id: updatedStudent.parent1_id || '',
    parent2_id: updatedStudent.parent2_id || ''
  };

  return apiFetch(`/students/${backendStudent.student_id}`, {
    method: 'PUT',
    body: JSON.stringify(backendStudent)
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
      filtered = filtered.filter(s =>
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
  return apiFetch('/subjects', {
    method: 'POST',
    body: JSON.stringify(newSubject)
  });
}

export async function updateSubject(updatedSubject: Record<string, unknown>) {
  return apiFetch(`/subjects/${updatedSubject.subject_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedSubject)
  });
}

export async function deleteSubject(subjectId: string) {
  return apiFetch(`/subjects/${subjectId}`, {
    method: 'DELETE'
  });
}

// Classes
export async function getClasses(params: Record<string, string> = {}) {
  if (isMockMode()) {
    const search = params.search?.toLowerCase() || '';
    let filtered = classes as Class[];
    if (search) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search)
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
  return apiFetch('/classes', {
    method: 'POST',
    body: JSON.stringify(newClass)
  });
}

export async function updateClass(updatedClass: Record<string, unknown>) {
  return apiFetch(`/classes/${updatedClass.class_id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedClass)
  });
}

export async function deleteClass(classId: string) {
  return apiFetch(`/classes/${classId}`, {
    method: 'DELETE'
  });
}

// Homework
export async function getHomework(params: Record<string, string> = {}) {
  if (isMockMode()) {
    const search = params.search?.toLowerCase() || '';
    let filtered = homework as HomeworkType[];
    if (search) {
      filtered = filtered.filter(h =>
        h.title.toLowerCase().includes(search) ||
        h.description?.toLowerCase().includes(search)
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

// Authentication
export async function login(username: string, password: string) {
  if (isMockMode()) {
    const user = users.find(u => u.email === username && u.password === password);
    if (user) {
      const token = 'mock-jwt-token-' + Date.now();
      setToken(token);
      
      // Ensure proper user data structure
      const userData = {
        id: user.id,
        username: user.email,
        role: user.role,
        full_name: user.full_name || username,
        email: user.email
      };
      
      return simulateLatency({
        status: 'success',
        data: {
          token,
          user: userData
        },
        error: null
      }, 500);
    } else {
      return simulateLatency({
        status: 'error',
        data: null,
        error: 'Invalid credentials'
      }, 500);
    }
  }
  
  const response = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (response.status === 'success' && response.data?.token) {
    setToken(response.data.token);
  }
  
  return response;
}

export function logout() {
  authToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
}

// Parents
export async function getParents() {
  if (isMockMode()) {
    return simulateLatency({ status: 'success', data: parents, error: null }, 200);
  }
  return apiFetch('/parents');
}

export async function getParentById(parentId: string) {
  if (isMockMode()) {
    const parent = parents.find(p => p.parent_id === parentId);
    return simulateLatency({ status: 'success', data: parent || null, error: null }, 200);
  }
  return apiFetch(`/parents/${parentId}`);
}

export async function getParentByEmail(email: string) {
  if (isMockMode()) {
    const parent = parents.find(p => p.email === email);
    return simulateLatency({ status: 'success', data: parent || null, error: null }, 200);
  }
  return apiFetch(`/parents/email/${email}`);
}

// Admin
export async function getAdmin() {
  if (isMockMode()) {
    return simulateLatency({ status: 'success', data: admin, error: null }, 200);
  }
  return apiFetch('/admin');
}

// Grades
export async function getGradesByStudentId(studentId: string) {
  if (isMockMode()) {
    // Try to get from mockGradesByStudent first
    if (mockGradesByStudent[studentId]) {
      return simulateLatency({ status: 'success', data: mockGradesByStudent[studentId], error: null }, 200);
    }
    // Synthesize from studentPerformance.json if not found
    const perf = studentPerformance.filter(p => p.student_id === studentId);
    if (perf.length > 0) {
      const grades = perf.map(p => ({
        subject_id: p.subject_id,
        grade: p.overall_grade,
        comment: `GPA: ${p.gpa}, Attendance: ${p.attendance_rate}%, Homework: ${p.homework_completion_rate}%`
      }));
      return simulateLatency({ status: 'success', data: grades, error: null }, 200);
    }
    return simulateLatency({ status: 'success', data: [], error: null }, 200);
  }
  return apiFetch(`/students/${studentId}/grades`);
}

// Attendance
export async function getAttendanceByClass(classId: string, date?: string) {
  if (isMockMode()) {
    const classAttendance = attendance.filter(a => a.class_id === classId);
    if (date) {
      const filtered = classAttendance.filter(a => a.date === date);
      return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
    }
    return simulateLatency({ status: 'success', data: classAttendance, error: null }, 200);
  }
  const query = date ? `?date=${date}` : '';
  return apiFetch(`/classes/${classId}/attendance${query}`);
}

export async function markAttendance(attendanceData: Partial<AttendanceType>) {
  return apiFetch('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  });
}

export async function updateAttendance(attendanceId: string, attendanceData: Partial<AttendanceType>) {
  return apiFetch(`/attendance/${attendanceId}`, {
    method: 'PUT',
    body: JSON.stringify(attendanceData)
  });
}

// Class Materials
export async function getClassMaterials(classId: string) {
  if (isMockMode()) {
    const materials = classMaterials.filter(m => m.class_id === classId);
    return simulateLatency({ status: 'success', data: materials, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/materials`);
}

export async function addClassMaterial(materialData: Partial<ClassMaterialType>) {
  return apiFetch('/materials', {
    method: 'POST',
    body: JSON.stringify(materialData)
  });
}

export async function deleteClassMaterial(materialId: string) {
  return apiFetch(`/materials/${materialId}`, {
    method: 'DELETE'
  });
}

// Class Announcements
export async function getClassAnnouncements(classId: string) {
  if (isMockMode()) {
    const announcements = classAnnouncements.filter(a => a.class_id === classId);
    return simulateLatency({ status: 'success', data: announcements, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/announcements`);
}

export async function addClassAnnouncement(announcementData: Partial<ClassAnnouncementType>) {
  return apiFetch('/announcements', {
    method: 'POST',
    body: JSON.stringify(announcementData)
  });
}

export async function updateClassAnnouncement(announcementId: string, announcementData: Partial<ClassAnnouncementType>) {
  return apiFetch(`/announcements/${announcementId}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData)
  });
}

export async function deleteClassAnnouncement(announcementId: string) {
  return apiFetch(`/announcements/${announcementId}`, {
    method: 'DELETE'
  });
}

// Homework Submissions
export async function getHomeworkSubmissions(homeworkId: string) {
  if (isMockMode()) {
    const submissions = homeworkSubmissions.filter(s => s.homework_id === homeworkId);
    return simulateLatency({ status: 'success', data: submissions, error: null }, 200);
  }
  return apiFetch(`/homework/${homeworkId}/submissions`);
}

export async function getSubmissionById(submissionId: string) {
  if (isMockMode()) {
    const submission = homeworkSubmissions.find(s => s.submission_id === submissionId);
    return simulateLatency({ status: 'success', data: submission || null, error: null }, 200);
  }
  return apiFetch(`/submissions/${submissionId}`);
}

export async function gradeSubmission(submissionId: string, gradeData: { grade: string; feedback: string }) {
  return apiFetch(`/submissions/${submissionId}/grade`, {
    method: 'PUT',
    body: JSON.stringify(gradeData)
  });
}

// Homework Rubrics
export async function getHomeworkRubric(homeworkId: string) {
  if (isMockMode()) {
    const rubric = homeworkRubrics.find(r => r.homework_id === homeworkId);
    return simulateLatency({ status: 'success', data: rubric || null, error: null }, 200);
  }
  return apiFetch(`/homework/${homeworkId}/rubric`);
}

export async function createHomeworkRubric(rubricData: Partial<HomeworkRubricType>) {
  return apiFetch('/rubrics', {
    method: 'POST',
    body: JSON.stringify(rubricData)
  });
}

export async function updateHomeworkRubric(rubricId: string, rubricData: Partial<HomeworkRubricType>) {
  return apiFetch(`/rubrics/${rubricId}`, {
    method: 'PUT',
    body: JSON.stringify(rubricData)
  });
}

// Analytics
export async function getHomeworkAnalytics(homeworkId: string) {
  if (isMockMode()) {
    const submissions = homeworkSubmissions.filter(s => s.homework_id === homeworkId);
    const total = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const averageGrade = submissions
      .filter(s => s.grade)
      .reduce((sum, s) => sum + parseFloat(s.grade || '0'), 0) / (graded || 1);
    
    return simulateLatency({
      status: 'success',
      data: {
        total,
        submitted,
        graded,
        averageGrade: Math.round(averageGrade * 100) / 100,
        submissions
      },
      error: null
    }, 200);
  }
  return apiFetch(`/homework/${homeworkId}/analytics`);
}

// Student Performance
export async function getStudentPerformance(studentId: string, classId?: string) {
  if (isMockMode()) {
    // If studentId is 'all', return all performance data for admin dashboard
    if (studentId === 'all') {
      return simulateLatency({ status: 'success', data: studentPerformance, error: null }, 200);
    }
    
    const performance = studentPerformance.filter(p => p.student_id === studentId);
    if (classId) {
      const filtered = performance.filter(p => p.class_id === classId);
      return simulateLatency({ status: 'success', data: filtered, error: null }, 200);
    }
    return simulateLatency({ status: 'success', data: performance, error: null }, 200);
  }
  const query = classId ? `?classId=${classId}` : '';
  return apiFetch(`/students/${studentId}/performance${query}`);
}

export async function updateStudentPerformance(performanceId: string, performanceData: Partial<StudentPerformanceType>) {
  return apiFetch(`/performance/${performanceId}`, {
    method: 'PUT',
    body: JSON.stringify(performanceData)
  });
}

// Student Notes
export async function getStudentNotes(studentId: string) {
  if (isMockMode()) {
    const notes = studentNotes.filter(n => n.student_id === studentId);
    return simulateLatency({ status: 'success', data: notes, error: null }, 200);
  }
  return apiFetch(`/students/${studentId}/notes`);
}

export async function addStudentNote(noteData: Partial<StudentNoteType>) {
  return apiFetch('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData)
  });
}

export async function updateStudentNote(noteId: string, noteData: Partial<StudentNoteType>) {
  return apiFetch(`/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(noteData)
  });
}

export async function deleteStudentNote(noteId: string) {
  return apiFetch(`/notes/${noteId}`, {
    method: 'DELETE'
  });
}

// Student Analytics
export async function getStudentAnalytics(studentId: string) {
  if (isMockMode()) {
    const performance = studentPerformance.filter(p => p.student_id === studentId);
    const notes = studentNotes.filter(n => n.student_id === studentId);
    const studentAttendance = attendance.filter(a => a.student_id === studentId);
    
    const overallGPA = performance.length > 0 
      ? performance.reduce((sum, p) => sum + p.gpa, 0) / performance.length 
      : 0;
    
    const attendanceRate = studentAttendance.length > 0
      ? (studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100
      : 0;
    
    return simulateLatency({
      status: 'success',
      data: {
        overallGPA: Math.round(overallGPA * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        totalNotes: notes.length,
        performance,
        recentNotes: notes.slice(-5)
      },
      error: null
    }, 200);
  }
  return apiFetch(`/students/${studentId}/analytics`);
}

// Teacher Dashboard
export async function getTeacherDashboard(teacherId: string) {
  if (isMockMode()) {
    const teacherClasses = classes.filter(c => c.teacher_id === teacherId);
    const teacherHomework = homework.filter(h => h.teacher_id === teacherId);
    
    return simulateLatency({
      status: 'success',
      data: {
        classes: teacherClasses,
        homework: teacherHomework,
        totalStudents: teacherClasses.reduce((sum, c) => sum + c.student_count, 0),
        pendingHomework: teacherHomework.filter(h => h.status === 'pending').length
      },
      error: null
    }, 200);
  }
  return apiFetch(`/teachers/${teacherId}/dashboard`);
}

// Class Students
export async function getClassStudents(classId: string) {
  if (isMockMode()) {
    const classStudents = students.filter(s => s.class_id === classId);
    return simulateLatency({ status: 'success', data: classStudents, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/students`);
}

// Student Classes
export async function getStudentClasses(studentId: string) {
  if (isMockMode()) {
    const student = students.find(s => s.student_id === studentId);
    if (student) {
      const studentClass = classes.find(c => c.class_id === student.class_id);
      return simulateLatency({ status: 'success', data: studentClass ? [studentClass] : [], error: null }, 200);
    }
    return simulateLatency({ status: 'success', data: [], error: null }, 200);
  }
  return apiFetch(`/students/${studentId}/classes`);
}

// Class Subjects
export async function getClassSubjects(classId: string) {
  if (isMockMode()) {
    const classSubjects = subjects.filter(s => s.subject_id === 'subject_1'); // Mock relationship
    return simulateLatency({ status: 'success', data: classSubjects, error: null }, 200);
  }
  return apiFetch(`/classes/${classId}/subjects`);
}

// Subject Classes
export async function getSubjectClasses(subjectId: string) {
  if (isMockMode()) {
    const subjectClasses = classes.filter(c => c.subject_id === subjectId);
    return simulateLatency({ status: 'success', data: subjectClasses, error: null }, 200);
  }
  return apiFetch(`/subjects/${subjectId}/classes`);
} 