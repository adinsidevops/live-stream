import React, { useEffect, useRef, useState } from 'react'
import SignalingClient from '../services/signalingClient'

export default function LiveBroadcaster({ streamId, broadcasterId, onStreamReady }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const peerConnectionRef = useRef(null)
  const signalingRef = useRef(null)
  const iceCandidateQueueRef = useRef([])

  useEffect(() => {
    const startBroadcast = async () => {
      try {
        // Initialize signaling client
        const signalingUrl = import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:8787'
        const signaling = new SignalingClient(signalingUrl)
        signalingRef.current = signaling

        // Create room for this stream
        await signaling.createRoom(broadcasterId, streamId)
        console.log('Room created:', signaling.roomId)

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
        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            try {
              await signaling.addICECandidate(broadcasterId, event.candidate)
              console.log('ICE Candidate sent:', event.candidate)
            } catch (err) {
              console.error('Failed to send ICE candidate:', err)
            }
          }
        }

        // Create and send SDP offer
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        await signaling.storeBroadcasterSDP(broadcasterId, peerConnection.localDescription)
        console.log('SDP offer sent to signaling server')

        setIsStreaming(true)
        onStreamReady?.()

      } catch (err) {
        setError(err.message)
        console.error('Broadcast error:', err)
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
  }, [streamId, broadcasterId, onStreamReady])

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
