-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  cred INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics/Categories table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duals table (main debate posts) - created first without side references
CREATE TABLE IF NOT EXISTS public.duals (
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

-- Sides table (left/right arguments)
CREATE TABLE IF NOT EXISTS public.sides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dual_id UUID NOT NULL,
  side_type TEXT NOT NULL CHECK (side_type IN ('left', 'right')),
  content TEXT NOT NULL CHECK (char_length(content) <= 400),
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  votes INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  changed_mind_count INTEGER DEFAULT 0,
  challenge_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT true, -- false if this is a challenge
  replaced_by UUID, -- if this side was replaced by a challenge
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints after both tables exist
ALTER TABLE public.sides
  ADD CONSTRAINT sides_dual_id_fkey FOREIGN KEY (dual_id) REFERENCES public.duals(id) ON DELETE CASCADE;

ALTER TABLE public.sides
  ADD CONSTRAINT sides_replaced_by_fkey FOREIGN KEY (replaced_by) REFERENCES public.sides(id);

ALTER TABLE public.duals
  ADD CONSTRAINT duals_left_side_id_fkey FOREIGN KEY (left_side_id) REFERENCES public.sides(id);

ALTER TABLE public.duals
  ADD CONSTRAINT duals_right_side_id_fkey FOREIGN KEY (right_side_id) REFERENCES public.sides(id);

-- Add foreign key constraint after sides table exists
ALTER TABLE public.duals 
  DROP CONSTRAINT IF EXISTS duals_left_side_id_fkey,
  DROP CONSTRAINT IF EXISTS duals_right_side_id_fkey;

ALTER TABLE public.duals
  ADD CONSTRAINT duals_left_side_id_fkey FOREIGN KEY (left_side_id) REFERENCES public.sides(id),
  ADD CONSTRAINT duals_right_side_id_fkey FOREIGN KEY (right_side_id) REFERENCES public.sides(id);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dual_id UUID REFERENCES public.duals(id) ON DELETE CASCADE NOT NULL,
  side_id UUID REFERENCES public.sides(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('left', 'right', 'neutral')),
  changed_mind BOOLEAN DEFAULT false, -- true if user changed their mind
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dual_id, user_id) -- One vote per user per dual
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dual_id UUID REFERENCES public.duals(id) ON DELETE CASCADE NOT NULL,
  side_id UUID REFERENCES public.sides(id) ON DELETE CASCADE NOT NULL, -- The side being challenged
  challenger_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 400),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge votes table
CREATE TABLE IF NOT EXISTS public.challenge_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dual_id UUID REFERENCES public.duals(id) ON DELETE CASCADE NOT NULL,
  side_type TEXT NOT NULL CHECK (side_type IN ('left', 'right', 'neutral')),
  content TEXT NOT NULL CHECK (char_length(content) <= 400),
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dual_id UUID REFERENCES public.duals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dual_id, user_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) NOT NULL,
  following_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('challenge', 'changed_mind', 'half_post_completed', 'new_follower', 'challenge_result')),
  message TEXT NOT NULL,
  related_dual_id UUID REFERENCES public.duals(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES public.profiles(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed table (for real-time updates)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('challenge', 'changed_mind', 'vote', 'comment', 'new_dual')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  dual_id UUID REFERENCES public.duals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_duals_status ON public.duals(status);
CREATE INDEX IF NOT EXISTS idx_duals_created_at ON public.duals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duals_topic_id ON public.duals(topic_id);
CREATE INDEX IF NOT EXISTS idx_sides_dual_id ON public.sides(dual_id);
CREATE INDEX IF NOT EXISTS idx_sides_author_id ON public.sides(author_id);
CREATE INDEX IF NOT EXISTS idx_votes_dual_id ON public.votes(dual_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_dual_id ON public.comments(dual_id);
CREATE INDEX IF NOT EXISTS idx_comments_side_type ON public.comments(side_type);
CREATE INDEX IF NOT EXISTS idx_challenges_dual_id ON public.challenges(dual_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- Partial unique index for sides (only one main side per type per dual)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sides_unique_main 
ON public.sides(dual_id, side_type) 
WHERE is_main = true;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_duals_topic_search ON public.duals USING gin(to_tsvector('english', topic));
CREATE INDEX IF NOT EXISTS idx_sides_content_search ON public.sides USING gin(to_tsvector('english', content));

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duals_updated_at BEFORE UPDATE ON public.duals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sides_updated_at BEFORE UPDATE ON public.sides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update side vote count
CREATE OR REPLACE FUNCTION update_side_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.sides 
    SET votes = votes + 1 
    WHERE id = NEW.side_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.sides 
    SET votes = GREATEST(0, votes - 1) 
    WHERE id = OLD.side_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for vote count
CREATE TRIGGER update_vote_count AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_side_vote_count();

-- Function to increment a column value
CREATE OR REPLACE FUNCTION increment(
  table_name TEXT,
  column_name TEXT,
  row_id UUID
)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update changed_mind_count
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

CREATE TRIGGER update_changed_mind_trigger AFTER INSERT OR UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_changed_mind_count();

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.duals 
    SET updated_at = NOW()
    WHERE id = NEW.dual_id;
    
    UPDATE public.sides
    SET comment_count = comment_count + 1
    WHERE dual_id = NEW.dual_id AND side_type = NEW.side_type;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.sides
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE dual_id = OLD.dual_id AND side_type = OLD.side_type;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comment_count_trigger AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Function to update challenge count
CREATE OR REPLACE FUNCTION update_challenge_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.sides 
    SET challenge_count = challenge_count + 1 
    WHERE id = NEW.side_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.sides 
    SET challenge_count = GREATEST(0, challenge_count - 1) 
    WHERE id = OLD.side_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_challenge_count_trigger AFTER INSERT OR DELETE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_challenge_count();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Duals policies
CREATE POLICY "Duals are viewable by everyone" ON public.duals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create duals" ON public.duals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own duals" ON public.duals
  FOR UPDATE USING (auth.uid() = created_by);

-- Sides policies
CREATE POLICY "Sides are viewable by everyone" ON public.sides
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create sides" ON public.sides
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own sides" ON public.sides
  FOR UPDATE USING (auth.uid() = author_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON public.votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- Challenges policies
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can challenge" ON public.challenges
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Activities are viewable by everyone" ON public.activities
  FOR SELECT USING (true);

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON public.follows
  FOR ALL USING (auth.uid() = follower_id);

