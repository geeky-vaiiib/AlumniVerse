#!/usr/bin/env node

/**
 * Database Fix Script
 * Runs the schema cache refresh migration
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DATABASE_URL = "postgresql://postgres:Jayashree@2805@db.flcgwqlabywhoulqalaz.supabase.co:5432/postgres";
const SQL_FILE = path.join(__dirname, '../backend/database/migrations/REFRESH_SCHEMA_CACHE.sql');

console.log('🔧 Running database schema refresh...\n');

try {
  // Check if SQL file exists
  if (!fs.existsSync(SQL_FILE)) {
    console.error('❌ SQL file not found:', SQL_FILE);
    process.exit(1);
  }

  // Execute the SQL file
  console.log('📄 Executing:', SQL_FILE);
  const result = execSync(`psql "${DATABASE_URL}" -f "${SQL_FILE}"`, {
    encoding: 'utf8',
    stdio: 'inherit'
  });

  console.log('\n✅ Database schema refresh completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Restart your backend server: npm run dev');
  console.log('   2. Hard refresh your browser: Cmd+Shift+R');
  console.log('   3. Test the posts API\n');

} catch (error) {
  console.error('\n❌ Error running migration:', error.message);
  console.error('\n💡 Try using Supabase Dashboard instead:');
  console.error('   1. Go to https://supabase.com/dashboard');
  console.error('   2. Open SQL Editor');
  console.error('   3. Paste the SQL from:', SQL_FILE);
  process.exit(1);
}
