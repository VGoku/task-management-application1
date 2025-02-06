import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = async (userId) => {
    try {
      console.log('Fetching user role for ID:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        // Create profile if it doesn't exist
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({ id: userId, role: 'user' })
            .select('role')
            .single()

          if (createError) {
            console.error('Error creating user profile:', createError)
            return 'user'
          }
          return newProfile.role
        }
        return 'user'
      }

      console.log('Fetched user role:', data)
      return data?.role || 'user'
    } catch (error) {
      console.error('Exception fetching user role:', error)
      return 'user'
    }
  }

  useEffect(() => {
    console.log('AuthProvider: Initial mount')
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Initial session:', session, sessionError)

        if (sessionError) throw sessionError

        if (session?.user) {
          const role = await fetchUserRole(session.user.id)
          if (mounted) {
            setUser({ ...session.user, role })
            console.log('User initialized with role:', role)
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)

      if (session?.user) {
        const role = await fetchUserRole(session.user.id)
        if (mounted) {
          setUser({ ...session.user, role })
          console.log('User updated with role:', role)
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
    console.log('Checking admin status:', user)
    return user?.role === 'admin'
  }

  const value = {
    user,
    loading,
    isAdmin
  }

  console.log('AuthProvider: Current state:', { user, loading })

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 