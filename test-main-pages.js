const https = require('https');

const BASE_URL = 'https://nuet-prep-academy.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data, headers: res.headers });
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

async function testMainPages() {
  console.log('🧪 Testing Main Pages...\n');
  
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/about', name: 'About Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/courses', name: 'Courses Page' },
    { path: '/auth/signin', name: 'Sign In Page' },
    { path: '/auth/signup', name: 'Sign Up Page' },
    { path: '/profile', name: 'Profile Page' },
    { path: '/courses/course-1', name: 'Course Detail Page' }
  ];
  
  let successCount = 0;
  let totalCount = pages.length;
  
  for (const page of pages) {
    try {
      console.log(`Testing ${page.name} (${page.path})...`);
      const response = await makeRequest(`${BASE_URL}${page.path}`);
      
      if (response.status === 200) {
        console.log(`  ✅ SUCCESS (${response.status})`);
        successCount++;
      } else if (response.status === 401) {
        console.log(`  ⚠️  AUTH REQUIRED (${response.status}) - Expected for protected pages`);
        successCount++; // Count as success since it's expected
      } else {
        console.log(`  ❌ ERROR (${response.status})`);
        if (response.data && response.data.includes('error')) {
          console.log(`  Error details: ${response.data.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.log(`  ❌ EXCEPTION: ${error.message}`);
    }
    console.log('');
  }
  
  console.log(`📊 Test Results: ${successCount}/${totalCount} pages working`);
  console.log(`✅ Success Rate: ${Math.round((successCount / totalCount) * 100)}%`);
}

testMainPages().catch(console.error);
