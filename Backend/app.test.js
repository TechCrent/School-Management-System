const request = require('supertest');
const app = require('./index');

let adminToken;
let teacherToken;

beforeAll(async () => {
  // Login as admin
  const resAdmin = await request(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin123' });
  adminToken = resAdmin.body.token;

  // Login as teacher
  const resTeacher = await request(app)
    .post('/login')
    .send({ username: 'teacher', password: 'teacher123' });
  teacherToken = resTeacher.body.token;
});

describe('Authentication', () => {
  it('should login as admin', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('admin');
  });

  it('should fail with wrong credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Students API', () => {
  let studentId;

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(401);
  });

  it('should create a student (admin)', async () => {
    const res = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'John Doe', email: 'john@example.com', grade: 'A' });
    expect(res.statusCode).toBe(201);
    expect(res.body.student_id).toBeDefined();
    studentId = res.body.student_id;
  });

  it('should validate student input', async () => {
    const res = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: '', email: 'notanemail', grade: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should get students (admin)', async () => {
    const res = await request(app)
      .get('/students')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a student', async () => {
    const res = await request(app)
      .put(`/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Jane Doe', email: 'jane@example.com', grade: 'B' });
    expect(res.statusCode).toBe(200);
    expect(res.body.full_name).toBe('Jane Doe');
  });

  it('should delete a student', async () => {
    const res = await request(app)
      .delete(`/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.student_id).toBe(studentId);
  });
});

describe('Teachers API', () => {
  let teacherId;

  it('should create a teacher (admin)', async () => {
    const res = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Mr. Smith', email: 'smith@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.teacher_id).toBeDefined();
    teacherId = res.body.teacher_id;
  });

  it('should validate teacher input', async () => {
    const res = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: '', email: 'notanemail' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should get teachers (admin)', async () => {
    const res = await request(app)
      .get('/teachers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a teacher', async () => {
    const res = await request(app)
      .put(`/teachers/${teacherId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Ms. Smith', email: 'msmith@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.full_name).toBe('Ms. Smith');
  });

  it('should delete a teacher', async () => {
    const res = await request(app)
      .delete(`/teachers/${teacherId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.teacher_id).toBe(teacherId);
  });
});

describe('Role-based Access', () => {
  it('should forbid teacher from creating a student', async () => {
    const res = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ full_name: 'Student', email: 's@example.com', grade: 'A' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow teacher to view students', async () => {
    const res = await request(app)
      .get('/students')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should forbid teacher from deleting a teacher', async () => {
    const res = await request(app)
      .delete('/teachers/9999')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('Classes API', () => {
  let classId;

  it('should forbid unauthenticated access', async () => {
    const res = await request(app).get('/classes');
    expect(res.statusCode).toBe(401);
  });

  it('should allow admin to create a class', async () => {
    const res = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Class 1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.class_id).toBeDefined();
    classId = res.body.class_id;
  });

  it('should allow admin to get classes', async () => {
    const res = await request(app)
      .get('/classes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow teacher to get classes', async () => {
    const res = await request(app)
      .get('/classes')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should forbid teacher from creating a class', async () => {
    const res = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Class 2' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to update a class', async () => {
    const res = await request(app)
      .put(`/classes/${classId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Class 1A' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Class 1A');
  });

  it('should forbid teacher from updating a class', async () => {
    const res = await request(app)
      .put(`/classes/${classId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Class 1B' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete a class', async () => {
    const res = await request(app)
      .delete(`/classes/${classId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.class_id).toBe(classId);
  });
});

describe('Subjects API', () => {
  let subjectId;

  it('should allow admin to create a subject', async () => {
    const res = await request(app)
      .post('/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Math', description: 'Mathematics' });
    expect(res.statusCode).toBe(201);
    expect(res.body.subject_id).toBeDefined();
    subjectId = res.body.subject_id;
  });

  it('should allow admin to get subjects', async () => {
    const res = await request(app)
      .get('/subjects')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow teacher to get subjects', async () => {
    const res = await request(app)
      .get('/subjects')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should forbid teacher from creating a subject', async () => {
    const res = await request(app)
      .post('/subjects')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Science' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to update a subject', async () => {
    const res = await request(app)
      .put(`/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Mathematics', description: 'Math subject' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Mathematics');
  });

  it('should forbid teacher from updating a subject', async () => {
    const res = await request(app)
      .put(`/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Biology' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete a subject', async () => {
    const res = await request(app)
      .delete(`/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.subject_id).toBe(subjectId);
  });
});

describe('User Management API', () => {
  let createdUserId;

  it('should forbid non-admin from creating a user', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ username: 'student1', password: 'pass1234', role: 'student' });
    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to create a student user', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'student1', password: 'pass1234', role: 'student' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user_id).toBeDefined();
    expect(res.body.role).toBe('student');
    createdUserId = res.body.user_id;
  });

  it('should not allow duplicate usernames', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'student1', password: 'pass1234', role: 'student' });
    expect(res.statusCode).toBe(400);
  });

  it('should allow admin to create a parent user', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'parent1', password: 'pass1234', role: 'parent' });
    expect(res.statusCode).toBe(201);
    expect(res.body.role).toBe('parent');
  });

  it('should validate user role', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'badrole', password: 'pass1234', role: 'notarole' });
    expect(res.statusCode).toBe(400);
  });

  it('should allow admin to update user role and password', async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'parent', password: 'newpass1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('parent');
  });

  it('should allow admin to deactivate a user', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.deactivated).toBe(true);
  });

  it('should return 404 for deactivating non-existent user', async () => {
    const res = await request(app)
      .delete('/users/doesnotexist')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Relationships API', () => {
  let studentId, classId, subjectId, teacherId;

  beforeAll(async () => {
    // Create a student
    let res = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Rel Student', email: 'relstudent@example.com', grade: 'A' });
    studentId = res.body.student_id;
    // Create a class
    res = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Rel Class' });
    classId = res.body.class_id;
    // Create a subject
    res = await request(app)
      .post('/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Rel Subject' });
    subjectId = res.body.subject_id;
    // Create a teacher
    res = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Rel Teacher', email: 'relteacher@example.com' });
    teacherId = res.body.teacher_id;
  });

  it('should assign student to class', async () => {
    const res = await request(app)
      .post('/student-classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ student_id: studentId, class_id: classId });
    expect(res.statusCode).toBe(201);
  });

  it('should list students in a class', async () => {
    const res = await request(app)
      .get(`/classes/${classId}/students`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(s => s.student_id === studentId)).toBe(true);
  });

  it('should list classes for a student', async () => {
    const res = await request(app)
      .get(`/students/${studentId}/classes`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(c => c.class_id === classId)).toBe(true);
  });

  it('should unassign student from class', async () => {
    const res = await request(app)
      .delete('/student-classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ student_id: studentId, class_id: classId });
    expect(res.statusCode).toBe(200);
    expect(res.body.unassigned).toBe(true);
  });

  it('should assign subject (with teacher) to class', async () => {
    const res = await request(app)
      .post('/class-subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ class_id: classId, subject_id: subjectId, teacher_id: teacherId });
    expect(res.statusCode).toBe(201);
  });

  it('should list subjects (with teachers) in a class', async () => {
    const res = await request(app)
      .get(`/classes/${classId}/subjects`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(s => s.subject_id === subjectId && s.teacher_id === teacherId)).toBe(true);
  });

  it('should list classes for a subject', async () => {
    const res = await request(app)
      .get(`/subjects/${subjectId}/classes`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(c => c.class_id === classId)).toBe(true);
  });

  it('should unassign subject from class', async () => {
    const res = await request(app)
      .delete('/class-subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ class_id: classId, subject_id: subjectId });
    expect(res.statusCode).toBe(200);
    expect(res.body.unassigned).toBe(true);
  });
});

describe('API Improvements: Pagination, Search, Soft Delete', () => {
  let studentId, teacherId, classId, subjectId;

  beforeAll(async () => {
    // Create student
    let res = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Paginate Student', email: 'paginate@example.com', grade: 'A' });
    studentId = res.body.student_id;
    // Create teacher
    res = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Paginate Teacher', email: 'pageteacher@example.com' });
    teacherId = res.body.teacher_id;
    // Create class
    res = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Paginate Class' });
    classId = res.body.class_id;
    // Create subject
    res = await request(app)
      .post('/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Paginate Subject' });
    subjectId = res.body.subject_id;
  });

  it('should paginate students', async () => {
    const res = await request(app)
      .get('/students?page=1&pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should search students by name', async () => {
    const res = await request(app)
      .get('/students?search=Paginate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(s => s.full_name === 'Paginate Student')).toBe(true);
  });

  it('should soft delete a student and not return in list', async () => {
    await request(app)
      .delete(`/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app)
      .get('/students?search=Paginate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.some(s => s.student_id === studentId)).toBe(false);
  });

  it('should paginate teachers', async () => {
    const res = await request(app)
      .get('/teachers?page=1&pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should search teachers by name', async () => {
    const res = await request(app)
      .get('/teachers?search=Paginate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(t => t.full_name === 'Paginate Teacher')).toBe(true);
  });

  it('should soft delete a teacher and not return in list', async () => {
    await request(app)
      .delete(`/teachers/${teacherId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app)
      .get('/teachers?search=Paginate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.some(t => t.teacher_id === teacherId)).toBe(false);
  });

  it('should paginate classes', async () => {
    const res = await request(app)
      .get('/classes?page=1&pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should search classes by name', async () => {
    const res = await request(app)
      .get('/classes?search=Paginate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(c => c.name === 'Paginate Class')).toBe(true);
  });

  it('should paginate subjects', async () => {
    const res = await request(app)
      .get('/subjects?page=1&pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should search subjects by name', async () => {
    const res = await request(app)
      .get('/subjects?search=Paginate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(s => s.name === 'Paginate Subject')).toBe(true);
  });
}); 