import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Stream from './pages/Stream'
import Watch from './pages/Watch'
import Discover from './pages/Discover'
import Dashboard from './pages/Dashboard'
import useAuthStore from './store/authStore'

function App() {
  const { initializeAuth, user, loading } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/discover" /> : <Login />} />
          <Route path="/discover" element={user ? <Discover /> : <Navigate to="/login" />} />
          <Route path="/watch/:streamId" element={<Watch />} />
          <Route path="/stream" element={user ? <Stream /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
