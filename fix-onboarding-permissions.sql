-- Fix onboarding permissions
-- Run this in your Supabase SQL Editor to allow users to create organizations during onboarding

-- Add INSERT policy for organizations table
-- This allows authenticated users to create a new organization
create policy "Authenticated users can create organizations"
  on organizations for insert
  to authenticated
  with check (true);

-- Note: The existing policies already allow users to:
-- - Insert their own profile (user_profiles)
-- - View/update their organization after creation
