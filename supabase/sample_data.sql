-- Sample Data for DUAL App
-- Creates 30 sample duals with topics, sides, comments, and votes
-- Run this in Supabase SQL Editor after running schema.sql

-- First, create sample topics if they don't exist
INSERT INTO public.topics (name, slug, description) VALUES
  ('Technology', 'technology', 'Debates about tech, AI, and innovation'),
  ('Work & Career', 'work-career', 'Remote work, office culture, productivity'),
  ('Society & Culture', 'society-culture', 'Social issues and cultural debates'),
  ('Science', 'science', 'Scientific discoveries and theories'),
  ('Politics', 'politics', 'Political debates and policies'),
  ('Health & Wellness', 'health-wellness', 'Health, fitness, and lifestyle'),
  ('Education', 'education', 'Learning, teaching, and academic debates'),
  ('Environment', 'environment', 'Climate, sustainability, and nature'),
  ('Entertainment', 'entertainment', 'Movies, music, games, and media'),
  ('Business', 'business', 'Entrepreneurship, economics, and commerce')
ON CONFLICT (name) DO NOTHING;

-- Create profiles for any existing auth users
INSERT INTO public.profiles (id, username, full_name)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'username',
    SPLIT_PART(email, '@', 1),
    'user_' || SUBSTRING(id::text, 1, 8)
  ),
  COALESCE(
    raw_user_meta_data->>'full_name',
    SPLIT_PART(email, '@', 1),
    'User'
  )
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Sample duals data
DO $$
DECLARE
  test_user_id UUID;
  dual_id_var UUID;
  left_side_id_var UUID;
  right_side_id_var UUID;
  topic_uuid UUID;
  i INTEGER;
  j INTEGER;
  side_type_var TEXT;
  vote_type_var TEXT;
  topic_name_var TEXT;
  left_content_var TEXT;
  right_content_var TEXT;
BEGIN
  -- Get the first user from auth.users
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first!';
  END IF;

  -- Create 30 duals with different topics
  FOR i IN 1..30 LOOP
    -- Select topic and content based on iteration
    CASE (i % 30)
      WHEN 1 THEN topic_name_var := 'Technology'; left_content_var := 'AI will replace most jobs within 10 years. Automation is inevitable and we need to prepare for mass unemployment.'; right_content_var := 'AI will create more jobs than it replaces. History shows technology creates new opportunities.';
      WHEN 2 THEN topic_name_var := 'Technology'; left_content_var := 'Remote work is more productive. Fewer distractions, better work-life balance, and higher employee satisfaction.'; right_content_var := 'Office work is more productive. Collaboration, team building, and spontaneous creativity happen in person.';
      WHEN 3 THEN topic_name_var := 'Technology'; left_content_var := 'Open source software is superior. Community-driven, transparent, and free from vendor lock-in.'; right_content_var := 'Proprietary software is more reliable. Better support, security, and polished user experience.';
      WHEN 4 THEN topic_name_var := 'Work & Career'; left_content_var := 'Four-day workweek increases productivity. Happier employees work better. Less burnout means better results.'; right_content_var := 'Five-day workweek is optimal. Full week ensures consistent progress and maintains work momentum.';
      WHEN 5 THEN topic_name_var := 'Work & Career'; left_content_var := 'Freelancing offers more freedom. Control your schedule, choose your clients, and work from anywhere.'; right_content_var := 'Full-time employment provides stability. Benefits, steady income, and career growth are more secure.';
      WHEN 6 THEN topic_name_var := 'Society & Culture'; left_content_var := 'Social media does more harm than good. Mental health issues, misinformation, and addiction are rampant.'; right_content_var := 'Social media connects people globally. It enables communication, community building, and information sharing.';
      WHEN 7 THEN topic_name_var := 'Society & Culture'; left_content_var := 'Cancel culture protects marginalized voices. It holds people accountable for harmful actions.'; right_content_var := 'Cancel culture is toxic. It promotes mob mentality and prevents growth and forgiveness.';
      WHEN 8 THEN topic_name_var := 'Science'; left_content_var := 'Climate change is the biggest threat to humanity. Immediate action is required to prevent catastrophe.'; right_content_var := 'Other issues like poverty and disease are more urgent. Climate action can wait.';
      WHEN 9 THEN topic_name_var := 'Science'; left_content_var := 'GMOs are safe and beneficial. They increase crop yields and reduce pesticide use.'; right_content_var := 'GMOs pose unknown health risks. Natural foods are always better than modified ones.';
      WHEN 10 THEN topic_name_var := 'Politics'; left_content_var := 'Universal basic income is necessary. Automation will eliminate jobs and we need a safety net.'; right_content_var := 'UBI discourages work and is too expensive. People should earn their income.';
      WHEN 11 THEN topic_name_var := 'Politics'; left_content_var := 'Government should regulate big tech. Monopolies harm consumers and democracy.'; right_content_var := 'Tech should self-regulate. Government intervention stifles innovation.';
      WHEN 12 THEN topic_name_var := 'Health & Wellness'; left_content_var := 'Plant-based diet is healthier. Lower risk of heart disease, cancer, and environmental impact.'; right_content_var := 'Balanced diet including meat is healthier. Animal protein provides essential nutrients.';
      WHEN 13 THEN topic_name_var := 'Health & Wellness'; left_content_var := 'Mental health days are essential. Burnout prevention improves long-term productivity.'; right_content_var := 'Mental health days are excuses. People should push through challenges.';
      WHEN 14 THEN topic_name_var := 'Education'; left_content_var := 'College is still worth the investment. Higher earning potential and personal growth justify the cost.'; right_content_var := 'College is outdated. Skills can be learned online for free. Debt is not worth it.';
      WHEN 15 THEN topic_name_var := 'Education'; left_content_var := 'Online learning is more accessible. Flexible schedules and lower costs benefit more students.'; right_content_var := 'In-person learning is superior. Direct interaction and campus experience are irreplaceable.';
      WHEN 16 THEN topic_name_var := 'Environment'; left_content_var := 'Renewable energy can completely replace fossil fuels. Technology exists, we just need commitment.'; right_content_var := 'Fossil fuels are still needed. Renewable energy is unreliable and expensive.';
      WHEN 17 THEN topic_name_var := 'Environment'; left_content_var := 'Individual action matters for climate. Every person''s choices create collective impact.'; right_content_var := 'Only corporations can fix climate. Individual actions are drops in the ocean.';
      WHEN 18 THEN topic_name_var := 'Entertainment'; left_content_var := 'Streaming killed cinema. Theatrical experience is dying and movies are just content now.'; right_content_var := 'Cinema is still thriving. Big screen experience and community viewing are irreplaceable.';
      WHEN 19 THEN topic_name_var := 'Entertainment'; left_content_var := 'Video games are art. They combine storytelling, music, and visual design into interactive experiences.'; right_content_var := 'Video games are just entertainment. They lack the depth and meaning of true art forms.';
      WHEN 20 THEN topic_name_var := 'Business'; left_content_var := 'Startups are better than corporations. Innovation, agility, and impact matter more than stability.'; right_content_var := 'Corporations offer better careers. Stability, benefits, and clear advancement paths are valuable.';
      WHEN 21 THEN topic_name_var := 'Business'; left_content_var := 'Remote teams are more efficient. Lower overhead, global talent pool, and flexible hours.'; right_content_var := 'In-person teams collaborate better. Face-to-face interaction builds trust and creativity.';
      WHEN 22 THEN topic_name_var := 'Technology'; left_content_var := 'Cryptocurrency is the future of money. Decentralization and blockchain technology will revolutionize finance.'; right_content_var := 'Cryptocurrency is a bubble. It''s volatile, unregulated, and lacks real-world utility.';
      WHEN 23 THEN topic_name_var := 'Work & Career'; left_content_var := 'Job hopping accelerates career growth. Diverse experience and salary increases are worth the risk.'; right_content_var := 'Loyalty to one company pays off. Long-term relationships and promotions reward commitment.';
      WHEN 24 THEN topic_name_var := 'Society & Culture'; left_content_var := 'Privacy is dead in the digital age. We must accept that our data is constantly collected.'; right_content_var := 'Privacy can still be protected. Strong laws and personal choices can preserve privacy.';
      WHEN 25 THEN topic_name_var := 'Science'; left_content_var := 'Space exploration is worth the cost. Scientific discoveries and future colonization justify investment.'; right_content_var := 'Earth problems need funding first. Poverty and climate change are more urgent than space.';
      WHEN 26 THEN topic_name_var := 'Politics'; left_content_var := 'Democracy needs major reform. Current systems are outdated and don''t represent modern society.'; right_content_var := 'Current democracy works fine. Gradual improvements are better than radical changes.';
      WHEN 27 THEN topic_name_var := 'Health & Wellness'; left_content_var := 'Fitness trackers improve health. Data-driven insights motivate better lifestyle choices.'; right_content_var := 'Fitness trackers cause anxiety. Constant monitoring creates unhealthy obsession with metrics.';
      WHEN 28 THEN topic_name_var := 'Education'; left_content_var := 'Coding bootcamps replace degrees. Practical skills matter more than theoretical knowledge.'; right_content_var := 'Degrees provide better foundation. Comprehensive education builds critical thinking skills.';
      WHEN 29 THEN topic_name_var := 'Environment'; left_content_var := 'Nuclear energy is clean and safe. Modern reactors are efficient and produce minimal waste.'; right_content_var := 'Nuclear energy is dangerous. Accidents and waste disposal pose unacceptable risks.';
      ELSE topic_name_var := 'Business'; left_content_var := 'Side hustles are necessary today. One income source is not enough for financial security.'; right_content_var := 'Focus on one career path. Mastery requires dedication, not distraction.';
    END CASE;
    
    -- Get topic ID
    SELECT id INTO topic_uuid FROM public.topics WHERE name = topic_name_var LIMIT 1;
    
    -- Create dual
    INSERT INTO public.duals (topic, topic_id, created_by, status)
    VALUES (
      topic_name_var,
      topic_uuid,
      test_user_id,
      CASE WHEN i % 3 = 0 THEN 'pending' ELSE 'active' END
    )
    RETURNING id INTO dual_id_var;

    -- Create left side
    INSERT INTO public.sides (dual_id, side_type, content, author_id, is_main)
    VALUES (
      dual_id_var,
      'left',
      left_content_var,
      test_user_id,
      true
    )
    RETURNING id INTO left_side_id_var;

    -- Create right side (for active duals)
    IF i % 3 != 0 THEN
      INSERT INTO public.sides (dual_id, side_type, content, author_id, is_main)
      VALUES (
        dual_id_var,
        'right',
        right_content_var,
        test_user_id,
        true
      )
      RETURNING id INTO right_side_id_var;

      -- Update dual with side IDs
      UPDATE public.duals 
      SET left_side_id = left_side_id_var, right_side_id = right_side_id_var
      WHERE id = dual_id_var;
    ELSE
      -- Update dual with only left side (unfinished)
      UPDATE public.duals 
      SET left_side_id = left_side_id_var
      WHERE id = dual_id_var;
    END IF;

    -- Create 2-5 comments per dual
    FOR j IN 1..(FLOOR(RANDOM() * 4) + 2) LOOP
      side_type_var := CASE WHEN RANDOM() > 0.5 THEN 'left' ELSE 'right' END;
      INSERT INTO public.comments (dual_id, side_type, content, author_id)
      VALUES (
        dual_id_var,
        side_type_var,
        CASE (FLOOR(RANDOM() * 5) + 1)
          WHEN 1 THEN 'I completely agree with this perspective. Well argued!'
          WHEN 2 THEN 'Interesting point, but I think there''s more to consider here.'
          WHEN 3 THEN 'This side makes a compelling case. Food for thought.'
          WHEN 4 THEN 'I see both sides, but this argument resonates with me.'
          ELSE 'Great debate! Both perspectives have merit.'
        END,
        test_user_id
      );
    END LOOP;

    -- Create some votes (if dual is active) - skip for now to avoid conflicts
    -- Votes will be created when users actually vote

    -- Create activity
    INSERT INTO public.activities (type, message, user_id, dual_id)
    VALUES (
      'new_dual',
      'New dual created: "' || topic_name_var || '"',
      test_user_id,
      dual_id_var
    );
  END LOOP;
  
  RAISE NOTICE 'Created 30 sample duals with comments!';
END $$;

-- Update comment counts
UPDATE public.sides s
SET comment_count = (
  SELECT COUNT(*) 
  FROM public.comments c 
  WHERE c.dual_id = s.dual_id AND c.side_type = s.side_type
);

-- Verify the data
SELECT 
  'Duals created' as info,
  COUNT(*)::text as count
FROM public.duals
UNION ALL
SELECT 
  'Sides created',
  COUNT(*)::text
FROM public.sides
UNION ALL
SELECT 
  'Comments created',
  COUNT(*)::text
FROM public.comments
UNION ALL
SELECT 
  'Active duals',
  COUNT(*)::text
FROM public.duals WHERE status = 'active'
UNION ALL
SELECT 
  'Unfinished duals',
  COUNT(*)::text
FROM public.duals WHERE status = 'pending';

