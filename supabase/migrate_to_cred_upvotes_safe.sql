-- Safe Migration script to rename persuasion_score to cred and persuasion_points to upvotes
-- This script checks if columns exist before renaming to avoid errors
-- Run this in your Supabase SQL Editor

-- Step 1: Check and rename column in profiles table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'persuasion_score'
  ) THEN
    ALTER TABLE public.profiles 
      RENAME COLUMN persuasion_score TO cred;
    RAISE NOTICE 'Renamed persuasion_score to cred in profiles table';
  ELSE
    RAISE NOTICE 'Column persuasion_score does not exist in profiles table (may already be renamed)';
  END IF;
END $$;

-- Step 2: Check and rename column in sides table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sides' 
    AND column_name = 'persuasion_points'
  ) THEN
    ALTER TABLE public.sides 
      RENAME COLUMN persuasion_points TO upvotes;
    RAISE NOTICE 'Renamed persuasion_points to upvotes in sides table';
  ELSE
    RAISE NOTICE 'Column persuasion_points does not exist in sides table (may already be renamed)';
  END IF;
END $$;

-- Step 3: Update the trigger function to use new column names
CREATE OR REPLACE FUNCTION update_changed_mind_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.changed_mind = true AND (OLD IS NULL OR OLD.changed_mind = false) THEN
    UPDATE public.sides 
    SET changed_mind_count = changed_mind_count + 1,
        upvotes = upvotes + 10
    WHERE id = NEW.side_id;
    
    -- Also update author's cred
    UPDATE public.profiles
    SET cred = cred + 10
    WHERE id = (SELECT author_id FROM public.sides WHERE id = NEW.side_id);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

