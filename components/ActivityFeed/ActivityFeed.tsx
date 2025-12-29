'use client'

import { useState, useEffect } from 'react'

export interface Activity {
  id: string
  type: 'challenge' | 'changed_mind' | 'vote' | 'comment' | 'new_dual'
  message: string
  userId?: string
  userName?: string
  timestamp: Date
}

interface ActivityFeedProps {
  activities?: Activity[]
  maxItems?: number
}

export default function ActivityFeed({ activities = [], maxItems = 5 }: ActivityFeedProps) {
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Show most recent activities
    const recent = activities.slice(0, maxItems)
    setDisplayedActivities(recent)
  }, [activities, maxItems])

  if (displayedActivities.length === 0) return null

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'challenge':
        return '⚔️'
      case 'changed_mind':
        return '💡'
      case 'vote':
        return '🗳️'
      case 'comment':
        return '💬'
      case 'new_dual':
        return '✨'
      default:
        return '🔔'
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'challenge':
        return 'text-[#E67E22]'
      case 'changed_mind':
        return 'text-[#2ECC71]'
      case 'vote':
        return 'text-[#F0F0F0]'
      case 'comment':
        return 'text-[#2ECC71]'
      case 'new_dual':
        return 'text-[#2ECC71]'
      default:
        return 'text-[#F0F0F0]'
    }
  }

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <div className="bg-[#1E211E] rounded-lg shadow-2xl border border-[#1E211E]/50 overflow-hidden">
        <div className="px-4 py-2 bg-[#2ECC71]/20 border-b border-[#1E211E]/50 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#2ECC71] rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-[#F0F0F0] uppercase tracking-wide">
            Live Activity
          </span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="px-4 py-3 border-b border-[#1E211E]/50 hover:bg-[#1E211E]/80 transition-colors animate-fade-in"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-[#F0F0F0]/50 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

