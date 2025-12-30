import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// POST /api/votes - Create or update a vote
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { dualId, sideId, voteType, changedMind } = body

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if vote already exists
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('dual_id', dualId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabase
        .from('votes')
        .update({
          side_id: sideId,
          vote_type: voteType,
          changed_mind: changedMind || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (error) throw error

      // Create activity
      await supabase.from('activities').insert({
        type: 'vote',
        message: `@${user.id} voted on a dual`,
        user_id: user.id,
        dual_id: dualId,
      })

      return NextResponse.json({ data, error: null })
    } else {
      // Create new vote
      const { data, error } = await supabase
        .from('votes')
        .insert({
          dual_id: dualId,
          side_id: sideId,
          user_id: user.id,
          vote_type: voteType,
          changed_mind: changedMind || false,
        })
        .select()
        .single()

      if (error) throw error

      // Create activity
      await supabase.from('activities').insert({
        type: 'vote',
        message: `@${user.id} voted on a dual`,
        user_id: user.id,
        dual_id: dualId,
      })

      return NextResponse.json({ data, error: null })
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
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const dualId = searchParams.get('dualId')

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('dual_id', dualId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

