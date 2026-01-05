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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Challenge {side === 'left' ? 'Side A' : 'Side B'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
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

          <div className="mb-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">
              Current {side === 'left' ? 'Side A' : 'Side B'} by{' '}
              <span className="font-semibold">{currentAuthor}</span>
            </p>
            <p className="text-xs text-gray-600">
              Write a better argument. If the community votes your challenge as higher quality, it
              will replace the current side.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Challenge (max 400 characters)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write your ${side === 'left' ? 'Side A' : 'Side B'} argument here...`}
              maxLength={400}
              rows={6}
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-sm ${
                  content.length > 380 ? 'text-purple-700' : 'text-gray-500'
                }`}
              >
                {content.length}/400
              </span>
              <span className="text-xs text-gray-500">
                Make it persuasive and concise
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > 400}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Submit Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

