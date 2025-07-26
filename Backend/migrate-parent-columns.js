const Database = require('better-sqlite3');

try {
  const db = new Database('edulite.db');
  
  console.log('🔄 Starting migration to add parent columns to students table...');
  
  // Check if columns already exist
  const schema = db.prepare("PRAGMA table_info(students)").all();
  const hasParent1Id = schema.some(col => col.name === 'parent1_id');
  const hasParent2Id = schema.some(col => col.name === 'parent2_id');
  
  console.log(`📊 Current students table columns: ${schema.map(col => col.name).join(', ')}`);
  
  if (!hasParent1Id) {
    console.log('➕ Adding parent1_id column...');
    db.prepare('ALTER TABLE students ADD COLUMN parent1_id TEXT').run();
    console.log('✅ parent1_id column added');
  } else {
    console.log('ℹ️ parent1_id column already exists');
  }
  
  if (!hasParent2Id) {
    console.log('➕ Adding parent2_id column...');
    db.prepare('ALTER TABLE students ADD COLUMN parent2_id TEXT').run();
    console.log('✅ parent2_id column added');
  } else {
    console.log('ℹ️ parent2_id column already exists');
  }
  
  // Update sample students with parent relationships
  console.log('🔗 Updating student-parent relationships...');
  db.prepare('UPDATE students SET parent1_id = ? WHERE student_id = ?').run('P001', 'S001');
  db.prepare('UPDATE students SET parent1_id = ? WHERE student_id = ?').run('P001', 'S002');
  db.prepare('UPDATE students SET parent2_id = ? WHERE student_id = ?').run('P002', 'S001');
  db.prepare('UPDATE students SET parent2_id = ? WHERE student_id = ?').run('P002', 'S002');
  console.log('✅ Student-parent relationships updated');
  
  // Verify the changes
  console.log('\n📊 Updated students table structure:');
  const newSchema = db.prepare("PRAGMA table_info(students)").all();
  newSchema.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  console.log('\n📊 Sample students with parent relationships:');
  const studentsWithParents = db.prepare(`
    SELECT s.student_id, s.full_name, s.parent1_id, s.parent2_id,
           p1.full_name as parent1_name, p2.full_name as parent2_name
    FROM students s
    LEFT JOIN parents p1 ON s.parent1_id = p1.parent_id
    LEFT JOIN parents p2 ON s.parent2_id = p2.parent_id
    LIMIT 5
  `).all();
  
  studentsWithParents.forEach(student => {
    console.log(`- ${student.full_name}: Parent1: ${student.parent1_name || 'None'}, Parent2: ${student.parent2_name || 'None'}`);
  });
  
  console.log('\n✅ Migration completed successfully!');
  
  db.close();
} catch (err) {
  console.error('❌ Migration error:', err.message);
} 