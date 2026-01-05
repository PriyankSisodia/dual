# ⚠️ URGENT: Database Migration Required

You're seeing the error: **"column profiles_2.cred does not exist"**

This means your database still has the old column names. You **MUST** run the migration script to fix this.

## Quick Fix (2 minutes)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "SQL Editor"** in the left sidebar
4. **Copy and paste this script**:

```sql
-- Rename columns
ALTER TABLE public.profiles 
  RENAME COLUMN persuasion_score TO cred;

ALTER TABLE public.sides 
  RENAME COLUMN persuasion_points TO upvotes;

-- Update trigger function
CREATE OR REPLACE FUNCTION update_changed_mind_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.changed_mind = true AND (OLD IS NULL OR OLD.changed_mind = false) THEN
    UPDATE public.sides 
    SET changed_mind_count = changed_mind_count + 1,
        upvotes = upvotes + 10
    WHERE id = NEW.side_id;
    
    UPDATE public.profiles
    SET cred = cred + 10
    WHERE id = (SELECT author_id FROM public.sides WHERE id = NEW.side_id);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';
```

5. **Click "Run"** (or press Ctrl+Enter / Cmd+Enter)
6. **Restart your dev server**: `npm run dev`

That's it! The error should be fixed.

---

**Note**: If you get an error saying the column doesn't exist, use the safe migration script in `supabase/migrate_to_cred_upvotes_safe.sql` instead.

