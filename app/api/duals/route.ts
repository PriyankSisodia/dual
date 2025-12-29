import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/duals - Get all duals with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const sort = searchParams.get('sort') || 'trending' // trending, newest, unfinished
    const topic = searchParams.get('topic')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('duals')
      .select(`
        *,
        left_side:sides!duals_left_side_id_fkey(
          *,
          author:profiles!sides_author_id_fkey(id, username, full_name, avatar_url)
        ),
        right_side:sides!duals_right_side_id_fkey(
          *,
          author:profiles!sides_author_id_fkey(id, username, full_name, avatar_url)
        ),
        creator:profiles!duals_created_by_fkey(id, username, full_name, avatar_url),
        comments:comments(
          *,
          author:profiles!comments_author_id_fkey(id, username, full_name, avatar_url)
        )
      `)

    // Filter by status
    if (sort === 'unfinished') {
      query = query.or('left_side_id.is.null,right_side_id.is.null')
    } else {
      query = query.not('left_side_id', 'is', null)
        .not('right_side_id', 'is', null)
    }

    // Filter by topic
    if (topic) {
      query = query.ilike('topic', `%${topic}%`)
    }

    // Sort
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'trending') {
      // Trending = most votes in last 24 hours
      query = query.order('updated_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/duals - Create a new dual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, leftContent } = body

    // Try to get user from Authorization header first, then cookies
    const authHeader = request.headers.get('authorization')
    let user = null
    let authError = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use token from Authorization header
      const token = authHeader.substring(7)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      if (!tokenError && tokenUser) {
        user = tokenUser
      } else {
        authError = tokenError
      }
    }

    // Fallback to cookie-based auth - create client with request cookies
    if (!user) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const { createServerClient } = await import('@supabase/ssr')
      
      const cookieResponse = NextResponse.next()
      const cookieSupabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieResponse.cookies.set(name, value, options)
            })
          },
        },
      })
      
      // Try getSession first (more reliable for cookies)
      const { data: { session } } = await cookieSupabase.auth.getSession()
      if (session?.user) {
        user = session.user
      } else {
        // Fallback to getUser
        const { data: { user: cookieUser }, error: cookieError } = await cookieSupabase.auth.getUser()
        if (!cookieError && cookieUser) {
          user = cookieUser
        } else {
          authError = cookieError || authError
        }
      }
    }
    
    if (authError || !user) {
      console.error('Auth error in create dual:', {
        error: authError?.message,
        hasUser: !!user,
        hasAuthHeader: !!authHeader,
        cookieNames: request.cookies.getAll().map(c => c.name),
        cookieValues: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value, length: c.value?.length })),
      })
      return NextResponse.json(
        { data: null, error: 'Unauthorized. Please sign in again.' },
        { status: 401 }
      )
    }

    // Use the authenticated supabase client (with user session) for database operations
    // This ensures RLS policies can see auth.uid() and auth.role()
    let supabase
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use token-based client
      const token = authHeader.substring(7)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const { createClient } = await import('@supabase/supabase-js')
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
    } else {
      // Use cookie-based client (already created above)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const { createServerClient } = await import('@supabase/ssr')
      
      const cookieResponse = NextResponse.next()
      supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieResponse.cookies.set(name, value, options)
            })
          },
        },
      })
    }

    // Ensure user profile exists (required for foreign key constraint)
    // Note: This should rarely be needed if the database trigger is set up
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist (fallback)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
          full_name: user.email?.split('@')[0] || user.user_metadata?.full_name || 'User',
        })

      if (profileError) {
        // If it's a unique constraint error, profile might have been created by trigger
        if (profileError.code !== '23505') {
          console.error('Failed to create profile:', profileError)
          return NextResponse.json(
            { data: null, error: 'Failed to create user profile. Please contact support.' },
            { status: 500 }
          )
        }
      }
    }

    // Create dual
    const { data: dual, error: dualError } = await supabase
      .from('duals')
      .insert({
        topic,
        created_by: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (dualError) throw dualError

    // Create left side
    const { data: leftSide, error: sideError } = await supabase
      .from('sides')
      .insert({
        dual_id: dual.id,
        side_type: 'left',
        content: leftContent,
        author_id: user.id,
        is_main: true,
      })
      .select()
      .single()

    if (sideError) throw sideError

    // Update dual with left_side_id
    const { error: updateError } = await supabase
      .from('duals')
      .update({ left_side_id: leftSide.id })
      .eq('id', dual.id)

    if (updateError) throw updateError

    // Create activity
    await supabase.from('activities').insert({
      type: 'new_dual',
      message: `New dual created: "${topic}"`,
      user_id: user.id,
      dual_id: dual.id,
    })

    return NextResponse.json({ data: { ...dual, left_side: leftSide }, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

