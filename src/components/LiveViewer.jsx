import React, { useEffect, useRef, useState } from 'react'

export default function LiveViewer({ streamId, streamerId }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        // WebRTC peer connection setup
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] },
            { urls: ['stun:stun1.l.google.com:19302'] },
          ],
        })

        peerConnection.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0]
            setIsConnected(true)
          }
        }

        peerConnection.onicecandidateerror = (event) => {
          setError(`ICE Error: ${event.errorCode} - ${event.errorText}`)
        }

        // In a real app, you'd exchange SDP and ICE candidates with the streamer
        // This would typically be done through Firebase Realtime Database or Firestore

      } catch (err) {
        setError(err.message)
      }
    }

    // initializeWebRTC()
  }, [streamId, streamerId])

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full"
      />
      {error && (
        <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded">
          {error}
        </div>
      )}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-white text-center">
            <div className="animate-spin mb-4">📡</div>
            <p>Connecting to stream...</p>
          </div>
        </div>
      )}
    </div>
  )
}
