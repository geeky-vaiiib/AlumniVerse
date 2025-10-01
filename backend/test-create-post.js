const { supabase } = require('./config/supabase');

async function createTestPost() {
  try {
    // First, get a user to be the author
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No users found in database. Creating a test user first...');
      
      // Create a test user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([
          {
            email: 'test.user@sit.ac.in',
            first_name: 'Test',
            last_name: 'User',
            usn: '1SI24CS999',
            branch: 'Computer Science',
            passing_year: 2024,
            is_email_verified: true,
            is_profile_complete: true
          }
        ])
        .select()
        .single();
      
      if (createUserError) {
        console.error('Error creating test user:', createUserError);
        return;
      }
      
      console.log('Test user created:', newUser);
      users.push(newUser);
    }
    
    const authorId = users[0].id;
    console.log('Using author ID:', authorId);
    
    // Create a test post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          author_id: authorId,
          content: 'This is a test post created by the system to verify posts functionality!',
          post_type: 'general',
          is_deleted: false
        }
      ])
      .select()
      .single();
    
    if (postError) {
      console.error('Error creating post:', postError);
      return;
    }
    
    console.log('Test post created successfully:',post);
    
    // Verify we can read it back
    const { data: readPost, error: readError } = await supabase
      .from('posts')
      .select('*, author:users!posts_author_id_fkey(*)')
      .eq('id', post.id)
      .single();
    
    if (readError) {
      console.error('Error reading post:', readError);
      return;
    }
    
    console.log('Post verification successful:', readPost);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

createTestPost();
