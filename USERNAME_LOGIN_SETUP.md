# Username/Email Login Setup

The login system now supports both **email** and **username** for signing in.

## What Changed

1. **Login Page**: Updated to accept "Email or Username" instead of just email
2. **Signin API**: Updated to detect if input is email or username, and look up email if username is provided
3. **Database Function**: Created a function to safely look up user email from username

## Setup Required

### Step 1: Run the Database Function

You need to create a database function that allows looking up a user's email by their username. This is necessary because we can't directly query `auth.users` from the API.

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `supabase/get_user_email_function.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run**

This creates a function `get_user_email_by_username` that:
- Takes a username as input
- Returns the email from `auth.users` for that username
- Uses `SECURITY DEFINER` to allow access to `auth.users` table

### Step 2: Test Login

After running the function, you can test:

1. **With Email**: Sign in with your email address (e.g., `user@example.com`)
2. **With Username**: Sign in with your username (e.g., `johndoe`)

Both should work!

## How It Works

1. User enters email or username in login form
2. API detects if input contains `@` (email) or not (username)
3. If username:
   - Calls database function to get email
   - Uses email to sign in with Supabase Auth
4. If email:
   - Uses email directly to sign in

## Security Notes

- The database function uses `SECURITY DEFINER` to access `auth.users`
- It only returns the email, not the password
- Username lookup is case-insensitive
- Invalid usernames return generic "Invalid username or password" error (for security)

## Troubleshooting

**Error: "function get_user_email_by_username does not exist"**
- Make sure you ran the SQL function in Supabase SQL Editor

**Error: "Invalid username or password"**
- Check that the username exists in the `profiles` table
- Make sure the user has confirmed their email (if email confirmation is enabled)
- Try signing in with email instead to verify credentials

**Username login not working**
- Verify the function was created successfully
- Check Supabase logs for any errors
- Make sure the username matches exactly (case-insensitive)

