#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Teacher Portal with Mock Data...\n');

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: FAILED - ${details}`);
  }
}

// Test 1: Check if teacher data exists
function testTeacherData() {
  try {
    const teachersPath = path.join(__dirname, 'src', 'data', 'teachers.json');
    const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    return teachers.length > 0 && teachers[0].teacher_id === 't-1';
  } catch (error) {
    return false;
  }
}

// Test 2: Check if classes data has correct teacher ID
function testClassesData() {
  try {
    const classesPath = path.join(__dirname, 'src', 'data', 'classes.json');
    const classes = JSON.parse(fs.readFileSync(classesPath, 'utf8'));
    return classes.every(cls => cls.teacher_id === 't-1');
  } catch (error) {
    return false;
  }
}

// Test 3: Check if homework data has correct teacher ID
function testHomeworkData() {
  try {
    const homeworkPath = path.join(__dirname, 'src', 'data', 'homework.json');
    const homework = JSON.parse(fs.readFileSync(homeworkPath, 'utf8'));
    return homework.every(hw => hw.teacher_id === 't-1');
  } catch (error) {
    return false;
  }
}

// Test 4: Check if student enrollments exist
function testStudentEnrollments() {
  try {
    const enrollmentsPath = path.join(__dirname, 'src', 'data', 'studentEnrollments.json');
    const enrollments = JSON.parse(fs.readFileSync(enrollmentsPath, 'utf8'));
    const classEnrollments = enrollments.filter(enrollment => 
      enrollment.class_id === 'class_1' || enrollment.class_id === 'class_2'
    );
    return classEnrollments.length > 0;
  } catch (error) {
    return false;
  }
}

// Test 5: Check if students data exists
function testStudentsData() {
  try {
    const studentsPath = path.join(__dirname, 'src', 'data', 'students.json');
    const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    return students.length > 0;
  } catch (error) {
    return false;
  }
}

// Test 6: Check if TeacherClasses component exists
function testTeacherClassesComponent() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'TeacherClasses.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    return content.includes('studentEnrollments') && content.includes('teacherId');
  } catch (error) {
    return false;
  }
}

// Test 7: Check if TeacherHomework component exists
function testTeacherHomeworkComponent() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'TeacherHomework.tsx');
    return fs.existsSync(componentPath);
  } catch (error) {
    return false;
  }
}

// Test 8: Check if TeacherStudents component exists
function testTeacherStudentsComponent() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'TeacherStudents.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    return content.includes('studentEnrollments') && content.includes('teacherId');
  } catch (error) {
    return false;
  }
}

// Test 9: Verify mock data relationships
function testMockDataRelationships() {
  try {
    const classes = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'classes.json'), 'utf8'));
    const enrollments = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'studentEnrollments.json'), 'utf8'));
    const students = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'students.json'), 'utf8'));
    
    // Check if enrollments reference valid classes
    const validClassIds = classes.map(cls => cls.class_id);
    const validEnrollments = enrollments.filter(enrollment => validClassIds.includes(enrollment.class_id));
    
    // Check if enrollments reference valid students
    const validStudentIds = students.map(student => student.student_id);
    const validStudentEnrollments = validEnrollments.filter(enrollment => validStudentIds.includes(enrollment.student_id));
    
    return validStudentEnrollments.length > 0;
  } catch (error) {
    return false;
  }
}

// Test 10: Check if API client supports mock mode
function testApiClientMockMode() {
  try {
    const apiClientPath = path.join(__dirname, 'src', 'api', 'edulite.ts');
    const content = fs.readFileSync(apiClientPath, 'utf8');
    return content.includes('isMockMode') && content.includes('localStorage.getItem(\'USE_MOCK\')');
  } catch (error) {
    return false;
  }
}

// Main test runner
function runTeacherPortalTests() {
  console.log('📊 Testing Mock Data Structure...');
  
  logTest('Teacher Data', testTeacherData());
  logTest('Classes Data', testClassesData());
  logTest('Homework Data', testHomeworkData());
  logTest('Student Enrollments', testStudentEnrollments());
  logTest('Students Data', testStudentsData());
  
  console.log('\n🎨 Testing Teacher Components...');
  
  logTest('TeacherClasses Component', testTeacherClassesComponent());
  logTest('TeacherHomework Component', testTeacherHomeworkComponent());
  logTest('TeacherStudents Component', testTeacherStudentsComponent());
  
  console.log('\n🔗 Testing Data Relationships...');
  
  logTest('Mock Data Relationships', testMockDataRelationships());
  logTest('API Client Mock Mode', testApiClientMockMode());
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Teacher portal is ready for mock data testing.');
    console.log('\n💡 To test the teacher portal:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Navigate to teacher pages (TeacherClasses, TeacherHomework, TeacherStudents)');
    console.log('3. You should see data populated from mock files');
    console.log('4. Teacher ID "t-1" will be used by default');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
}

// Run the tests
runTeacherPortalTests(); 