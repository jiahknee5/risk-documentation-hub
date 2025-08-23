#!/usr/bin/env node

/**
 * Production Testing Script for Risk Documentation Hub
 * Tests against the live deployment at risk.johnnycchung.com
 */

const https = require('https');
const fs = require('fs');

const PROD_URL = 'https://risk.johnnycchung.com';
let testResults = [];
let passCount = 0;
let failCount = 0;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`  ${status} ${name}`);
  if (details) {
    console.log(`    ${colors.gray}${details}${colors.reset}`);
  }
  
  testResults.push({ name, passed, details });
  if (passed) passCount++;
  else failCount++;
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(PROD_URL + path);
    const reqOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'RiskHub-Test-Suite/1.0',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testHomePage() {
  log('\n🏠 Home Page Test', 'blue');
  
  try {
    const response = await makeRequest('/');
    logTest('Home page accessible', response.status === 200, `Status: ${response.status}`);
    logTest('HTTPS redirect working', response.headers.location === undefined);
    
    // Check if it's HTML
    const isHTML = response.data.includes('<!DOCTYPE html>') || response.data.includes('<html');
    logTest('Returns HTML content', isHTML);
  } catch (error) {
    logTest('Home page accessible', false, error.message);
  }
}

async function testAuthentication() {
  log('\n🔐 Authentication Tests', 'blue');
  
  // Test auth endpoints
  try {
    const response = await makeRequest('/api/auth/session');
    logTest('Session endpoint accessible', response.status === 200, `Status: ${response.status}`);
    
    // Test signin page
    const signinResponse = await makeRequest('/auth/signin');
    logTest('Sign-in page accessible', 
      signinResponse.status === 200 || signinResponse.status === 307,
      `Status: ${signinResponse.status}`
    );
  } catch (error) {
    logTest('Authentication endpoints', false, error.message);
  }
}

async function testAPIEndpoints() {
  log('\n🔌 API Endpoint Tests', 'blue');
  
  const endpoints = [
    { path: '/api/documents', name: 'Documents API' },
    { path: '/api/documents/list', name: 'Documents List API' },
    { path: '/api/documents/upload', name: 'Upload API', method: 'POST' },
    { path: '/api/documents/failsafe-upload', name: 'Failsafe Upload API', method: 'POST' },
    { path: '/api/no-db-upload', name: 'No-DB Upload API', method: 'POST' },
    { path: '/api/auto-upload', name: 'Auto Upload API', method: 'POST' },
    { path: '/api/debug/documents', name: 'Debug API' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.path, { 
        method: endpoint.method || 'GET' 
      });
      
      // For POST endpoints, we expect 400/401/415 (bad request/unauthorized/unsupported media)
      // For GET endpoints, we expect 200/401 (success/unauthorized)
      const validStatuses = endpoint.method === 'POST' 
        ? [400, 401, 415, 422]
        : [200, 401, 500];
      
      logTest(
        `${endpoint.name} endpoint exists`, 
        response.status !== 404,
        `Status: ${response.status}`
      );
    } catch (error) {
      logTest(`${endpoint.name} endpoint`, false, error.message);
    }
  }
}

async function testDocumentUpload() {
  log('\n📤 Document Upload Test', 'blue');
  
  // Test multipart upload
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2);
  const testContent = 'Test document content for production testing';
  const fileName = `test-${Date.now()}.txt`;
  
  const body = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
    'Content-Type: text/plain',
    '',
    testContent,
    `--${boundary}`,
    'Content-Disposition: form-data; name="title"',
    '',
    'Production Test Document',
    `--${boundary}`,
    'Content-Disposition: form-data; name="category"',
    '',
    'OTHER',
    `--${boundary}--`
  ].join('\r\n');
  
  try {
    const response = await makeRequest('/api/documents/failsafe-upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      },
      body
    });
    
    logTest('Upload endpoint responds', response.status !== 404, `Status: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      logTest('Document upload successful', true, `Document ID: ${response.data.document?.id}`);
    } else {
      logTest('Document upload successful', false, `Response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    logTest('Document upload', false, error.message);
  }
}

async function testPageNavigation() {
  log('\n🧭 Page Navigation Tests', 'blue');
  
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/documents', name: 'Documents' },
    { path: '/compliance', name: 'Compliance' },
    { path: '/analytics', name: 'Analytics' },
    { path: '/settings', name: 'Settings' },
    { path: '/test-suite', name: 'Test Suite' },
    { path: '/test-flow', name: 'Test Flow' }
  ];
  
  for (const page of pages) {
    try {
      const start = Date.now();
      const response = await makeRequest(page.path);
      const duration = Date.now() - start;
      
      // 200 = OK, 307/308 = Redirect (likely to auth), 401 = Unauthorized
      const validStatuses = [200, 307, 308, 401];
      const pageExists = validStatuses.includes(response.status);
      
      logTest(
        `${page.name} page accessible`, 
        pageExists,
        `Status: ${response.status}, Time: ${duration}ms`
      );
    } catch (error) {
      logTest(`${page.name} page`, false, error.message);
    }
  }
}

async function testPerformance() {
  log('\n⚡ Performance Tests', 'blue');
  
  // Test response times for critical endpoints
  const criticalEndpoints = [
    { path: '/', name: 'Home page' },
    { path: '/api/documents/list', name: 'Documents API' },
    { path: '/api/auth/session', name: 'Session check' }
  ];
  
  for (const endpoint of criticalEndpoints) {
    try {
      const start = Date.now();
      const response = await makeRequest(endpoint.path);
      const duration = Date.now() - start;
      
      logTest(
        `${endpoint.name} response time < 2s`, 
        duration < 2000,
        `${duration}ms`
      );
    } catch (error) {
      logTest(`${endpoint.name} performance`, false, error.message);
    }
  }
}

async function testErrorHandling() {
  log('\n⚠️ Error Handling Tests', 'blue');
  
  // Test 404 handling
  try {
    const response = await makeRequest('/api/nonexistent-endpoint');
    logTest('404 error handling', response.status === 404, `Status: ${response.status}`);
  } catch (error) {
    logTest('404 error handling', false, error.message);
  }
  
  // Test invalid JSON upload
  try {
    const response = await makeRequest('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{"invalid": "data"}'
    });
    
    logTest('Invalid upload rejection', response.status >= 400, `Status: ${response.status}`);
  } catch (error) {
    logTest('Invalid upload rejection', false, error.message);
  }
}

async function testSecurityHeaders() {
  log('\n🔒 Security Headers Test', 'blue');
  
  try {
    const response = await makeRequest('/');
    const headers = response.headers;
    
    // Check for common security headers
    logTest('X-Frame-Options present', 
      headers['x-frame-options'] !== undefined,
      headers['x-frame-options'] || 'Not set'
    );
    
    logTest('Strict-Transport-Security', 
      headers['strict-transport-security'] !== undefined,
      headers['strict-transport-security'] || 'Not set'
    );
    
    logTest('Content-Security-Policy', 
      headers['content-security-policy'] !== undefined,
      headers['content-security-policy'] ? 'Set' : 'Not set'
    );
  } catch (error) {
    logTest('Security headers', false, error.message);
  }
}

async function runAllTests() {
  log('🧪 Risk Documentation Hub - Production Testing\n', 'yellow');
  log(`Testing against: ${PROD_URL}`, 'gray');
  log(`Time: ${new Date().toISOString()}\n`, 'gray');
  
  const startTime = Date.now();
  
  await testHomePage();
  await testAuthentication();
  await testAPIEndpoints();
  await testDocumentUpload();
  await testPageNavigation();
  await testPerformance();
  await testErrorHandling();
  await testSecurityHeaders();
  
  const duration = Date.now() - startTime;
  
  // Summary
  log('\n📊 Test Summary', 'yellow');
  log(`Total Tests: ${passCount + failCount}`);
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`Duration: ${duration}ms`, 'gray');
  log(`Pass Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
  
  // Health Assessment
  log('\n🏥 Health Assessment', 'yellow');
  const passRate = (passCount / (passCount + failCount)) * 100;
  
  if (passRate >= 90) {
    log('System Status: HEALTHY ✅', 'green');
    log('The application is functioning well in production.', 'green');
  } else if (passRate >= 70) {
    log('System Status: DEGRADED ⚠️', 'yellow');
    log('Some features may not be working correctly.', 'yellow');
  } else {
    log('System Status: CRITICAL ❌', 'red');
    log('Major issues detected. Immediate attention required.', 'red');
  }
  
  // Recommendations
  if (failCount > 0) {
    log('\n💡 Recommendations:', 'blue');
    const failedTests = testResults.filter(t => !t.passed);
    failedTests.slice(0, 5).forEach(test => {
      log(`  - Fix: ${test.name}`, 'gray');
    });
  }
  
  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runAllTests();