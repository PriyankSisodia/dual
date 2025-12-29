// Client-side API helpers for votes

export interface Vote {
  id: string
  dual_id: string
  side_id: string
  user_id: string
  vote_type: 'left' | 'right' | 'neutral'
  changed_mind: boolean
  created_at: string
  updated_at: string
}

export async function createVote(params: {
  dualId: string
  sideId: string
  voteType: 'left' | 'right' | 'neutral'
  changedMind?: boolean
}): Promise<{ data: Vote | null; error: string | null }> {
  try {
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        dualId: params.dualId,
        sideId: params.sideId,
        voteType: params.voteType,
        changedMind: params.changedMind || false,
      }),
    })
    return await response.json()
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function deleteVote(dualId: string): Promise<{ data: { success: boolean } | null; error: string | null }> {
  try {
    const response = await fetch(`/api/votes?dualId=${dualId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return await response.json()
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

