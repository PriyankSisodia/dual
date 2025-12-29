import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/comments?dualId=xxx - Get comments for a dual
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const dualId = searchParams.get('dualId')

    if (!dualId) {
      return NextResponse.json(
        { data: null, error: 'dualId is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, username, full_name, avatar_url)
      `)
      .eq('dual_id', dualId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a comment
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

    const { data, error } = await supabase
      .from('comments')
      .insert({
        dual_id: dualId,
        side_type: sideType,
        content,
        author_id: user.id,
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Create activity
    await supabase.from('activities').insert({
      type: 'comment',
      message: `@${user.id} commented on a dual`,
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

