#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Frontend-Backend Integration...\n');

// Test configuration
const API_URL = 'http://localhost:4000';
const TEST_USER = { username: 'admin', password: 'admin123' };

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

// Test 1: Check if backend is running
async function testBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    return false;
  }
}

// Test 2: Test login functionality
async function testLogin() {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    const data = await response.json();
    return data.status === 'success' && data.data.token;
  } catch (error) {
    return false;
  }
}

// Test 3: Test students endpoint
async function testStudentsEndpoint(token) {
  try {
    const response = await fetch(`${API_URL}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.status === 'success' && Array.isArray(data.data);
  } catch (error) {
    return false;
  }
}

// Test 4: Test teachers endpoint
async function testTeachersEndpoint(token) {
  try {
    const response = await fetch(`${API_URL}/teachers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.status === 'success' && Array.isArray(data.data);
  } catch (error) {
    return false;
  }
}

// Test 5: Test homework endpoint
async function testHomeworkEndpoint(token) {
  try {
    const response = await fetch(`${API_URL}/homework`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.status === 'success' && Array.isArray(data.data);
  } catch (error) {
    return false;
  }
}

// Test 6: Test classes endpoint
async function testClassesEndpoint(token) {
  try {
    const response = await fetch(`${API_URL}/classes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.status === 'success' && Array.isArray(data.data);
  } catch (error) {
    return false;
  }
}

// Test 7: Test teacher dashboard endpoint
async function testTeacherDashboard(token, teacherId) {
  try {
    const response = await fetch(`${API_URL}/teacher/${teacherId}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    return false;
  }
}

// Test 8: Test frontend API client (mock mode)
function testFrontendApiClient() {
  try {
    // Check if the API client file exists
    const apiClientPath = path.join(__dirname, 'src', 'api', 'edulite.ts');
    console.log('🔍 Checking API client at:', apiClientPath);
    
    if (!fs.existsSync(apiClientPath)) {
      console.log('❌ API client file not found');
      return false;
    }
    
    // Read the file and check for key functions
    const content = fs.readFileSync(apiClientPath, 'utf8');
    const requiredFunctions = [
      'getStudents',
      'getTeachers', 
      'getHomework',
      'getClasses',
      'login',
      'getTeacherDashboard',
      'isMockMode'
    ];
    
    const missingFunctions = requiredFunctions.filter(func => {
      if (func === 'isMockMode') {
        return !content.includes(`function ${func}`);
      }
      return !content.includes(`export async function ${func}`);
    });
    console.log('🔍 Missing functions:', missingFunctions);
    return missingFunctions.length === 0;
  } catch (error) {
    console.log('❌ Error testing API client:', error.message);
    return false;
  }
}

// Test 9: Test frontend data files
function testFrontendDataFiles() {
  try {
    const dataDir = path.join(__dirname, 'src', 'data');
    const requiredFiles = [
      'students.json',
      'teachers.json',
      'homework.json',
      'classes.json',
      'users.json'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(dataDir, file))
    );
    
    return missingFiles.length === 0;
  } catch (error) {
    return false;
  }
}

// Test 10: Test package.json scripts
function testPackageScripts() {
  try {
    const packagePath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packagePath)) {
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const requiredScripts = ['dev', 'build', 'preview'];
    
    const missingScripts = requiredScripts.filter(script => 
      !packageJson.scripts || !packageJson.scripts[script]
    );
    
    return missingScripts.length === 0;
  } catch (error) {
    return false;
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('🔍 Testing Backend Connectivity...');
  
  // Test 1: Backend health
  const backendHealthy = await testBackendHealth();
  logTest('Backend Health Check', backendHealthy, backendHealthy ? '' : 'Backend not running');
  
  if (!backendHealthy) {
    console.log('\n⚠️  Backend is not running. Testing frontend components only...\n');
  } else {
    console.log('\n🔐 Testing Backend Authentication...');
    
    // Test 2: Login
    const loginSuccess = await testLogin();
    logTest('Login Functionality', loginSuccess);
    
    if (loginSuccess) {
      console.log('\n📊 Testing Backend Endpoints...');
      
      // Get token for authenticated requests
      const loginResponse = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
      });
      const loginData = await loginResponse.json();
      const token = loginData.data.token;
      
      // Test 3-6: Core endpoints
      const studentsSuccess = await testStudentsEndpoint(token);
      logTest('Students Endpoint', studentsSuccess);
      
      const teachersSuccess = await testTeachersEndpoint(token);
      logTest('Teachers Endpoint', teachersSuccess);
      
      const homeworkSuccess = await testHomeworkEndpoint(token);
      logTest('Homework Endpoint', homeworkSuccess);
      
      const classesSuccess = await testClassesEndpoint(token);
      logTest('Classes Endpoint', classesSuccess);
      
      // Test 7: Teacher dashboard (if we have a teacher ID)
      if (teachersSuccess) {
        const teachersResponse = await fetch(`${API_URL}/teachers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const teachersData = await teachersResponse.json();
        if (teachersData.data && teachersData.data.length > 0) {
          const teacherId = teachersData.data[0].teacher_id;
          const dashboardSuccess = await testTeacherDashboard(token, teacherId);
          logTest('Teacher Dashboard Endpoint', dashboardSuccess);
        }
      }
    }
  }
  
  console.log('\n🎨 Testing Frontend Components...');
  
  // Test 8-10: Frontend components
  const apiClientSuccess = testFrontendApiClient();
  logTest('Frontend API Client', apiClientSuccess);
  
  const dataFilesSuccess = testFrontendDataFiles();
  logTest('Frontend Data Files', dataFilesSuccess);
  
  const packageScriptsSuccess = testPackageScripts();
  logTest('Package.json Scripts', packageScriptsSuccess);
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Frontend-Backend integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  console.log('\n💡 Next Steps:');
  if (!backendHealthy) {
    console.log('1. Start the backend server: cd Backend && npm run dev');
    console.log('2. Run this test again to verify full integration');
  }
  console.log('3. Start the frontend: npm run dev');
  console.log('4. Test the application in the browser');
}

// Run the tests
runIntegrationTests().catch(console.error); 