import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          user_type: 'performer' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          user_type: 'performer' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          user_type?: 'performer' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
      performer_profiles: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id: string
          performer_type: 'solo' | 'crew'
          base_location: string
          hourly_rate: number
          specialties: string[]
          hype_styles: string[]
          bio?: string | null
          portfolio_urls?: string[]
          verified?: boolean
          rating?: number | null
          total_gigs?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          performer_type?: 'solo' | 'crew'
          base_location?: string
          hourly_rate?: number
          specialties?: string[]
          hype_styles?: string[]
          bio?: string | null
          portfolio_urls?: string[]
          verified?: boolean
          rating?: number | null
          total_gigs?: number
          created_at?: string
          updated_at?: string
        }
      }
      gigs: {
        Row: {
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
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          event_type: string
          location: string
          date: string
          start_time: string
          end_time?: string | null
          budget: number
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          requirements: string[]
          hype_styles_wanted: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          event_type?: string
          location?: string
          date?: string
          start_time?: string
          end_time?: string | null
          budget?: number
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          requirements?: string[]
          hype_styles_wanted?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      gig_applications: {
        Row: {
          id: string
          gig_id: string
          performer_id: string
          message: string
          proposed_rate: number | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gig_id: string
          performer_id: string
          message: string
          proposed_rate?: number | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gig_id?: string
          performer_id?: string
          message?: string
          proposed_rate?: number | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}