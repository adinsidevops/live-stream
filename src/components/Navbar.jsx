import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const { user, signOutUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOutUser()
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              🔴 BIGO Live
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/discover" className="hover:text-primary transition">
                  Discover
                </Link>
                <Link to="/dashboard" className="hover:text-primary transition">
                  Dashboard
                </Link>
                <button
                  onClick={() => navigate('/stream')}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Go Live
                </button>
                <div className="flex items-center space-x-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm">{user.displayName}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
