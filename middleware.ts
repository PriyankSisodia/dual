import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh session if expired - required for Server Components
  // This ensures session cookies are refreshed on every request
  const { data: { session } } = await supabase.auth.getSession()
  
  // If session exists but is close to expiring, refresh it
  if (session && session.expires_at) {
    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    const fiveMinutes = 5 * 60 * 1000
    
    // If session expires in less than 5 minutes, refresh it
    if (timeUntilExpiry < fiveMinutes) {
      await supabase.auth.refreshSession()
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

