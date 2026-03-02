import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile } from '../lib/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, userType: 'performer' | 'client') => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MAX_PROFILE_RETRIES = 5
const RETRY_DELAY_MS = 2000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    setProfile(data)
  }, [])

  const fetchProfileWithRetry = useCallback(async (userId: string) => {
    for (let attempt = 0; attempt < MAX_PROFILE_RETRIES; attempt++) {
      try {
        await fetchProfile(userId)
        return
      } catch (err: unknown) {
        const isNotFound =
          err instanceof Object && 'code' in err && (err as { code: string }).code === 'PGRST116'
        if (isNotFound && attempt < MAX_PROFILE_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
          continue
        }
        throw err
      }
    }
  }, [fetchProfile])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).catch(() => {}).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          if (_event === 'SIGNED_UP') {
            try {
              await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
              await fetchProfileWithRetry(session.user.id)
            } catch {
              // profile may not exist yet, handled gracefully
            }
          } else {
            try {
              await fetchProfile(session.user.id)
            } catch {
              // noop
            }
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile, fetchProfileWithRetry])

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    userType: 'performer' | 'client'
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, user_type: userType }
      }
    })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export type { AuthContextValue }
