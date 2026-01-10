import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useStreamStore from '../store/streamStore'
import LiveViewer from '../components/LiveViewer'

export default function Watch() {
  const { streamId } = useParams()
  const { activeStream, fetchStreamById, loading } = useStreamStore()
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])

  useEffect(() => {
    fetchStreamById(streamId)
  }, [streamId])

  const handleSendComment = () => {
    if (comment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        text: comment,
        timestamp: new Date()
      }])
      setComment('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Loading stream...</p>
      </div>
    )
  }

  if (!activeStream) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Stream not found</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-screen flex">
      {/* Main Stream */}
      <div className="flex-1">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            <LiveViewer streamId={streamId} streamerId={activeStream.userId} />
          </div>
        </div>

        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-2">{activeStream.title}</h1>
          <div className="flex items-center space-x-4">
            {activeStream.streamerAvatar && (
              <img
                src={activeStream.streamerAvatar}
                alt={activeStream.streamerName}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="text-white font-semibold">{activeStream.streamerName}</p>
              <p className="text-gray-400 text-sm">{activeStream.viewers?.length || 0} viewers</p>
            </div>
          </div>
          <p className="text-gray-300 mt-4">{activeStream.category}</p>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Live Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="text-sm">
                <p className="text-gray-300">{c.text}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {c.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
              placeholder="Say something..."
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSendComment}
              className="bg-primary text-white px-3 py-2 rounded hover:bg-red-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
