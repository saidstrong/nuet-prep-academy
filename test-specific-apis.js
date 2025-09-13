const https = require('https');

const BASE_URL = 'https://nuet-prep-academy.vercel.app';

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

async function testSpecificAPIs() {
  console.log('🧪 Testing Specific APIs...\n');
  
  // Test public APIs that should work
  const publicAPIs = [
    '/api/courses',
    '/api/courses/fallback',
    '/api/check-env',
    '/api/simple-test'
  ];
  
  for (const api of publicAPIs) {
    try {
      console.log(`Testing ${api}...`);
      const response = await makeRequest(`${BASE_URL}${api}`);
      console.log(`  Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`  ✅ SUCCESS`);
        if (api === '/api/courses' && response.data.courses) {
          console.log(`  📊 Found ${response.data.courses.length} courses`);
        }
      } else {
        console.log(`  ❌ ERROR: ${response.status}`);
        if (response.data && typeof response.data === 'object') {
          console.log(`  Error details:`, JSON.stringify(response.data, null, 2));
        }
      }
    } catch (error) {
      console.log(`  ❌ EXCEPTION: ${error.message}`);
    }
    console.log('');
  }
  
  // Test course detail APIs
  console.log('Testing Course Detail APIs...\n');
  const courseIds = ['course-1', 'course-2', 'course-3'];
  
  for (const courseId of courseIds) {
    try {
      console.log(`Testing /api/courses/${courseId}...`);
      const response = await makeRequest(`${BASE_URL}/api/courses/${courseId}`);
      console.log(`  Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`  ✅ SUCCESS`);
      } else {
        console.log(`  ❌ ERROR: ${response.status}`);
        if (response.data && typeof response.data === 'object') {
          console.log(`  Error details:`, JSON.stringify(response.data, null, 2));
        }
      }
    } catch (error) {
      console.log(`  ❌ EXCEPTION: ${error.message}`);
    }
    console.log('');
  }
}

testSpecificAPIs().catch(console.error);
