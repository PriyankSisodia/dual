# DUAL Backend Setup Guide

This guide will help you set up the Supabase backend for the DUAL application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and anon key from Settings > API

## Step 2: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 3: Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script
5. This will create all tables, indexes, triggers, and RLS policies

## Step 4: Set Up Authentication

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Email provider (or other providers you want to use)
3. Configure email templates if needed

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Test the Backend

The API routes are now available at:
- `GET /api/duals` - Get all duals
- `POST /api/duals` - Create a new dual
- `GET /api/duals/[id]` - Get a single dual
- `POST /api/votes` - Create/update a vote
- `DELETE /api/votes` - Remove a vote
- `GET /api/comments?dualId=xxx` - Get comments
- `POST /api/comments` - Create a comment
- `POST /api/challenges` - Create a challenge
- `POST /api/sides` - Complete a dual by adding a side

## Database Schema Overview

### Main Tables

- **profiles** - User profiles (extends auth.users)
- **duals** - Main debate posts
- **sides** - Left/right arguments
- **votes** - User votes on duals
- **challenges** - Challenges to existing sides
- **comments** - Comments on duals
- **notifications** - User notifications
- **activities** - Real-time activity feed
- **bookmarks** - User bookmarks
- **follows** - User follow relationships

### Key Features

- **Row Level Security (RLS)** - All tables have RLS enabled
- **Automatic Triggers** - Vote counts, comment counts, etc. update automatically
- **Full-text Search** - Search duals and sides by content
- **Real-time Subscriptions** - Use Supabase Realtime for live updates

## Real-time Setup

To enable real-time updates:

1. In Supabase dashboard, go to Database > Replication
2. Enable replication for tables you want to subscribe to:
   - `votes`
   - `comments`
   - `activities`
   - `challenges`

## Using the Backend in Components

### Example: Fetching Duals

```typescript
const response = await fetch('/api/duals?sort=trending&limit=10')
const { data, error } = await response.json()
```

### Example: Creating a Vote

```typescript
const response = await fetch('/api/votes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dualId: 'xxx',
    sideId: 'yyy',
    voteType: 'left',
    changedMind: false
  })
})
```

### Example: Real-time Subscriptions

```typescript
import { useRealtimeDual } from '@/lib/hooks/useRealtime'

const { votes } = useRealtimeDual(dualId)
```

## Next Steps

1. Update your components to use the API routes instead of mock data
2. Add authentication flows
3. Set up real-time subscriptions for live updates
4. Add error handling and loading states
5. Implement pagination for large datasets

## Troubleshooting

- **RLS Errors**: Make sure you're authenticated and policies are set correctly
- **Connection Issues**: Verify your environment variables are correct
- **Real-time Not Working**: Check that replication is enabled for the tables

