import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// GET /api/auth/check - Check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Get cookies from request
    const cookies = request.cookies.getAll()
    
    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id || null,
      email: user?.email || null,
      error: authError?.message || null,
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    )
  }
}

