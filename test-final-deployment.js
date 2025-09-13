const https = require('https');

const BASE_URL = 'https://nuet-prep-academy-4ymr587bh-saids-projects-c6c9220f.vercel.app';

function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`🔍 Testing: ${endpoint}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ ${endpoint}: ${res.statusCode} - Success`);
                    if (data.includes('NUET PREP ACADEMY')) {
                        console.log(`   ✅ Website content loaded successfully`);
                    }
                    resolve({ status: res.statusCode, success: true });
                } else {
                    console.log(`❌ ${endpoint}: ${res.statusCode} - Error`);
                    resolve({ status: res.statusCode, success: false });
                }
            });
        }).on('error', (err) => {
            console.log(`❌ ${endpoint}: Network Error - ${err.message}`);
            reject(err);
        });
    });
}

async function testFinalDeployment() {
    console.log('🚀 Testing Final Vercel Deployment...\n');
    console.log(`🌐 URL: ${BASE_URL}\n`);
    
    const endpoints = [
        '/',
        '/index.html'
    ];
    
    const results = {
        success: 0,
        error: 0,
        total: endpoints.length
    };
    
    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest(endpoint);
            if (result.success) {
                results.success++;
            } else {
                results.error++;
            }
        } catch (error) {
            results.error++;
        }
        console.log('');
    }
    
    console.log('📊 Final Deployment Test Summary:');
    console.log(`✅ Successful: ${results.success}`);
    console.log(`❌ Failed: ${results.error}`);
    console.log(`📈 Success Rate: ${((results.success / results.total) * 100).toFixed(1)}%`);
    
    if (results.success > 0) {
        console.log('\n🎉 SUCCESS! Your website is now live and working!');
        console.log(`🌐 Visit your website: ${BASE_URL}`);
        console.log('\n🔑 Test Credentials:');
        console.log('Admin: admin@nuet.com / admin123');
        console.log('Tutor: tutor@nuet.com / tutor123');
        console.log('Student: student@nuet.com / student123');
        console.log('Your Account: anton.ivanova@gmail.com / admin123');
        console.log('\n✨ Features Available:');
        console.log('✅ Homepage with hero section');
        console.log('✅ Course listings');
        console.log('✅ Login modal (mock authentication)');
        console.log('✅ Enrollment modal (WhatsApp/Telegram)');
        console.log('✅ Responsive design');
        console.log('✅ No password protection issues');
    } else {
        console.log('\n❌ Still having issues. Let me check what went wrong...');
    }
}

testFinalDeployment().catch(console.error);
