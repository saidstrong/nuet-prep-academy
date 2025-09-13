const https = require('https');

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
    console.log('🔐 Testing Authentication System...\n');
    
    // Test credentials
    const testCredentials = [
        { email: 'admin@nuet.com', password: 'admin123', role: 'ADMIN' },
        { email: 'tutor@nuet.com', password: 'tutor123', role: 'TUTOR' },
        { email: 'student@nuet.com', password: 'student123', role: 'STUDENT' },
        { email: 'anton.ivanova@gmail.com', password: 'admin123', role: 'ADMIN' }
    ];
    
    for (const cred of testCredentials) {
        try {
            console.log(`🔍 Testing: ${cred.email} (${cred.role})`);
            
            const response = await fetch(`${BASE_URL}/api/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: cred.email,
                    password: cred.password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ ${cred.email}: Authentication successful`);
            } else {
                console.log(`❌ ${cred.email}: ${data.error || 'Authentication failed'}`);
            }
        } catch (error) {
            console.log(`❌ ${cred.email}: Network error - ${error.message}`);
        }
        console.log('');
    }
    
    console.log('🎉 Authentication test complete!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@nuet.com / admin123');
    console.log('Tutor: tutor@nuet.com / tutor123');
    console.log('Student: student@nuet.com / student123');
    console.log('Your Account: anton.ivanova@gmail.com / admin123');
}

// Run the test
testAuth().catch(console.error);
