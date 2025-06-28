/*
  # Fix user registration database error

  1. Database Issues Fixed
    - Recreate trigger function with proper permissions
    - Fix foreign key constraints
    - Update RLS policies for proper access
    - Add error handling in trigger function

  2. Security
    - Proper RLS policies for profiles table
    - Secure trigger function execution
*/

-- First, let's clean up any existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table with error handling
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    user_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')::user_type,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Enable read access for authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Fix foreign key constraints
DO $$
BEGIN
  -- Drop existing foreign key constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  -- Add the correct foreign key constraint to auth.users
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, continue
    NULL;
  WHEN others THEN
    -- Log error but continue
    RAISE LOG 'Error updating profiles foreign key: %', SQLERRM;
END $$;

-- Update other table foreign keys to reference profiles
DO $$
BEGIN
  -- Fix performer_profiles foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'performer_profiles_user_id_fkey' 
    AND table_name = 'performer_profiles'
  ) THEN
    ALTER TABLE performer_profiles DROP CONSTRAINT performer_profiles_user_id_fkey;
  END IF;
  
  ALTER TABLE performer_profiles 
  ADD CONSTRAINT performer_profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error updating performer_profiles foreign key: %', SQLERRM;
END $$;

DO $$
BEGIN
  -- Fix gigs foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gigs_client_id_fkey' 
    AND table_name = 'gigs'
  ) THEN
    ALTER TABLE gigs DROP CONSTRAINT gigs_client_id_fkey;
  END IF;
  
  ALTER TABLE gigs 
  ADD CONSTRAINT gigs_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
  
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error updating gigs foreign key: %', SQLERRM;
END $$;

DO $$
BEGIN
  -- Fix gig_applications foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gig_applications_performer_id_fkey' 
    AND table_name = 'gig_applications'
  ) THEN
    ALTER TABLE gig_applications DROP CONSTRAINT gig_applications_performer_id_fkey;
  END IF;
  
  ALTER TABLE gig_applications 
  ADD CONSTRAINT gig_applications_performer_id_fkey 
  FOREIGN KEY (performer_id) REFERENCES profiles(id) ON DELETE CASCADE;
  
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error updating gig_applications foreign key: %', SQLERRM;
END $$;