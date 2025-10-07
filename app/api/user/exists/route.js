import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

    console.log('🔍 [TEMP] Checking user existence for:', email)

    // Check if user exists in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (error && error.message !== 'User not found') {
      console.error('Error checking user existence:', error)
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      )
    }

    const exists = !error && data?.user
    
    console.log('🔍 [TEMP] User existence result:', { email, exists: !!exists })

    return NextResponse.json({
      exists: !!exists,
      email
    })

  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
