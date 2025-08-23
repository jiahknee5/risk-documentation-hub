# Risk Documentation Hub - Manual Testing Checklist

## Pre-Testing Setup
- [ ] Application running (`npm run dev`)
- [ ] Database seeded (`/api/seed-db?secret=setup-risk-docs-2024`)
- [ ] Browser console open for error monitoring
- [ ] Test files prepared (txt, pdf, large file)

## 1. Authentication Testing

### Login Flow
- [ ] Navigate to http://localhost:3000
- [ ] Redirected to login page if not authenticated
- [ ] Login form displays correctly
- [ ] Login with demo@riskdocs.com / demo123
- [ ] Successfully redirected to dashboard
- [ ] User email shown in navigation

### Invalid Login
- [ ] Try login with wrong credentials
- [ ] Error message displays
- [ ] Remains on login page
- [ ] No console errors

### Session Management
- [ ] Refresh page after login
- [ ] Still logged in
- [ ] Navigate between pages
- [ ] Session persists

### Logout
- [ ] Click logout button
- [ ] Redirected to login page
- [ ] Cannot access protected pages
- [ ] Login works again

## 2. Document Upload Testing

### Basic Upload
- [ ] Navigate to Documents page
- [ ] Upload interface displays
- [ ] Click to select file
- [ ] File picker opens
- [ ] Select a .txt file
- [ ] Modal opens with form
- [ ] File name pre-fills title
- [ ] Fill all metadata fields
- [ ] Click Upload button
- [ ] Loading state shows
- [ ] Success message appears
- [ ] Modal closes
- [ ] Document appears in list

### Upload Variations
- [ ] Upload PDF file
- [ ] Upload .docx file
- [ ] Upload .md file
- [ ] Try unsupported file type (.exe)
- [ ] Cancel upload mid-process
- [ ] Upload without filling required fields
- [ ] Upload with very long title/description
- [ ] Upload with special characters in metadata

### Edge Cases
- [ ] Upload same file twice
- [ ] Upload empty file
- [ ] Upload file > 10MB
- [ ] Upload multiple files quickly
- [ ] Upload while offline

## 3. Document Management Testing

### Document List
- [ ] All uploaded documents visible
- [ ] Correct metadata displayed
- [ ] File size shown correctly
- [ ] Upload date formatted properly
- [ ] Category badges display
- [ ] Risk level indicators work

### View Document
- [ ] Click View button
- [ ] Modal opens smoothly
- [ ] All metadata displayed
- [ ] Title shows correctly
- [ ] Description preserved
- [ ] Category/Risk Level accurate
- [ ] Tags displayed (if any)
- [ ] File information correct
- [ ] Close modal with X
- [ ] Close modal with Close button
- [ ] ESC key closes modal

### Delete Document
- [ ] Click Delete button
- [ ] Confirmation dialog appears
- [ ] Cancel keeps document
- [ ] Confirm removes document
- [ ] Document disappears from list
- [ ] Success message shows
- [ ] Refresh page - still deleted

### Document Search/Filter
- [ ] Search by title
- [ ] Filter by category
- [ ] Filter by risk level
- [ ] Clear filters
- [ ] Results update immediately

## 4. Navigation Testing

### Main Navigation
- [ ] Logo/brand clickable
- [ ] Dashboard link works
- [ ] Documents link works
- [ ] Compliance link works
- [ ] Analytics link works
- [ ] Settings link works
- [ ] Active page highlighted

### Dashboard Quick Actions
- [ ] Upload Document button → Documents page
- [ ] View Compliance button → Compliance page
- [ ] Analytics button → Analytics page
- [ ] All navigation smooth

### Breadcrumbs
- [ ] Show current location
- [ ] Clickable to navigate back
- [ ] Update on page change

## 5. UI/UX Testing

### Responsive Design
- [ ] Desktop view (1920px)
- [ ] Laptop view (1366px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] Navigation adapts
- [ ] Tables become scrollable
- [ ] Modals fit screen

### Visual Consistency
- [ ] Consistent color scheme
- [ ] Proper spacing/padding
- [ ] Readable fonts
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Loading states smooth
- [ ] Animations not jarring

### Accessibility
- [ ] Tab navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Alt text on images
- [ ] Form labels present
- [ ] Error messages clear

## 6. Error Handling Testing

### Network Errors
- [ ] Disconnect internet
- [ ] Try to upload file
- [ ] Error message appears
- [ ] Reconnect internet
- [ ] Retry works

### Server Errors
- [ ] Stop backend server
- [ ] Try various operations
- [ ] Graceful error messages
- [ ] No data loss
- [ ] Restart server
- [ ] Recovery works

### Validation Errors
- [ ] Submit empty forms
- [ ] Enter invalid data
- [ ] Exceed field limits
- [ ] Clear error messages
- [ ] Fields highlighted
- [ ] Can correct and retry

## 7. Performance Testing

### Page Load Times
- [ ] Dashboard < 2 seconds
- [ ] Documents < 2 seconds
- [ ] With 50+ documents < 3 seconds
- [ ] Search results instant
- [ ] No visible lag

### Resource Usage
- [ ] Check browser memory
- [ ] Monitor CPU usage
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No janky animations

## 8. Data Integrity Testing

### Upload Accuracy
- [ ] File names preserved
- [ ] Special characters handled
- [ ] Metadata saves correctly
- [ ] Dates accurate
- [ ] File sizes correct

### Data Persistence
- [ ] Uploads survive refresh
- [ ] Edits saved properly
- [ ] Deletes permanent
- [ ] No data corruption
- [ ] Consistent across sessions

## 9. Security Testing

### Authentication
- [ ] Can't access without login
- [ ] Session timeout works
- [ ] No sensitive data in URLs
- [ ] Passwords hidden
- [ ] Secure cookie flags

### Authorization
- [ ] Can't edit others' documents
- [ ] Can't delete without permission
- [ ] Admin features protected
- [ ] API endpoints secured

## 10. Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Console clean
- [ ] Performance good

### Firefox
- [ ] All features work
- [ ] Console clean
- [ ] Performance good

### Safari
- [ ] All features work
- [ ] Console clean
- [ ] Performance good

### Edge
- [ ] All features work
- [ ] Console clean
- [ ] Performance good

## Post-Testing

### Cleanup
- [ ] Delete test documents
- [ ] Clear browser data
- [ ] Reset database if needed
- [ ] Document any issues

### Reporting
- [ ] List all failures
- [ ] Note performance issues
- [ ] Suggest improvements
- [ ] Update test plan

## Sign-off

**Tester Name:** _______________________

**Date:** _______________________

**Environment:** _______________________

**Overall Result:** ⬜ PASS ⬜ FAIL

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________