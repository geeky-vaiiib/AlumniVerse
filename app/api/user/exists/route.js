import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    console.log('🔍 [USER_EXISTS] Checking user existence for:', email)

    // Check if user exists in Supabase Auth using v2 API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('❌ [USER_EXISTS] Error listing users:', error.message)
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      )
    }

    // Find user by email in the returned users list
    const user = data.users?.find(u => u.email === email)
    const exists = !!user

    console.log('🔍 [USER_EXISTS] User existence result:', { email, exists })

    return NextResponse.json({
      exists,
      user: exists ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      } : null
    })

  } catch (err) {
    console.error('❌ [USER_EXISTS] API Error:', err.message)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
