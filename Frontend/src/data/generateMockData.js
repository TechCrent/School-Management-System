// Node.js script to generate mock data for students, parents, and admin
const fs = require('fs');
const path = require('path');

const NUM_STUDENTS = 200;
const NUM_SIBLING_FAMILIES = 30; // 30 families with 2-3 siblings
const SURNAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Hernandez',
  'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];
const MALE_FIRST = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'
];
const FEMALE_FIRST = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'
];
const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad(num, len = 4) { return num.toString().padStart(len, '0'); }
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

let students = [];
let parents = [];
let parentEmailSet = new Set();
let parentIdCounter = 1;
let studentIdCounter = 1;

// Generate sibling families first
for (let f = 0; f < NUM_SIBLING_FAMILIES; f++) {
  const surname = randomFrom(SURNAMES);
  const numSiblings = Math.floor(Math.random() * 2) + 2; // 2 or 3 siblings
  // Generate parents
  const momId = `P${pad(parentIdCounter++)}`;
  const dadId = `P${pad(parentIdCounter++)}`;
  const momFirst = randomFrom(FEMALE_FIRST);
  const dadFirst = randomFrom(MALE_FIRST);
  const momEmail = `${momFirst.toLowerCase()}.${surname.toLowerCase()}@parentmail.com`;
  const dadEmail = `${dadFirst.toLowerCase()}.${surname.toLowerCase()}@parentmail.com`;
  // Ensure unique emails
  if (parentEmailSet.has(momEmail) || parentEmailSet.has(dadEmail)) continue;
  parentEmailSet.add(momEmail); parentEmailSet.add(dadEmail);
  const mom = {
    parent_id: momId,
    full_name: `${momFirst} ${surname}`,
    email: momEmail,
    phone: `555-1${pad(momId.slice(1), 3)}`,
    children_ids: []
  };
  const dad = {
    parent_id: dadId,
    full_name: `${dadFirst} ${surname}`,
    email: dadEmail,
    phone: `555-2${pad(dadId.slice(1), 3)}`,
    children_ids: []
  };
  // Generate siblings
  for (let s = 0; s < numSiblings && studentIdCounter <= NUM_STUDENTS; s++) {
    const gender = Math.random() < 0.5 ? 'M' : 'F';
    const first = gender === 'M' ? randomFrom(MALE_FIRST) : randomFrom(FEMALE_FIRST);
    const studentId = `S${pad(studentIdCounter++)}`;
    const dob = randomDate(new Date(2005, 0, 1), new Date(2017, 11, 31));
    const grade = randomFrom(GRADES);
    const email = `${first.toLowerCase()}.${surname.toLowerCase()}${studentId}@schoolmail.com`;
    const student = {
      student_id: studentId,
      full_name: `${first} ${surname}`,
      email,
      grade,
      date_of_birth: dob.toISOString().slice(0, 10),
      address: `${Math.floor(Math.random()*900+100)} ${surname} St, Cityville`,
      parent1_id: momId,
      parent2_id: dadId
    };
    students.push(student);
    mom.children_ids.push(studentId);
    dad.children_ids.push(studentId);
  }
  parents.push(mom, dad);
}

// Fill up to 200 students with unique families
while (students.length < NUM_STUDENTS) {
  const surname = randomFrom(SURNAMES);
  const momId = `P${pad(parentIdCounter++)}`;
  const dadId = `P${pad(parentIdCounter++)}`;
  const momFirst = randomFrom(FEMALE_FIRST);
  const dadFirst = randomFrom(MALE_FIRST);
  const momEmail = `${momFirst.toLowerCase()}.${surname.toLowerCase()}@parentmail.com`;
  const dadEmail = `${dadFirst.toLowerCase()}.${surname.toLowerCase()}@parentmail.com`;
  if (parentEmailSet.has(momEmail) || parentEmailSet.has(dadEmail)) continue;
  parentEmailSet.add(momEmail); parentEmailSet.add(dadEmail);
  const mom = {
    parent_id: momId,
    full_name: `${momFirst} ${surname}`,
    email: momEmail,
    phone: `555-1${pad(momId.slice(1), 3)}`,
    children_ids: []
  };
  const dad = {
    parent_id: dadId,
    full_name: `${dadFirst} ${surname}`,
    email: dadEmail,
    phone: `555-2${pad(dadId.slice(1), 3)}`,
    children_ids: []
  };
  const gender = Math.random() < 0.5 ? 'M' : 'F';
  const first = gender === 'M' ? randomFrom(MALE_FIRST) : randomFrom(FEMALE_FIRST);
  const studentId = `S${pad(studentIdCounter++)}`;
  const dob = randomDate(new Date(2005, 0, 1), new Date(2017, 11, 31));
  const grade = randomFrom(GRADES);
  const email = `${first.toLowerCase()}.${surname.toLowerCase()}${studentId}@schoolmail.com`;
  const student = {
    student_id: studentId,
    full_name: `${first} ${surname}`,
    email,
    grade,
    date_of_birth: dob.toISOString().slice(0, 10),
    address: `${Math.floor(Math.random()*900+100)} ${surname} St, Cityville`,
    parent1_id: momId,
    parent2_id: dadId
  };
  students.push(student);
  mom.children_ids.push(studentId);
  dad.children_ids.push(studentId);
  parents.push(mom, dad);
}

// Admin
const admin = {
  admin_id: 'A0001',
  full_name: 'Admin User',
  username: 'admin',
  email: 'admin@schoolapp.com',
  password: 'Admin$1234',
  role: 'admin'
};

fs.writeFileSync(path.join(__dirname, 'students.json'), JSON.stringify(students, null, 2));
fs.writeFileSync(path.join(__dirname, 'parents.json'), JSON.stringify(parents, null, 2));
fs.writeFileSync(path.join(__dirname, 'admin.json'), JSON.stringify([admin], null, 2));
console.log('Mock data generated: students.json, parents.json, admin.json'); 