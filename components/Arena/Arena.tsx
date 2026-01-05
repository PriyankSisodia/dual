'use client'

import { useState } from 'react'
import { Comment } from '../DualCard/types'

interface ArenaProps {
  comments?: Comment[]
  onComment?: (side: 'left' | 'right' | 'neutral', content: string) => void
  onChallenge?: (side: 'left' | 'right') => void
  leftSideAuthor?: string
  rightSideAuthor?: string
}

export default function Arena({
  comments = [],
  onComment,
  onChallenge,
  leftSideAuthor,
  rightSideAuthor,
}: ArenaProps) {
  const [showCommentForm, setShowCommentForm] = useState<'left' | 'right' | 'neutral' | null>(null)
  const [commentContent, setCommentContent] = useState('')

  const leftComments = comments.filter((c) => c.side === 'left').sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const rightComments = comments.filter((c) => c.side === 'right').sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleSubmitComment = (side: 'left' | 'right' | 'neutral') => {
    if (commentContent.trim() && commentContent.length <= 400) {
      onComment?.(side, commentContent)
      setCommentContent('')
      setShowCommentForm(null)
    }
  }

  return (
    <div className="border-t border-purple-200 bg-gradient-to-b from-purple-50 to-white backdrop-blur-sm">
      {/* Split Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-purple-200">
        {/* Left Comments */}
        <div className="p-4">
          <div className="flex items-center justify-end mb-3">
            <button
              onClick={() => setShowCommentForm(showCommentForm === 'left' ? null : 'left')}
              className="text-xs px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all duration-200 border border-purple-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
            >
              + Comment
            </button>
          </div>

          {showCommentForm === 'left' && (
            <div className="mb-3 p-3 bg-white rounded-lg border border-purple-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Support Side A..."
                maxLength={400}
                rows={2}
                className="w-full px-2 py-1.5 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs text-gray-900 resize-none transition-all duration-200 shadow-inner"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-500">
                  {commentContent.length}/400
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCommentForm(null)
                      setCommentContent('')
                    }}
                    className="text-[10px] px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-purple-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitComment('left')}
                    className="text-[10px] px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-medium"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Left Comments */}
          <div 
            className="max-h-[400px] overflow-y-auto pr-2 space-y-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(139, 92, 246, 0.5) transparent'
            }}
          >
            {leftComments.length > 0 ? (
              leftComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-2.5 bg-white rounded-lg border-l-[3px] border-purple-300 border border-purple-200 shadow-md hover:shadow-lg hover:border-purple-400 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {comment.avatar ? (
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-5 h-5 rounded-full ring-1 ring-purple-300 transition-all duration-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold ring-1 ring-purple-300 transition-all duration-200 shadow-sm">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
                        {comment.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-1.5">{comment.content}</p>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] px-1.5 py-0.5 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded transition-all duration-200 flex items-center gap-1">
                      <span>👍</span>
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">
                No comments yet. Be the first!
              </p>
            )}
          </div>
        </div>

        {/* Right Comments */}
        <div className="p-4">
          <div className="flex items-center justify-end mb-3">
            <button
              onClick={() => setShowCommentForm(showCommentForm === 'right' ? null : 'right')}
              className="text-xs px-3 py-1.5 bg-[#E67E22]/20 text-[#E67E22] rounded-full hover:bg-[#E67E22]/30 transition-all duration-200 border border-[#E67E22]/30 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
            >
              + Comment
            </button>
          </div>

          {showCommentForm === 'right' && (
            <div className="mb-3 p-3 bg-white rounded-lg border border-purple-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Support Side B..."
                maxLength={400}
                rows={2}
                className="w-full px-2 py-1.5 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs text-gray-900 resize-none transition-all duration-200 shadow-inner"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-500">
                  {commentContent.length}/400
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCommentForm(null)
                      setCommentContent('')
                    }}
                    className="text-[10px] px-2 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-purple-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitComment('right')}
                    className="text-[10px] px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-medium"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Right Comments */}
          <div 
            className="max-h-[400px] overflow-y-auto pr-2 space-y-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(139, 92, 246, 0.5) transparent'
            }}
          >
            {rightComments.length > 0 ? (
              rightComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-2.5 bg-white rounded-lg border-l-[3px] border-purple-300 border border-purple-200 shadow-md hover:shadow-lg hover:border-purple-400 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {comment.avatar ? (
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-5 h-5 rounded-full ring-1 ring-purple-300 transition-all duration-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold ring-1 ring-purple-300 transition-all duration-200 shadow-sm">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
                        {comment.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-1.5">{comment.content}</p>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] px-1.5 py-0.5 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded transition-all duration-200 flex items-center gap-1">
                      <span>👍</span>
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">
                No comments yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
