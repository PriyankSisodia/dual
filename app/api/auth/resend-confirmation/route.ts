import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// POST /api/auth/resend-confirmation - Resend email confirmation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { emailOrUsername } = body

    if (!emailOrUsername) {
      return NextResponse.json(
        { data: null, error: 'Email or username is required' },
        { status: 400 }
      )
    }

    let email = emailOrUsername

    // Check if input is an email (contains @) or username
    const isEmail = emailOrUsername.includes('@')

    if (!isEmail) {
      // It's a username - look up the email using a database function
      const { data: emailData, error: emailError } = await supabase.rpc('get_user_email_by_username', {
        username_param: emailOrUsername.toLowerCase().trim()
      })

      if (emailError || !emailData || (Array.isArray(emailData) && emailData.length === 0)) {
        return NextResponse.json(
          { data: null, error: 'User not found' },
          { status: 404 }
        )
      }

      const emailResult = Array.isArray(emailData) ? emailData[0] : emailData
      if (!emailResult || !emailResult.email) {
        return NextResponse.json(
          { data: null, error: 'User not found' },
          { status: 404 }
        )
      }

      email = emailResult.email
    }

    // Resend confirmation email
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    })

    if (error) throw error

    return NextResponse.json({ 
      data: { message: 'Confirmation email sent successfully' }, 
      error: null 
    })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message || 'Failed to resend confirmation email' },
      { status: 500 }
    )
  }
}

