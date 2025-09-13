const https = require('https');

const BASE_URL = 'https://nuet-prep-academy-bfiftqyqg-saids-projects-c6c9220f.vercel.app';

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
                        console.log(`   Data: ${JSON.stringify(jsonData).substring(0, 100)}...`);
                        resolve({ status: res.statusCode, data: jsonData });
                    } else {
                        console.log(`❌ ${endpoint}: ${res.statusCode} - ${jsonData.error || 'Error'}`);
                        resolve({ status: res.statusCode, error: jsonData.error });
                    }
                } catch (e) {
                    console.log(`❌ ${endpoint}: ${res.statusCode} - Invalid JSON response`);
                    console.log(`   Response: ${data.substring(0, 200)}...`);
                    resolve({ status: res.statusCode, error: 'Invalid JSON' });
                }
            });
        }).on('error', (err) => {
            console.log(`❌ ${endpoint}: Network Error - ${err.message}`);
            reject(err);
        });
    });
}

async function testPreviewAPIs() {
    console.log('🚀 Testing preview deployment (no password protection)...\n');
    
    const endpoints = [
        // Public course APIs
        '/api/courses',
        '/api/courses/course-1',
        '/api/courses/course-2', 
        '/api/courses/course-3',
        '/api/courses/course-4',
        '/api/courses/course-5',
        
        // Public pages
        '/',
        '/courses',
        '/about',
        '/contact',
        
        // Test APIs
        '/api/test-connection',
        '/api/simple-test',
        '/api/check-env'
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
    
    console.log('📊 Preview API Test Summary:');
    console.log(`✅ Successful: ${results.success}`);
    console.log(`❌ Failed: ${results.error}`);
    console.log(`📈 Success Rate: ${((results.success / results.total) * 100).toFixed(1)}%`);
    
    if (results.success > 0) {
        console.log('\n🎉 Great! The preview deployment is working without password protection!');
        console.log('You can now test your website functions properly.');
    }
}

// Run the tests
testPreviewAPIs().catch(console.error);
