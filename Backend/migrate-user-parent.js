const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('🔄 Starting migration to add parent_id column to users table...');
  
  // Check if column already exists
  const schema = db.prepare("PRAGMA table_info(users)").all();
  const hasParentId = schema.some(col => col.name === 'parent_id');
  
  console.log(`📊 Current users table columns: ${schema.map(col => col.name).join(', ')}`);
  
  if (!hasParentId) {
    console.log('➕ Adding parent_id column...');
    db.prepare('ALTER TABLE users ADD COLUMN parent_id TEXT').run();
    console.log('✅ parent_id column added');
  } else {
    console.log('ℹ️ parent_id column already exists');
  }
  
  // Update parent user with parent_id
  console.log('🔗 Updating parent user with parent_id...');
  db.prepare('UPDATE users SET parent_id = ? WHERE username = ?').run('P001', 'parent');
  console.log('✅ Parent user updated');
  
  // Verify the changes
  console.log('\n📊 Updated users table structure:');
  const newSchema = db.prepare("PRAGMA table_info(users)").all();
  newSchema.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  console.log('\n📊 Users with parent relationships:');
  const usersWithParents = db.prepare(`
    SELECT u.username, u.role, u.parent_id, p.full_name as parent_name, p.email as parent_email
    FROM users u
    LEFT JOIN parents p ON u.parent_id = p.parent_id
    WHERE u.role = 'parent'
  `).all();
  
  usersWithParents.forEach(user => {
    console.log(`- User: ${user.username} (${user.role}) - Parent: ${user.parent_name || 'Not linked'} (${user.parent_email || 'N/A'})`);
  });
  
  console.log('\n✅ Migration completed successfully!');
  
  db.close();
} catch (err) {
  console.error('❌ Migration error:', err.message);
} 