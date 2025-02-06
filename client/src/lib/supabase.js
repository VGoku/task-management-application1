import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl) // Debug log
console.log('Environment:', import.meta.env) // Debug log

// Better error handling with specific messages
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing in environment variables')
  throw new Error('Supabase URL configuration is missing')
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing in environment variables')
  throw new Error('Supabase Anon Key configuration is missing')
}

// Initialize Supabase client with enhanced options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  persistSession: true,
  localStorage: window.localStorage
})

// Enhanced error handling for auth functions
export const signUp = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Sign up error:', error.message)
    return { data: null, error }
  }
}

export const signIn = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Sign in error:', error.message)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error.message)
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    
    if (!session) {
      return { user: null, error: null }
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    
    return { user, error: null }
  } catch (error) {
    console.error('Get current user error:', error.message)
    return { user: null, error }
  }
} 