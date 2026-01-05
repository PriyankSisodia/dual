import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// POST /api/votes - Create or update a vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dualId, sideId, voteType, changedMind } = body

    // Validate required fields
    if (!dualId) {
      return NextResponse.json(
        { data: null, error: 'dualId is required' },
        { status: 400 }
      )
    }

    if (!voteType || !['left', 'right', 'neutral'].includes(voteType)) {
      return NextResponse.json(
        { data: null, error: 'voteType must be left, right, or neutral' },
        { status: 400 }
      )
    }

    // Get Supabase credentials first (needed for neutral vote sideId lookup)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // sideId is required for all votes (schema constraint - side_id is NOT NULL)
    // For neutral votes, fetch the dual to get a side_id to use as placeholder
    let finalSideId = sideId
    if (!finalSideId || finalSideId === '') {
      if (voteType === 'neutral') {
        // For neutral votes, fetch the dual to get a side_id
        const { createClient } = await import('@supabase/supabase-js')
        const tempClient = createClient(supabaseUrl, supabaseAnonKey)
        const { data: dualData, error: dualError } = await tempClient
          .from('duals')
          .select('left_side_id, right_side_id')
          .eq('id', dualId)
          .single()
        
        if (dualError || !dualData) {
          return NextResponse.json(
            { data: null, error: 'Dual not found' },
            { status: 400 }
          )
        }
        
        // Use left side as placeholder for neutral votes (schema requires side_id)
        finalSideId = dualData.left_side_id || dualData.right_side_id
        if (!finalSideId) {
          return NextResponse.json(
            { data: null, error: 'Dual has no sides yet' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { data: null, error: 'sideId is required for left/right votes' },
          { status: 400 }
        )
      }
    }

    // Create Supabase client with request cookies for proper session handling
    const { createServerClient } = await import('@supabase/ssr')
    
    // Create a response object to store cookies (can't use NextResponse.next() in API routes)
    const response = new NextResponse()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Try to get user - if cookie-based auth fails, try manual parsing
    let user = null
    let authError = null
    let session = null
    let dbClient = supabase
    
    // First try getSession
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
    session = currentSession
    
    if (session?.user) {
      user = session.user
    } else {
      // Try getUser as fallback
      const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser()
      if (!userError && fetchedUser) {
        user = fetchedUser
        const { data: { session: refreshedSession } } = await supabase.auth.getSession()
        session = refreshedSession
      } else {
        // Both failed - try manual cookie parsing
        const authCookie = request.cookies.get('sb-bxzmjforzmioskarmspi-auth-token')
        if (authCookie?.value && authCookie.value.startsWith('{')) {
          try {
            const sessionData = JSON.parse(authCookie.value)
            if (sessionData.access_token) {
              // Create token-based client
              const { createClient } = await import('@supabase/supabase-js')
              const tokenSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: {
                  headers: {
                    Authorization: `Bearer ${sessionData.access_token}`,
                  },
                },
              })
              
              // Verify token and get user
              const { data: { user: tokenUser }, error: tokenError } = await tokenSupabase.auth.getUser(sessionData.access_token)
              if (!tokenError && tokenUser) {
                user = tokenUser
                session = {
                  access_token: sessionData.access_token,
                  refresh_token: sessionData.refresh_token,
                  expires_in: sessionData.expires_in,
                  expires_at: sessionData.expires_at,
                  token_type: sessionData.token_type || 'bearer',
                  user: tokenUser,
                }
                dbClient = tokenSupabase // Use token-based client for DB operations
              } else {
                authError = tokenError
              }
            }
          } catch (parseError: any) {
            authError = parseError
          }
        } else {
          authError = userError || sessionError
        }
      }
    }

    if (authError || !user) {
      console.error('Auth error in vote:', {
        error: authError?.message,
        hasUser: !!user,
        hasSession: !!session,
        sessionUser: session?.user?.id,
        cookieNames: request.cookies.getAll().map(c => c.name),
        cookieValues: request.cookies.getAll().map(c => ({ 
          name: c.name, 
          hasValue: !!c.value, 
          length: c.value?.length,
          startsWith: c.value?.substring(0, 20)
        })),
        cookieCount: request.cookies.getAll().length,
      })
      
      // Return more detailed error for debugging
      return NextResponse.json(
        { 
          data: null, 
          error: 'Unauthorized. Please sign in again.',
          debug: {
            hasSession: !!session,
            hasUser: !!user,
            cookieCount: request.cookies.getAll().length,
            errorMessage: authError?.message,
          }
        },
        { status: 401 }
      )
    }

    // Check if vote already exists (use maybeSingle to avoid error if no vote exists)
    const { data: existingVote, error: checkError } = await dbClient
      .from('votes')
      .select('*')
      .eq('dual_id', dualId)
      .eq('user_id', user.id)
      .maybeSingle()
    
    // If there's an error that's not "not found", throw it
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingVote) {
      // Update existing vote
      const { data, error } = await dbClient
        .from('votes')
        .update({
          side_id: finalSideId,
          vote_type: voteType,
          changed_mind: changedMind || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (error) {
        console.error('Update vote error:', error)
        throw error
      }

      // Create activity
      await dbClient.from('activities').insert({
        type: 'vote',
        message: `@${user.id} voted on a dual`,
        user_id: user.id,
        dual_id: dualId,
      })

      return NextResponse.json({ data, error: null }, {
        headers: response.headers,
      })
    } else {
      // Create new vote - handle potential race condition
      let voteData = null
      let voteError = null
      
      // Build insert payload - side_id is always required (even for neutral votes)
      const insertPayload = {
        dual_id: dualId,
        side_id: finalSideId, // Required by schema, even for neutral votes (we use a placeholder)
        user_id: user.id,
        vote_type: voteType,
        changed_mind: changedMind || false,
      }

      const { data: insertData, error: insertError } = await dbClient
        .from('votes')
        .insert(insertPayload)
        .select()
        .single()

      if (insertError) {
        // If it's a duplicate key error, vote was created between check and insert - update it
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
          const { data: updatedData, error: updateError } = await dbClient
            .from('votes')
            .update({
              side_id: finalSideId,
              vote_type: voteType,
              changed_mind: changedMind || false,
              updated_at: new Date().toISOString(),
            })
            .eq('dual_id', dualId)
            .eq('user_id', user.id)
            .select()
            .single()
          
          if (updateError) {
            console.error('Update vote error (duplicate key recovery):', updateError)
            throw updateError
          }
          voteData = updatedData
        } else {
          throw insertError
        }
      } else {
        voteData = insertData
      }

      // Create activity (only for new votes, skip if it was an update)
      if (voteData && !insertError) {
        try {
          await dbClient.from('activities').insert({
            type: 'vote',
            message: `@${user.id} voted on a dual`,
            user_id: user.id,
            dual_id: dualId,
          })
        } catch (activityError) {
          // Ignore activity creation errors (might be duplicate)
        }
      }

      return NextResponse.json({ data: voteData, error: null }, {
        headers: response.headers,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/votes - Remove a vote
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dualId = searchParams.get('dualId')

    // Create Supabase client with request cookies for proper session handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const { createServerClient } = await import('@supabase/ssr')
    
    const response = new NextResponse()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Try getSession first (more reliable for cookies)
    let user = null
    let authError = null
    
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user = session.user
    } else {
      // Fallback to getUser
      const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser()
      if (!userError && fetchedUser) {
        user = fetchedUser
      } else {
        authError = userError
      }
    }

    if (authError || !user) {
      console.error('Auth error in delete vote:', {
        error: authError?.message,
        hasUser: !!user,
        hasSession: !!session,
        cookieNames: request.cookies.getAll().map(c => c.name),
      })
      return NextResponse.json(
        { data: null, error: 'Unauthorized. Please sign in again.' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('dual_id', dualId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null }, {
      headers: response.headers,
    })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

