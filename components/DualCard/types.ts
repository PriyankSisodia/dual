export interface DualSide {
  id: string
  content: string
  author: string
  authorId: string
  avatar?: string
  votes: number
  persuasionPoints: number
  changedMindCount?: number
  createdAt: Date | string
  challengeCount?: number
  commentCount?: number
}

export interface Comment {
  id: string
  content: string
  author: string
  authorId: string
  avatar?: string
  side: 'left' | 'right' | 'neutral'
  createdAt: Date | string
  likes: number
}

export interface DualCardProps {
  id: string
  leftSide: DualSide | null
  rightSide: DualSide | null
  topic?: string
  leftVotes?: number
  rightVotes?: number
  neutralVotes?: number
  onVote?: (side: 'left' | 'right' | 'neutral') => void
  onChangeMind?: (side: 'left' | 'right') => void
  onChallenge?: (side: 'left' | 'right') => void
  onShare?: () => void
  onBookmark?: () => void
  showArena?: boolean
  comments?: Comment[]
  onComment?: (side: 'left' | 'right' | 'neutral', content: string) => void
  className?: string
  isBookmarked?: boolean
  recentActivity?: string[]
}
