# 🚀 Quick Start - Connect Your Supabase Project

## Step 1: Get Your Supabase Credentials (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Click **Settings** (⚙️ icon) → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 2: Create Environment File (1 minute)

Run this command in your terminal (from the project root):

```bash
cp env.example .env.local
```

Then open `.env.local` and replace the placeholder values:

```bash
# Open the file
open .env.local  # On Mac
# or
code .env.local  # VS Code
# or edit manually
```

Paste your actual values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Step 3: Run Database Schema (3 minutes)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query** button
3. Open `supabase/schema.sql` from your project folder
4. **Copy the entire file content** (Cmd+A, Cmd+C)
5. **Paste into SQL Editor** (Cmd+V)
6. Click **Run** button (or press Cmd+Enter)
7. Wait for "Success" message ✅

## Step 4: Enable Real-time (1 minute)

1. In Supabase dashboard, go to **Database** → **Replication**
2. Toggle ON for these tables:
   - ✅ `votes`
   - ✅ `comments` 
   - ✅ `activities`
   - ✅ `challenges`

## Step 5: Install Dependencies (1 minute)

```bash
npm install
```

## Step 6: Test It! (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 - you should see your app!

## ✅ Verification Checklist

- [ ] `.env.local` file created with real values
- [ ] Database schema ran successfully (check Database → Tables)
- [ ] Real-time replication enabled
- [ ] `npm install` completed
- [ ] Dev server starts without errors

## 🆘 Having Issues?

**"Missing environment variables" error:**
- Make sure `.env.local` is in the project root (same folder as `package.json`)
- Restart your dev server after creating `.env.local`

**"relation does not exist" error:**
- Go back to Step 3 and make sure schema.sql ran completely
- Check Database → Tables to see if tables were created

**Connection errors:**
- Double-check your URL and anon key are correct
- Make sure they're in `.env.local`, not `.env`

## 🎉 You're Done!

Your backend is now connected! The app will use your Supabase database for:
- Storing duals, votes, comments
- User authentication
- Real-time updates
- Notifications

