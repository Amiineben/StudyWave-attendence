/**
 * Test API Endpoints
 * Tests registration and login API endpoints directly
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRegistrationAPI() {
  console.log('🧪 Testing Registration API...\n');
  
  const testUser = {
    name: 'API Test User',
    email: 'apitest@studywave.ma',
    password: 'testpass123',
    role: 'student'
  };
  
  try {
    // Test registration
    console.log('📝 Testing registration endpoint...');
    console.log('Request data:', testUser);
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response:', {
      success: registerResponse.data.success,
      message: registerResponse.data.message,
      user: registerResponse.data.data?.user?.name,
      role: registerResponse.data.data?.user?.role,
      hasToken: !!registerResponse.data.data?.token
    });
    
    // Test login with the same credentials
    console.log('\n🚪 Testing login with new account...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log('Login response:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      user: loginResponse.data.data?.user?.name,
      role: loginResponse.data.data?.user?.role,
      hasToken: !!loginResponse.data.data?.token
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Make sure backend is running on http://localhost:5000');
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

async function testDemoLogin() {
  console.log('\n🔐 Testing demo account login...\n');
  
  const demoAccounts = [
    { email: 'admin@studywave.ma', password: 'demo123', role: 'admin' },
    { email: 'professor@studywave.ma', password: 'demo123', role: 'professor' },
    { email: 'student@studywave.ma', password: 'demo123', role: 'student' }
  ];
  
  for (const account of demoAccounts) {
    try {
      console.log(`Testing ${account.role}: ${account.email}`);
      
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: account.email,
        password: account.password
      });
      
      console.log(`✅ ${account.role} login successful`);
      console.log(`   User: ${response.data.data?.user?.name}`);
      console.log(`   Role: ${response.data.data?.user?.role}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${account.role} login failed`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message}`);
      }
      console.log('');
    }
  }
}

async function checkServerStatus() {
  console.log('🔍 Checking server status...\n');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running');
    console.log('Health check:', {
      status: response.data.status,
      message: response.data.message,
      database: response.data.database?.status
    });
    return true;
  } catch (error) {
    console.log('❌ Server is not responding');
    console.log('Make sure to start the backend server:');
    console.log('   cd backend');
    console.log('   npm run dev');
    return false;
  }
}

async function main() {
  console.log('🚀 StudyWave API Testing\n');
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Test demo logins
  await testDemoLogin();
  
  // Test registration
  await testRegistrationAPI();
  
  console.log('\n🎉 API testing completed!');
  console.log('\n💡 If registration failed, check:');
  console.log('   1. Backend server is running (npm run dev)');
  console.log('   2. MongoDB is running');
  console.log('   3. Database is seeded (npm run seed)');
  console.log('   4. No validation errors in the request');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRegistrationAPI, testDemoLogin };
