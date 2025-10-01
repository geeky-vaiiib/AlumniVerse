const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkDatabase() {
  console.log('🔍 Checking database status...\n');
  
  // Check users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(10);
  
  console.log('👥 Users in database:', users?.length || 0);
  if (users && users.length > 0) {
    console.log('Sample user:', {
      id: users[0].id,
      email: users[0].email,
      name: `${users[0].first_name} ${users[0].last_name}`
    });
  }
  
  // Check posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .limit(10);
  
  console.log('\n📝 Posts in database:', posts?.length || 0);
  if (posts && posts.length > 0) {
    console.log('Sample post:', {
      id: posts[0].id,
      content: posts[0].content.substring(0, 50) + '...'
    });
  }
  
  // Check jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .limit(10);
  
  console.log('\n💼 Jobs in database:', jobs?.length || 0);
  
  // Check events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .limit(10);
  
  console.log('\n📅 Events in database:', events?.length || 0);
  
  console.log('\n' + '='.repeat(50));
  console.log('💡 DIAGNOSIS:');
  if (!users || users.length === 0) {
    console.log('❌ NO USERS IN DATABASE!');
    console.log('   Users must sign up through the app first.');
  }
  if (!posts || posts.length === 0) {
    console.log('❌ NO POSTS IN DATABASE!');
    console.log('   Posts will appear empty until users create them.');
  }
  
  process.exit(0);
}

checkDatabase();
