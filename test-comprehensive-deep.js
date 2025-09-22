#!/usr/bin/env node

/**
 * DEEP COMPREHENSIVE TEST - Check for 404s and Database Issues
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://nuet-prep-academy.vercel.app';

class DeepTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
      missingPages: [],
      dbIssues: []
    };
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
          'User-Agent': 'Deep-Tester/1.0',
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

  async testAllPossiblePages() {
    console.log('\n🔍 Testing ALL Possible Pages for 404s...');
    
    const allPossiblePages = [
      // Main pages
      '/',
      '/about',
      '/contact',
      '/courses',
      '/auth/signin',
      '/auth/signup',
      '/auth/forgot-password',
      '/auth/reset-password',
      
      // Student pages
      '/student/dashboard',
      '/student/content-viewer',
      '/my-courses',
      '/progress',
      '/profile',
      
      // Tutor pages
      '/tutor/dashboard',
      '/tutor/courses',
      '/tutor/content-management',
      
      // Admin pages
      '/admin/dashboard',
      '/admin/courses',
      '/admin/courses/page',
      '/admin/analytics',
      '/admin/users',
      '/admin/settings',
      '/admin/students',
      '/admin/tutors',
      '/admin/test-questions',
      '/admin/enrollment-requests',
      '/admin/course-builder',
      '/admin/add-tutor',
      
      // Course pages
      '/courses/page',
      '/courses/[courseId]',
      '/courses/[courseId]/materials',
      '/courses/[courseId]/content',
      
      // Admin course management
      '/admin/courses/[courseId]',
      '/admin/courses/[courseId]/edit',
      '/admin/courses/[courseId]/access-control',
      '/admin/courses/[courseId]/content',
      
      // Test pages
      '/tests/take/[testId]',
      '/tests/[testId]/results',
      
      // Gamification pages
      '/gamification',
      '/leaderboard',
      '/challenges',
      '/study-streak',
      
      // Chat
      '/chat',
      
      // Debug pages (should exist but might be 404)
      '/debug-course-fetch',
      '/fix-course-schema',
      '/fix-rls-policies',
      '/migrate-quiz-fields',
      '/setup-complete-database',
      '/setup-missing-tables',
      '/test-chat',
      '/test-migration',
      '/test-questions-management',
      '/test-signin',
      '/test-student-management'
    ];

    for (const page of allPossiblePages) {
      try {
        const response = await this.makeRequest(`${BASE_URL}${page}`);
        
        if (response.status === 200) {
          this.logTest(`Page ${page}`, 'PASS', 'Page loads successfully');
        } else if (response.status === 404) {
          this.logTest(`Page ${page}`, 'FAIL', 'Page not found (404)');
          this.results.missingPages.push(page);
        } else if (response.status === 401 || response.status === 403) {
          this.logTest(`Page ${page}`, 'PASS', `Page handles auth correctly (${response.status})`);
        } else {
          this.logTest(`Page ${page}`, 'WARN', `Unexpected status (${response.status})`);
        }
      } catch (error) {
        this.logTest(`Page ${page}`, 'FAIL', 'Page failed to load', error.message);
        this.results.missingPages.push(page);
      }
    }
  }

  async testAllAPIEndpoints() {
    console.log('\n🔌 Testing ALL API Endpoints for Database Issues...');
    
    const allAPIs = [
      // Public APIs
      '/api/courses',
      '/api/system-health',
      
      // Admin APIs
      '/api/admin/stats',
      '/api/admin/courses',
      '/api/admin/users',
      '/api/admin/analytics',
      '/api/admin/top-courses',
      '/api/admin/recent-users',
      '/api/admin/settings',
      '/api/admin/courses/import',
      '/api/admin/users/bulk-action',
      
      // User APIs
      '/api/user/avatar',
      '/api/profile',
      '/api/profile/update',
      '/api/profile/change-password',
      
      // Student APIs
      '/api/student/courses',
      '/api/student/materials',
      '/api/student/favorites',
      '/api/student/enrolled-courses',
      '/api/student/bookmarks',
      '/api/student/tests',
      
      // Tutor APIs
      '/api/tutor/courses',
      '/api/tutor/students',
      
      // Chat APIs
      '/api/chat/chats',
      '/api/chat/messages',
      '/api/chat/send',
      '/api/chat/reactions',
      '/api/chat/forward',
      '/api/chat/find-user',
      
      // Course APIs
      '/api/courses/[courseId]/materials',
      '/api/courses/[courseId]/content',
      '/api/courses/[courseId]/progress',
      '/api/courses/[courseId]/tutors',
      '/api/courses/favorite',
      '/api/courses/bookmark',
      '/api/courses/tutors',
      '/api/courses/hybrid',
      
      // Test APIs
      '/api/tests/take',
      '/api/tests/submit',
      '/api/tests/[testId]/results',
      
      // Material APIs
      '/api/materials',
      '/api/materials/upload',
      '/api/materials/progress',
      
      // Enrollment APIs
      '/api/enrollments',
      '/api/student/enroll',
      '/api/student/enroll-alt',
      '/api/student/enroll-simple',
      '/api/student/enroll-temp',
      
      // Payment APIs
      '/api/payments',
      
      // Progress APIs
      '/api/progress',
      
      // Upload APIs
      '/api/upload/file',
      '/api/upload/avatar',
      
      // Auth APIs
      '/api/auth/signup',
      '/api/auth/forgot-password',
      
      // Tutor APIs
      '/api/tutors',
      '/api/admin/tutors',
      '/api/admin/tutors/available',
      '/api/admin/tutors/[id]',
      
      // Admin course management APIs
      '/api/admin/courses/[courseId]',
      '/api/admin/courses/topics',
      '/api/admin/courses/topics-simple',
      '/api/admin/courses/topics/[topicId]',
      '/api/admin/courses/subtopics',
      '/api/admin/courses/subtopics-simple',
      '/api/admin/courses/subtopics/[subtopicId]',
      '/api/admin/courses/materials',
      '/api/admin/courses/materials-simple',
      '/api/admin/courses/materials/[materialId]',
      '/api/admin/courses/tests',
      '/api/admin/courses/tests-simple',
      '/api/admin/courses/tests/[testId]',
      '/api/admin/courses/assign-tutor',
      '/api/admin/courses/available-for-enrollment',
      
      // Admin student management APIs
      '/api/admin/students',
      '/api/admin/students/[id]',
      '/api/admin/students/enroll',
      
      // Admin test question APIs
      '/api/admin/test-questions',
      '/api/admin/test-questions/[id]',
      
      // Admin enrollment request APIs
      '/api/admin/enrollment-requests/approve',
      
      // Admin notification APIs
      '/api/admin/notifications',
      
      // Admin recent activity APIs
      '/api/admin/recent-activity',
      
      // Admin migration APIs
      '/api/admin/migrate-db',
      
      // Admin clear avatars API
      '/api/admin/clear-large-avatars'
    ];

    for (const api of allAPIs) {
      try {
        const response = await this.makeRequest(`${BASE_URL}${api}`);
        
        if (response.status === 200) {
          this.logTest(`API ${api}`, 'PASS', 'API responds correctly');
        } else if (response.status === 401 || response.status === 403) {
          this.logTest(`API ${api}`, 'PASS', `API handles auth correctly (${response.status})`);
        } else if (response.status === 500) {
          this.logTest(`API ${api}`, 'FAIL', `Server error (${response.status})`);
          this.results.dbIssues.push(api);
        } else if (response.status === 404) {
          this.logTest(`API ${api}`, 'FAIL', `API not found (${response.status})`);
          this.results.missingPages.push(api);
        } else {
          this.logTest(`API ${api}`, 'WARN', `Unexpected status (${response.status})`);
        }
      } catch (error) {
        this.logTest(`API ${api}`, 'FAIL', 'API request failed', error.message);
        this.results.dbIssues.push(api);
      }
    }
  }

  async testDatabaseConnectionDeeply() {
    console.log('\n🗄️ Deep Database Connection Testing...');
    
    try {
      // Test system health endpoint
      const healthResponse = await this.makeRequest(`${BASE_URL}/api/system-health`);
      if (healthResponse.status === 200 && healthResponse.data) {
        this.logTest('System Health Check', 'PASS', 'System health endpoint working');
        
        // Check specific database indicators
        if (healthResponse.data.health && healthResponse.data.health.database) {
          const dbStatus = healthResponse.data.health.database.status;
          if (dbStatus === 'healthy') {
            this.logTest('Database Status', 'PASS', 'Database reported as healthy');
          } else {
            this.logTest('Database Status', 'WARN', `Database status: ${dbStatus}`);
            this.results.dbIssues.push('Database status not healthy');
          }
        }
        
        // Check for fallback indicators
        if (healthResponse.data.health && healthResponse.data.health.databaseFallbacks) {
          const fallbacks = healthResponse.data.health.databaseFallbacks;
          if (fallbacks.status === 'active') {
            this.logTest('Database Fallbacks', 'PASS', 'Database fallbacks are active');
          } else {
            this.logTest('Database Fallbacks', 'WARN', 'Database fallbacks not active');
          }
        }
      } else {
        this.logTest('System Health Check', 'FAIL', 'System health check failed');
        this.results.dbIssues.push('System health check failed');
      }
    } catch (error) {
      this.logTest('Database Deep Test', 'FAIL', 'Database deep test failed', error.message);
      this.results.dbIssues.push('Database deep test failed');
    }
  }

  generateDetailedReport() {
    console.log('\n📊 DETAILED DEEP TEST REPORT');
    console.log('=====================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Total Tests: ${this.results.tests.length}`);
    
    const successRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (this.results.missingPages.length > 0) {
      console.log('\n🚨 MISSING PAGES (404s):');
      this.results.missingPages.forEach(page => {
        console.log(`   ❌ ${page}`);
      });
    }
    
    if (this.results.dbIssues.length > 0) {
      console.log('\n🗄️ DATABASE ISSUES:');
      this.results.dbIssues.forEach(issue => {
        console.log(`   ⚠️  ${issue}`);
      });
    }
    
    if (this.results.failed === 0 && this.results.warnings <= 2) {
      console.log('\n🎉 PRODUCTION READY! Website is ready for production deployment.');
    } else if (this.results.failed <= 2) {
      console.log('\n⚠️  MOSTLY READY: Minor issues need attention before production.');
    } else {
      console.log('\n🚨 NOT READY: Critical issues must be fixed before production.');
    }
  }

  async runDeepTests() {
    console.log('🚀 Starting Deep Comprehensive Test...');
    console.log(`🌐 Testing: ${BASE_URL}`);
    console.log('================================================');
    
    await this.testAllPossiblePages();
    await this.testAllAPIEndpoints();
    await this.testDatabaseConnectionDeeply();
    
    this.generateDetailedReport();
  }
}

// Run the deep tests
const tester = new DeepTester();
tester.runDeepTests().catch(console.error);
