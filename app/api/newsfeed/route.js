import { getSupabaseClient } from '@/lib/supabase-singleton'
import { NextResponse } from 'next/server'

const supabase = getSupabaseClient()

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('newsfeed')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [API] Error fetching newsfeed:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Transform to expected format
    const transformedPosts = (posts || []).map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.author?.id,
        name: `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Anonymous',
        avatar: post.author?.avatar_path,
        position: post.author?.current_position,
        company: post.author?.company
      },
      createdAt: post.created_at,
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0
    }))

    return NextResponse.json({ 
      success: true, 
      data: { posts: transformedPosts },
      count: transformedPosts.length 
    })
  } catch (error) {
    console.error('❌ [API] Newsfeed fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Get the session from the request
    const { session } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const postData = await request.json()

    // Get user's internal ID
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (userError || !userProfile) {
      console.error('❌ [API] User profile not found:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 400 })
    }

    // Create newsfeed post
    const { data: post, error } = await supabase
      .from('newsfeed')
      .insert([{
        title: postData.title,
        content: postData.content,
        author_id: userProfile.id
      }])
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .single()

    if (error) {
      console.error('❌ [API] Error creating newsfeed post:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    console.log('✅ [API] Newsfeed post created successfully:', post.id)

    // Transform to expected format
    const transformedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.author?.id,
        name: `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Anonymous',
        avatar: post.author?.avatar_path,
        position: post.author?.current_position,
        company: post.author?.company
      },
      createdAt: post.created_at,
      likesCount: 0,
      commentsCount: 0
    }

    return NextResponse.json({ 
      success: true, 
      data: transformedPost 
    })
  } catch (error) {
    console.error('❌ [API] Newsfeed creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}