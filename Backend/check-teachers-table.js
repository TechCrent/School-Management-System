const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('📋 Teachers Table Structure:');
  const schema = db.prepare("PRAGMA table_info(teachers)").all();
  schema.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  console.log('\n📊 Sample Teachers Data:');
  const teachers = db.prepare('SELECT * FROM teachers LIMIT 3').all();
  teachers.forEach(teacher => {
    console.log(`- ${JSON.stringify(teacher)}`);
  });
  
  console.log('\n🔍 Testing the exact query from the endpoint:');
  try {
    const testQuery = `SELECT * FROM teachers WHERE (full_name LIKE ? OR email LIKE ?) AND (active IS NULL OR active = 1) LIMIT ? OFFSET ?`;
    const result = db.prepare(testQuery).all('%', '%', 20, 0);
    console.log(`✅ Query successful, found ${result.length} teachers`);
  } catch (err) {
    console.log('❌ Query failed:', err.message);
  }
  
  db.close();
} catch (err) {
  console.error('❌ Database error:', err.message);
} 