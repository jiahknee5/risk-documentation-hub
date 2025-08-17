// Test Deployment Script
// This script tests various aspects of the deployment to identify issues

const https = require('https');
const http = require('http');

const TEST_URLS = [
  'https://risk-documentation-hub.vercel.app/',
  'https://risk-documentation-hub.vercel.app/ragdocumenthub',
  'https://risk-documentation-hub.vercel.app/ragdocumenthub/',
  'https://risk-documentation-hub.vercel.app/ragdocumenthub/auth/signin',
  'https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/providers',
  'https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/csrf',
  'https://risk-documentation-mzzfj1h4m-johnnys-projects-0e834ac4.vercel.app/ragdocumenthub',
  'https://risk-documentation-mzzfj1h4m-johnnys-projects-0e834ac4.vercel.app/ragdocumenthub/auth/signin'
];

console.log('🧪 Risk Documentation Hub - Deployment Test\n');
console.log('Testing various endpoints to identify issues...\n');

async function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const result = {
          url: url,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          redirectTo: res.headers.location,
          contentType: res.headers['content-type'],
          contentLength: data.length,
          hasHTML: data.includes('<html') || data.includes('<!DOCTYPE'),
          hasNextData: data.includes('__NEXT_DATA__'),
          title: data.match(/<title>(.*?)<\/title>/)?.[1] || 'No title found'
        };
        
        resolve(result);
      });
    }).on('error', (err) => {
      resolve({
        url: url,
        status: 'ERROR',
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('📍 Testing endpoints...\n');
  
  for (const url of TEST_URLS) {
    const result = await testUrl(url);
    
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.status} ${result.statusText || ''}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else if (result.status === 200) {
      console.log(`✅ Success`);
      console.log(`   Content-Type: ${result.contentType}`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Has HTML: ${result.hasHTML}`);
      console.log(`   Has Next.js Data: ${result.hasNextData}`);
    } else if (result.status === 301 || result.status === 302 || result.status === 307 || result.status === 308) {
      console.log(`↪️  Redirect to: ${result.redirectTo}`);
    } else if (result.status === 404) {
      console.log(`❌ Not Found`);
    } else if (result.status === 401) {
      console.log(`🔒 Unauthorized`);
    } else {
      console.log(`⚠️  Unexpected status`);
    }
    
    console.log('---\n');
  }
  
  // Test API endpoints
  console.log('\n📍 Testing API endpoints...\n');
  
  const apiTest = await testUrl('https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/providers');
  if (apiTest.status === 200) {
    console.log('✅ NextAuth API is accessible');
  } else {
    console.log('❌ NextAuth API not working properly');
  }
  
  // Diagnosis
  console.log('\n🔍 Diagnosis:\n');
  
  if (apiTest.status !== 200) {
    console.log('⚠️  NextAuth might not be configured properly');
    console.log('   - Check NEXTAUTH_URL environment variable');
    console.log('   - Verify basePath configuration in next.config.ts');
  }
  
  console.log('\n💡 Recommendations:\n');
  console.log('1. Check if NEXTAUTH_URL includes the basePath');
  console.log('2. Verify all API routes are prefixed with basePath');
  console.log('3. Check NextAuth configuration for basePath support');
  console.log('4. Review next.config.ts settings');
}

runTests().catch(console.error);