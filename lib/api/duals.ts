// Client-side API helpers for duals

export interface Dual {
  id: string
  topic: string
  topic_id?: string
  left_side_id?: string
  right_side_id?: string
  created_by: string
  status: 'pending' | 'active' | 'completed' | 'archived'
  view_count: number
  created_at: string
  updated_at: string
  left_side?: any
  right_side?: any
  creator?: any
}

export async function fetchDuals(params: {
  sort?: 'trending' | 'newest' | 'unfinished'
  topic?: string
  limit?: number
  offset?: number
}): Promise<{ data: Dual[] | null; error: string | null }> {
  try {
    const queryParams = new URLSearchParams()
    if (params.sort) queryParams.set('sort', params.sort)
    if (params.topic) queryParams.set('topic', params.topic)
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.offset) queryParams.set('offset', params.offset.toString())

    const response = await fetch(`/api/duals?${queryParams}`, {
      credentials: 'include',
    })
    return await response.json()
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function fetchDual(id: string): Promise<{ data: Dual | null; error: string | null }> {
  try {
    const response = await fetch(`/api/duals/${id}`, {
      credentials: 'include',
    })
    return await response.json()
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function createDual(topic: string, leftContent: string, accessToken?: string): Promise<{ data: Dual | null; error: string | null }> {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    
    // Add authorization header if token is provided
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    const response = await fetch('/api/duals', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ topic, leftContent }),
    })
    return await response.json()
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

