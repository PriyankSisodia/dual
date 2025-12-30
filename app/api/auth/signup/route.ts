import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// POST /api/auth/signup - Create a new user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { email, password, username, fullName } = body

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Don't require email confirmation redirect
      },
    })

    if (authError) throw authError
    if (!authData.user) {
      return NextResponse.json(
        { data: null, error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Auto-confirm user email if service role key is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey && authData.user && !authData.user.email_confirmed_at) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        )

        // Update user to confirm email
        await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
          email_confirm: true,
        })
      } catch (adminError) {
        // If admin update fails, continue anyway - user can confirm via email
        console.log('Auto-confirm failed (this is okay if service role key is not set):', adminError)
      }
    }

    // Create profile (with retry logic)
    // Note: If the database trigger is set up, this might already be created
    let profile = null
    let profileError = null
    
    // Try to create profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username || email.split('@')[0],
        full_name: fullName || username || 'User',
      })
      .select()
      .single()

    if (insertError) {
      // Profile might already exist (created by trigger) or there's a conflict
      if (insertError.code === '23505') { // Unique violation - profile already exists
        // Fetch the existing profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        profile = existingProfile
      } else {
        profileError = insertError
        console.error('Profile creation error:', profileError)
        // Wait a moment and try fetching (in case trigger created it)
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: fetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        if (fetchedProfile) {
          profile = fetchedProfile
          profileError = null
        }
      }
    } else {
      profile = newProfile
    }

    return NextResponse.json({
      data: {
        user: authData.user,
        profile,
      },
      error: null,
    })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

