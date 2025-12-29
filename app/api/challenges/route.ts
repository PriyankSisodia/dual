import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// POST /api/challenges - Create a challenge
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { dualId, sideId, content } = body

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create challenge
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        dual_id: dualId,
        side_id: sideId,
        challenger_id: user.id,
        content,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Get side author to send notification
    const { data: side } = await supabase
      .from('sides')
      .select('author_id')
      .eq('id', sideId)
      .single()

    if (side) {
      await supabase.from('notifications').insert({
        user_id: side.author_id,
        type: 'challenge',
        message: `@${user.id} challenged your argument`,
        related_dual_id: dualId,
        related_user_id: user.id,
      })
    }

    // Create activity
    await supabase.from('activities').insert({
      type: 'challenge',
      message: `@${user.id} challenged an argument`,
      user_id: user.id,
      dual_id: dualId,
    })

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

