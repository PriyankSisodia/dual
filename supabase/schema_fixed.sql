-- This is a corrected version of the schema that handles circular dependencies
-- Run this AFTER running the main schema.sql, or replace the duals/sides section

-- Drop existing constraints if they exist
ALTER TABLE public.duals DROP CONSTRAINT IF EXISTS duals_left_side_id_fkey;
ALTER TABLE public.duals DROP CONSTRAINT IF EXISTS duals_right_side_id_fkey;
ALTER TABLE public.sides DROP CONSTRAINT IF EXISTS sides_dual_id_fkey;
ALTER TABLE public.sides DROP CONSTRAINT IF EXISTS sides_replaced_by_fkey;

-- Recreate duals table without foreign keys to sides
DROP TABLE IF EXISTS public.duals CASCADE;
CREATE TABLE public.duals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic TEXT NOT NULL,
  topic_id UUID REFERENCES public.topics(id),
  left_side_id UUID,
  right_side_id UUID,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'archived')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate sides table
DROP TABLE IF EXISTS public.sides CASCADE;
CREATE TABLE public.sides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dual_id UUID NOT NULL,
  side_type TEXT NOT NULL CHECK (side_type IN ('left', 'right')),
  content TEXT NOT NULL CHECK (char_length(content) <= 400),
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  votes INTEGER DEFAULT 0,
  persuasion_points INTEGER DEFAULT 0,
  changed_mind_count INTEGER DEFAULT 0,
  challenge_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT true,
  replaced_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dual_id, side_type, is_main) WHERE is_main = true
);

-- Now add foreign key constraints
ALTER TABLE public.sides
  ADD CONSTRAINT sides_dual_id_fkey FOREIGN KEY (dual_id) REFERENCES public.duals(id) ON DELETE CASCADE;

ALTER TABLE public.sides
  ADD CONSTRAINT sides_replaced_by_fkey FOREIGN KEY (replaced_by) REFERENCES public.sides(id);

ALTER TABLE public.duals
  ADD CONSTRAINT duals_left_side_id_fkey FOREIGN KEY (left_side_id) REFERENCES public.sides(id);

ALTER TABLE public.duals
  ADD CONSTRAINT duals_right_side_id_fkey FOREIGN KEY (right_side_id) REFERENCES public.sides(id);

