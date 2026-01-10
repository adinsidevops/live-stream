import React, { useEffect, useState } from 'react'
import useStreamStore from '../store/streamStore'
import StreamCard from '../components/StreamCard'

export default function Discover() {
  const { streams, fetchActiveStreams, loading } = useStreamStore()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchActiveStreams()
  }, [])

  const categories = ['All', 'Just Chatting', 'Gaming', 'Music', 'Cooking', 'Education', 'Art & Design']

  const filteredStreams = filter === 'all' 
    ? streams 
    : streams.filter(s => s.category === filter)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Discover Live Streams</h1>

        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-3 mb-8 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat.toLowerCase())}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                filter === cat.toLowerCase()
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Streams Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-400">Loading streams...</p>
          </div>
        ) : filteredStreams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStreams.map(stream => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No streams in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
