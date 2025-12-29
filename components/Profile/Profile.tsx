'use client'

interface ProfileProps {
  userId: string
  name: string
  avatar?: string
  persuasionScore: number
  topics: string[]
  rivalCount?: number
  followerCount?: number
  followingCount?: number
  isFollowing?: boolean
  onFollow?: () => void
}

export default function Profile({
  userId,
  name,
  avatar,
  persuasionScore,
  topics,
  rivalCount = 0,
  followerCount = 0,
  followingCount = 0,
  isFollowing = false,
  onFollow,
}: ProfileProps) {
  return (
    <div className="bg-[#1E211E] rounded-xl shadow-lg border border-[#1E211E]/50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#E67E22] flex items-center justify-center text-white text-2xl font-bold">
            {avatar || name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F0F0F0]">{name}</h2>
            <p className="text-sm text-[#F0F0F0]/70">@{userId}</p>
          </div>
        </div>
        <button
          onClick={onFollow}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isFollowing
              ? 'bg-[#1E211E]/60 text-[#F0F0F0]/80 border border-[#1E211E]/50'
              : 'bg-[#2ECC71] text-white hover:bg-[#27AE60]'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-[#1E211E]/50">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F0F0F0]">{followerCount}</div>
          <div className="text-sm text-[#F0F0F0]/70">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F0F0F0]">{followingCount}</div>
          <div className="text-sm text-[#F0F0F0]/70">Following</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F0F0F0]">{rivalCount}</div>
          <div className="text-sm text-[#F0F0F0]/70">Rivals</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#F0F0F0] mb-3">
          Persuasion Score
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-[#121412] rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2ECC71] to-[#E67E22] transition-all duration-500"
              style={{ width: `${Math.min((persuasionScore / 1000) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xl font-bold text-[#F0F0F0]">{persuasionScore}</span>
        </div>
        <p className="text-sm text-[#F0F0F0]/70 mt-2">
          Points earned from "Changed My Mind" votes
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#F0F0F0] mb-3">
          Perspective Profile
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#2ECC71]/20 text-[#2ECC71] rounded-full text-sm font-medium border border-[#2ECC71]/30"
              >
                {topic}
              </span>
            ))
          ) : (
            <p className="text-sm text-[#F0F0F0]/70">
              No topics yet. Start debating to build your profile!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

