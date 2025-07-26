const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('📋 Parents Table Structure:');
  const schema = db.prepare("PRAGMA table_info(parents)").all();
  schema.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  console.log('\n📊 Sample Parents Data:');
  const parents = db.prepare('SELECT * FROM parents LIMIT 5').all();
  parents.forEach(parent => {
    console.log(`- ${JSON.stringify(parent)}`);
  });
  
  console.log('\n📊 Parent Count:');
  const count = db.prepare('SELECT COUNT(*) as count FROM parents').get();
  console.log(`- Total parents: ${count.count}`);
  
  console.log('\n🔍 Testing parent-child relationships:');
  const parentWithChildren = db.prepare(`
    SELECT p.*, s.student_id, s.full_name as child_name 
    FROM parents p 
    LEFT JOIN students s ON (s.parent1_id = p.parent_id OR s.parent2_id = p.parent_id)
    LIMIT 5
  `).all();
  
  parentWithChildren.forEach(row => {
    console.log(`- Parent: ${row.full_name} (${row.email}) - Child: ${row.child_name || 'None'}`);
  });
  
  console.log('\n🔍 Testing user-parent relationships:');
  const userParent = db.prepare(`
    SELECT u.username, u.role, p.full_name, p.email 
    FROM users u 
    LEFT JOIN parents p ON u.parent_id = p.parent_id 
    WHERE u.role = 'parent'
  `).all();
  
  userParent.forEach(row => {
    console.log(`- User: ${row.username} (${row.role}) - Parent: ${row.full_name || 'Not linked'} (${row.email || 'N/A'})`);
  });
  
  db.close();
} catch (err) {
  console.error('❌ Database error:', err.message);
} 