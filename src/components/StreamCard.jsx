import React from 'react'
import { Link } from 'react-router-dom'

export default function StreamCard({ stream }) {
  return (
    <Link to={`/watch/${stream.id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        <div className="relative">
          <img
            src={stream.thumbnail || 'https://via.placeholder.com/320x180'}
            alt={stream.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            🔴 LIVE
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {stream.viewers?.length || 0} viewers
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-white truncate">{stream.title}</h3>
          <p className="text-gray-400 text-sm truncate">{stream.streamerName}</p>
          <p className="text-gray-500 text-xs mt-1">{stream.category}</p>
        </div>
      </div>
    </Link>
  )
}
