#!/usr/bin/env node

/**
 * Automated Test Runner for Risk Documentation Hub
 * 
 * This script runs automated tests against the running application
 * Usage: node run-tests.js [category]
 * 
 * Categories: auth, upload, manage, nav, error, perf, data, all
 */

const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
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
    const url = new URL(BASE_URL + path);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAuth() {
  log('\n🔐 Authentication Tests', 'blue');
  
  // Test session endpoint
  try {
    const response = await makeRequest('/api/auth/session');
    logTest('Session endpoint accessible', response.status === 200);
  } catch (error) {
    logTest('Session endpoint accessible', false, error.message);
  }
}

async function testUpload() {
  log('\n📤 Upload Tests', 'blue');
  
  // Test upload endpoints exist
  const endpoints = [
    '/api/documents/upload',
    '/api/documents/failsafe-upload',
    '/api/no-db-upload'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint, { method: 'POST' });
      // We expect 400/401/500 for POST without data, not 404
      logTest(`Upload endpoint exists: ${endpoint}`, response.status !== 404);
    } catch (error) {
      logTest(`Upload endpoint exists: ${endpoint}`, false, error.message);
    }
  }
}

async function testDocumentManagement() {
  log('\n📄 Document Management Tests', 'blue');
  
  // Test document list endpoint
  try {
    const response = await makeRequest('/api/documents/list');
    logTest('Document list endpoint', response.status === 200);
    
    if (response.data.documents) {
      logTest('Document list returns array', Array.isArray(response.data.documents));
      log(`    Found ${response.data.documents.length} documents`, 'gray');
    }
  } catch (error) {
    logTest('Document list endpoint', false, error.message);
  }
}

async function testNavigation() {
  log('\n🧭 Navigation Tests', 'blue');
  
  const pages = [
    { path: '/', name: 'Home page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/documents', name: 'Documents' },
    { path: '/auth/signin', name: 'Sign in' }
  ];
  
  for (const page of pages) {
    try {
      const response = await makeRequest(page.path);
      // 200 or 401 (auth required) are both valid
      logTest(`${page.name} accessible`, response.status === 200 || response.status === 401);
    } catch (error) {
      logTest(`${page.name} accessible`, false, error.message);
    }
  }
}

async function testErrorHandling() {
  log('\n⚠️ Error Handling Tests', 'blue');
  
  // Test 404 handling
  try {
    const response = await makeRequest('/api/nonexistent');
    logTest('404 error handling', response.status === 404);
  } catch (error) {
    logTest('404 error handling', false, error.message);
  }
  
  // Test invalid upload
  try {
    const response = await makeRequest('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true })
    });
    logTest('Invalid upload rejection', response.status >= 400);
  } catch (error) {
    logTest('Invalid upload rejection', true, 'Request failed as expected');
  }
}

async function testPerformance() {
  log('\n⚡ Performance Tests', 'blue');
  
  // Test response times
  const start = Date.now();
  try {
    await makeRequest('/api/documents/list');
    const duration = Date.now() - start;
    logTest('API response time < 1000ms', duration < 1000, `${duration}ms`);
  } catch (error) {
    logTest('API response time', false, error.message);
  }
}

async function testDataIntegrity() {
  log('\n🔒 Data Integrity Tests', 'blue');
  
  // Test debug endpoint
  try {
    const response = await makeRequest('/api/debug/documents');
    logTest('Debug endpoint accessible', response.status === 200);
    
    if (response.data) {
      logTest('Debug data structure valid', 
        response.data.hasOwnProperty('database') && 
        response.data.hasOwnProperty('documents')
      );
    }
  } catch (error) {
    logTest('Debug endpoint accessible', false, error.message);
  }
}

async function runAllTests() {
  log('🧪 Risk Documentation Hub - Automated Test Runner\n', 'yellow');
  log(`Running tests against: ${BASE_URL}`, 'gray');
  log('Make sure the application is running with: npm run dev\n', 'gray');
  
  const startTime = Date.now();
  
  await testAuth();
  await testUpload();
  await testDocumentManagement();
  await testNavigation();
  await testErrorHandling();
  await testPerformance();
  await testDataIntegrity();
  
  const duration = Date.now() - startTime;
  
  // Summary
  log('\n📊 Test Summary', 'yellow');
  log(`Total Tests: ${passCount + failCount}`);
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`Duration: ${duration}ms`, 'gray');
  log(`Pass Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%\n`);
  
  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0);
}

// Parse command line arguments
const args = process.argv.slice(2);
const category = args[0] || 'all';

// Check if server is running
http.get(BASE_URL, (res) => {
  runTests();
}).on('error', (err) => {
  log('❌ Error: Application is not running!', 'red');
  log('Please start the application with: npm run dev', 'yellow');
  process.exit(1);
});

async function runTests() {
  switch(category) {
    case 'auth':
      await testAuth();
      break;
    case 'upload':
      await testUpload();
      break;
    case 'manage':
      await testDocumentManagement();
      break;
    case 'nav':
      await testNavigation();
      break;
    case 'error':
      await testErrorHandling();
      break;
    case 'perf':
      await testPerformance();
      break;
    case 'data':
      await testDataIntegrity();
      break;
    case 'all':
    default:
      await runAllTests();
  }
  
  if (category !== 'all') {
    log(`\nPassed: ${passCount}, Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
    process.exit(failCount > 0 ? 1 : 0);
  }
}