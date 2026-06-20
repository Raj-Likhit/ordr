-- Phase 4: First-Time User Onboarding Schema Updates

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'name_added', 'tour_started', 'completed', 'skipped')),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS phone_number text;

-- One-time migration: Default existing users to 'completed'
-- We consider users created before this script as existing users who don't need the tour.
UPDATE profiles 
SET onboarding_status = 'completed', 
    onboarding_completed_at = NOW() 
WHERE onboarding_status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
