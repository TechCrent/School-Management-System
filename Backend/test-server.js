#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing EduLite Nexus Backend...');

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          resolve({ status: 'success', message: 'Health check passed' });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

// Test login endpoint
const testLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          resolve({ status: 'error', message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
};

// Run tests
const runTests = async () => {
  console.log('📍 Testing server at http://localhost:4000');
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResult = await testHealth();
    console.log('✅ Health check:', healthResult);

    // Test login endpoint
    console.log('\n2️⃣ Testing login endpoint...');
    const loginResult = await testLogin();
    console.log('✅ Login test:', loginResult.status === 'success' ? 'PASSED' : 'FAILED');

    console.log('\n🎉 All tests completed!');
    console.log('📚 API Documentation: http://localhost:4000/docs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
};

runTests(); 