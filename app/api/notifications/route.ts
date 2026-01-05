import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// GET /api/notifications - Get all notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        user:profiles!notifications_related_user_id_fkey(id, username, full_name, avatar_url),
        dual:duals!notifications_related_dual_id_fkey(id, topic)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

