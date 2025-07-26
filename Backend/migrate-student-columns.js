require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(process.env.DB_PATH || path.join(__dirname, 'edulite.db'));

console.log('🔄 Starting migration to add missing columns to students table...');

try {
  // Check current table structure
  const schema = db.prepare("PRAGMA table_info(students)").all();
  console.log(`📊 Current students table columns: ${schema.map(col => col.name).join(', ')}`);

  // Define the columns we need to add
  const columnsToAdd = [
    { name: 'parent1_email', type: 'TEXT' },
    { name: 'parent1_name', type: 'TEXT' },
    { name: 'parent1_contact', type: 'TEXT' },
    { name: 'parent2_email', type: 'TEXT' },
    { name: 'parent2_name', type: 'TEXT' },
    { name: 'parent2_contact', type: 'TEXT' },
    { name: 'status', type: 'TEXT DEFAULT "active"' },
    { name: 'class_id', type: 'TEXT' }
  ];

  // Add missing columns
  columnsToAdd.forEach(column => {
    const columnExists = schema.some(col => col.name === column.name);
    if (!columnExists) {
      console.log(`➕ Adding column: ${column.name}`);
      db.prepare(`ALTER TABLE students ADD COLUMN ${column.name} ${column.type}`).run();
    } else {
      console.log(`✅ Column already exists: ${column.name}`);
    }
  });

  // Verify the updated structure
  const updatedSchema = db.prepare("PRAGMA table_info(students)").all();
  console.log('\n📊 Updated students table structure:');
  updatedSchema.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
  });

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
} finally {
  db.close();
} 