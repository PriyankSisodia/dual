-- Function to get user email by username
-- This allows the API to look up a user's email when they sign in with username
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username_param TEXT)
RETURNS TABLE(email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.email::TEXT
  FROM auth.users au
  INNER JOIN public.profiles p ON p.id = au.id
  WHERE LOWER(p.username) = LOWER(username_param)
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users (or anon if needed)
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO authenticated;

