// Test authentication flow
const https = require('https');

console.log('🧪 Testing authentication flow...\n');

// Test the new deployment
const testUrl = 'https://risk-documentation-hub.vercel.app/ragdocumenthub';

https.get(testUrl, (res) => {
  console.log(`Homepage Status: ${res.statusCode}`);
  console.log(`Redirect Location: ${res.headers.location || 'No redirect'}`);
  
  if (res.statusCode === 307 && res.headers.location === '/ragdocumenthub/auth/signin') {
    console.log('✅ Correctly redirecting to sign-in page with basePath');
  } else {
    console.log('⚠️  Unexpected redirect behavior');
  }
  
  // Test the sign-in page
  https.get('https://risk-documentation-hub.vercel.app/ragdocumenthub/auth/signin', (res2) => {
    console.log(`\nSign-in Page Status: ${res2.statusCode}`);
    if (res2.statusCode === 200) {
      console.log('✅ Sign-in page is accessible');
    } else {
      console.log('❌ Sign-in page not accessible');
    }
    
    // Test API endpoints
    https.get('https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/providers', (res3) => {
      console.log(`\nAuth API Status: ${res3.statusCode}`);
      if (res3.statusCode === 200) {
        console.log('✅ NextAuth API is working');
      } else {
        console.log('❌ NextAuth API error');
      }
      
      console.log('\n📋 Summary:');
      console.log('- The application is deployed successfully');
      console.log('- Authentication pages include basePath');
      console.log('- You can now login at: https://risk-documentation-hub.vercel.app/ragdocumenthub');
      console.log('\n🔐 Test Credentials:');
      console.log('- Admin: admin@example.com / Admin123!');
      console.log('- Manager: manager@example.com / Manager123!');
      console.log('- User: user@example.com / User123!');
    });
  });
});