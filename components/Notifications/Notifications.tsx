'use client'

import { useState } from 'react'

export interface Notification {
  id: string
  type: 'challenge' | 'changed_mind' | 'half_post_completed' | 'new_follower' | 'vote' | 'comment' | 'new_dual'
  message: string
  userId?: string
  userName?: string
  dualId?: string
  timestamp: Date
  read: boolean
}

interface NotificationsProps {
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
  onClearAll?: () => void
}

export default function Notifications({
  notifications,
  onMarkAsRead,
  onClearAll,
}: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'challenge':
        return '⚔️'
      case 'changed_mind':
        return '💡'
      case 'half_post_completed':
        return '✅'
      case 'new_follower':
        return '👤'
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

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'challenge':
        return 'text-purple-600'
      case 'changed_mind':
        return 'text-purple-600'
      case 'half_post_completed':
        return 'text-purple-600'
      case 'new_follower':
        return 'text-purple-600'
      case 'vote':
        return 'text-gray-900'
      case 'comment':
        return 'text-purple-600'
      case 'new_dual':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-purple-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-purple-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="divide-y divide-purple-200">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        onMarkAsRead?.(notification.id)
                      }
                    }}
                    className={`p-4 hover:bg-purple-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-600">
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

