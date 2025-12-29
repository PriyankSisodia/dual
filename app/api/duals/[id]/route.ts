import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/duals/[id] - Get a single dual
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
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
        creator:profiles!duals_created_by_fkey(id, username, full_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Increment view count
    await supabase.rpc('increment', {
      table_name: 'duals',
      column_name: 'view_count',
      row_id: id,
    })

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

