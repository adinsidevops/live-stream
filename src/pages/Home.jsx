import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useStreamStore from '../store/streamStore'
import StreamCard from '../components/StreamCard'

export default function Home() {
  const { user } = useAuthStore()
  const { streams, fetchActiveStreams, loading } = useStreamStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchActiveStreams()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">Loading streams...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to BIGO Live</h1>
          <p className="text-gray-400">Discover live streams from creators around the world</p>
        </div>

        {!user && (
          <div className="bg-primary/20 border border-primary rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Start Your Journey</h2>
            <p className="text-gray-300 mb-4">Sign in with Google to watch, stream, and connect with creators</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Sign In with Google
            </button>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🔴 Live Now ({streams.length})</h2>
          {streams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {streams.map(stream => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No live streams right now</p>
              <p className="text-gray-500 mt-2">Check back later or explore other streams</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
