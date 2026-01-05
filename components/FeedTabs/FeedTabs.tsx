'use client'

export type FeedSort = 'trending' | 'newest' | 'unfinished'

interface FeedTabsProps {
  activeTab: FeedSort
  onTabChange: (tab: FeedSort) => void
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs: { id: FeedSort; label: string; icon: string }[] = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'newest', label: 'Newest', icon: '✨' },
    { id: 'unfinished', label: 'Unfinished', icon: '⏳' },
  ]

  return (
    <div className="border-b border-purple-200 bg-white sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-purple-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

