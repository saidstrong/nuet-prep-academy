const https = require('https');

const BASE_URL = 'https://nuet-prep-academy-321zs0pgv-saids-projects-c6c9220f.vercel.app';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test functions
async function testHomepage() {
  console.log('\n🏠 Testing Homepage...');
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    console.log(`✅ Homepage: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
    if (response.status !== 200) {
      console.log('❌ Homepage error:', response.data);
    }
  } catch (error) {
    console.log('❌ Homepage error:', error.message);
  }
}

async function testCoursesAPI() {
  console.log('\n📚 Testing Courses API...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/courses`);
    console.log(`✅ Courses API: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
    if (response.status === 200) {
      console.log(`📊 Found ${response.data.courses?.length || 0} courses`);
    } else {
      console.log('❌ Courses API error:', response.data);
    }
  } catch (error) {
    console.log('❌ Courses API error:', error.message);
  }
}

async function testAuthPages() {
  console.log('\n🔐 Testing Authentication Pages...');
  
  const authPages = ['/auth/signin', '/auth/signup'];
  
  for (const page of authPages) {
    try {
      const response = await makeRequest(`${BASE_URL}${page}`);
      console.log(`✅ ${page}: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
      if (response.status !== 200) {
        console.log(`❌ ${page} error:`, response.data);
      }
    } catch (error) {
      console.log(`❌ ${page} error:`, error.message);
    }
  }
}

async function testDashboardPages() {
  console.log('\n📊 Testing Dashboard Pages...');
  
  const dashboardPages = [
    '/student/dashboard',
    '/tutor/dashboard', 
    '/admin/dashboard',
    '/admin/courses',
    '/admin/tutors',
    '/admin/students',
    '/admin/enrollment-requests'
  ];
  
  for (const page of dashboardPages) {
    try {
      const response = await makeRequest(`${BASE_URL}${page}`);
      console.log(`✅ ${page}: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
      if (response.status !== 200) {
        console.log(`❌ ${page} error:`, response.data);
      }
    } catch (error) {
      console.log(`❌ ${page} error:`, error.message);
    }
  }
}

async function testPublicAPIs() {
  console.log('\n🔌 Testing Public APIs...');
  
  const publicAPIs = [
    '/api/courses',
    '/api/courses/fallback',
    '/api/check-env',
    '/api/simple-test'
  ];
  
  for (const api of publicAPIs) {
    try {
      const response = await makeRequest(`${BASE_URL}${api}`);
      console.log(`✅ ${api}: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
      if (response.status !== 200) {
        console.log(`❌ ${api} error:`, response.data);
      }
    } catch (error) {
      console.log(`❌ ${api} error:`, error.message);
    }
  }
}

async function testCourseDetailPages() {
  console.log('\n📖 Testing Course Detail Pages...');
  
  const courseIds = ['course-1', 'course-2', 'course-3'];
  
  for (const courseId of courseIds) {
    try {
      const response = await makeRequest(`${BASE_URL}/courses/${courseId}`);
      console.log(`✅ /courses/${courseId}: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
      if (response.status !== 200) {
        console.log(`❌ /courses/${courseId} error:`, response.data);
      }
    } catch (error) {
      console.log(`❌ /courses/${courseId} error:`, error.message);
    }
  }
}

async function testOtherPages() {
  console.log('\n📄 Testing Other Pages...');
  
  const otherPages = [
    '/about',
    '/contact',
    '/courses',
    '/profile',
    '/challenges',
    '/leaderboard',
    '/gamification'
  ];
  
  for (const page of otherPages) {
    try {
      const response = await makeRequest(`${BASE_URL}${page}`);
      console.log(`✅ ${page}: ${response.status} - ${response.status === 200 ? 'OK' : 'ERROR'}`);
      if (response.status !== 200) {
        console.log(`❌ ${page} error:`, response.data);
      }
    } catch (error) {
      console.log(`❌ ${page} error:`, error.message);
    }
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 Starting Comprehensive Website Testing...');
  console.log(`🌐 Testing: ${BASE_URL}`);
  
  await testHomepage();
  await testCoursesAPI();
  await testAuthPages();
  await testDashboardPages();
  await testPublicAPIs();
  await testCourseDetailPages();
  await testOtherPages();
  
  console.log('\n✅ Testing Complete!');
}

// Run the tests
runAllTests().catch(console.error);
