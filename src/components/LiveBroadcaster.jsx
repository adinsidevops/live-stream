import React, { useEffect, useRef, useState } from 'react'

export default function LiveBroadcaster({ onStreamReady }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const peerConnectionRef = useRef(null)

  useEffect(() => {
    const startBroadcast = async () => {
      try {
        // Get user's camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Initialize WebRTC peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] },
            { urls: ['stun:stun1.l.google.com:19302'] },
          ],
        })

        peerConnectionRef.current = peerConnection

        // Add tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream)
        })

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ICE candidate to viewers via Firebase
            console.log('ICE Candidate:', event.candidate)
          }
        }

        setIsStreaming(true)
        onStreamReady?.()

      } catch (err) {
        setError(err.message)
      }
    }

    startBroadcast()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [onStreamReady])

  const stopBroadcast = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    setIsStreaming(false)
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full"
      />
      {error && (
        <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded">
          {error}
        </div>
      )}
      {isStreaming && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={stopBroadcast}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Stop Streaming
          </button>
        </div>
      )}
    </div>
  )
}
