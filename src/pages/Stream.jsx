import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useStreamStore from '../store/streamStore'
import LiveBroadcaster from '../components/LiveBroadcaster'

const CATEGORIES = [
  'Just Chatting',
  'Gaming',
  'Music',
  'Cooking',
  'Education',
  'Art & Design',
  'Sports',
  'Entertainment'
]

export default function Stream() {
  const { user } = useAuthStore()
  const { createStream } = useStreamStore()
  const navigate = useNavigate()
  const [streamTitle, setStreamTitle] = useState('')
  const [category, setCategory] = useState('Just Chatting')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamId, setStreamId] = useState(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">You need to be signed in to stream</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title')
      return
    }

    try {
      const id = await createStream(user.uid, {
        title: streamTitle,
        category,
        streamerName: user.displayName,
        streamerAvatar: user.photoURL,
        thumbnail: null,
      })
      setStreamId(id)
      setIsStreaming(true)
    } catch (error) {
      alert('Failed to start stream: ' + error.message)
    }
  }

  if (isStreaming && streamId) {
    return (
      <div className="fixed inset-0 bg-black">
        <div className="h-full w-full">
          <LiveBroadcaster streamId={streamId} />
        </div>
        <div className="fixed top-4 left-4 bg-gray-800 rounded-lg p-4 max-w-sm">
          <h2 className="text-white font-semibold mb-2">{streamTitle}</h2>
          <p className="text-gray-400 text-sm mb-2">Category: {category}</p>
          <button
            onClick={() => {
              setIsStreaming(false)
              navigate('/')
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full"
          >
            End Stream
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Start a Live Stream</h1>

        <div className="bg-gray-800 rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Stream Title</label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="Enter your stream title..."
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-8">
            <label className="block text-white font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-white font-semibold mb-2">📹 Camera Permission</h3>
            <p className="text-gray-300 text-sm mb-4">
              We'll need access to your camera and microphone to start streaming.
            </p>
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <span>✓</span>
              <span>Camera & Microphone</span>
            </div>
          </div>

          <button
            onClick={handleStartStream}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold text-lg"
          >
            🔴 Go Live
          </button>
        </div>
      </div>
    </div>
  )
}
