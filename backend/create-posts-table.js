require('dotenv').config();
const { supabaseAdmin } = require('./config/supabase');

async function createPostsTable() {
  console.log('Creating posts table...');
  
  try {
    // Try to create the posts table using raw SQL
    const createPostsTableSQL = `
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        post_type VARCHAR(20) DEFAULT 'general',
        images JSONB DEFAULT '[]'::jsonb,
        tags JSONB DEFAULT '[]'::jsonb,
        visibility VARCHAR(20) DEFAULT 'public',
        is_deleted BOOLEAN DEFAULT false,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Test if we can query the posts table
    const { data, error } = await supabaseAdmin.from('posts').select('count');
    
    if (error) {
      console.log('Posts table does not exist. You need to create it manually in Supabase dashboard.');
      console.log('SQL to execute:');
      console.log(createPostsTableSQL);
      
      console.log('\nAlso create post_likes table:');
      console.log(`
        CREATE TABLE IF NOT EXISTS post_likes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(post_id, user_id)
        );
      `);
      
      console.log('\nAnd comments table:');
      console.log(`
        CREATE TABLE IF NOT EXISTS comments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_deleted BOOLEAN DEFAULT false,
          likes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      console.log('\nPlease run these SQL commands in your Supabase dashboard.');
    } else {
      console.log('Posts table already exists!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createPostsTable();
