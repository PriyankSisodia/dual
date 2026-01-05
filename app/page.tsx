'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import FeedTabs, { FeedSort } from '@/components/FeedTabs'
import Sidebar from '@/components/Sidebar'
import DualCard from '@/components/DualCard'
import { DualSide, Comment } from '@/components/DualCard/types'
import { Notification } from '@/components/Notifications'
import CreateDualModal from '@/components/CreateDual'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { fetchDuals, createDual } from '@/lib/api/duals'
import { createVote, deleteVote } from '@/lib/api/votes'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FeedSort>('trending')
  const [displayedCards, setDisplayedCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  // Check authentication first
  useEffect(() => {
    checkAuth()
  }, [])

  // Load data after auth check
  useEffect(() => {
    if (!authLoading && currentUser) {
      loadDuals()
      loadNotifications()
    }
  }, [activeTab, authLoading, currentUser, selectedTopic])

  const checkAuth = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Not authenticated - redirect to login
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setCurrentUser({
        id: user.id,
        name: profile?.full_name || profile?.username || 'User',
        avatar: profile?.avatar_url,
      })
    } catch (err) {
      console.error('Auth check error:', err)
      router.push('/login')
    } finally {
      setAuthLoading(false)
    }
  }

  const loadDuals = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await fetchDuals({
        sort: activeTab,
        limit: 20,
        offset: 0,
        topic: selectedTopic || undefined,
      })

      if (error) {
        setError(error)
        // Fallback to empty array if API fails
        setDisplayedCards([])
      } else if (data) {
        // Transform API data to component format
        const transformed = data.map((dual: any) => ({
          id: dual.id,
          topic: dual.topic,
          leftSide: dual.left_side ? transformSide(dual.left_side) : null,
          rightSide: dual.right_side ? transformSide(dual.right_side) : null,
          comments: (dual.comments || []).map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            author: comment.author?.username || comment.author?.full_name || 'Anonymous',
            authorId: comment.author_id,
            avatar: comment.author?.avatar_url,
            side: comment.side_type as 'left' | 'right' | 'neutral',
            createdAt: comment.created_at,
            likes: comment.likes || 0,
          })),
        }))
        setDisplayedCards(transformed)
        setHasMore(data.length === 20)
      }
    } catch (err: any) {
      console.error('Error loading duals:', err)
      setError(err.message)
      setDisplayedCards([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get cred title (same as Profile component)
  const getCredTitle = (cred: number): { title: string; color: string } => {
    if (cred >= 5000) return { title: 'Philosopher', color: '#9B59B6' }
    if (cred >= 2500) return { title: 'Master Debater', color: '#3498DB' }
    if (cred >= 1000) return { title: 'Debater', color: '#2ECC71' }
    if (cred >= 500) return { title: 'Thinker', color: '#F39C12' }
    if (cred >= 100) return { title: 'Skeptic', color: '#E67E22' }
    return { title: 'Novice', color: '#95A5A6' }
  }

  const transformSide = (side: any): DualSide => {
    const authorCred = side.author?.cred || 0
    const { title } = getCredTitle(authorCred)
    
    return {
      id: side.id,
      content: side.content,
      author: side.author?.full_name || side.author?.username || 'Unknown',
      authorId: side.author_id,
      avatar: side.author?.avatar_url,
      authorCred,
      authorTitle: title,
      votes: side.votes || 0,
      upvotes: side.upvotes || 0,
      changedMindCount: side.changed_mind_count || 0,
      challengeCount: side.challenge_count || 0,
      commentCount: side.comment_count || 0,
      createdAt: side.created_at,
    }
  }

  const loadNotifications = async () => {
    try {
      // Load both notifications and activities, merge them
      const [notificationsRes, activitiesRes] = await Promise.all([
        fetch('/api/notifications', {
          credentials: 'include',
        }),
        fetch('/api/activities?limit=10', {
          credentials: 'include',
        }),
      ])

      const notificationsData = await notificationsRes.json()
      const activitiesData = await activitiesRes.json()

      // Transform notifications
      const notificationsList: Notification[] = []
      
      if (notificationsData.data) {
        notificationsList.push(...notificationsData.data.map((n: any) => ({
          id: n.id,
          type: n.type as Notification['type'],
          message: n.message,
          userId: n.user_id,
          userName: n.user?.username || n.user?.full_name,
          dualId: n.dual_id,
          timestamp: new Date(n.created_at),
          read: n.read || false,
        })))
      }

      // Transform activities and add them as notifications
      if (activitiesData.data) {
        notificationsList.push(...activitiesData.data.map((a: any) => ({
          id: `activity-${a.id}`,
          type: (a.type === 'vote' ? 'vote' : a.type === 'comment' ? 'comment' : a.type === 'new_dual' ? 'new_dual' : 'challenge') as Notification['type'],
          message: a.message,
          userId: a.user_id,
          userName: a.user?.username || a.user?.full_name,
          dualId: a.dual_id,
          timestamp: new Date(a.created_at),
          read: false,
        })))
      }

      // Sort by timestamp (newest first) and set
      const allNotifications = notificationsList.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )
      setNotifications(allNotifications)
    } catch (err) {
      console.error('Error loading notifications:', err)
    }
  }

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const { data, error } = await fetchDuals({
        sort: activeTab,
        limit: 20,
        offset: displayedCards.length,
      })

      if (!error && data) {
        const transformed = data.map((dual: any) => ({
          id: dual.id,
          topic: dual.topic,
          leftSide: dual.left_side ? transformSide(dual.left_side) : null,
          rightSide: dual.right_side ? transformSide(dual.right_side) : null,
          comments: (dual.comments || []).map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            author: comment.author?.username || comment.author?.full_name || 'Anonymous',
            authorId: comment.author_id,
            avatar: comment.author?.avatar_url,
            side: comment.side_type as 'left' | 'right' | 'neutral',
            createdAt: comment.created_at,
            likes: comment.likes || 0,
          })),
        }))
        setDisplayedCards((prev) => [...prev, ...transformed])
        setHasMore(data.length === 20)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more:', err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, displayedCards.length, activeTab])

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: handleLoadMore,
  })

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadDuals()
      return
    }
    try {
      setLoading(true)
      const { data, error } = await fetchDuals({
        sort: activeTab,
        topic: query,
        limit: 20,
      })
      if (!error && data) {
        const transformed = data.map((dual: any) => ({
          id: dual.id,
          topic: dual.topic,
          leftSide: dual.left_side ? transformSide(dual.left_side) : null,
          rightSide: dual.right_side ? transformSide(dual.right_side) : null,
          comments: (dual.comments || []).map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            author: comment.author?.username || comment.author?.full_name || 'Anonymous',
            authorId: comment.author_id,
            avatar: comment.author?.avatar_url,
            side: comment.side_type as 'left' | 'right' | 'neutral',
            createdAt: comment.created_at,
            likes: comment.likes || 0,
          })),
        }))
        setDisplayedCards(transformed)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (dualId: string, side: 'left' | 'right' | 'neutral') => {
    if (!currentUser) {
      alert('Please sign in to vote')
      router.push('/login')
      return
    }

    try {
      // Find the side ID
      const dual = displayedCards.find((d) => d.id === dualId)
      if (!dual) return

      const sideId = side === 'left' ? dual.leftSide?.id : side === 'right' ? dual.rightSide?.id : null
      if (!sideId && side !== 'neutral') return

      const { data, error } = await createVote({
        dualId,
        sideId: sideId || '',
        voteType: side,
        changedMind: false,
      })

      if (error) {
        console.error('Vote error:', error)
        if (error.includes('Unauthorized') || error.includes('sign in') || error.includes('session')) {
          // Session expired or invalid - check client-side session
          const supabase = createSupabaseClient()
          const { data: { session: clientSession }, error: sessionError } = await supabase.auth.getSession()
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (sessionError || !clientSession || userError || !user) {
            // Client-side session is also invalid - definitely need to re-login
            alert('Your session has expired. Please sign in again.')
            router.push('/login')
            router.refresh()
          } else {
            // Client has valid session but server doesn't - cookie sync issue
            // Try to refresh the session to sync cookies
            try {
              await supabase.auth.refreshSession()
              // Retry the vote after refresh
              const retryResult = await createVote({
                dualId,
                sideId: sideId || '',
                voteType: side,
                changedMind: false,
              })
              
              if (retryResult.error) {
                alert('Session sync issue. Please sign out and sign back in, then try again.')
              } else {
                loadDuals()
              }
            } catch (refreshError) {
              alert('Session issue detected. Please sign out and sign back in, then try voting again.')
            }
          }
        } else {
          alert('Failed to vote: ' + error)
        }
      } else {
        // Reload duals to get updated vote counts
        loadDuals()
      }
    } catch (err: any) {
      console.error('Vote error:', err)
      alert('Failed to vote: ' + (err.message || 'Unknown error'))
    }
  }

  const handleChangeMind = async (dualId: string, side: 'left' | 'right') => {
    if (!currentUser) {
      alert('Please sign in')
      return
    }

    try {
      const dual = displayedCards.find((d) => d.id === dualId)
      if (!dual) return

      const sideId = side === 'left' ? dual.leftSide?.id : dual.rightSide?.id
      if (!sideId) return

      const { data, error } = await createVote({
        dualId,
        sideId,
        voteType: side,
        changedMind: true,
      })

      if (error) {
        console.error('Change mind error:', error)
      } else {
        loadDuals()
        loadNotifications()
      }
    } catch (err: any) {
      console.error('Change mind error:', err)
    }
  }

  const handleChallenge = async (dualId: string, side: 'left' | 'right') => {
    if (!currentUser) {
      alert('Please sign in to challenge')
      return
    }
    // The ChallengerModal will handle the actual submission
    console.log(`Challenging ${side} side on ${dualId}`)
  }

  const handleShare = async (dualId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DUAL - Break Echo Chambers',
          text: 'Check out this debate on DUAL',
          url: `${window.location.origin}/dual/${dualId}`,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/dual/${dualId}`)
      alert('Link copied to clipboard!')
    }
  }

  const handleBookmark = async (dualId: string) => {
    if (!currentUser) {
      alert('Please sign in to bookmark')
      return
    }
    // TODO: Implement bookmark API
    console.log(`Bookmarking ${dualId}`)
  }

  const handleComment = async (dualId: string, side: 'left' | 'right' | 'neutral', content: string) => {
    if (!currentUser) {
      alert('Please sign in to comment')
      return
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dualId, sideType: side, content }),
      })

      const { data, error } = await response.json()
      if (error) {
        alert('Failed to post comment: ' + error)
      } else {
        // Reload comments or update UI
        loadDuals()
      }
    } catch (err: any) {
      console.error('Comment error:', err)
      alert('Failed to post comment')
    }
  }

  const handleCreateDual = async (topic: string, leftContent: string) => {
    if (!currentUser) {
      alert('Please sign in to create a dual')
      return
    }

    try {
      // Get session token from client and send it
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Session expired. Please sign in again.')
        router.push('/login')
        return
      }

      const { data, error } = await createDual(topic, leftContent, session.access_token)
      if (error) {
        alert('Failed to create dual: ' + error)
      } else {
        setShowCreateModal(false)
        loadDuals()
        loadNotifications()
      }
    } catch (err: any) {
      console.error('Create dual error:', err)
      alert('Failed to create dual: ' + err.message)
    }
  }

  const handleNotificationRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Filter cards based on active tab
  const filteredCards = displayedCards.filter((card) => {
    if (activeTab === 'unfinished') {
      return !card.leftSide || !card.rightSide
    }
    return true
  })

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-gray-900">
      <Header
        onSearch={handleSearch}
        currentUser={currentUser}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
        onLogout={async () => {
          await fetch('/api/auth/signout', { 
            method: 'POST',
            credentials: 'include',
          })
          router.push('/login')
          router.refresh()
        }}
      />
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content with Sidebar */}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <Sidebar 
          activeTopic={selectedTopic || undefined}
          onTopicSelect={setSelectedTopic}
        />
        
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Create Dual Button */}
          <div className="pt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-6 py-4 bg-white border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-3 group"
            >
              <svg
                className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-gray-900 font-medium">What's your take? Start a Dual</span>
            </button>
          </div>


          <main className="py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-purple-100 border border-purple-300 rounded-lg text-purple-700">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Make sure your Supabase credentials are set in .env.local</p>
          </div>
        )}

        {/* Loading State */}
        {loading && displayedCards.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading debates...</span>
            </div>
          </div>
        )}

        {/* Dual Cards Feed */}
        {!loading && filteredCards.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No duals found. Be the first to start one!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Create First Dual
            </button>
          </div>
        )}

        <div className="space-y-8">
          {filteredCards.map((card) => (
            <DualCard
              key={card.id}
              id={card.id}
              leftSide={card.leftSide}
              rightSide={card.rightSide}
              topic={card.topic}
              leftVotes={card.leftSide?.votes || 0}
              rightVotes={card.rightSide?.votes || 0}
              neutralVotes={0}
              onVote={(side) => handleVote(card.id, side)}
              onChangeMind={(side) => handleChangeMind(card.id, side)}
              onChallenge={(side) => handleChallenge(card.id, side)}
              onShare={() => handleShare(card.id)}
              onBookmark={() => handleBookmark(card.id)}
              showArena={false}
              comments={card.comments}
              onComment={(side, content) => handleComment(card.id, side, content)}
            />
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-8 text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading more debates...</span>
              </div>
            ) : (
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                Load More
              </button>
            )}
          </div>
        )}

        {!hasMore && displayedCards.length > 0 && (
          <div className="py-8 text-center text-gray-600">
            <p>You've reached the end of the feed!</p>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* Create Dual Modal */}
      <CreateDualModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDual}
      />
    </div>
  )
}
