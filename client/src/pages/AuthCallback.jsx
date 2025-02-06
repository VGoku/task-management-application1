import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error.message)
          toast.error('Authentication failed')
          navigate('/login')
          return
        }

        if (session) {
          toast.success('Authentication successful!')
          navigate('/')
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error.message)
        toast.error('Authentication failed')
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Completing authentication...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we verify your credentials.
        </p>
      </div>
    </div>
  )
} 