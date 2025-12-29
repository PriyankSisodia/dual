'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import FeedTabs, { FeedSort } from '@/components/FeedTabs'
import DualCard from '@/components/DualCard'
import { DualSide, Comment } from '@/components/DualCard/types'
import { Notification } from '@/components/Notifications'
import CreateDualModal from '@/components/CreateDual'
import ActivityFeed, { Activity } from '@/components/ActivityFeed'
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
  const [activities, setActivities] = useState<Activity[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check authentication first
  useEffect(() => {
    checkAuth()
  }, [])

  // Load data after auth check
  useEffect(() => {
    if (!authLoading && currentUser) {
      loadDuals()
      loadActivities()
    }
  }, [activeTab, authLoading, currentUser])

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

  const transformSide = (side: any): DualSide => {
    return {
      id: side.id,
      content: side.content,
      author: side.author?.full_name || side.author?.username || 'Unknown',
      authorId: side.author_id,
      avatar: side.author?.avatar_url,
      votes: side.votes || 0,
      persuasionPoints: side.persuasion_points || 0,
      changedMindCount: side.changed_mind_count || 0,
      challengeCount: side.challenge_count || 0,
      commentCount: side.comment_count || 0,
      createdAt: side.created_at,
    }
  }

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activities?limit=5', {
        credentials: 'include',
      })
      const { data, error } = await response.json()
      if (!error && data) {
        setActivities(data.map((a: any) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          userId: a.user_id,
          userName: a.user?.username || a.user?.full_name,
          timestamp: new Date(a.created_at),
        })))
      }
    } catch (err) {
      console.error('Error loading activities:', err)
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
        alert('Failed to vote: ' + error)
      } else {
        // Reload duals to get updated vote counts
        loadDuals()
      }
    } catch (err: any) {
      console.error('Vote error:', err)
      alert('Failed to vote: ' + err.message)
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
        loadActivities()
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
        loadActivities()
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
      <div className="min-h-screen bg-[#121412] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F0F0F0]/70">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#121412] text-[#F0F0F0]">
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
      
      {/* Create Dual Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-6 py-4 bg-[#1E211E] border-2 border-dashed border-[#2ECC71]/30 rounded-xl hover:border-[#2ECC71] hover:bg-[#1E211E]/80 transition-all flex items-center justify-center gap-3 group"
        >
          <svg
            className="w-6 h-6 text-[#2ECC71] group-hover:scale-110 transition-transform"
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
          <span className="text-[#F0F0F0] font-medium">What's your take? Start a Dual</span>
        </button>
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#E67E22]/20 border border-[#E67E22]/50 rounded-lg text-[#E67E22]">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Make sure your Supabase credentials are set in .env.local</p>
          </div>
        )}

        {/* Loading State */}
        {loading && displayedCards.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-[#F0F0F0]/70">
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
            <p className="text-[#F0F0F0]/70 mb-4">No duals found. Be the first to start one!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors font-medium"
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
              <div className="flex items-center justify-center gap-2 text-[#F0F0F0]/70">
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
                className="px-6 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                Load More
              </button>
            )}
          </div>
        )}

        {!hasMore && displayedCards.length > 0 && (
          <div className="py-8 text-center text-[#F0F0F0]/70">
            <p>You've reached the end of the feed!</p>
          </div>
        )}
      </main>

      {/* Create Dual Modal */}
      <CreateDualModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDual}
      />
    </div>
  )
}
