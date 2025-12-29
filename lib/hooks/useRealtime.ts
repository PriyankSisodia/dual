'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeDual(dualId: string) {
  const [votes, setVotes] = useState<any>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const channel = supabase
      .channel(`dual:${dualId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `dual_id=eq.${dualId}`,
        },
        (payload) => {
          console.log('Vote change:', payload)
          // Refetch votes or update state
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dualId, supabase])

  return { votes }
}

export function useRealtimeActivities() {
  const [activities, setActivities] = useState<any[]>([])
  const supabase = createSupabaseClient()

  useEffect(() => {
    const channel = supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
        },
        (payload) => {
          setActivities((prev) => [payload.new, ...prev.slice(0, 4)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { activities }
}

