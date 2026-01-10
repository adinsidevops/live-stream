import React, { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'
import useStreamStore from '../store/streamStore'
import useUserStore from '../store/userStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { streams } = useStreamStore()
  const { userProfile, getUserProfile } = useUserStore()

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid)
    }
  }, [user])

  const userStreams = streams.filter(s => s.userId === user?.uid)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-6">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{user?.displayName}</h1>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex space-x-6 mt-4 text-sm">
                <div>
                  <p className="text-gray-400">Followers</p>
                  <p className="text-white font-bold">0</p>
                </div>
                <div>
                  <p className="text-gray-400">Following</p>
                  <p className="text-white font-bold">0</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Views</p>
                  <p className="text-white font-bold">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Streams</h3>
            <p className="text-3xl font-bold text-white">{userStreams.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Viewers</h3>
            <p className="text-3xl font-bold text-white">
              {userStreams.reduce((acc, s) => acc + (s.viewers?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Average Duration</h3>
            <p className="text-3xl font-bold text-white">--:--</p>
          </div>
        </div>

        {/* Recent Streams */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Streams</h2>
          {userStreams.length > 0 ? (
            <div className="space-y-4">
              {userStreams.map(stream => (
                <div key={stream.id} className="flex items-center justify-between p-4 bg-gray-700 rounded">
                  <div>
                    <p className="text-white font-semibold">{stream.title}</p>
                    <p className="text-gray-400 text-sm">{stream.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{stream.viewers?.length || 0} viewers</p>
                    <p className="text-gray-400 text-sm">
                      {stream.isLive ? '🔴 LIVE' : 'Ended'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No streams yet. Start streaming to see your history here.</p>
          )}
        </div>
      </div>
    </div>
  )
}
