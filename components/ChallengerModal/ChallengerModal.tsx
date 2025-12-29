'use client'

import { useState } from 'react'

interface ChallengerModalProps {
  isOpen: boolean
  onClose: () => void
  side: 'left' | 'right'
  currentAuthor: string
  onSubmit: (content: string) => void
}

export default function ChallengerModal({
  isOpen,
  onClose,
  side,
  currentAuthor,
  onSubmit,
}: ChallengerModalProps) {
  const [content, setContent] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (content.trim() && content.length <= 400) {
      onSubmit(content)
      setContent('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-[#1E211E] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#F0F0F0]">
              Challenge {side === 'left' ? 'Left' : 'Right'} Side
            </h2>
            <button
              onClick={onClose}
              className="text-[#F0F0F0]/60 hover:text-[#F0F0F0]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-4 bg-[#121412] rounded-lg">
            <p className="text-sm text-[#F0F0F0]/80 mb-1">
              Current {side === 'left' ? 'Left' : 'Right'} Side by{' '}
              <span className="font-semibold">{currentAuthor}</span>
            </p>
            <p className="text-xs text-[#F0F0F0]/60">
              Write a better argument. If the community votes your challenge as higher quality, it
              will replace the current side.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Your Challenge (max 400 characters)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write your ${side === 'left' ? 'left' : 'right'} side argument here...`}
              maxLength={400}
              rows={6}
              className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] text-[#F0F0F0] resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-sm ${
                  content.length > 380 ? 'text-[#E67E22]' : 'text-[#F0F0F0]/60'
                }`}
              >
                {content.length}/400
              </span>
              <span className="text-xs text-[#F0F0F0]/60">
                Make it persuasive and concise
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#1E211E]/60 text-[#F0F0F0] rounded-lg hover:bg-[#1E211E]/80 transition-colors font-medium border border-[#1E211E]/50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > 400}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                side === 'left'
                  ? 'bg-[#2ECC71] hover:bg-[#27AE60] text-white'
                  : 'bg-[#E67E22] hover:bg-[#D35400] text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
            >
              Submit Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

