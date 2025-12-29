-- URGENT FIX: Confirm all existing users
-- Run this in Supabase SQL Editor to confirm all users immediately
-- This will allow all existing users to sign in without email confirmation

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT 
  COUNT(*) as total_users,
  COUNT(email_confirmed_at) as confirmed_users,
  COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

