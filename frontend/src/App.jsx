import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './Pages/Dashboard'
import LeaveRequestPage from './Pages/LeaveRequestPage'
import LoginPage from './Pages/LoginPage'
import Profile from './Pages/Profile'
import ManagerDashboard from './Pages/ManagerDashboard'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

function RoleRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'MANAGER' ? '/manager' : '/dashboard'} replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/leave-request" element={<PrivateRoute><LeaveRequestPage /></PrivateRoute>} />
          <Route path="/leave-history" element={<PrivateRoute><LeaveRequestPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/manager" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
