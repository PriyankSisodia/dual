'use client'

import { useState } from 'react'

export interface Notification {
  id: string
  type: 'challenge' | 'changed_mind' | 'half_post_completed' | 'new_follower'
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
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'challenge':
        return 'text-[#E67E22]'
      case 'changed_mind':
        return 'text-[#2ECC71]'
      case 'half_post_completed':
        return 'text-[#2ECC71]'
      case 'new_follower':
        return 'text-[#2ECC71]'
      default:
        return 'text-[#F0F0F0]/70'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#F0F0F0]/80 hover:text-[#F0F0F0] transition-colors"
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
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-[#E67E22] text-white text-xs flex items-center justify-center font-bold">
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
          <div className="absolute right-0 mt-2 w-80 bg-[#1E211E] rounded-xl shadow-2xl border border-[#1E211E]/50 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-[#1E211E]/50 flex items-center justify-between">
              <h3 className="font-semibold text-[#F0F0F0]">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-[#2ECC71] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="divide-y divide-[#1E211E]/50">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        onMarkAsRead?.(notification.id)
                      }
                    }}
                    className={`p-4 hover:bg-[#1E211E]/80 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-[#2ECC71]/10' : ''
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
                        <p className="text-xs text-[#F0F0F0]/60 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#2ECC71] flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[#F0F0F0]/70">
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

