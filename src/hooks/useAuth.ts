import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile } from '../lib/types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          if (event === 'SIGNED_UP') {
            // For new signups, wait a bit longer for the trigger to complete
            console.log('New user signed up, waiting for profile creation...')
            setTimeout(() => fetchProfileWithRetry(session.user.id, 5), 2000)
          } else {
            fetchProfile(session.user.id)
          }
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfileWithRetry = async (userId: string, maxRetries: number) => {
    let retries = 0
    
    const attemptFetch = async (): Promise<void> => {
      try {
        console.log(`Fetching profile for user ${userId}, attempt ${retries + 1}`)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116' && retries < maxRetries) {
            // Profile not found, retry
            retries++
            console.log(`Profile not found, retrying in 2 seconds... (${retries}/${maxRetries})`)
            setTimeout(attemptFetch, 2000)
            return
          }
          throw error
        }
        
        console.log('Profile found:', data)
        setProfile(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }
    
    await attemptFetch()
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, userType: 'performer' | 'client') => {
    try {
      console.log('Signing up user:', { email, fullName, userType })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        throw error
      }
      
      console.log('Signup successful:', data)
      return { data, error: null }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Signout error:', error)
      throw error
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  }
}