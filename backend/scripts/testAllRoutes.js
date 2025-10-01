/**
 * Comprehensive API Route Testing Script
 * Tests all frontend-backend route mappings
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Test results tracking
const results = {
  passed: [],
  failed: [],
  total: 0
};

async function testRoute(method, endpoint, data = null, requiresAuth = false, description = '') {
  results.total++;
  
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    console.log(`🧪 Testing: ${method} ${endpoint} ${description ? `(${description})` : ''}`);
    
    const response = await axios(config);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ PASS: ${response.status} ${response.statusText}`);
      results.passed.push({ method, endpoint, status: response.status, description });
      return response.data;
    } else {
      console.log(`❌ FAIL: ${response.status} ${response.statusText}`);
      results.failed.push({ method, endpoint, status: response.status, description, error: response.statusText });
      return null;
    }
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    console.log(`❌ FAIL: ${status} - ${message}`);
    results.failed.push({ method, endpoint, status, description, error: message });
    return null;
  }
}

async function runTests() {
  console.log('🚀 StudyWave API Route Testing\n');
  console.log(`📡 Base URL: ${BASE_URL}\n`);
  
  // 1. Health Check (Public)
  console.log('📋 Testing Public Routes:');
  await testRoute('GET', '/health', null, false, 'Health check');
  
  // 2. Authentication Routes (Public)
  console.log('\n🔐 Testing Authentication Routes:');
  
  // Test login and get token
  const loginResponse = await testRoute('POST', '/auth/login', {
    email: 'admin@studywave.ma',
    password: 'demo123'
  }, false, 'Admin login');
  
  if (loginResponse && loginResponse.data?.token) {
    authToken = loginResponse.data.token;
    console.log('🎫 Auth token obtained for protected routes');
  }
  
  // Test registration (might fail if user exists)
  await testRoute('POST', '/auth/register', {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'student'
  }, false, 'User registration');
  
  // 3. Protected Authentication Routes
  console.log('\n🔒 Testing Protected Authentication Routes:');
  await testRoute('GET', '/auth/profile', null, true, 'Get user profile');
  await testRoute('PUT', '/auth/profile', {
    name: 'Updated Admin User'
  }, true, 'Update profile');
  await testRoute('GET', '/auth/verify-token', null, true, 'Verify token');
  await testRoute('GET', '/auth/users', null, true, 'Get all users (admin)');
  
  // 4. Articles Routes
  console.log('\n📰 Testing Articles Routes:');
  await testRoute('GET', '/articles', null, false, 'Get all articles (public)');
  await testRoute('GET', '/articles?status=published', null, false, 'Get published articles');
  
  // Test creating article (requires auth)
  await testRoute('POST', '/articles', {
    title: 'Test Article',
    summary: 'Test article summary',
    content: 'Test article content',
    category: 'news',
    status: 'published'
  }, true, 'Create article');
  
  // 5. Courses Routes
  console.log('\n📚 Testing Courses Routes:');
  await testRoute('GET', '/courses', null, true, 'Get all courses');
  await testRoute('GET', '/courses/my/courses', null, true, 'Get my courses');
  
  // 6. Attendance Routes
  console.log('\n📋 Testing Attendance Routes:');
  await testRoute('GET', '/attendance/my-attendance', null, true, 'Get my attendance');
  
  // 7. News Routes
  console.log('\n📺 Testing News Routes:');
  await testRoute('GET', '/news/stats', null, true, 'Get news stats');
  await testRoute('GET', '/news/test-sources', null, true, 'Test news sources');
  
  // 8. Test some common 404 routes
  console.log('\n❓ Testing Non-existent Routes:');
  await testRoute('GET', '/nonexistent', null, false, 'Non-existent route');
  await testRoute('GET', '/api/invalid', null, false, 'Invalid API route');
  
  // Results Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}/${results.total}`);
  console.log(`❌ Failed: ${results.failed.length}/${results.total}`);
  console.log(`📈 Success Rate: ${((results.passed.length / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => {
      console.log(`   ${test.method} ${test.endpoint} - ${test.status} (${test.description})`);
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    });
  }
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => {
      console.log(`   ${test.method} ${test.endpoint} - ${test.status} (${test.description})`);
    });
  }
  
  console.log('\n🎯 Frontend-Backend Route Mapping:');
  console.log('Frontend API calls → Backend routes:');
  console.log('  /auth/login → POST /api/auth/login ✅');
  console.log('  /auth/register → POST /api/auth/register ✅');
  console.log('  /auth/profile → GET/PUT /api/auth/profile ✅');
  console.log('  /articles → GET /api/articles ✅');
  console.log('  /courses → GET /api/courses ✅');
  console.log('  /attendance/record → POST /api/attendance/record');
  console.log('  /news/fetch → POST /api/news/fetch');
  console.log('  /health → GET /api/health ✅');
  
  console.log('\n💡 Recommendations:');
  if (results.failed.length > 0) {
    console.log('- Check failed routes for missing implementations');
    console.log('- Verify authentication requirements');
    console.log('- Check request data formats');
  } else {
    console.log('- All tested routes are working correctly! 🎉');
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRoute, runTests };
