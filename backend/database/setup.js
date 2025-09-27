/**
 * Database Setup Script
 * Creates database, runs migrations, and seeds initial data
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration for setup
const setupConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  // Don't specify database initially to create it
};

const dbName = process.env.DB_NAME || 'alumniverse';

async function createDatabase() {
  const pool = new Pool(setupConfig);
  
  try {
    // Check if database exists
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Create database
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`ℹ️  Database '${dbName}' already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function runMigrations() {
  // Connect to the specific database
  const pool = new Pool({
    ...setupConfig,
    database: dbName
  });

  try {
    console.log('🔄 Running database migrations...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function seedDatabase() {
  const pool = new Pool({
    ...setupConfig,
    database: dbName
  });

  try {
    console.log('🌱 Seeding database with initial data...');
    
    // Check if we have any users (to avoid re-seeding)
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('ℹ️  Database already has data, skipping seed');
      return;
    }

    // Read and execute seed file if it exists
    const seedPath = path.join(__dirname, 'seeds', 'initial_data.sql');
    
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seedData);
      console.log('✅ Database seeded successfully');
    } else {
      console.log('ℹ️  No seed file found, skipping seeding');
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    await createDatabase();
    await runMigrations();
    await seedDatabase();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log(`📊 Database: ${dbName}`);
    console.log(`🔗 Connection: ${setupConfig.host}:${setupConfig.port}`);
    
  } catch (error) {
    console.error('\n💥 Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  require('dotenv').config();
  setupDatabase();
}

module.exports = {
  createDatabase,
  runMigrations,
  seedDatabase,
  setupDatabase
};
