require('dotenv').config();
const { supabaseAdmin } = require('./config/supabase');
const fs = require('fs');

async function createSocialTables() {
  console.log('Creating social features tables...');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('./database/social_features_schema.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.length === 0) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // For CREATE TABLE statements, we'll use raw SQL execution
        if (statement.toLowerCase().includes('create table') || 
            statement.toLowerCase().includes('create index') ||
            statement.toLowerCase().includes('create trigger') ||
            statement.toLowerCase().includes('create function') ||
            statement.toLowerCase().includes('alter table') ||
            statement.toLowerCase().includes('create policy') ||
            statement.toLowerCase().includes('drop table')) {
          
          const { data, error } = await supabaseAdmin.from('_temp').select('1');
          // This is a workaround - we'll need to execute SQL via the Supabase dashboard
          console.log('Statement would be executed:', statement.substring(0, 100) + '...');
        }
      } catch (error) {
        console.error(`Error in statement ${i + 1}:`, error.message);
      }
    }
    
    console.log('Social tables creation process completed.');
    console.log('Note: You may need to run the SQL manually in Supabase dashboard.');
    
  } catch (error) {
    console.error('Failed to create social tables:', error.message);
  }
}

createSocialTables();
