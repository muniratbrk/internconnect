const fs = require('fs');
const path = require('path');
const { exec } = require('../config/db');

async function runMigrations() {
  console.log('Running database migrations...');
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    // 1. Execute DDL multi-statement script
    await exec(schemaSql);

    // 2. Safe Alterations for existing tables
    await exec(`
      ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
      ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(100);
      ALTER TABLE internships ADD COLUMN IF NOT EXISTS department VARCHAR(100);
      ALTER TABLE internships ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(100);
      ALTER TABLE internships ALTER COLUMN stipend_currency SET DEFAULT 'ETB';
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0));
}

module.exports = runMigrations;
