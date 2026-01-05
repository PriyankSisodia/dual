'use client'

import { useState } from 'react'

interface CreateDualModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (topic: string, leftContent: string) => void
}

export default function CreateDualModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateDualModalProps) {
  const [topic, setTopic] = useState('')
  const [leftContent, setLeftContent] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (topic.trim() && leftContent.trim() && leftContent.length <= 400) {
      onSubmit(topic, leftContent)
      setTopic('')
      setLeftContent('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Start a Dual</h2>
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Topic / Question
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Remote Work vs. In-Office Work"
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Side A Argument (max 400 characters)
            </label>
            <textarea
              value={leftContent}
              onChange={(e) => setLeftContent(e.target.value)}
              placeholder="Write your Side A perspective here..."
              maxLength={400}
              rows={6}
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-sm ${
                  leftContent.length > 380 ? 'text-purple-700' : 'text-gray-500'
                }`}
              >
                {leftContent.length}/400
              </span>
              <span className="text-xs text-gray-500">
                Someone else will complete Side B
              </span>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Your post will appear in the "Unfinished" tab. The community
              will complete it by adding the Side B perspective.
            </p>
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
              disabled={!topic.trim() || !leftContent.trim() || leftContent.length > 400}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Create Dual
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

