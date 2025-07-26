#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Parent Portal Improvements...\n');

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: FAILED - ${details}`);
  }
}

// Test 1: Check if parent data exists
function testParentData() {
  try {
    const parentsPath = path.join(__dirname, 'src', 'data', 'parents.json');
    const parents = JSON.parse(fs.readFileSync(parentsPath, 'utf8'));
    return parents.length > 0 && parents[0].parent_id && parents[0].children_ids;
  } catch (error) {
    return false;
  }
}

// Test 2: Check if ParentDashboard component uses proper theme classes
function testParentDashboardTheme() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentDashboard.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for proper theme classes instead of hardcoded colors
    const hasThemeClasses = content.includes('text-foreground') && 
                           content.includes('text-muted-foreground') &&
                           content.includes('shadow-card');
    
    // Check for proper imports
    const hasProperImports = content.includes('Card, CardContent') &&
                            content.includes('Badge') &&
                            content.includes('Breadcrumbs');
    
    return hasThemeClasses && hasProperImports;
  } catch (error) {
    return false;
  }
}

// Test 3: Check if ParentChildren component uses proper theme classes
function testParentChildrenTheme() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentChildren.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for proper theme classes
    const hasThemeClasses = content.includes('text-foreground') && 
                           content.includes('text-muted-foreground') &&
                           content.includes('bg-background') &&
                           content.includes('shadow-card');
    
    // Check for no hardcoded colors
    const noHardcodedColors = !content.includes('bg-white') &&
                              !content.includes('text-black') &&
                              !content.includes('text-gray');
    
    return hasThemeClasses && noHardcodedColors;
  } catch (error) {
    return false;
  }
}

// Test 4: Check if ParentNotifications component uses proper theme classes
function testParentNotificationsTheme() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentNotifications.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for proper theme classes
    const hasThemeClasses = content.includes('text-foreground') && 
                           content.includes('text-muted-foreground') &&
                           content.includes('shadow-card');
    
    // Check for no hardcoded colors
    const noHardcodedColors = !content.includes('bg-white') &&
                              !content.includes('text-black') &&
                              !content.includes('text-gray');
    
    return hasThemeClasses && noHardcodedColors;
  } catch (error) {
    return false;
  }
}

// Test 5: Check if ParentProfile component shows correct parent data
function testParentProfileData() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentProfile.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for parent-specific data handling
    const hasParentData = content.includes('parent_id') &&
                         content.includes('children_ids') &&
                         content.includes('parents.find');
    
    // Check for no teacher-related data
    const noTeacherData = !content.includes('teacher_id') &&
                         !content.includes('classes_taught') &&
                         !content.includes('subject_id');
    
    return hasParentData && noTeacherData;
  } catch (error) {
    return false;
  }
}

// Test 6: Check if ParentDashboard has comprehensive features
function testParentDashboardFeatures() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentDashboard.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for comprehensive dashboard features
    const hasStats = content.includes('getOverallStats') &&
                    content.includes('totalChildren') &&
                    content.includes('averageGPA');
    
    const hasChildOverview = content.includes('getChildHomework') &&
                            content.includes('getChildPerformance') &&
                            content.includes('upcomingDeadlines');
    
    const hasQuickActions = content.includes('Quick Actions') &&
                           content.includes('View Children') &&
                           content.includes('Homework');
    
    return hasStats && hasChildOverview && hasQuickActions;
  } catch (error) {
    return false;
  }
}

// Test 7: Check if ParentChildren has detailed child information
function testParentChildrenFeatures() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentChildren.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for detailed child features
    const hasChildDetails = content.includes('getChildPerformance') &&
                           content.includes('getChildClasses') &&
                           content.includes('getChildHomework');
    
    const hasModal = content.includes('selectedChild') &&
                    content.includes('openChildDetails') &&
                    content.includes('closeModal');
    
    const hasPerformanceDisplay = content.includes('Academic Performance') &&
                                 content.includes('Enrolled Classes') &&
                                 content.includes('Recent Homework');
    
    return hasChildDetails && hasModal && hasPerformanceDisplay;
  } catch (error) {
    return false;
  }
}

// Test 8: Check if ParentNotifications has filtering and management
function testParentNotificationsFeatures() {
  try {
    const componentPath = path.join(__dirname, 'src', 'pages', 'ParentNotifications.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Check for notification management features
    const hasFiltering = content.includes('filter') &&
                        content.includes('unread') &&
                        content.includes('high');
    
    const hasManagement = content.includes('markAsRead') &&
                         content.includes('markAllAsRead') &&
                         content.includes('read: boolean');
    
    const hasStats = content.includes('unreadCount') &&
                    content.includes('highPriorityCount') &&
                    content.includes('Total Notifications');
    
    return hasFiltering && hasManagement && hasStats;
  } catch (error) {
    return false;
  }
}

// Test 9: Check if all components use proper loading states
function testLoadingStates() {
  try {
    const dashboardPath = path.join(__dirname, 'src', 'pages', 'ParentDashboard.tsx');
    const childrenPath = path.join(__dirname, 'src', 'pages', 'ParentChildren.tsx');
    const profilePath = path.join(__dirname, 'src', 'pages', 'ParentProfile.tsx');
    
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    const childrenContent = fs.readFileSync(childrenPath, 'utf8');
    const profileContent = fs.readFileSync(profilePath, 'utf8');
    
    const hasLoadingStates = dashboardContent.includes('loading') &&
                            childrenContent.includes('loading') &&
                            profileContent.includes('loading') &&
                            dashboardContent.includes('Loading') &&
                            childrenContent.includes('Loading') &&
                            profileContent.includes('Loading');
    
    return hasLoadingStates;
  } catch (error) {
    return false;
  }
}

// Test 10: Check if all components use proper error handling
function testErrorHandling() {
  try {
    const dashboardPath = path.join(__dirname, 'src', 'pages', 'ParentDashboard.tsx');
    const childrenPath = path.join(__dirname, 'src', 'pages', 'ParentChildren.tsx');
    const profilePath = path.join(__dirname, 'src', 'pages', 'ParentProfile.tsx');
    
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    const childrenContent = fs.readFileSync(childrenPath, 'utf8');
    const profileContent = fs.readFileSync(profilePath, 'utf8');
    
    const hasErrorHandling = dashboardContent.includes('catch (error)') &&
                            childrenContent.includes('catch (error)') &&
                            profileContent.includes('catch (error)') &&
                            dashboardContent.includes('console.error') &&
                            childrenContent.includes('console.error') &&
                            profileContent.includes('console.error');
    
    return hasErrorHandling;
  } catch (error) {
    return false;
  }
}

// Test 11: Check if components use proper data relationships
function testDataRelationships() {
  try {
    const dashboardPath = path.join(__dirname, 'src', 'pages', 'ParentDashboard.tsx');
    const childrenPath = path.join(__dirname, 'src', 'pages', 'ParentChildren.tsx');
    
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    const childrenContent = fs.readFileSync(childrenPath, 'utf8');
    
    const hasStudentEnrollments = dashboardContent.includes('studentEnrollments') &&
                                 childrenContent.includes('studentEnrollments');
    
    const hasParentData = dashboardContent.includes('parents.find') &&
                         dashboardContent.includes('children_ids');
    
    return hasStudentEnrollments && hasParentData;
  } catch (error) {
    return false;
  }
}

// Test 12: Check if components have proper TypeScript interfaces
function testTypeScriptInterfaces() {
  try {
    const dashboardPath = path.join(__dirname, 'src', 'pages', 'ParentDashboard.tsx');
    const childrenPath = path.join(__dirname, 'src', 'pages', 'ParentChildren.tsx');
    const profilePath = path.join(__dirname, 'src', 'pages', 'ParentProfile.tsx');
    
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    const childrenContent = fs.readFileSync(childrenPath, 'utf8');
    const profileContent = fs.readFileSync(profilePath, 'utf8');
    
    const hasInterfaces = dashboardContent.includes('interface Student') &&
                         dashboardContent.includes('interface Homework') &&
                         dashboardContent.includes('interface StudentPerformance') &&
                         childrenContent.includes('interface Student') &&
                         childrenContent.includes('interface Class') &&
                         profileContent.includes('interface Parent');
    
    return hasInterfaces;
  } catch (error) {
    return false;
  }
}

// Main test runner
function runParentPortalTests() {
  console.log('📊 Testing Parent Data Structure...');
  
  logTest('Parent Data Exists', testParentData());
  
  console.log('\n🎨 Testing Theme Consistency...');
  
  logTest('ParentDashboard Theme', testParentDashboardTheme());
  logTest('ParentChildren Theme', testParentChildrenTheme());
  logTest('ParentNotifications Theme', testParentNotificationsTheme());
  
  console.log('\n🔧 Testing Data Integrity...');
  
  logTest('ParentProfile Data', testParentProfileData());
  logTest('Data Relationships', testDataRelationships());
  
  console.log('\n✨ Testing Feature Completeness...');
  
  logTest('ParentDashboard Features', testParentDashboardFeatures());
  logTest('ParentChildren Features', testParentChildrenFeatures());
  logTest('ParentNotifications Features', testParentNotificationsFeatures());
  
  console.log('\n🛡️ Testing Code Quality...');
  
  logTest('Loading States', testLoadingStates());
  logTest('Error Handling', testErrorHandling());
  logTest('TypeScript Interfaces', testTypeScriptInterfaces());
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Parent portal is fully improved and ready.');
    console.log('\n💡 Parent Portal Features:');
    console.log('✅ Comprehensive dashboard with child overview');
    console.log('✅ Detailed child information with performance tracking');
    console.log('✅ Advanced notifications with filtering and management');
    console.log('✅ Proper parent profile without teacher data');
    console.log('✅ Consistent theme across all components');
    console.log('✅ Proper data relationships and error handling');
    console.log('✅ TypeScript interfaces for type safety');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Start the frontend: npm run dev');
  console.log('2. Test parent login and navigation');
  console.log('3. Verify all parent-specific features work correctly');
  console.log('4. Test theme consistency across all parent pages');
}

// Run the tests
runParentPortalTests(); 