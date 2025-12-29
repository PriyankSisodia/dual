# How to Enable Real-time Subscriptions in Supabase

## Important Note

The "Replication" page you see in Supabase is for **external data replication** (sending data to BigQuery, data warehouses, etc.). 

For **real-time subscriptions** in your app (live updates when votes/comments change), you need to enable the `realtime` publication via SQL.

## Step-by-Step Instructions

### Step 1: Open SQL Editor

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 2: Run the Real-time Script

1. Open the file `supabase/enable_realtime.sql` from your project
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success" messages

### Step 3: Verify It Worked

Run this query to check which tables are enabled:

```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see:
- `votes`
- `comments`
- `activities`
- `challenges`
- `duals` (optional)
- `sides` (optional)

## What This Does

This enables Supabase Realtime for these tables, which means:
- ✅ Your app can subscribe to changes in real-time
- ✅ Votes update live without page refresh
- ✅ New comments appear instantly
- ✅ Activity feed updates automatically
- ✅ Challenge notifications come through immediately

## Alternative: Enable via Supabase Dashboard (Newer UI)

Some Supabase projects have a newer UI where you can enable real-time via the dashboard:

1. Go to **Database** → **Tables**
2. Click on a table (e.g., `votes`)
3. Look for a **Replication** or **Real-time** toggle
4. Enable it for each table you need

But the SQL method above works for all Supabase projects and is more reliable.

## Testing Real-time

After enabling, your app's real-time hooks will work:
- `useRealtimeDual()` - Live vote updates
- `useRealtimeActivities()` - Live activity feed

No need to refresh the page to see new votes or comments!

