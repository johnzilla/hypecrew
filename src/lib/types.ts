export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  user_type: 'performer' | 'client'
  created_at: string
  updated_at: string
}

export interface PerformerProfile {
  id: string
  user_id: string
  performer_type: 'solo' | 'crew'
  base_location: string
  hourly_rate: number
  specialties: string[]
  hype_styles: string[]
  bio: string | null
  portfolio_urls: string[]
  verified: boolean
  rating: number | null
  total_gigs: number
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Gig {
  id: string
  client_id: string
  title: string
  description: string
  event_type: string
  location: string
  date: string
  start_time: string
  end_time: string | null
  budget: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  requirements: string[]
  hype_styles_wanted: string[]
  created_at: string
  updated_at: string
  client?: Profile
}

export interface GigApplication {
  id: string
  gig_id: string
  performer_id: string
  message: string
  proposed_rate: number | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  performer?: PerformerProfile
}

export const HYPE_STYLES = [
  'High Energy',
  'Smooth Vibes',
  'Comedy Hype',
  'Motivational',
  'Gaming/Esports',
  'Wedding',
  'Corporate',
  'Fitness/Workout',
  'Social Media',
  'Birthday/Celebration'
]

export const EVENT_TYPES = [
  'Birthday Party',
  'Wedding',
  'Corporate Event',
  'Gaming Tournament',
  'Fitness Event',
  'Social Media Content',
  'Product Launch',
  'Sports Event',
  'Concert/Music',
  'Other'
]