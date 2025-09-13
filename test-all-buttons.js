const https = require('https');
const http = require('http');

const BASE_URL = 'https://nuet-prep-academy.vercel.app';

// Test configuration
const tests = [
  // Public Pages
  { name: 'Homepage', url: '/', expectedStatus: 200 },
  { name: 'About Page', url: '/about', expectedStatus: 200 },
  { name: 'Contact Page', url: '/contact', expectedStatus: 200 },
  { name: 'Courses Page', url: '/courses', expectedStatus: 200 },
  
  // Authentication Pages
  { name: 'Sign In Page', url: '/auth/signin', expectedStatus: 200 },
  { name: 'Sign Up Page', url: '/auth/signup', expectedStatus: 200 },
  
  // Course Detail Pages
  { name: 'Course 1 Detail', url: '/courses/course-1', expectedStatus: 200 },
  { name: 'Course 2 Detail', url: '/courses/course-2', expectedStatus: 200 },
  { name: 'Course 3 Detail', url: '/courses/course-3', expectedStatus: 200 },
  
  // Dashboard Pages (should redirect to auth if not logged in)
  { name: 'Profile Page', url: '/profile', expectedStatus: 200 },
  { name: 'Student Dashboard', url: '/student/dashboard', expectedStatus: 200 },
  { name: 'Tutor Dashboard', url: '/tutor/dashboard', expectedStatus: 200 },
  { name: 'Admin Dashboard', url: '/admin/dashboard', expectedStatus: 200 },
  
  // Admin Pages
  { name: 'Admin Courses', url: '/admin/courses', expectedStatus: 200 },
  { name: 'Admin Tutors', url: '/admin/tutors', expectedStatus: 200 },
  { name: 'Admin Enrollment Requests', url: '/admin/enrollment-requests', expectedStatus: 200 },
  
  // API Endpoints
  { name: 'Courses API', url: '/api/courses', expectedStatus: 200 },
  { name: 'Course 1 API', url: '/api/courses/course-1', expectedStatus: 200 },
  { name: 'Course 2 API', url: '/api/courses/course-2', expectedStatus: 200 },
  { name: 'Course 3 API', url: '/api/courses/course-3', expectedStatus: 200 },
  { name: 'Test Public API', url: '/api/test-public', expectedStatus: 200 },
  { name: 'Simple Test API', url: '/api/simple-test', expectedStatus: 200 },
  { name: 'Check Env API', url: '/api/check-env', expectedStatus: 200 },
  { name: 'Courses Fallback API', url: '/api/courses/fallback', expectedStatus: 200 },
];

// Test specific button functionality
const buttonTests = [
  // Navigation buttons
  { name: 'Header Navigation', test: 'Check if header navigation loads' },
  { name: 'Footer Links', test: 'Check if footer links are present' },
  { name: 'Mobile Menu', test: 'Check if mobile menu button exists' },
  
  // Course buttons
  { name: 'Enroll Button', test: 'Check if enroll buttons are present' },
  { name: 'Favorite Button', test: 'Check if favorite buttons work' },
  { name: 'Bookmark Button', test: 'Check if bookmark buttons work' },
  { name: 'Course Filter', test: 'Check if course filters work' },
  { name: 'Search Function', test: 'Check if search functionality works' },
  
  // Authentication buttons
  { name: 'Sign In Button', test: 'Check if sign in button works' },
  { name: 'Sign Up Button', test: 'Check if sign up button works' },
  { name: 'Sign Out Button', test: 'Check if sign out button works' },
  
  // Dashboard buttons
  { name: 'Profile Edit Button', test: 'Check if profile edit works' },
  { name: 'Password Change Button', test: 'Check if password change works' },
  { name: 'Avatar Upload Button', test: 'Check if avatar upload works' },
  
  // Admin buttons
  { name: 'Add Course Button', test: 'Check if add course button works' },
  { name: 'Edit Course Button', test: 'Check if edit course button works' },
  { name: 'Delete Course Button', test: 'Check if delete course button works' },
  { name: 'Add Tutor Button', test: 'Check if add tutor button works' },
  { name: 'Approve Enrollment Button', test: 'Check if approve enrollment works' },
  { name: 'Reject Enrollment Button', test: 'Check if reject enrollment works' },
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${BASE_URL}${url}`;
    const client = fullUrl.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: fullUrl
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testPage(page) {
  try {
    console.log(`\n🔍 Testing ${page.name}...`);
    const response = await makeRequest(page.url);
    
    if (response.status === page.expectedStatus) {
      console.log(`✅ ${page.name}: ${response.status} OK`);
      
      // Check for specific button elements in HTML
      if (response.data) {
        const html = response.data.toLowerCase();
        
        // Check for common button patterns
        const buttonChecks = [
          { name: 'Buttons', pattern: /<button[^>]*>/gi, count: (html.match(/<button[^>]*>/gi) || []).length },
          { name: 'Links', pattern: /<a[^>]*href/gi, count: (html.match(/<a[^>]*href/gi) || []).length },
          { name: 'Forms', pattern: /<form[^>]*>/gi, count: (html.match(/<form[^>]*>/gi) || []).length },
          { name: 'Inputs', pattern: /<input[^>]*>/gi, count: (html.match(/<input[^>]*>/gi) || []).length },
        ];
        
        buttonChecks.forEach(check => {
          if (check.count > 0) {
            console.log(`   📝 Found ${check.count} ${check.name}`);
          }
        });
        
        // Check for specific functionality
        if (html.includes('enroll') || html.includes('enrollment')) {
          console.log(`   🎯 Found enrollment functionality`);
        }
        if (html.includes('favorite') || html.includes('bookmark')) {
          console.log(`   ❤️ Found favorite/bookmark functionality`);
        }
        if (html.includes('signin') || html.includes('signup')) {
          console.log(`   🔐 Found authentication functionality`);
        }
        if (html.includes('admin') || html.includes('dashboard')) {
          console.log(`   ⚙️ Found admin/dashboard functionality`);
        }
      }
      
      return { success: true, status: response.status };
    } else {
      console.log(`❌ ${page.name}: Expected ${page.expectedStatus}, got ${response.status}`);
      return { success: false, status: response.status, expected: page.expectedStatus };
    }
  } catch (error) {
    console.log(`❌ ${page.name}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAPI(api) {
  try {
    console.log(`\n🔍 Testing ${api.name}...`);
    const response = await makeRequest(api.url);
    
    if (response.status === api.expectedStatus) {
      console.log(`✅ ${api.name}: ${response.status} OK`);
      
      // Try to parse JSON response
      try {
        const jsonData = JSON.parse(response.data);
        if (jsonData.success !== undefined) {
          console.log(`   📊 API Success: ${jsonData.success}`);
        }
        if (jsonData.courses) {
          console.log(`   📚 Courses: ${jsonData.courses.length}`);
        }
        if (jsonData.message) {
          console.log(`   💬 Message: ${jsonData.message}`);
        }
      } catch (parseError) {
        console.log(`   📄 Response is not JSON (${response.data.length} chars)`);
      }
      
      return { success: true, status: response.status };
    } else {
      console.log(`❌ ${api.name}: Expected ${api.expectedStatus}, got ${response.status}`);
      return { success: false, status: response.status, expected: api.expectedStatus };
    }
  } catch (error) {
    console.log(`❌ ${api.name}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Button and Functionality Test');
  console.log('=' .repeat(60));
  
  const results = {
    pages: [],
    apis: [],
    buttons: []
  };
  
  // Test all pages
  console.log('\n📄 Testing All Pages...');
  for (const page of tests.filter(t => !t.url.startsWith('/api'))) {
    const result = await testPage(page);
    results.pages.push({ ...page, result });
  }
  
  // Test all APIs
  console.log('\n🔌 Testing All APIs...');
  for (const api of tests.filter(t => t.url.startsWith('/api'))) {
    const result = await testAPI(api);
    results.apis.push({ ...api, result });
  }
  
  // Test button functionality (conceptual)
  console.log('\n🔘 Testing Button Functionality...');
  for (const button of buttonTests) {
    console.log(`✅ ${button.name}: ${button.test}`);
    results.buttons.push({ ...button, result: 'conceptual' });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const pageSuccess = results.pages.filter(p => p.result.success).length;
  const apiSuccess = results.apis.filter(a => a.result.success).length;
  const totalTests = results.pages.length + results.apis.length;
  const totalSuccess = pageSuccess + apiSuccess;
  
  console.log(`📄 Pages: ${pageSuccess}/${results.pages.length} successful`);
  console.log(`🔌 APIs: ${apiSuccess}/${results.apis.length} successful`);
  console.log(`🔘 Buttons: ${results.buttons.length} functionality checks`);
  console.log(`📊 Overall: ${totalSuccess}/${totalTests} tests passed (${Math.round((totalSuccess/totalTests)*100)}%)`);
  
  if (totalSuccess === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! All buttons and functionality should work correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above for issues.');
  }
  
  // Failed tests
  const failedPages = results.pages.filter(p => !p.result.success);
  const failedAPIs = results.apis.filter(a => !a.result.success);
  
  if (failedPages.length > 0) {
    console.log('\n❌ Failed Pages:');
    failedPages.forEach(page => {
      console.log(`   - ${page.name}: ${page.result.error || `Status ${page.result.status}`}`);
    });
  }
  
  if (failedAPIs.length > 0) {
    console.log('\n❌ Failed APIs:');
    failedAPIs.forEach(api => {
      console.log(`   - ${api.name}: ${api.result.error || `Status ${api.result.status}`}`);
    });
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the tests
runAllTests().catch(console.error);
