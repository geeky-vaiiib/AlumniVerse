require('dotenv').config();
const { supabaseAdmin } = require('./config/supabase');

async function setupDatabaseTables() {
  console.log('🚀 Setting up AlumniVerse database tables...\n');

  try {
    // Test connection first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Check if posts table exists
    const { data: postsTest, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('count')
      .limit(1);

    if (postsError && postsError.message.includes('does not exist')) {
      console.log('📝 Posts table does not exist. Creating it...');
      
      // Create posts table using raw SQL
      const createPostsSQL = `
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

        CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
        CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(is_deleted) WHERE is_deleted = false;
      `;

      try {
        // For now, we'll output the SQL that needs to be run manually
        console.log('\n📋 Please run the following SQL in your Supabase SQL editor:');
        console.log('=====================================');
        console.log(createPostsSQL);
        console.log('=====================================\n');
      } catch (sqlError) {
        console.error('❌ Error creating posts table:', sqlError.message);
      }
    } else {
      console.log('✅ Posts table exists');
    }

    // Check if post_likes table exists
    const { data: likesTest, error: likesError } = await supabaseAdmin
      .from('post_likes')
      .select('count')
      .limit(1);

    if (likesError && likesError.message.includes('does not exist')) {
      console.log('📝 Post likes table does not exist. Creating it...');
      
      const createLikesSQL = `
        CREATE TABLE IF NOT EXISTS post_likes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(post_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
        CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
      `;

      console.log('\n📋 Please also run this SQL for post likes:');
      console.log('=====================================');
      console.log(createLikesSQL);
      console.log('=====================================\n');
    } else {
      console.log('✅ Post likes table exists');
    }

    // Check if comments table exists
    const { data: commentsTest, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select('count')
      .limit(1);

    if (commentsError && commentsError.message.includes('does not exist')) {
      console.log('📝 Comments table does not exist. Creating it...');
      
      const createCommentsSQL = `
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

        CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
        CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
      `;

      console.log('\n📋 Please also run this SQL for comments:');
      console.log('=====================================');
      console.log(createCommentsSQL);
      console.log('=====================================\n');
    } else {
      console.log('✅ Comments table exists');
    }

    console.log('🎯 Database setup check complete!');
    console.log('\n💡 If you see SQL above, please run it in your Supabase dashboard SQL editor.');
    console.log('   Then run this script again to verify the setup.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabaseTables();
