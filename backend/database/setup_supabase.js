/**
 * Supabase Database Setup Script
 * Creates sample data using Supabase client
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

async function setupSupabaseDatabase() {
  try {
    console.log('🔄 Connecting to Supabase...');

    // Note: Schema and RLS policies should be created manually in Supabase dashboard
    // or using the SQL editor. This script focuses on creating sample data.

    console.log('📊 Creating sample data...');
    await createSampleData();
    console.log('✅ Sample data created successfully');

    console.log('🎉 Supabase database setup complete!');
    console.log('📝 Note: Please run the SQL files manually in Supabase dashboard:');
    console.log('   1. supabase_schema.sql');
    console.log('   2. supabase_rls_policies.sql');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

async function createSampleData() {
  // Create sample admin user
  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from('users')
    .insert([{
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@sit.ac.in',
      usn: 'SIT001',
      branch: 'Computer Science',
      admission_year: 2020,
      passing_year: 2024,
      bio: 'System administrator for AlumniVerse platform',
      current_position: 'Platform Administrator',
      company: 'SIT',
      location: 'Bangalore',
      is_email_verified: true,
      role: 'admin'
    }])
    .select()
    .single();

  if (adminError && adminError.code !== '23505') { // Ignore duplicate key error
    console.error('Error creating admin user:', adminError);
  } else {
    console.log('✅ Admin user created');
  }
  
  // Create sample regular users
  const sampleUsers = [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@sit.ac.in',
      usn: 'SIT002',
      branch: 'Computer Science',
      admission_year: 2019,
      passing_year: 2023,
      bio: 'Software Engineer with 2 years of experience in full-stack development',
      current_position: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'Bangalore',
      skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
      is_email_verified: true
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@sit.ac.in',
      usn: 'SIT003',
      branch: 'Information Science',
      admission_year: 2018,
      passing_year: 2022,
      bio: 'Product Manager passionate about building user-centric solutions',
      current_position: 'Product Manager',
      company: 'Innovation Labs',
      location: 'Mumbai',
      skills: ["Product Management", "Agile", "User Research", "Analytics"],
      is_email_verified: true
    },
    {
      first_name: 'Raj',
      last_name: 'Patel',
      email: 'raj.patel@sit.ac.in',
      usn: 'SIT004',
      branch: 'Electronics',
      admission_year: 2017,
      passing_year: 2021,
      bio: 'Data Scientist specializing in machine learning and AI',
      current_position: 'Senior Data Scientist',
      company: 'AI Corp',
      location: 'Hyderabad',
      skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
      is_email_verified: true
    }
  ];

  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .insert(sampleUsers)
    .select();

  if (usersError && usersError.code !== '23505') {
    console.error('Error creating sample users:', usersError);
  } else {
    console.log('✅ Sample users created');
  }
  
  console.log('✅ Sample data creation completed');
  console.log('📝 Note: Jobs, events, and badges will be created through the API once authentication is set up');
}

// Run setup if called directly
if (require.main === module) {
  setupSupabaseDatabase()
    .then(() => {
      console.log('Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSupabaseDatabase };
