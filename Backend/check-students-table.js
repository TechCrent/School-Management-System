const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('📋 Students Table Structure:');
  const schema = db.prepare("PRAGMA table_info(students)").all();
  schema.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  console.log('\n📊 Sample Students Data:');
  const students = db.prepare('SELECT * FROM students LIMIT 3').all();
  students.forEach(student => {
    console.log(`- ${JSON.stringify(student)}`);
  });
  
  db.close();
} catch (err) {
  console.error('❌ Database error:', err.message);
} 