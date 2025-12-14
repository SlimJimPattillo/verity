-- Diagnostic and Fix Script for Missing User Profile
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/sjsgsufeofinawsbstfy/editor)

-- 1. Check if you have any users in auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check if you have any organizations
SELECT id, name, sector, created_at
FROM organizations
ORDER BY created_at DESC;

-- 3. Check if you have any user_profiles
SELECT id, organization_id, full_name, created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 4. Find auth.users WITHOUT a corresponding user_profile (orphaned users)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- ============================================
-- FIX: Create missing organization and user_profile
-- ============================================
-- ONLY run this section if you found orphaned users above
-- Replace the values below with your information

-- Step 1: Create an organization (if you don't have one yet)
-- Uncomment and modify this:
/*
INSERT INTO organizations (name, sector)
VALUES ('Your Organization Name', 'food')  -- Change 'food' to: education, healthcare, animal, or other
RETURNING id;
*/

-- Step 2: Create user_profile linking your user to the organization
-- Replace 'YOUR_USER_ID' with the id from auth.users query above
-- Replace 'YOUR_ORG_ID' with the id from the INSERT above (or SELECT id FROM organizations)
-- Uncomment and modify this:
/*
INSERT INTO user_profiles (id, organization_id, full_name)
VALUES (
  'YOUR_USER_ID'::uuid,
  'YOUR_ORG_ID'::uuid,
  'Your Name'
);
*/

-- ============================================
-- ALTERNATIVE: Complete fix in one go
-- ============================================
-- If you want to create both organization AND profile for your current user:
-- 1. Find your user ID from the first query above
-- 2. Replace 'YOUR_USER_ID' below with that ID
-- 3. Uncomment and run:

/*
DO $$
DECLARE
  v_user_id uuid := 'YOUR_USER_ID'::uuid;  -- REPLACE THIS
  v_org_id uuid;
BEGIN
  -- Create organization
  INSERT INTO organizations (name, sector)
  VALUES ('My Organization', 'other')  -- CUSTOMIZE THIS
  RETURNING id INTO v_org_id;

  -- Create user profile
  INSERT INTO user_profiles (id, organization_id, full_name)
  VALUES (v_user_id, v_org_id, 'My Name');  -- CUSTOMIZE THIS

  RAISE NOTICE 'Created organization % and user_profile for user %', v_org_id, v_user_id;
END $$;
*/
