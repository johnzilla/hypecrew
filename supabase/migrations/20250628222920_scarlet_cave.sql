/*
  # Create HypeCrew Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `user_type` (enum: performer, client)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `performer_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `performer_type` (enum: solo, crew)
      - `base_location` (text)
      - `hourly_rate` (numeric)
      - `specialties` (text array)
      - `hype_styles` (text array)
      - `bio` (text, nullable)
      - `portfolio_urls` (text array)
      - `verified` (boolean, default false)
      - `rating` (numeric, nullable)
      - `total_gigs` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gigs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text)
      - `event_type` (text)
      - `location` (text)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time, nullable)
      - `budget` (numeric)
      - `status` (enum: open, in_progress, completed, cancelled)
      - `requirements` (text array)
      - `hype_styles_wanted` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gig_applications`
      - `id` (uuid, primary key)
      - `gig_id` (uuid, foreign key to gigs)
      - `performer_id` (uuid, foreign key to profiles)
      - `message` (text)
      - `proposed_rate` (numeric, nullable)
      - `status` (enum: pending, accepted, rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for viewing public data appropriately

  3. Functions
    - Auto-update updated_at timestamps
    - Handle user profile creation on auth signup
*/

-- Create custom types
CREATE TYPE user_type AS ENUM ('performer', 'client');
CREATE TYPE performer_type AS ENUM ('solo', 'crew');
CREATE TYPE gig_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  user_type user_type NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create performer_profiles table
CREATE TABLE IF NOT EXISTS performer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  performer_type performer_type NOT NULL DEFAULT 'solo',
  base_location text NOT NULL,
  hourly_rate numeric(10,2) NOT NULL,
  specialties text[] DEFAULT '{}',
  hype_styles text[] DEFAULT '{}',
  bio text,
  portfolio_urls text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  rating numeric(3,2),
  total_gigs integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gigs table
CREATE TABLE IF NOT EXISTS gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  budget numeric(10,2) NOT NULL,
  status gig_status DEFAULT 'open',
  requirements text[] DEFAULT '{}',
  hype_styles_wanted text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gig_applications table
CREATE TABLE IF NOT EXISTS gig_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid REFERENCES gigs(id) ON DELETE CASCADE,
  performer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  proposed_rate numeric(10,2),
  status application_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(gig_id, performer_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for performer_profiles
CREATE POLICY "Anyone can view performer profiles"
  ON performer_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Performers can manage own profile"
  ON performer_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for gigs
CREATE POLICY "Anyone can view open gigs"
  ON gigs
  FOR SELECT
  TO authenticated
  USING (status = 'open' OR client_id = auth.uid());

CREATE POLICY "Clients can manage own gigs"
  ON gigs
  FOR ALL
  TO authenticated
  USING (client_id = auth.uid());

-- Create policies for gig_applications
CREATE POLICY "Users can view applications for their gigs or applications they made"
  ON gig_applications
  FOR SELECT
  TO authenticated
  USING (
    performer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM gigs 
      WHERE gigs.id = gig_applications.gig_id 
      AND gigs.client_id = auth.uid()
    )
  );

CREATE POLICY "Performers can create applications"
  ON gig_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (performer_id = auth.uid());

CREATE POLICY "Users can update applications they're involved in"
  ON gig_applications
  FOR UPDATE
  TO authenticated
  USING (
    performer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM gigs 
      WHERE gigs.id = gig_applications.gig_id 
      AND gigs.client_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performer_profiles_updated_at
  BEFORE UPDATE ON performer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gig_applications_updated_at
  BEFORE UPDATE ON gig_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'client')::user_type
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date);
CREATE INDEX IF NOT EXISTS idx_gigs_location ON gigs(location);
CREATE INDEX IF NOT EXISTS idx_performer_profiles_location ON performer_profiles(base_location);
CREATE INDEX IF NOT EXISTS idx_performer_profiles_hourly_rate ON performer_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_gig_applications_gig_id ON gig_applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_applications_performer_id ON gig_applications(performer_id);