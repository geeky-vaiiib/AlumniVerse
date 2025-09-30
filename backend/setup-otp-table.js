#!/usr/bin/env node

/**
 * Setup OTP Table in Supabase
 * Creates the otp_codes table and sets up RLS policies
 */

require('dotenv').config();
const { supabaseAdmin } = require('./config/supabase');

async function setupOTPTable() {
  console.log('🔧 Setting up OTP table in Supabase...\n');

  try {
    // Create OTP codes table
    console.log('📝 Creating otp_codes table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        used_at TIMESTAMP WITH TIME ZONE NULL,
        is_used BOOLEAN DEFAULT FALSE
      );
    `;

    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.error('❌ Error creating table:', createError);
      // Try alternative approach
      console.log('🔄 Trying alternative table creation...');
      
      const { error: altError } = await supabaseAdmin
        .from('otp_codes')
        .select('id')
        .limit(1);
        
      if (altError && altError.code === 'PGRST205') {
        console.log('⚠️ Table does not exist. Please create it manually in Supabase dashboard.');
        console.log('\n📋 SQL to run in Supabase SQL Editor:');
        console.log('=====================================');
        console.log(createTableSQL);
        console.log('\n-- Create indexes');
        console.log('CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_otp_codes_otp ON otp_codes(otp);');
        console.log('CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);');
        console.log('\n-- Enable RLS');
        console.log('ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;');
        console.log('\n-- Create RLS policies');
        console.log(`CREATE POLICY "Service role can manage OTP codes" ON otp_codes
  FOR ALL USING (auth.role() = 'service_role');`);
        console.log('=====================================\n');
        return false;
      }
    } else {
      console.log('✅ Table created successfully');
    }

    // Create indexes
    console.log('📝 Creating indexes...');
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_otp ON otp_codes(otp);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
    `;

    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: indexSQL
    });

    if (indexError) {
      console.log('⚠️ Index creation may have failed:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    console.log('📝 Enabling Row Level Security...');
    const rlsSQL = `ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;`;

    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: rlsSQL
    });

    if (rlsError) {
      console.log('⚠️ RLS enabling may have failed:', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create RLS policies
    console.log('📝 Creating RLS policies...');
    const policySQL = `
      CREATE POLICY "Service role can manage OTP codes" ON otp_codes
        FOR ALL USING (auth.role() = 'service_role');
    `;

    const { error: policyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: policySQL
    });

    if (policyError) {
      console.log('⚠️ Policy creation may have failed:', policyError.message);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Test table access
    console.log('🧪 Testing table access...');
    const { data, error: testError } = await supabaseAdmin
      .from('otp_codes')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Table access test failed:', testError);
      return false;
    } else {
      console.log('✅ Table access test passed');
    }

    console.log('\n🎉 OTP table setup completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Test OTP service
async function testOTPService() {
  console.log('\n🧪 Testing OTP service...');
  
  try {
    const { createOTP, validateOTP } = require('./services/otpService');
    
    // Create a test OTP
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    console.log('📝 Creating test OTP...');
    
    const otpData = await createOTP(testUserId);
    console.log('✅ OTP created:', { id: otpData.id, otp: otpData.otp });
    
    // Validate the OTP
    console.log('🔍 Validating OTP...');
    const isValid = await validateOTP(testUserId, otpData.otp);
    console.log('✅ OTP validation result:', isValid);
    
    // Try to validate again (should fail as it's used)
    console.log('🔍 Validating used OTP...');
    const isValidAgain = await validateOTP(testUserId, otpData.otp);
    console.log('✅ Used OTP validation result:', isValidAgain);
    
    console.log('\n🎉 OTP service test completed!');
    
  } catch (error) {
    console.error('❌ OTP service test failed:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 AlumniVerse OTP Setup\n');
  
  const setupSuccess = await setupOTPTable();
  
  if (setupSuccess) {
    await testOTPService();
  }
  
  console.log('\n✨ Setup complete!');
}

main().catch(console.error);
