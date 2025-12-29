'use client'

import { useState } from 'react'
import Notifications from '../Notifications'
import { Notification } from '../Notifications'

interface HeaderProps {
  onSearch?: (query: string) => void
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
  notifications?: Notification[]
  onNotificationRead?: (id: string) => void
  onLogout?: () => void
}

export default function Header({
  onSearch,
  currentUser,
  notifications = [],
  onNotificationRead,
  onLogout,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1E211E] border-b border-[#1E211E]/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#F0F0F0]">
              DUAL
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics: Tech, Politics, Food..."
                className="w-full px-4 py-2 pl-10 pr-4 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-[#F0F0F0] placeholder-[#F0F0F0]/50"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-[#F0F0F0]/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>
          </div>

          {/* User Profile / Auth */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <Notifications
                notifications={notifications}
                onMarkAsRead={onNotificationRead}
              />
            )}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <a
                  href={`/profile/${currentUser.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#1E211E]/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2ECC71] flex items-center justify-center text-white font-semibold">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#F0F0F0] hidden sm:block">
                    {currentUser.name}
                  </span>
                </a>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-[#F0F0F0]/70 hover:text-[#F0F0F0] hover:bg-[#1E211E]/80 rounded-lg transition-colors text-sm font-medium"
                  title="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors font-medium"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

