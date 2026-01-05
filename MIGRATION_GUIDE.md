# Migration Guide: Rename to cred/upvotes

**IMPORTANT**: You must run this migration before the application will work correctly!

This guide will help you update your database to use the new column names `cred` and `upvotes` instead of `persuasion_score` and `persuasion_points`.

## Steps

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard: https://supabase.com/dashboard
   - Select your project
   - Navigate to the **SQL Editor** (left sidebar)

2. **Run the Migration Script**
   - Open the file `supabase/migrate_to_cred_upvotes_safe.sql` (or `migrate_to_cred_upvotes.sql`)
   - Copy the entire contents
   - Paste it into the SQL Editor in Supabase
   - Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac) to execute

3. **Verify the Migration**
   - After running, check the messages/notices at the bottom
   - You should see messages confirming the renames
   - Optionally, verify in the Table Editor:
     - Go to **Table Editor** → `profiles` table → Check for `cred` column
     - Go to **Table Editor** → `sides` table → Check for `upvotes` column

## What This Migration Does

- Renames `profiles.persuasion_score` → `profiles.cred`
- Renames `sides.persuasion_points` → `sides.upvotes`
- Updates the database trigger function to use the new column names

## Troubleshooting

**Error: "column does not exist"**
- If you see this error, it means the columns were already renamed or the table structure is different
- Use the `migrate_to_cred_upvotes_safe.sql` script which checks for column existence first

**Error: "relation does not exist"**
- Make sure you're connected to the correct Supabase project
- Verify that the `profiles` and `sides` tables exist in your database

## After Migration

Once the migration is complete:

1. **Restart your Next.js development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Clear your browser cache** (optional but recommended):
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

The application should now work correctly with the new column names!

