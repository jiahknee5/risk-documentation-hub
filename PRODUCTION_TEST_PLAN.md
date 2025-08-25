# Risk Documentation Hub - Production Test Plan

## Overview
This test plan ensures that real data flows correctly through all system components in production, with no fake/mock data being used.

## Pre-Test Checklist
- [ ] Verify production URL: https://risk.johnnycchung.com
- [ ] Clear browser cache and cookies
- [ ] Open browser developer console (F12)
- [ ] Have test files ready (PDF, DOC, TXT)
- [ ] Note current time for tracking

## Test 1: Authentication Flow
**Purpose**: Verify user authentication creates real database records

### Steps:
1. Navigate to https://risk.johnnycchung.com
2. Click "Sign In"
3. Complete Google OAuth login
4. **Verify in Console**:
   ```javascript
   // Check session data
   console.log(await fetch('/api/auth/session').then(r => r.json()))
   ```
5. **Expected**: Real user data with email, not mock data

### Database Verification:
```sql
-- Check if user was created in database
SELECT * FROM User WHERE email = 'your-email@gmail.com' ORDER BY createdAt DESC LIMIT 1;
```

## Test 2: Document Upload Flow
**Purpose**: Ensure documents are saved to real database

### Steps:
1. Navigate to `/documents`
2. Click "Upload Documents"
3. Select a real file (e.g., test.pdf)
4. Fill form:
   - Title: "Production Test Document [timestamp]"
   - Description: "Testing real data flow"
   - Category: POLICY
   - Risk Level: MEDIUM
   - Tags: "test, production, 2025"
5. Click Upload

### Console Verification:
```javascript
// Monitor network tab for:
// 1. POST /api/documents/upload (or fallback endpoints)
// 2. Response should contain real document ID

// After upload, check debug endpoint:
fetch('/api/documents/debug-list')
  .then(r => r.json())
  .then(data => {
    console.log('Total documents:', data.debug.totalCount);
    console.log('Active documents:', data.debug.activeCount);
    console.log('Latest document:', data.documents[0]);
  });
```

### Expected Results:
- Document ID format: Should be real UUID/CUID, not "mock-001"
- Upload response includes actual database ID
- Document count increases by 1
- No fake data in response

## Test 3: Document Listing
**Purpose**: Verify documents are fetched from real database

### Steps:
1. After upload, check document library
2. **Console Commands**:
   ```javascript
   // Check all listing endpoints
   const endpoints = [
     '/api/documents',
     '/api/documents/list',
     '/api/documents/debug-list'
   ];
   
   for (const endpoint of endpoints) {
     const response = await fetch(endpoint);
     const data = await response.json();
     console.log(`${endpoint}:`, {
       status: response.status,
       documentCount: data.documents?.length || 0,
       firstDoc: data.documents?.[0]
     });
   }
   ```

### Expected Results:
- All endpoints return same document count
- Documents have real IDs (not "mock-001")
- Timestamps are current (not hardcoded dates)
- File sizes are actual bytes (not always 1024)

## Test 4: Search Functionality
**Purpose**: Ensure search queries real database

### Steps:
1. Navigate to `/search`
2. Search for document uploaded in Test 2
3. **Console Verification**:
   ```javascript
   // Test standard search
   fetch('/api/search?q=Production+Test+Document')
     .then(r => r.json())
     .then(data => console.log('Search results:', data));
   ```

### Expected Results:
- Returns actual uploaded documents
- No hardcoded search results
- Result count matches database

## Test 5: Enhanced Banking Risk Search
**Purpose**: Verify RAG processes real documents

### Steps:
1. Navigate to `/search/enhanced`
2. Enable "Banking Risk AI"
3. Search for risk terms
4. **Console Verification**:
   ```javascript
   // Test RAG search
   fetch('/api/rag/vercel-search', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       query: 'risk policy',
       filters: {}
     })
   })
   .then(r => r.json())
   .then(data => {
     console.log('RAG document count:', data.documentCount);
     console.log('Results from real data:', data.results);
   });
   ```

### Expected Results:
- RAG loads actual documents from database
- Risk levels based on real content analysis
- Document count matches database count

## Test 6: Document Operations
**Purpose**: Verify CRUD operations affect real database

### Steps:
1. Click "View" on a document
2. Note document details
3. Click "Delete" on a document
4. **Console Verification**:
   ```javascript
   // Before delete
   const before = await fetch('/api/documents/debug-list').then(r => r.json());
   console.log('Before delete:', before.debug.totalCount);
   
   // After delete (wait 2 seconds)
   setTimeout(async () => {
     const after = await fetch('/api/documents/debug-list').then(r => r.json());
     console.log('After delete:', after.debug.totalCount);
     console.log('Difference:', before.debug.totalCount - after.debug.totalCount);
   }, 2000);
   ```

### Expected Results:
- Document count decreases by 1
- Deleted document marked as inactive (soft delete)
- No mock success messages

## Test 7: Data Persistence
**Purpose**: Ensure data persists across sessions

### Steps:
1. Note document IDs from previous tests
2. Sign out
3. Clear browser cache
4. Sign in again
5. Check if documents persist
6. **Console Verification**:
   ```javascript
   // Check if specific document still exists
   const docId = 'YOUR_DOCUMENT_ID_HERE';
   fetch(`/api/documents/${docId}`)
     .then(r => r.json())
     .then(data => console.log('Document persisted:', data));
   ```

### Expected Results:
- All uploaded documents remain
- User data persists
- No data loss on session change

## Test 8: Error Handling
**Purpose**: Verify real error messages, not mocked

### Steps:
1. Try uploading without selecting file
2. Try accessing non-existent document
3. **Console Verification**:
   ```javascript
   // Test 404 error
   fetch('/api/documents/non-existent-id')
     .then(r => r.json())
     .then(data => console.log('Error response:', data));
   ```

### Expected Results:
- Real database errors (not "Mock error")
- Proper HTTP status codes
- Descriptive error messages

## Test 9: Audit Trail
**Purpose**: Verify audit logs are created

### Steps:
1. Perform various actions (upload, search, delete)
2. **Database Query** (if you have access):
   ```sql
   SELECT * FROM AuditLog 
   WHERE userId = 'YOUR_USER_ID' 
   ORDER BY createdAt DESC 
   LIMIT 10;
   ```

### Expected Results:
- Each action creates audit log entry
- IP addresses are real (not "127.0.0.1")
- Timestamps are accurate

## Test 10: Performance & Load
**Purpose**: Ensure system handles real data volume

### Steps:
1. Upload 10+ documents rapidly
2. **Console Monitoring**:
   ```javascript
   // Monitor upload times
   const startTime = Date.now();
   
   // Upload multiple files
   for (let i = 0; i < 10; i++) {
     const formData = new FormData();
     formData.append('file', testFile);
     formData.append('title', `Load Test ${i}`);
     
     fetch('/api/documents/upload', {
       method: 'POST',
       body: formData
     }).then(r => {
       console.log(`Upload ${i}: ${Date.now() - startTime}ms`);
     });
   }
   ```

### Expected Results:
- All uploads succeed
- Response times remain consistent
- No timeout errors
- Database handles concurrent writes

## Production Data Validation Script

Create this validation script to run in browser console:

```javascript
// Complete Production Data Validation
async function validateProductionData() {
  console.log('🔍 Starting Production Data Validation...\n');
  
  // 1. Check Authentication
  console.log('1️⃣ Checking Authentication...');
  const session = await fetch('/api/auth/session').then(r => r.json());
  console.log('Session:', session);
  console.log('✅ Auth Check:', session.user?.email ? 'REAL USER' : 'FAILED');
  
  // 2. Check Document Count
  console.log('\n2️⃣ Checking Document Database...');
  const debug = await fetch('/api/documents/debug-list').then(r => r.json());
  console.log('Database Stats:', debug.debug);
  console.log('✅ Database Check:', debug.debug.totalCount > 0 ? 'HAS REAL DATA' : 'EMPTY');
  
  // 3. Validate Document Structure
  console.log('\n3️⃣ Validating Document Structure...');
  if (debug.documents?.[0]) {
    const doc = debug.documents[0];
    const isMock = doc.id.includes('mock') || doc.title.includes('Mock');
    console.log('Latest Document:', {
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt,
      isMockData: isMock
    });
    console.log('✅ Data Check:', !isMock ? 'REAL DATA' : 'MOCK DATA DETECTED!');
  }
  
  // 4. Test Search
  console.log('\n4️⃣ Testing Search Functionality...');
  const searchResults = await fetch('/api/search?q=test').then(r => r.json());
  console.log('Search Results:', searchResults.results?.length || 0);
  
  // 5. Test RAG
  console.log('\n5️⃣ Testing Banking Risk RAG...');
  const ragResponse = await fetch('/api/rag/vercel-search', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query: 'risk', filters: {}})
  }).then(r => r.json());
  console.log('RAG Status:', ragResponse.searchType);
  console.log('RAG Document Count:', ragResponse.documentCount);
  
  // 6. Summary
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log('- User Authentication:', session.user ? '✅' : '❌');
  console.log('- Database Connection:', debug.success ? '✅' : '❌');
  console.log('- Real Documents:', debug.debug.totalCount > 0 ? '✅' : '❌');
  console.log('- No Mock Data:', !debug.documents?.[0]?.id.includes('mock') ? '✅' : '❌');
  console.log('- Search Working:', searchResults.results ? '✅' : '❌');
  console.log('- RAG Initialized:', ragResponse.documentCount >= 0 ? '✅' : '❌');
  
  return {
    authOk: !!session.user,
    dbOk: debug.success,
    hasRealData: debug.debug.totalCount > 0,
    noMockData: !debug.documents?.[0]?.id.includes('mock'),
    searchOk: !!searchResults.results,
    ragOk: ragResponse.documentCount >= 0
  };
}

// Run validation
validateProductionData();
```

## Post-Test Cleanup

1. Delete test documents to keep production clean
2. Document any issues found
3. Check error logs in Vercel dashboard
4. Verify no test data remains in production

## Success Criteria

✅ All tests pass with real data
✅ No mock/fake data detected
✅ Document operations affect real database
✅ Data persists across sessions
✅ Search returns actual documents
✅ RAG processes real content
✅ Audit logs are created
✅ Error messages are descriptive
✅ Performance is acceptable

## Common Issues to Check

1. **Documents not appearing**: Check if `isActive` is being set correctly
2. **Auth failures**: Verify NextAuth configuration in production
3. **Database connection**: Check Prisma connection string
4. **Search not working**: Verify search indices are created
5. **RAG not initializing**: Check if documents are loaded on first request

## Report Template

```
Test Date: _____________
Tester: _____________
Environment: Production (https://risk.johnnycchung.com)

Test Results:
- [ ] Test 1: Authentication - PASS/FAIL
- [ ] Test 2: Document Upload - PASS/FAIL
- [ ] Test 3: Document Listing - PASS/FAIL
- [ ] Test 4: Search - PASS/FAIL
- [ ] Test 5: Banking Risk RAG - PASS/FAIL
- [ ] Test 6: Document Operations - PASS/FAIL
- [ ] Test 7: Data Persistence - PASS/FAIL
- [ ] Test 8: Error Handling - PASS/FAIL
- [ ] Test 9: Audit Trail - PASS/FAIL
- [ ] Test 10: Performance - PASS/FAIL

Issues Found:
1. ________________
2. ________________

Recommendations:
1. ________________
2. ________________
```