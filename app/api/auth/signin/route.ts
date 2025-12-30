import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// POST /api/auth/signin - Sign in user with email or username
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { emailOrUsername, password } = body

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { data: null, error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    let email = emailOrUsername

    // Check if input is an email (contains @) or username
    const isEmail = emailOrUsername.includes('@')

    if (!isEmail) {
      // It's a username - look up the email using a database function
      // We'll use a SQL function to get email from auth.users via profiles
      const { data: emailData, error: emailError } = await supabase.rpc('get_user_email_by_username', {
        username_param: emailOrUsername.toLowerCase().trim()
      })

      if (emailError || !emailData || (Array.isArray(emailData) && emailData.length === 0)) {
        return NextResponse.json(
          { data: null, error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // The function returns a table, so emailData is an array with one object
      const emailResult = Array.isArray(emailData) ? emailData[0] : emailData
      if (!emailResult || !emailResult.email) {
        return NextResponse.json(
          { data: null, error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      email = emailResult.email
    }

    // Sign in with email and password
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    // If error is email not confirmed, try to auto-confirm if service role key is available
    if (error && (
      error.message.includes('email') && error.message.includes('confirm') ||
      error.message.includes('Email not confirmed')
    )) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js')
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

          // Get user by email to find their ID
          const { data: users } = await supabaseAdmin.auth.admin.listUsers()
          const user = users?.users.find(u => u.email === email.trim())
          
          if (user) {
            // Confirm the user
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              email_confirm: true,
            })
            
            // Try signing in again
            const retryResult = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            })
            
            if (!retryResult.error) {
              data = retryResult.data
              error = null
            }
          }
        } catch (adminError) {
          // If auto-confirm fails, return original error
          console.log('Auto-confirm on signin failed:', adminError)
        }
      }
    }

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    // Provide user-friendly error messages
    let errorMessage = error.message
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email/username or password'
    }

    return NextResponse.json(
      { data: null, error: errorMessage },
      { status: 401 }
    )
  }
}

