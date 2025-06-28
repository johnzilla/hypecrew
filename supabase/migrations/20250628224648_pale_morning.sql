/*
  # Fix user registration flow

  1. Database Changes
    - Create trigger function to handle new user registration
    - Update profiles table to work with Supabase auth
    - Ensure proper foreign key relationships

  2. Security
    - Update RLS policies for proper user access
    - Ensure users can only access their own data

  3. Authentication Flow
    - Handle automatic profile creation on signup
    - Proper user type assignment
*/

-- Create or replace the trigger function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'user_type', 'client')::user_type
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles table policies to ensure proper access
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new RLS policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has the correct structure
DO $$
BEGIN
  -- Check if the foreign key constraint exists and drop it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  -- Add the correct foreign key constraint
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Update performer_profiles foreign key to reference profiles correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'performer_profiles_user_id_fkey' 
    AND table_name = 'performer_profiles'
  ) THEN
    ALTER TABLE performer_profiles 
    ADD CONSTRAINT performer_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update gigs foreign key to reference profiles correctly  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gigs_client_id_fkey' 
    AND table_name = 'gigs'
  ) THEN
    ALTER TABLE gigs 
    ADD CONSTRAINT gigs_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update gig_applications foreign key to reference profiles correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gig_applications_performer_id_fkey' 
    AND table_name = 'gig_applications'
  ) THEN
    ALTER TABLE gig_applications 
    ADD CONSTRAINT gig_applications_performer_id_fkey 
    FOREIGN KEY (performer_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;