-- Test Data for DUAL App
-- Run this AFTER schema.sql to populate with sample data
-- This will help you test the UI immediately

-- First, create a test user profile (you'll need to sign up first via the app)
-- For now, we'll create a placeholder profile that you can link to your auth user later

-- Insert sample topics
INSERT INTO public.topics (name, slug, description) VALUES
  ('Technology', 'technology', 'Debates about tech, AI, and innovation'),
  ('Work', 'work', 'Remote work, office culture, productivity'),
  ('Society', 'society', 'Social issues and cultural debates'),
  ('Science', 'science', 'Scientific discoveries and theories')
ON CONFLICT (name) DO NOTHING;

-- Note: To create duals, you need to:
-- 1. Sign up via the app (creates auth.users entry)
-- 2. Create a profile entry manually or via trigger
-- 3. Then you can create duals

-- Example: After you sign up, get your user ID and run:
-- INSERT INTO public.profiles (id, username, full_name) 
-- VALUES ('your-user-id-here', 'yourusername', 'Your Name');

-- Then you can create test duals:
-- INSERT INTO public.duals (topic, created_by, status) 
-- VALUES ('Test Debate', 'your-user-id-here', 'pending')
-- RETURNING id;

