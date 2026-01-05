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
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden border border-purple-100 mb-6 transition-all duration-300 hover:border-purple-300 hover:-translate-y-1 ${className}`}
      >
        {/* Status Indicator for Unfinished Posts */}
        {isUnfinished && (
          <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center">
            <span className="inline-flex items-center gap-2 font-semibold text-sm animate-pulse">
              <span>⏳</span>
              <span>Waiting for Counter-Argument</span>
            </span>
          </div>
        )}

        {topic && (
          <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 shadow-inner">
            <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">{topic}</h3>
          </div>
        )}

        {/* Split Screen Container */}
        <div className="flex flex-col md:flex-row min-h-[350px]">
          {/* Left Side */}
          <div
            className={`flex-1 p-8 border-r-0 md:border-r border-b md:border-b-0 border-purple-200 relative group ${
              userVote === 'left'
                ? 'bg-gradient-to-br from-purple-50 to-purple-100 ring-2 ring-purple-400 ring-opacity-50 shadow-lg shadow-purple-200'
                : 'bg-white hover:bg-purple-50'
            } transition-all duration-300`}
          >
            {/* Subtle glow effect on hover */}
            {userVote !== 'left' && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-50/0 group-hover:from-purple-50 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
            )}
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-purple-600 uppercase tracking-wide">
                    Side A
                  </span>
                  {leftSide && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleChallenge('left')}
                        className="p-1 hover:bg-purple-100 rounded transition-colors group"
                        title="Challenge this side"
                      >
                        <svg
                          className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors"
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
                      <a
                        href={`/profile/${leftSide.authorId}`}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-purple-600 hover:underline transition-all duration-200 group/author relative"
                        title={leftSide.authorTitle && leftSide.authorCred !== undefined 
                          ? `${leftSide.authorTitle} • ${leftSide.authorCred} cred`
                          : leftSide.authorCred !== undefined 
                          ? `${leftSide.authorCred} cred`
                          : ''}
                      >
                        {leftSide.avatar ? (
                          <img
                            src={leftSide.avatar}
                            alt={leftSide.author}
                            className="w-5 h-5 rounded-full ring-2 ring-purple-300 group-hover/author:ring-purple-500 transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-purple-300 group-hover/author:ring-purple-500 transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110">
                            {leftSide.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>@{leftSide.author}</span>
                        
                        {/* Hover tooltip showing title and cred */}
                        {leftSide.authorTitle && leftSide.authorCred !== undefined && (
                          <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-white border border-purple-300 rounded-lg shadow-xl opacity-0 invisible group-hover/author:opacity-100 group-hover/author:visible transition-all duration-200 z-50 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span 
                                className="font-semibold text-sm"
                                style={{ 
                                  color: leftSide.authorCred >= 5000 ? '#9B59B6' :
                                         leftSide.authorCred >= 2500 ? '#3498DB' :
                                         leftSide.authorCred >= 1000 ? '#2ECC71' :
                                         leftSide.authorCred >= 500 ? '#F39C12' :
                                         leftSide.authorCred >= 100 ? '#E67E22' : '#95A5A6'
                                }}
                              >
                                {leftSide.authorTitle}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-700">
                                {leftSide.authorCred} cred
                              </span>
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-r border-t border-purple-300 rotate-45"></div>
                          </div>
                        )}
                      </a>
                    </div>
                  )}
                </div>
                {leftSide && leftSide.changedMindCount !== undefined && leftSide.changedMindCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <span className="text-purple-600">💡</span>
                    <span>{leftSide.changedMindCount} changed their mind</span>
                  </div>
                )}
              </div>

              {leftSide ? (
                <>
                  <div className="flex-1 mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {leftSide.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    {/* Small Cred Button */}
                    {leftSide.authorCred !== undefined && (
                      <button
                        onClick={() => handleVote('left')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          userVote === 'left'
                            ? 'bg-purple-100 text-purple-600 border border-purple-300 shadow-sm'
                            : 'bg-purple-50 text-gray-600 hover:bg-purple-100 border border-purple-200'
                        }`}
                        title="Vote for this side"
                      >
                        <svg
                          className={`w-3.5 h-3.5 ${userVote === 'left' ? 'text-purple-600' : 'text-gray-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className={userVote === 'left' ? 'text-purple-600 font-semibold' : 'text-gray-700'}>
                          {leftSide.authorCred}
                        </span>
                      </button>
                    )}
                    {userVote === 'right' && !hasChangedMind && (
                      <button
                        onClick={() => handleChangeMind('left')}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-900/30 to-purple-900/40 text-purple-300 hover:from-purple-900/50 hover:to-purple-900/60 transition-all shadow-sm hover:shadow-md"
                      >
                        Changed My Mind
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">
                      Waiting for Side A...
                    </p>
                    <p className="text-sm text-gray-500">
                      Be the first to post the left perspective
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side B */}
          <div
            className={`flex-1 p-8 relative group ${
              userVote === 'right'
                ? 'bg-gradient-to-br from-purple-50 to-purple-100 ring-2 ring-purple-400 ring-opacity-50 shadow-lg shadow-purple-200'
                : 'bg-white hover:bg-purple-50'
            } transition-all duration-300`}
          >
            {/* Subtle glow effect on hover */}
            {userVote !== 'right' && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-50/0 group-hover:from-purple-50 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
            )}
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  {rightSide && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/profile/${rightSide.authorId}`}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-purple-600 hover:underline transition-all duration-200 group/author relative"
                        title={rightSide.authorTitle && rightSide.authorCred !== undefined 
                          ? `${rightSide.authorTitle} • ${rightSide.authorCred} cred`
                          : rightSide.authorCred !== undefined 
                          ? `${rightSide.authorCred} cred`
                          : ''}
                      >
                        {rightSide.avatar ? (
                          <img
                            src={rightSide.avatar}
                            alt={rightSide.author}
                            className="w-5 h-5 rounded-full ring-2 ring-purple-300 group-hover/author:ring-purple-500 transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-purple-300 group-hover/author:ring-purple-500 transition-all duration-200 shadow-md group-hover/author:shadow-lg group-hover/author:scale-110">
                            {rightSide.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>@{rightSide.author}</span>
                        
                        {/* Hover tooltip showing title and cred */}
                        {rightSide.authorTitle && rightSide.authorCred !== undefined && (
                          <div className="absolute left-0 top-full mt-2 px-3 py-2 bg-white border border-purple-300 rounded-lg shadow-xl opacity-0 invisible group-hover/author:opacity-100 group-hover/author:visible transition-all duration-200 z-50 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span 
                                className="font-semibold text-sm"
                                style={{ 
                                  color: rightSide.authorCred >= 5000 ? '#7C3AED' :
                                         rightSide.authorCred >= 2500 ? '#8B5CF6' :
                                         rightSide.authorCred >= 1000 ? '#9333EA' :
                                         rightSide.authorCred >= 500 ? '#A855F7' :
                                         rightSide.authorCred >= 100 ? '#C084FC' : '#D8B4FE'
                                }}
                              >
                                {rightSide.authorTitle}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-700">
                                {rightSide.authorCred} cred
                              </span>
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-l border-t border-purple-300 rotate-45"></div>
                          </div>
                        )}
                      </a>
                      <button
                        onClick={() => handleChallenge('right')}
                        className="p-1 hover:bg-purple-100 rounded transition-colors group"
                        title="Challenge this side"
                      >
                        <svg
                          className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors"
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
                  <span className="text-base font-bold text-purple-600 uppercase tracking-wide">
                    Side B
                  </span>
                </div>
                {rightSide && rightSide.changedMindCount !== undefined && rightSide.changedMindCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <span className="text-purple-600">💡</span>
                    <span>{rightSide.changedMindCount} changed their mind</span>
                  </div>
                )}
              </div>

              {rightSide ? (
                <>
                  <div className="flex-1 mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {rightSide.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    {/* Small Cred Button */}
                    {rightSide.authorCred !== undefined && (
                      <button
                        onClick={() => handleVote('right')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          userVote === 'right'
                            ? 'bg-purple-100 text-purple-600 border border-purple-300 shadow-sm'
                            : 'bg-purple-50 text-gray-600 hover:bg-purple-100 border border-purple-200'
                        }`}
                        title="Vote for this side"
                      >
                        <svg
                          className={`w-3.5 h-3.5 ${userVote === 'right' ? 'text-purple-600' : 'text-gray-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className={userVote === 'right' ? 'text-purple-600 font-semibold' : 'text-gray-700'}>
                          {rightSide.authorCred}
                        </span>
                      </button>
                    )}
                    {userVote === 'left' && !hasChangedMind && (
                      <button
                        onClick={() => handleChangeMind('right')}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-900/30 to-purple-900/40 text-purple-300 hover:from-purple-900/50 hover:to-purple-900/60 transition-all shadow-sm hover:shadow-md"
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
                      Waiting for Side B...
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
        <div className="px-6 py-4 bg-gradient-to-b from-purple-50 to-white border-t border-purple-200 shadow-inner">
          {/* Percentage Display Above Bar */}
          {totalVotes > 0 && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-semibold text-purple-600">
                {Math.round(leftPercentage)}%
              </span>
              <span className="text-xs text-gray-600">
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </span>
              <span className="text-sm font-semibold text-purple-600">
                {Math.round(rightPercentage)}%
              </span>
            </div>
          )}
          <div
            className={`relative h-6 bg-purple-100 rounded-full overflow-hidden cursor-pointer mb-2 shadow-inner ${
              barPulse ? 'ring-2 ring-purple-400 ring-opacity-50' : ''
            } transition-all duration-300 hover:shadow-lg`}
            onMouseEnter={() => setHoveredBar(true)}
            onMouseLeave={() => setHoveredBar(false)}
          >
            {/* Left Side */}
            <div
              className={`absolute left-0 top-0 h-full bg-purple-500 transition-all duration-500 ease-out ${
                barPulse ? 'animate-pulse' : ''
              }`}
              style={{ width: `${leftPercentage}%` }}
            />
            {/* Bridge (Neutral Zone) */}
            {neutralPercentage > 5 && (
              <div
                className="absolute top-0 h-full bg-purple-200 transition-all duration-500 ease-out border-l-2 border-r-2 border-purple-300"
                style={{
                  left: `${leftPercentage}%`,
                  width: `${neutralPercentage}%`,
                }}
              />
            )}
            {/* Side B */}
            <div
              className="absolute right-0 top-0 h-full bg-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${rightPercentage}%` }}
            />
            {/* Divider Lines */}
            {leftPercentage > 0 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-white shadow-lg z-10 transition-all duration-500 ease-out"
                style={{ left: `${leftPercentage}%` }}
              />
            )}
            {neutralPercentage > 0 && (
              <div
                className="absolute top-0 h-full w-0.5 bg-white shadow-lg z-10 transition-all duration-500 ease-out"
                style={{ left: `${leftPercentage + neutralPercentage}%` }}
              />
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredBar && breakdown && totalVotes > 0 && (
            <div className="mt-2 p-3 bg-white rounded-lg border border-purple-200 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-purple-600 mb-1">
                    Side A Breakdown
                  </p>
                  <p className="text-gray-600">
                    {breakdown.left.logical}% find this more logical
                  </p>
                  <p className="text-gray-600">
                    {breakdown.left.emotional}% find this more persuasive
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-purple-600 mb-1">
                    Side B Breakdown
                  </p>
                  <p className="text-gray-600">
                    {breakdown.right.logical}% find this more logical
                  </p>
                  <p className="text-gray-600">
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
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {userVote === 'neutral' ? '✓ Both Have Merit' : 'Both Have Merit'}
              </button>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-gradient-to-b from-purple-50 to-white border-t border-purple-200 flex items-center justify-between shadow-inner">
          {/* Side A Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArenaSection(!showArenaSection)}
              className={`flex items-center gap-1.5 text-sm transition-all duration-200 px-2 py-1 rounded-lg ${
                showArenaSection
                  ? 'text-purple-600 bg-purple-100 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-purple-50'
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
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-purple-50"
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
                  ? 'text-purple-600 bg-purple-100 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-purple-50'
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

          {/* Side B - Challenge Button */}
          <button
            onClick={() => {
              // Show challenge options
              if (leftSide && rightSide) {
                // If both sides exist, could show a menu, but for now just challenge left
                handleChallenge('left')
              }
            }}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-purple-50 hover:shadow-md"
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
