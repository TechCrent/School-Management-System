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