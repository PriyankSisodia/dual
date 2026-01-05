-- Migration script to rename persuasion_score to cred and persuasion_points to upvotes
-- Run this in your Supabase SQL Editor

-- Step 1: Rename column in profiles table
ALTER TABLE public.profiles 
  RENAME COLUMN persuasion_score TO cred;

-- Step 2: Rename column in sides table
ALTER TABLE public.sides 
  RENAME COLUMN persuasion_points TO upvotes;

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

