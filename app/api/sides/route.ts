import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// POST /api/sides - Complete a dual by adding the missing side
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { dualId, sideType, content } = body

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if dual exists and get current state
    const { data: dual, error: dualError } = await supabase
      .from('duals')
      .select('*')
      .eq('id', dualId)
      .single()

    if (dualError) throw dualError

    // Create the side
    const { data: side, error: sideError } = await supabase
      .from('sides')
      .insert({
        dual_id: dualId,
        side_type: sideType,
        content,
        author_id: user.id,
        is_main: true,
      })
      .select()
      .single()

    if (sideError) throw sideError

    // Update dual
    const updateField = sideType === 'left' ? 'left_side_id' : 'right_side_id'
    const { error: updateError } = await supabase
      .from('duals')
      .update({
        [updateField]: side.id,
        status: dual.left_side_id && dual.right_side_id ? 'active' : 'pending',
      })
      .eq('id', dualId)

    if (updateError) throw updateError

    // Notify the creator if this completes the dual
    if (dual.left_side_id && sideType === 'right' || dual.right_side_id && sideType === 'left') {
      await supabase.from('notifications').insert({
        user_id: dual.created_by,
        type: 'half_post_completed',
        message: `Your dual "${dual.topic}" was completed!`,
        related_dual_id: dualId,
        related_user_id: user.id,
      })
    }

    // Create activity
    await supabase.from('activities').insert({
      type: 'new_dual',
      message: `@${user.id} completed a dual`,
      user_id: user.id,
      dual_id: dualId,
    })

    return NextResponse.json({ data: side, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

