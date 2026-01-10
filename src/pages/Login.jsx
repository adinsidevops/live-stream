import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useUserStore from '../store/userStore'

export default function Login() {
  const { user, signInWithGoogle } = useAuthStore()
  const { createUserProfile } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/discover')
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    try {
      const firebaseUser = await signInWithGoogle()
      if (!firebaseUser) return

      await createUserProfile(firebaseUser.uid, {
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        profilePicture: firebaseUser.photoURL || '',
      })

      navigate('/discover')
    } catch (error) {
      console.error('Login error:', error)
      alert('Sign in failed: ' + (error.message || error))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">🔴 BIGO Live</h1>
            <p className="text-gray-400">Watch & Stream Live</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-white font-semibold mb-4">Sign in to get started</h2>
              <div className="flex justify-center">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white text-black rounded-lg px-4 py-2 font-semibold hover:opacity-90 transition"
                >
                  Sign in with Google
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">By signing in, you agree to our Terms of Service</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl mb-2">📺</p>
            <p className="text-gray-400 text-sm">Watch Streams</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl mb-2">🎥</p>
            <p className="text-gray-400 text-sm">Go Live</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-gray-400 text-sm">Connect</p>
          </div>
        </div>
      </div>
    </div>
  )
}
            <p className="text-2xl mb-2">👥</p>
