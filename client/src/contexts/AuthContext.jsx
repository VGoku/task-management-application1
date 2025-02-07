import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = async (userId) => {
    try {
      console.log('Fetching user profile for ID:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Creating new user profile...')
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{ id: userId, is_admin: false }])
            .select('is_admin')
            .single()

          if (createError) {
            console.error('Error creating user profile:', createError)
            return false
          }
          console.log('New profile created:', newProfile)
          return newProfile?.is_admin || false
        }
        return false
      }

      console.log('Fetched user profile:', data)
      return data?.is_admin || false
    } catch (error) {
      console.error('Exception in fetchUserRole:', error)
      return false
    }
  }

  useEffect(() => {
    console.log('AuthProvider: Initial mount')
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Initial session:', session?.user?.id)

        if (sessionError) {
          console.error('Session error:', sessionError)
          return
        }

        if (session?.user) {
          const isAdmin = await fetchUserRole(session.user.id)
          if (mounted) {
            setUser({ ...session.user, isAdmin })
            console.log('User initialized with admin status:', isAdmin)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)

      if (session?.user) {
        const isAdmin = await fetchUserRole(session.user.id)
        if (mounted) {
          setUser({ ...session.user, isAdmin })
          console.log('User updated with admin status:', isAdmin)
        }
      } else {
        if (mounted) {
          setUser(null)
          console.log('User signed out')
        }
      }

      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isAdmin = () => {
    console.log('Checking admin status:', user?.isAdmin)
    return user?.isAdmin || false
  }

  const value = {
    user,
    loading,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 