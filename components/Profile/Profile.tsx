'use client'

interface ProfileProps {
  userId: string
  name: string
  avatar?: string
  cred: number
  topics: string[]
  rivalCount?: number
  followerCount?: number
  followingCount?: number
  isFollowing?: boolean
  onFollow?: () => void
}

// Get user title based on cred
function getCredTitle(cred: number): { title: string; color: string } {
  if (cred >= 5000) return { title: 'Philosopher', color: '#9B59B6' }
  if (cred >= 2500) return { title: 'Master Debater', color: '#3498DB' }
  if (cred >= 1000) return { title: 'Debater', color: '#2ECC71' }
  if (cred >= 500) return { title: 'Thinker', color: '#F39C12' }
  if (cred >= 100) return { title: 'Skeptic', color: '#E67E22' }
  return { title: 'Novice', color: '#95A5A6' }
}

export default function Profile({
  userId,
  name,
  avatar,
  cred,
  topics,
  rivalCount = 0,
  followerCount = 0,
  followingCount = 0,
  isFollowing = false,
  onFollow,
}: ProfileProps) {
  const { title, color } = getCredTitle(cred)
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-full ring-2 ring-purple-200 shadow-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-purple-200 shadow-lg">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${color}20`, color: color }}
              >
                {title}
              </span>
            </div>
            <p className="text-sm text-gray-600">@{userId}</p>
          </div>
        </div>
        <button
          onClick={onFollow}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isFollowing
              ? 'bg-gray-100 text-gray-700 border border-gray-300'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-purple-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{rivalCount}</div>
          <div className="text-sm text-gray-600">Rivals</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Credibility (Cred)
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-purple-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min((cred / 5000) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xl font-bold text-gray-900">{cred.toLocaleString()}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Credibility earned from "Changed My Mind" votes
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Perspective Profile
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium border border-purple-300"
              >
                {topic}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-600">
              No topics yet. Start debating to build your profile!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

