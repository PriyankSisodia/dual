'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Topic {
  id: string
  name: string
  slug: string
  description?: string
}

interface SidebarProps {
  activeTopic?: string
  onTopicSelect?: (topic: string | null) => void
}

export default function Sidebar({ activeTopic, onTopicSelect }: SidebarProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const response = await fetch('/api/topics', {
        credentials: 'include',
      })
      const { data, error } = await response.json()
      
      if (error) {
        console.error('Failed to load topics:', error)
        // Use default topics if API fails
        setTopics([
          { id: '1', name: 'All', slug: 'all' },
          { id: '2', name: 'Technology', slug: 'technology' },
          { id: '3', name: 'Politics', slug: 'politics' },
          { id: '4', name: 'Science', slug: 'science' },
          { id: '5', name: 'Philosophy', slug: 'philosophy' },
          { id: '6', name: 'Business', slug: 'business' },
          { id: '7', name: 'Culture', slug: 'culture' },
          { id: '8', name: 'Health', slug: 'health' },
        ])
      } else {
        // Add "All" option at the beginning
        setTopics([
          { id: 'all', name: 'All', slug: 'all' },
          ...(data || []),
        ])
      }
    } catch (error) {
      console.error('Error loading topics:', error)
      // Use default topics on error
      setTopics([
        { id: '1', name: 'All', slug: 'all' },
        { id: '2', name: 'Technology', slug: 'technology' },
        { id: '3', name: 'Politics', slug: 'politics' },
        { id: '4', name: 'Science', slug: 'science' },
        { id: '5', name: 'Philosophy', slug: 'philosophy' },
        { id: '6', name: 'Business', slug: 'business' },
        { id: '7', name: 'Culture', slug: 'culture' },
        { id: '8', name: 'Health', slug: 'health' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTopicClick = (topicSlug: string) => {
    const selectedTopic = topicSlug === 'all' ? null : topicSlug
    onTopicSelect?.(selectedTopic)
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Categories</h2>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-purple-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <nav className="space-y-1">
              {topics.map((topic) => {
                const isActive = activeTopic === topic.slug || (!activeTopic && topic.slug === 'all')
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group ${
                      isActive
                        ? 'bg-purple-100 text-purple-600 border-l-2 border-purple-600'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm font-medium">{topic.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                    )}
                  </button>
                )
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  )
}

