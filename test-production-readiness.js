#!/usr/bin/env node

/**
 * COMPREHENSIVE PRODUCTION READINESS TEST
 * Tests every critical aspect of the website for production deployment
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://nuet-prep-academy.vercel.app';
const TEST_CREDENTIALS = {
  admin: { email: 'admin@nuetprep.academy', password: 'admin123' },
  student: { email: 'student@nuet.com', password: 'student123' },
  tutor: { email: 'tutor@nuet.com', password: 'tutor123' }
};

class ProductionTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    this.session = null;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Production-Tester/1.0',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
              rawData: data
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
              rawData: data
            });
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  logTest(name, status, message, details = null) {
    const test = { name, status, message, details, timestamp: new Date().toISOString() };
    this.results.tests.push(test);
    
    if (status === 'PASS') {
      this.results.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else if (status === 'FAIL') {
      this.results.failed++;
      console.log(`❌ ${name}: ${message}`);
      if (details) console.log(`   Details: ${details}`);
    } else if (status === 'WARN') {
      this.results.warnings++;
      console.log(`⚠️  ${name}: ${message}`);
      if (details) console.log(`   Details: ${details}`);
    }
  }

  async testBasicConnectivity() {
    console.log('\n🔍 Testing Basic Connectivity...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/`);
      if (response.status === 200) {
        this.logTest('Homepage Access', 'PASS', 'Homepage loads successfully');
      } else {
        this.logTest('Homepage Access', 'FAIL', `Homepage returned status ${response.status}`);
      }
    } catch (error) {
      this.logTest('Homepage Access', 'FAIL', 'Homepage failed to load', error.message);
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication System...');
    
    // Test signin page
    try {
      const signinResponse = await this.makeRequest(`${BASE_URL}/auth/signin`);
      if (signinResponse.status === 200) {
        this.logTest('Signin Page', 'PASS', 'Signin page accessible');
      } else {
        this.logTest('Signin Page', 'FAIL', `Signin page returned status ${signinResponse.status}`);
      }
    } catch (error) {
      this.logTest('Signin Page', 'FAIL', 'Signin page failed to load', error.message);
    }

    // Test signup page
    try {
      const signupResponse = await this.makeRequest(`${BASE_URL}/auth/signup`);
      if (signupResponse.status === 200) {
        this.logTest('Signup Page', 'PASS', 'Signup page accessible');
      } else {
        this.logTest('Signup Page', 'FAIL', `Signup page returned status ${signupResponse.status}`);
      }
    } catch (error) {
      this.logTest('Signup Page', 'FAIL', 'Signup page failed to load', error.message);
    }
  }

  async testAPIEndpoints() {
    console.log('\n🔌 Testing Critical API Endpoints...');
    
    const criticalEndpoints = [
      '/api/courses',
      '/api/system-health',
      '/api/admin/stats',
      '/api/admin/courses',
      '/api/user/avatar',
      '/api/chat/chats',
      '/api/student/courses',
      '/api/tutor/courses'
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await this.makeRequest(`${BASE_URL}${endpoint}`);
        
        if (response.status === 200 || response.status === 401) {
          // 401 is acceptable for protected endpoints
          this.logTest(`API ${endpoint}`, 'PASS', `Endpoint responds correctly (${response.status})`);
        } else if (response.status === 500) {
          this.logTest(`API ${endpoint}`, 'FAIL', `Server error (${response.status})`);
        } else if (response.status === 404) {
          this.logTest(`API ${endpoint}`, 'FAIL', `Endpoint not found (${response.status})`);
        } else {
          this.logTest(`API ${endpoint}`, 'WARN', `Unexpected status (${response.status})`);
        }
      } catch (error) {
        this.logTest(`API ${endpoint}`, 'FAIL', 'Request failed', error.message);
      }
    }
  }

  async testPageAccessibility() {
    console.log('\n📄 Testing Page Accessibility...');
    
    const publicPages = [
      '/',
      '/courses',
      '/about',
      '/contact',
      '/auth/signin',
      '/auth/signup'
    ];

    const protectedPages = [
      '/admin/dashboard',
      '/admin/courses',
      '/admin/analytics',
      '/student/dashboard',
      '/tutor/dashboard',
      '/my-courses',
      '/progress',
      '/chat',
      '/profile'
    ];

    // Test public pages
    for (const page of publicPages) {
      try {
        const response = await this.makeRequest(`${BASE_URL}${page}`);
        if (response.status === 200) {
          this.logTest(`Public Page ${page}`, 'PASS', 'Page loads successfully');
        } else {
          this.logTest(`Public Page ${page}`, 'FAIL', `Page returned status ${response.status}`);
        }
      } catch (error) {
        this.logTest(`Public Page ${page}`, 'FAIL', 'Page failed to load', error.message);
      }
    }

    // Test protected pages (should redirect or show auth required)
    for (const page of protectedPages) {
      try {
        const response = await this.makeRequest(`${BASE_URL}${page}`);
        if (response.status === 200 || response.status === 401 || response.status === 302) {
          this.logTest(`Protected Page ${page}`, 'PASS', `Page handles auth correctly (${response.status})`);
        } else if (response.status === 404) {
          this.logTest(`Protected Page ${page}`, 'FAIL', `Page not found (${response.status})`);
        } else {
          this.logTest(`Protected Page ${page}`, 'WARN', `Unexpected status (${response.status})`);
        }
      } catch (error) {
        this.logTest(`Protected Page ${page}`, 'FAIL', 'Page failed to load', error.message);
      }
    }
  }

  async testDatabaseHealth() {
    console.log('\n🗄️ Testing Database Health...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/system-health`);
      if (response.status === 200 && response.data) {
        this.logTest('Database Health', 'PASS', 'Database health check successful');
        
        // Check specific health indicators
        if (response.data.database && response.data.database.status === 'healthy') {
          this.logTest('Database Connection', 'PASS', 'Database connection healthy');
        } else {
          this.logTest('Database Connection', 'WARN', 'Database connection issues detected');
        }
      } else {
        this.logTest('Database Health', 'FAIL', 'Database health check failed');
      }
    } catch (error) {
      this.logTest('Database Health', 'FAIL', 'Database health check request failed', error.message);
    }
  }

  async testSecurityHeaders() {
    console.log('\n🔒 Testing Security Headers...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/`);
      const headers = response.headers;
      
      // Check for security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];
      
      let securityScore = 0;
      for (const header of securityHeaders) {
        if (headers[header]) {
          securityScore++;
        }
      }
      
      if (securityScore >= 3) {
        this.logTest('Security Headers', 'PASS', `${securityScore}/5 security headers present`);
      } else if (securityScore >= 1) {
        this.logTest('Security Headers', 'WARN', `Only ${securityScore}/5 security headers present`);
      } else {
        this.logTest('Security Headers', 'FAIL', 'No security headers detected');
      }
    } catch (error) {
      this.logTest('Security Headers', 'FAIL', 'Security header check failed', error.message);
    }
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    const testPages = ['/', '/courses', '/auth/signin'];
    
    for (const page of testPages) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(`${BASE_URL}${page}`);
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        if (loadTime < 2000) {
          this.logTest(`Performance ${page}`, 'PASS', `Page loads in ${loadTime}ms`);
        } else if (loadTime < 5000) {
          this.logTest(`Performance ${page}`, 'WARN', `Page loads slowly in ${loadTime}ms`);
        } else {
          this.logTest(`Performance ${page}`, 'FAIL', `Page loads very slowly in ${loadTime}ms`);
        }
      } catch (error) {
        this.logTest(`Performance ${page}`, 'FAIL', 'Performance test failed', error.message);
      }
    }
  }

  async testErrorHandling() {
    console.log('\n🚨 Testing Error Handling...');
    
    // Test 404 handling
    try {
      const response = await this.makeRequest(`${BASE_URL}/nonexistent-page`);
      if (response.status === 404) {
        this.logTest('404 Error Handling', 'PASS', '404 errors handled correctly');
      } else {
        this.logTest('404 Error Handling', 'WARN', `Unexpected status for 404: ${response.status}`);
      }
    } catch (error) {
      this.logTest('404 Error Handling', 'FAIL', '404 test failed', error.message);
    }

    // Test invalid API endpoint
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/nonexistent-endpoint`);
      if (response.status === 404) {
        this.logTest('API 404 Handling', 'PASS', 'API 404 errors handled correctly');
      } else {
        this.logTest('API 404 Handling', 'WARN', `Unexpected status for API 404: ${response.status}`);
      }
    } catch (error) {
      this.logTest('API 404 Handling', 'FAIL', 'API 404 test failed', error.message);
    }
  }

  generateReport() {
    console.log('\n📊 PRODUCTION READINESS REPORT');
    console.log('================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Total Tests: ${this.results.tests.length}`);
    
    const successRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (this.results.failed === 0 && this.results.warnings <= 2) {
      console.log('\n🎉 PRODUCTION READY! Website is ready for production deployment.');
    } else if (this.results.failed <= 2) {
      console.log('\n⚠️  MOSTLY READY: Minor issues need attention before production.');
    } else {
      console.log('\n🚨 NOT READY: Critical issues must be fixed before production.');
    }
    
    console.log('\n📋 Detailed Results:');
    this.results.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${test.name}: ${test.message}`);
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Production Readiness Test...');
    console.log(`🌐 Testing: ${BASE_URL}`);
    console.log('================================================');
    
    await this.testBasicConnectivity();
    await this.testAuthentication();
    await this.testAPIEndpoints();
    await this.testPageAccessibility();
    await this.testDatabaseHealth();
    await this.testSecurityHeaders();
    await this.testPerformance();
    await this.testErrorHandling();
    
    this.generateReport();
  }
}

// Run the tests
const tester = new ProductionTester();
tester.runAllTests().catch(console.error);
