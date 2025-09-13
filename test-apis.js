const https = require('https');

const BASE_URL = 'https://nuet-prep-academy-9h6w7pmy3-saids-projects-c6c9220f.vercel.app';

function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`🔍 Testing: ${endpoint}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (res.statusCode === 200) {
                        console.log(`✅ ${endpoint}: ${res.statusCode} - Success`);
                        resolve({ status: res.statusCode, data: jsonData });
                    } else {
                        console.log(`❌ ${endpoint}: ${res.statusCode} - ${jsonData.error || 'Error'}`);
                        resolve({ status: res.statusCode, error: jsonData.error });
                    }
                } catch (e) {
                    console.log(`❌ ${endpoint}: ${res.statusCode} - Invalid JSON response`);
                    resolve({ status: res.statusCode, error: 'Invalid JSON' });
                }
            });
        }).on('error', (err) => {
            console.log(`❌ ${endpoint}: Network Error - ${err.message}`);
            reject(err);
        });
    });
}

async function testAllAPIs() {
    console.log('🚀 Starting comprehensive API tests...\n');
    
    const endpoints = [
        // Course APIs
        '/api/courses',
        '/api/courses/course-1',
        '/api/courses/course-2', 
        '/api/courses/course-3',
        '/api/courses/course-4',
        '/api/courses/course-5',
        
        // Student APIs
        '/api/student/courses',
        
        // Admin APIs
        '/api/admin/courses',
        '/api/admin/stats',
        '/api/admin/students',
        '/api/admin/tutors',
        
        // Tutor APIs
        '/api/tutor/courses',
        '/api/tutor/students',
        
        // Auth APIs
        '/api/auth/signup',
        '/api/check-session',
        
        // Chat APIs
        '/api/chat/chats',
        '/api/chat/messages',
        
        // Other APIs
        '/api/profile',
        '/api/tutors'
    ];
    
    const results = {
        success: 0,
        error: 0,
        total: endpoints.length
    };
    
    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest(endpoint);
            if (result.status === 200) {
                results.success++;
            } else {
                results.error++;
            }
        } catch (error) {
            results.error++;
        }
        console.log(''); // Empty line for readability
    }
    
    console.log('📊 Test Summary:');
    console.log(`✅ Successful: ${results.success}`);
    console.log(`❌ Failed: ${results.error}`);
    console.log(`📈 Success Rate: ${((results.success / results.total) * 100).toFixed(1)}%`);
}

// Run the tests
testAllAPIs().catch(console.error);
