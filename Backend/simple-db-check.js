const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('📋 Checking database...');
  
  // Check if we can query the database
  const result = db.prepare('SELECT 1 as test').get();
  console.log('✅ Database connection successful');
  
  // List all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📊 Tables found:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  // Check specific tables
  if (tables.some(t => t.name === 'teachers')) {
    console.log('\n📊 Teachers table exists');
    const teacherCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get();
    console.log(`- Teacher count: ${teacherCount.count}`);
  } else {
    console.log('\n❌ Teachers table does not exist');
  }
  
  if (tables.some(t => t.name === 'students')) {
    console.log('\n📊 Students table exists');
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get();
    console.log(`- Student count: ${studentCount.count}`);
  } else {
    console.log('\n❌ Students table does not exist');
  }
  
  if (tables.some(t => t.name === 'classes')) {
    console.log('\n📊 Classes table exists');
    const classCount = db.prepare('SELECT COUNT(*) as count FROM classes').get();
    console.log(`- Class count: ${classCount.count}`);
  } else {
    console.log('\n❌ Classes table does not exist');
  }
  
  if (tables.some(t => t.name === 'homework')) {
    console.log('\n📊 Homework table exists');
    const homeworkCount = db.prepare('SELECT COUNT(*) as count FROM homework').get();
    console.log(`- Homework count: ${homeworkCount.count}`);
  } else {
    console.log('\n❌ Homework table does not exist');
  }
  
  db.close();
} catch (err) {
  console.error('❌ Database error:', err.message);
} 