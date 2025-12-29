# DUAL Supabase Setup Guide - Step by Step

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (gear icon in the left sidebar)
4. Click on **API** in the settings menu
5. You'll see:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 2: Create Environment File

1. In your project root, create a file named `.env.local`
2. Add these lines (replace with your actual values):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

## Step 3: Run the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase/schema.sql` from your project
4. Copy the **entire contents** of the file
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for it to complete - you should see "Success. No rows returned"

**Note:** If you get any errors about circular dependencies, don't worry - the schema handles this. Just make sure all tables are created.

## Step 4: Enable Real-time Replication

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find these tables and toggle them ON:
   - ✅ `votes`
   - ✅ `comments`
   - ✅ `activities`
   - ✅ `challenges`
   - ✅ `duals` (optional, for live updates)

## Step 5: Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (it's usually enabled by default)
3. Optionally configure other providers (Google, GitHub, etc.)

## Step 6: Install Dependencies

Run in your terminal:

```bash
npm install
```

This will install:
- `@supabase/supabase-js`
- `@supabase/ssr`

## Step 7: Test the Connection

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Check the browser console for any Supabase connection errors

## Step 8: Create a Test Profile (Optional)

After a user signs up, you'll need to create a profile. You can do this manually in the SQL Editor:

```sql
-- This will be done automatically via a trigger, but you can test with:
INSERT INTO public.profiles (id, username, full_name)
VALUES (
  'your-user-id-from-auth-users',
  'testuser',
  'Test User'
);
```

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Check that variable names start with `NEXT_PUBLIC_`
- Restart your dev server after adding env variables

### "relation does not exist" errors
- Make sure you ran the schema.sql file completely
- Check that all tables were created in the Database → Tables section

### Real-time not working
- Make sure replication is enabled for the tables
- Check that you're using the correct Supabase client

### RLS (Row Level Security) blocking queries
- The schema includes RLS policies
- Make sure you're authenticated when testing protected routes
- Check the policies in Database → Tables → [table] → Policies

## Next Steps

Once everything is set up:
1. Update your components to use the API routes
2. Add authentication flows
3. Test creating a dual, voting, commenting
4. Check real-time updates are working

