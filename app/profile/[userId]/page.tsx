'use client'

import { use } from 'react'
import Profile from '@/components/Profile'
import DualCard from '@/components/DualCard'
import Header from '@/components/Header'

// Sample user data - in real app, fetch from API
const getUserData = (userId: string) => {
  const users: Record<string, any> = {
    'user-1': {
      name: 'Sarah Chen',
      persuasionScore: 450,
      topics: ['Technology', 'Remote Work', 'Productivity'],
      followerCount: 1234,
      followingCount: 567,
      rivalCount: 12,
    },
    'user-2': {
      name: 'Michael Torres',
      persuasionScore: 320,
      topics: ['Business', 'Team Culture', 'Collaboration'],
      followerCount: 890,
      followingCount: 234,
      rivalCount: 8,
    },
  }

  return users[userId] || {
    name: 'Unknown User',
    persuasionScore: 0,
    topics: [],
    followerCount: 0,
    followingCount: 0,
    rivalCount: 0,
  }
}

// Sample user's dual cards
const getUserDualCards = (userId: string) => {
  if (userId === 'user-1') {
    return [
      {
        id: 'user-dual-1',
        leftSide: {
          id: 'left-1',
          content: 'Remote work increases productivity by eliminating commute time and allowing employees to work in their optimal environment.',
          author: 'Sarah Chen',
          authorId: 'user-1',
          votes: 42,
          persuasionPoints: 150,
          createdAt: new Date(),
        },
        rightSide: {
          id: 'right-1',
          content: 'In-office collaboration fosters innovation through spontaneous interactions.',
          author: 'Michael Torres',
          authorId: 'user-2',
          votes: 38,
          persuasionPoints: 120,
          createdAt: new Date(),
        },
        topic: 'Remote Work vs. In-Office Work',
      },
    ]
  }
  return []
}

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const userData = getUserData(userId)
  const userDualCards = getUserDualCards(userId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header onSearch={() => {}} />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Profile
          userId={userId}
          name={userData.name}
          persuasionScore={userData.persuasionScore}
          topics={userData.topics}
          followerCount={userData.followerCount}
          followingCount={userData.followingCount}
          rivalCount={userData.rivalCount}
          isFollowing={false}
          onFollow={() => console.log('Follow clicked')}
        />

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Debates
          </h2>
          <div className="space-y-8">
            {userDualCards.length > 0 ? (
              userDualCards.map((card) => (
                <DualCard
                  key={card.id}
                  id={card.id}
                  leftSide={card.leftSide}
                  rightSide={card.rightSide}
                  topic={card.topic}
                  leftVotes={card.leftSide.votes}
                  rightVotes={card.rightSide.votes}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No debates yet. Start your first debate!
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

