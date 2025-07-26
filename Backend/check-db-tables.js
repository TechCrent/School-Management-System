const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('📋 Database Tables:');
  const tables = db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  console.log('\n📊 Teachers Table Structure:');
  try {
    const teachersSchema = db.prepare("PRAGMA table_info(teachers)").all();
    teachersSchema.forEach(col => {
      console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
  } catch (err) {
    console.log('❌ Teachers table does not exist or has issues:', err.message);
  }
  
  console.log('\n📊 Students Table Structure:');
  try {
    const studentsSchema = db.prepare("PRAGMA table_info(students)").all();
    studentsSchema.forEach(col => {
      console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
  } catch (err) {
    console.log('❌ Students table does not exist or has issues:', err.message);
  }
  
  console.log('\n📊 Sample Data:');
  try {
    const teacherCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get();
    console.log(`- Teachers: ${teacherCount.count}`);
    
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get();
    console.log(`- Students: ${studentCount.count}`);
    
    const classCount = db.prepare('SELECT COUNT(*) as count FROM classes').get();
    console.log(`- Classes: ${classCount.count}`);
    
    const homeworkCount = db.prepare('SELECT COUNT(*) as count FROM homework').get();
    console.log(`- Homework: ${homeworkCount.count}`);
  } catch (err) {
    console.log('❌ Error counting records:', err.message);
  }
  
  db.close();
} catch (err) {
  console.error('❌ Database error:', err.message);
} 