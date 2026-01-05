import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Use Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// GET /api/topics - Get all topics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    )
  }
}

