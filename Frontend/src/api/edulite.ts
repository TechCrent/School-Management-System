const BASE_URL = 'http://localhost:4000';

export async function getStudents() {
  const res = await fetch(`${BASE_URL}/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function addStudent(student) {
  const res = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error('Failed to add student');
  return res.json();
}

export async function updateStudent(id, student) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete student');
  return res.json();
}

// Teacher API
export async function getTeachers() {
  const res = await fetch(`${BASE_URL}/teachers`);
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

export async function addTeacher(teacher) {
  const res = await fetch(`${BASE_URL}/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  });
  if (!res.ok) throw new Error('Failed to add teacher');
  return res.json();
}

export async function updateTeacher(id, teacher) {
  const res = await fetch(`${BASE_URL}/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  });
  if (!res.ok) throw new Error('Failed to update teacher');
  return res.json();
}

export async function deleteTeacher(id) {
  const res = await fetch(`${BASE_URL}/teachers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete teacher');
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) return null;
  return res.json();
} 