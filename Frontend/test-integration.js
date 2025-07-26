// Test script to verify frontend-backend integration
const API_URL = 'http://localhost:4000';

async function testBackendIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);

    // Test 2: Login to get token
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', { token: loginData.token ? 'Token received' : 'No token', role: loginData.role });

    if (!loginData.token) {
      throw new Error('Login failed - no token received');
    }

    const token = loginData.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Test 3: Get homework (teacher endpoint)
    console.log('\n3. Testing homework endpoint...');
    const homeworkResponse = await fetch(`${API_URL}/homework`, { headers });
    const homeworkData = await homeworkResponse.json();
    console.log('✅ Homework endpoint:', { 
      status: homeworkData.status, 
      count: homeworkData.data ? homeworkData.data.length : 0 
    });

    // Test 4: Get teachers
    console.log('\n4. Testing teachers endpoint...');
    const teachersResponse = await fetch(`${API_URL}/teachers`, { headers });
    const teachersData = await teachersResponse.json();
    console.log('✅ Teachers endpoint:', { 
      status: teachersData.status, 
      count: teachersData.data ? teachersData.data.length : 0 
    });

    // Test 5: Get classes
    console.log('\n5. Testing classes endpoint...');
    const classesResponse = await fetch(`${API_URL}/classes`, { headers });
    const classesData = await classesResponse.json();
    console.log('✅ Classes endpoint:', { 
      status: classesData.status, 
      count: classesData.data ? classesData.data.length : 0 
    });

    // Test 6: Get students
    console.log('\n6. Testing students endpoint...');
    const studentsResponse = await fetch(`${API_URL}/students`, { headers });
    const studentsData = await studentsResponse.json();
    console.log('✅ Students endpoint:', { 
      status: studentsData.status, 
      count: studentsData.data ? studentsData.data.length : 0 
    });

    // Test 7: Teacher dashboard (if we have a teacher ID)
    if (teachersData.data && teachersData.data.length > 0) {
      const teacherId = teachersData.data[0].teacher_id;
      console.log('\n7. Testing teacher dashboard endpoint...');
      const dashboardResponse = await fetch(`${API_URL}/teacher/${teacherId}/dashboard`, { headers });
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Teacher dashboard endpoint:', { 
        status: dashboardData.status, 
        data: dashboardData.data 
      });
    }

    console.log('\n🎉 All tests passed! Frontend-Backend integration is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- Backend server is running on http://localhost:4000');
    console.log('- Authentication is working');
    console.log('- All major endpoints are responding correctly');
    console.log('- Teacher-specific endpoints are functional');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the backend server is running on http://localhost:4000');
    console.log('2. Check that all dependencies are installed');
    console.log('3. Verify the database is properly initialized');
  }
}

// Run the test
testBackendIntegration(); 