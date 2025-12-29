# DUAL - Social Debate Web App

A responsive web application that breaks echo chambers by displaying every post as a split-screen narrative. Each "Dual-Card" consists of a Left Side and a Right Side, representing two opposing or different opinions on the same topic.

## Features

- **Split-UI**: 50/50 vertical layout for every post
- **Half-Post Loop**: Users can create a "Left Side" post that stays in "Pending" state until another user completes the "Right Side"
- **Leaning Bar**: Visual slider showing which side is winning based on community votes
- **Changed My Mind**: Button that rewards authors with "Persuasion Points" when users change their stance
- **Snackable Content**: Max 400 characters per side to maintain high engagement
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dual/
├── app/
│   ├── globals.css       # Global styles with Tailwind
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page with sample DualCards
├── components/
│   └── DualCard/
│       ├── DualCard.tsx  # Main DualCard component
│       ├── types.ts      # TypeScript types
│       └── index.ts      # Export file
└── package.json
```

## DualCard Component

The `DualCard` component is a reusable component that displays:

- **Split-screen layout**: Left and Right sides in a 50/50 layout
- **Voting system**: Users can vote for either side
- **Leaning bar**: Visual indicator showing vote distribution
- **Changed My Mind button**: Appears when user has voted for one side but wants to switch
- **Pending states**: Handles cases where one or both sides are missing

### Usage

```tsx
import DualCard from '@/components/DualCard'

<DualCard
  id="dual-1"
  leftSide={leftSideData}
  rightSide={rightSideData}
  topic="Your Topic Here"
  leftVotes={42}
  rightVotes={38}
  onVote={(side) => console.log(`Voted ${side}`)}
  onChangeMind={(side) => console.log(`Changed mind to ${side}`)}
/>
```

## Next Steps

- [ ] Integrate Supabase for database operations
- [ ] Add user authentication
- [ ] Implement real-time voting updates
- [ ] Add "Challenge" system for replacing sides
- [ ] Create post creation interface
- [ ] Add character counter (400 char limit)
- [ ] Implement Persuasion Points system

