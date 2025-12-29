-- Fix missing profiles for existing users
-- Run this in Supabase SQL Editor to create profiles for users who don't have them

INSERT INTO public.profiles (id, username, full_name)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'username',
    SPLIT_PART(au.email, '@', 1),
    'user_' || SUBSTRING(au.id::text, 1, 8)
  ) as username,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1),
    'User'
  ) as full_name
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the fix
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM public.profiles) as missing_profiles
FROM auth.users;

