-- Enable Real-time Subscriptions for Tables
-- Run this AFTER running schema.sql

-- Enable realtime for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- Enable realtime for comments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable realtime for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- Enable realtime for challenges table
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;

-- Enable realtime for duals table (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.duals;

-- Enable realtime for sides table (optional, for live vote count updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.sides;

-- Verify the tables are added (this will show all tables in the publication)
-- You can run this to check:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

