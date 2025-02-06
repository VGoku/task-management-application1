import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TaskDetails from './pages/TaskDetails'
import Layout from './components/Layout'
import AuthCallback from './pages/AuthCallback'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  console.log('ProtectedRoute: Current state:', { user, loading }) // Debug log
  
  if (loading) {
    console.log('ProtectedRoute: Loading...') // Debug log
    return <div>Loading...</div>
  }
  
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login') // Debug log
    return <Navigate to="/login" />
  }
  
  console.log('ProtectedRoute: Rendering protected content') // Debug log
  return children
}

function App() {
  console.log('App: Rendering') // Debug log
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks/:taskId" element={
            <ProtectedRoute>
              <Layout>
                <TaskDetails />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App 