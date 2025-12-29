'use client'

import { useState, useMemo } from 'react'
import { DualCardProps } from './types'
import Arena from '../Arena'
import ChallengerModal from '../ChallengerModal'

export default function DualCard({
  id,
  leftSide,
  rightSide,
  topic,
  leftVotes = 0,
  rightVotes = 0,
  neutralVotes = 0,
  onVote,
  onChangeMind,
  onChallenge,
  onShare,
  onBookmark,
  showArena = false,
  comments = [],
  onComment,
  className = '',
  isBookmarked = false,
}: DualCardProps) {
  const [localLeftVotes, setLocalLeftVotes] = useState(leftVotes)
  const [localRightVotes, setLocalRightVotes] = useState(rightVotes)
  const [localNeutralVotes, setLocalNeutralVotes] = useState(neutralVotes)
  const [userVote, setUserVote] = useState<'left' | 'right' | 'neutral' | null>(null)
  const [hasChangedMind, setHasChangedMind] = useState(false)
  const [showArenaSection, setShowArenaSection] = useState(false)
  const [challengerModal, setChallengerModal] = useState<{
    isOpen: boolean
    side: 'left' | 'right'
  }>({ isOpen: false, side: 'left' })
  const [hoveredBar, setHoveredBar] = useState(false)
  const [barPulse, setBarPulse] = useState(false)

  const totalVotes = localLeftVotes + localRightVotes + localNeutralVotes
  const leftPercentage = totalVotes > 0 ? (localLeftVotes / totalVotes) * 100 : 33.33
  const rightPercentage = totalVotes > 0 ? (localRightVotes / totalVotes) * 100 : 33.33
  const neutralPercentage = totalVotes > 0 ? (localNeutralVotes / totalVotes) * 100 : 33.34

  const isUnfinished = !leftSide || !rightSide

  const handleVote = (side: 'left' | 'right' | 'neutral') => {
    if (userVote === side) {
      // Undo vote
      if (side === 'left') {
        setLocalLeftVotes((prev) => Math.max(0, prev - 1))
      } else if (side === 'right') {
        setLocalRightVotes((prev) => Math.max(0, prev - 1))
      } else {
        setLocalNeutralVotes((prev) => Math.max(0, prev - 1))
      }
      setUserVote(null)
    } else {
      // Remove previous vote if exists
      if (userVote === 'left') {
        setLocalLeftVotes((prev) => Math.max(0, prev - 1))
      } else if (userVote === 'right') {
        setLocalRightVotes((prev) => Math.max(0, prev - 1))
      } else if (userVote === 'neutral') {
        setLocalNeutralVotes((prev) => Math.max(0, prev - 1))
      }

      // Add new vote
      if (side === 'left') {
        setLocalLeftVotes((prev) => prev + 1)
      } else if (side === 'right') {
        setLocalRightVotes((prev) => prev + 1)
      } else {
        setLocalNeutralVotes((prev) => prev + 1)
      }
      setUserVote(side)
    }

    // Trigger pulse animation
    setBarPulse(true)
    setTimeout(() => setBarPulse(false), 1000)

    onVote?.(side)
  }

  const handleChangeMind = (side: 'left' | 'right') => {
    if (!hasChangedMind && userVote && userVote !== side && userVote !== 'neutral') {
      setHasChangedMind(true)
      onChangeMind?.(side)
    }
  }

  const handleChallenge = (side: 'left' | 'right') => {
    setChallengerModal({ isOpen: true, side })
  }

  const handleChallengeSubmit = (content: string) => {
    onChallenge?.(challengerModal.side)
    // In real app, this would submit the challenge content
    console.log(`Challenging ${challengerModal.side} side with:`, content)
  }

  const getVoteBreakdown = () => {
    if (totalVotes === 0) return null
    const logicalLeft = Math.round((localLeftVotes / totalVotes) * 100 * 0.6)
    const logicalRight = Math.round((localRightVotes / totalVotes) * 100 * 0.6)
    const emotionalLeft = Math.round((localLeftVotes / totalVotes) * 100 * 0.4)
    const emotionalRight = Math.round((localRightVotes / totalVotes) * 100 * 0.4)

    return {
      left: { logical: logicalLeft, emotional: emotionalLeft },
      right: { logical: logicalRight, emotional: emotionalRight },
    }
  }

  const breakdown = getVoteBreakdown()

  return (
    <>
      <div
        className={`bg-[#1E211E] rounded-xl shadow-xl hover:shadow-2xl overflow-hidden border border-[#1E211E]/50 mb-6 transition-all duration-300 hover:border-[#1E211E]/70 hover:-translate-y-1 ${className}`}
      >
        {/* Status Indicator for Unfinished Posts */}
        {isUnfinished && (
          <div className="px-6 py-3 bg-gradient-to-r from-[#E67E22]/80 to-[#D35400] text-white text-center">
            <span className="inline-flex items-center gap-2 font-semibold text-sm animate-pulse">
              <span>⏳</span>
              <span>Waiting for Counter-Argument</span>
            </span>
          </div>
        )}

        {topic && (
          <div className="px-6 py-5 bg-gradient-to-r from-[#1E211E] to-[#1E211E]/90 border-b border-[#1E211E]/50 shadow-inner">
            <h3 className="text-xl font-bold text-[#F0F0F0] drop-shadow-sm">{topic}</h3>
          </div>
        )}

        {/* Split Screen Container */}
        <div className="flex flex-col md:flex-row min-h-[350px]">
          {/* Left Side */}
          <div
            className={`flex-1 p-8 border-r-0 md:border-r border-b md:border-b-0 border-[#1E211E]/50 relative group ${
              userVote === 'left'
                ? 'bg-gradient-to-br from-[#2ECC71]/15 to-[#2ECC71]/5 ring-2 ring-[#2ECC71] ring-opacity-50 shadow-lg shadow-[#2ECC71]/20'
                : 'bg-[#1E211E] hover:bg-[#1E211E]/95'
            } transition-all duration-300`}
          >
            {/* Subtle glow effect on hover */}
            {userVote !== 'left' && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2ECC71]/0 to-[#2ECC71]/0 group-hover:from-[#2ECC71]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
            )}
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-[#2ECC71] uppercase tracking-wide">
                    Left Side
                  </span>
                  {leftSide && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/profile/${leftSide.authorId}`}
                        className="flex items-center gap-1.5 text-xs text-[#F0F0F0]/70 hover:text-[#2ECC71] hover:underline transition-all duration-200 group/author"
                      >
                        {leftSide.avatar ? (
                          <img
                            src={leftSide.avatar}
                            alt={leftSide.author}
                            className="w-5 h-5 rounded-full ring-2 ring-[#2ECC71]/30 group-hover/author:ring-[#2ECC71] transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center text-white text-xs font-semibold ring-2 ring-[#2ECC71]/30 group-hover/author:ring-[#2ECC71] transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110">
                            {leftSide.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        @{leftSide.author}
                      </a>
                      <button
                        onClick={() => handleChallenge('left')}
                        className="p-1 hover:bg-[#2ECC71]/20 rounded transition-colors group"
                        title="Challenge this side"
                      >
                        <svg
                          className="w-4 h-4 text-[#2ECC71]/70 group-hover:text-[#27AE60] transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {leftSide && leftSide.changedMindCount !== undefined && leftSide.changedMindCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[#F0F0F0]/60 mb-2">
                    <span className="text-[#2ECC71]">💡</span>
                    <span>{leftSide.changedMindCount} changed their mind</span>
                  </div>
                )}
              </div>

              {leftSide ? (
                <>
                  <div className="flex-1 mb-4">
                    <p className="text-[#F0F0F0] leading-relaxed">
                      {leftSide.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      onClick={() => handleVote('left')}
                      className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        userVote === 'left'
                          ? 'bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white shadow-lg shadow-[#2ECC71]/30 hover:shadow-xl hover:shadow-[#2ECC71]/40'
                          : 'bg-[#2ECC71]/20 text-[#2ECC71] hover:bg-[#2ECC71]/30 border border-[#2ECC71]/30 shadow-md hover:shadow-lg hover:border-[#2ECC71]/50'
                      }`}
                    >
                      {userVote === 'left' ? '✓ Voted' : 'Vote Left'}
                    </button>
                    {userVote === 'right' && !hasChangedMind && (
                      <button
                        onClick={() => handleChangeMind('left')}
                        className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-900/40 text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-900/50 dark:hover:to-purple-900/60 transition-all shadow-sm hover:shadow-md"
                      >
                        Changed My Mind
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[#F0F0F0]/60 mb-2">
                      Waiting for Left Side...
                    </p>
                    <p className="text-sm text-[#F0F0F0]/50">
                      Be the first to post the left perspective
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div
            className={`flex-1 p-8 relative group ${
              userVote === 'right'
                ? 'bg-gradient-to-br from-[#E67E22]/15 to-[#E67E22]/5 ring-2 ring-[#E67E22] ring-opacity-50 shadow-lg shadow-[#E67E22]/20'
                : 'bg-[#1E211E] hover:bg-[#1E211E]/95'
            } transition-all duration-300`}
          >
            {/* Subtle glow effect on hover */}
            {userVote !== 'right' && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#E67E22]/0 to-[#E67E22]/0 group-hover:from-[#E67E22]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
            )}
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-[#E67E22] uppercase tracking-wide">
                    Right Side
                  </span>
                  {rightSide && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/profile/${rightSide.authorId}`}
                        className="flex items-center gap-1.5 text-xs text-[#F0F0F0]/70 hover:text-[#E67E22] hover:underline transition-all duration-200 group/author"
                      >
                        {rightSide.avatar ? (
                          <img
                            src={rightSide.avatar}
                            alt={rightSide.author}
                            className="w-5 h-5 rounded-full ring-2 ring-[#E67E22]/30 group-hover/author:ring-[#E67E22] transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E67E22] to-[#D35400] flex items-center justify-center text-white text-xs font-semibold ring-2 ring-[#E67E22]/30 group-hover/author:ring-[#E67E22] transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110">
                            {rightSide.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        @{rightSide.author}
                      </a>
                      <button
                        onClick={() => handleChallenge('right')}
                        className="p-1 hover:bg-[#E67E22]/20 rounded transition-colors group"
                        title="Challenge this side"
                      >
                        <svg
                          className="w-4 h-4 text-[#E67E22]/70 group-hover:text-[#D35400] transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {rightSide && rightSide.changedMindCount !== undefined && rightSide.changedMindCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[#F0F0F0]/60 mb-2">
                    <span className="text-[#E67E22]">💡</span>
                    <span>{rightSide.changedMindCount} changed their mind</span>
                  </div>
                )}
              </div>

              {rightSide ? (
                <>
                  <div className="flex-1 mb-4">
                    <p className="text-[#F0F0F0] leading-relaxed">
                      {rightSide.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      onClick={() => handleVote('right')}
                      className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        userVote === 'right'
                          ? 'bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white shadow-lg shadow-[#E67E22]/30 hover:shadow-xl hover:shadow-[#E67E22]/40'
                          : 'bg-[#E67E22]/20 text-[#E67E22] hover:bg-[#E67E22]/30 border border-[#E67E22]/30 shadow-md hover:shadow-lg hover:border-[#E67E22]/50'
                      }`}
                    >
                      {userVote === 'right' ? '✓ Voted' : 'Vote Right'}
                    </button>
                    {userVote === 'left' && !hasChangedMind && (
                      <button
                        onClick={() => handleChangeMind('right')}
                        className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-900/40 text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-900/50 dark:hover:to-purple-900/60 transition-all shadow-sm hover:shadow-md"
                      >
                        Changed My Mind
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[#F0F0F0]/60 mb-2">
                      Waiting for Right Side...
                    </p>
                    <p className="text-sm text-[#F0F0F0]/50">
                      Be the first to post the right perspective
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Leaning Bar */}
        <div className="px-6 py-4 bg-gradient-to-b from-[#1E211E]/90 to-[#1E211E]/80 border-t border-[#1E211E]/50 shadow-inner">
          <div
            className={`relative h-6 bg-[#1E211E]/60 rounded-full overflow-hidden cursor-pointer mb-2 shadow-inner ${
              barPulse ? 'ring-2 ring-[#2ECC71] ring-opacity-50' : ''
            } transition-all duration-300 hover:shadow-lg`}
            onMouseEnter={() => setHoveredBar(true)}
            onMouseLeave={() => setHoveredBar(false)}
          >
            {/* Left Side */}
            <div
              className={`absolute left-0 top-0 h-full bg-[#2ECC71] transition-all duration-500 ease-out flex items-center justify-start pl-2 ${
                barPulse ? 'animate-pulse' : ''
              }`}
              style={{ width: `${leftPercentage}%` }}
            >
              {leftPercentage > 15 && totalVotes > 0 && (
                <span className="text-xs font-semibold text-white drop-shadow">
                  {Math.round(leftPercentage)}%
                </span>
              )}
            </div>
            {/* Bridge (Neutral Zone) */}
            {neutralPercentage > 5 && (
              <div
                className="absolute top-0 h-full bg-[#F0F0F0]/30 transition-all duration-500 ease-out border-l-2 border-r-2 border-[#121412] flex items-center justify-center"
                style={{
                  left: `${leftPercentage}%`,
                  width: `${neutralPercentage}%`,
                }}
              >
                {neutralPercentage > 10 && totalVotes > 0 && (
                  <span className="text-xs font-semibold text-[#F0F0F0] drop-shadow">
                    {Math.round(neutralPercentage)}%
                  </span>
                )}
              </div>
            )}
            {/* Right Side */}
            <div
              className="absolute right-0 top-0 h-full bg-[#E67E22] transition-all duration-500 ease-out flex items-center justify-end pr-2"
              style={{ width: `${rightPercentage}%` }}
            >
              {rightPercentage > 15 && totalVotes > 0 && (
                <span className="text-xs font-semibold text-white drop-shadow">
                  {Math.round(rightPercentage)}%
                </span>
              )}
            </div>
            {/* Divider Lines */}
            {leftPercentage > 0 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-[#121412] shadow-lg z-10 transition-all duration-500 ease-out"
                style={{ left: `${leftPercentage}%` }}
              />
            )}
            {neutralPercentage > 0 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-[#121412] shadow-lg z-10 transition-all duration-500 ease-out"
                style={{ left: `${leftPercentage + neutralPercentage}%` }}
              />
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredBar && breakdown && totalVotes > 0 && (
            <div className="mt-2 p-3 bg-[#1E211E] rounded-lg border border-[#1E211E]/50 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-[#2ECC71] mb-1">
                    Left Side Breakdown
                  </p>
                  <p className="text-[#F0F0F0]/70">
                    {breakdown.left.logical}% find this more logical
                  </p>
                  <p className="text-[#F0F0F0]/70">
                    {breakdown.left.emotional}% find this more persuasive
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#E67E22] mb-1">
                    Right Side Breakdown
                  </p>
                  <p className="text-[#F0F0F0]/70">
                    {breakdown.right.logical}% find this more logical
                  </p>
                  <p className="text-[#F0F0F0]/70">
                    {breakdown.right.emotional}% find this more persuasive
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Neutral Vote Button - Subtle */}
          {totalVotes > 0 && (
            <div className="mt-2 flex items-center justify-center">
              <button
                onClick={() => handleVote('neutral')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  userVote === 'neutral'
                    ? 'bg-[#F0F0F0]/20 text-[#F0F0F0]'
                    : 'text-[#F0F0F0]/60 hover:text-[#F0F0F0]/80'
                }`}
              >
                {userVote === 'neutral' ? '✓ Both Have Merit' : 'Both Have Merit'}
              </button>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-gradient-to-b from-[#1E211E]/80 to-[#1E211E]/90 border-t border-[#1E211E]/50 flex items-center justify-between shadow-inner">
          {/* Left Side Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArenaSection(!showArenaSection)}
              className={`flex items-center gap-1.5 text-sm transition-all duration-200 px-2 py-1 rounded-lg ${
                showArenaSection
                  ? 'text-[#2ECC71] bg-[#2ECC71]/10 shadow-md'
                  : 'text-[#F0F0F0]/70 hover:text-[#F0F0F0] hover:bg-[#1E211E]/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{comments.length}</span>
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 text-sm text-[#F0F0F0]/70 hover:text-[#F0F0F0] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-[#1E211E]/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button
              onClick={onBookmark}
              className={`flex items-center gap-1.5 text-sm transition-all duration-200 px-2 py-1 rounded-lg ${
                isBookmarked
                  ? 'text-[#F39C12] bg-[#F39C12]/10 shadow-md'
                  : 'text-[#F0F0F0]/70 hover:text-[#F0F0F0] hover:bg-[#1E211E]/50'
              }`}
            >
              <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>

          {/* Right Side - Challenge Button */}
          <button
            onClick={() => {
              // Show challenge options
              if (leftSide && rightSide) {
                // If both sides exist, could show a menu, but for now just challenge left
                handleChallenge('left')
              }
            }}
            className="flex items-center gap-1.5 text-sm text-[#F0F0F0]/70 hover:text-[#F0F0F0] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-[#1E211E]/50 hover:shadow-md"
            title="Challenge this dual"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </button>
        </div>

        {/* Arena Section - Collapsible */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showArenaSection ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {showArenaSection && (
            <Arena
              comments={comments}
              onComment={onComment}
              onChallenge={handleChallenge}
              leftSideAuthor={leftSide?.author}
              rightSideAuthor={rightSide?.author}
            />
          )}
        </div>
      </div>

      {/* Challenger Modal */}
      <ChallengerModal
        isOpen={challengerModal.isOpen}
        onClose={() => setChallengerModal({ isOpen: false, side: 'left' })}
        side={challengerModal.side}
        currentAuthor={
          challengerModal.side === 'left' ? leftSide?.author || '' : rightSide?.author || ''
        }
        onSubmit={handleChallengeSubmit}
      />
    </>
  )
}
