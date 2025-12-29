# Fix Profile Creation Issue - Permanent Solution

This guide will ensure profiles are **always** created automatically for new users, preventing the foreign key constraint error.

## Step 1: Run the Auto-Create Profile Trigger (REQUIRED)

This creates a database trigger that automatically creates a profile whenever a new user signs up.

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase/auto_create_profile_trigger.sql`
3. Copy the **entire contents**
4. Paste into SQL Editor
5. Click **Run**

This will:
- ✅ Create a function that auto-creates profiles
- ✅ Set up a trigger on `auth.users` table
- ✅ Add RLS policy for profile insertion
- ✅ Grant necessary permissions

**After this, every new user will automatically get a profile!**

## Step 2: Fix Existing Users (One-Time)

If you have existing users without profiles, run this:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase/fix_missing_profiles.sql`
3. Copy and paste into SQL Editor
4. Click **Run**

This creates profiles for all existing users who don't have one.

## Step 3: Verify It Works

1. **Test with a new signup:**
   - Sign up a new user
   - Check Supabase Dashboard → Database → Tables → `profiles`
   - The profile should be created automatically

2. **Test creating a dual:**
   - Sign in
   - Try creating a dual
   - It should work without errors

## What Changed

### Database Level (Permanent Fix)
- ✅ **Auto-create trigger**: Every new user automatically gets a profile
- ✅ **RLS policy**: Added policy to allow profile insertion
- ✅ **Permissions**: Granted necessary permissions

### Application Level (Fallback)
- ✅ **Signup route**: Better error handling for profile creation
- ✅ **Duals route**: Fallback to create profile if missing
- ✅ **Schema**: Added RLS policy for profile insertion

## How It Works

1. **User signs up** → `auth.users` table gets a new row
2. **Database trigger fires** → Automatically creates profile in `profiles` table
3. **User can create duals** → No foreign key errors!

## Troubleshooting

**If you still get errors:**

1. Check if the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Check if profiles are being created:
   ```sql
   SELECT COUNT(*) FROM auth.users;
   SELECT COUNT(*) FROM public.profiles;
   -- These should match (or profiles should be >= users)
   ```

3. Manually create profile for your user:
   ```sql
   INSERT INTO public.profiles (id, username, full_name)
   SELECT 
     id,
     SPLIT_PART(email, '@', 1),
     SPLIT_PART(email, '@', 1)
   FROM auth.users
   WHERE id NOT IN (SELECT id FROM public.profiles)
   ON CONFLICT (id) DO NOTHING;
   ```

## Summary

- ✅ **Run `auto_create_profile_trigger.sql`** - This is the permanent fix
- ✅ **Run `fix_missing_profiles.sql`** - Fix existing users (one-time)
- ✅ **Done!** - New users will automatically get profiles

The trigger ensures this will **never happen again** for new users!

