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
    
    // Check if response is OK and has content
    if (!response.ok) {
      const text = await response.text()
      try {
        const json = JSON.parse(text)
        return { data: null, error: json.error || `HTTP ${response.status}` }
      } catch {
        return { data: null, error: text || `HTTP ${response.status}` }
      }
    }
    
    // Check if response has content
    const text = await response.text()
    if (!text || text.trim() === '') {
      return { data: null, error: 'Empty response from server' }
    }
    
    try {
      return JSON.parse(text)
    } catch (parseError: any) {
      return { data: null, error: `Invalid JSON response: ${parseError.message}` }
    }
  } catch (error: any) {
    return { data: null, error: error.message || 'Network error' }
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

