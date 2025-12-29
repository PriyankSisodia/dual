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
      <div className="bg-[#1E211E] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#1E211E]/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#F0F0F0]">Start a Dual</h2>
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Topic / Question
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Remote Work vs. In-Office Work"
              className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] text-[#F0F0F0]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Your Left Side Argument (max 400 characters)
            </label>
            <textarea
              value={leftContent}
              onChange={(e) => setLeftContent(e.target.value)}
              placeholder="Write your left side perspective here..."
              maxLength={400}
              rows={6}
              className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] text-[#F0F0F0] resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-sm ${
                  leftContent.length > 380 ? 'text-[#E67E22]' : 'text-[#F0F0F0]/60'
                }`}
              >
                {leftContent.length}/400
              </span>
              <span className="text-xs text-[#F0F0F0]/60">
                Someone else will complete the Right Side
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#121412] rounded-lg mb-4">
            <p className="text-sm text-[#F0F0F0]/80">
              💡 <strong>Tip:</strong> Your post will appear in the "Unfinished" tab. The community
              will complete it by adding the Right Side perspective.
            </p>
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
              disabled={!topic.trim() || !leftContent.trim() || leftContent.length > 400}
              className="flex-1 px-4 py-2 bg-[#2ECC71] hover:bg-[#27AE60] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Create Dual
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

