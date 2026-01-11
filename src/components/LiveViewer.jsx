import React, { useEffect, useRef, useState } from 'react'
import SignalingClient from '../services/signalingClient'

export default function LiveViewer({ streamId, broadcasterId, viewerId }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const peerConnectionRef = useRef(null)
  const signalingRef = useRef(null)
  const iceCheckIntervalRef = useRef(null)

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        // Initialize signaling client
        const signalingUrl = import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:8787'
        const signaling = new SignalingClient(signalingUrl)
        signalingRef.current = signaling

        // Set room ID from stream
        signaling.roomId = `${streamId}_${broadcasterId}`

        // Add viewer to room
        await signaling.addViewer(viewerId)
        console.log('Viewer added to room')

        // WebRTC peer connection setup
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] },
            { urls: ['stun:stun1.l.google.com:19302'] },
          ],
        })

        peerConnectionRef.current = peerConnection

        peerConnection.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0]
            setIsConnected(true)
          }
        }

        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            try {
              await signaling.addICECandidate(viewerId, event.candidate)
              console.log('Viewer ICE candidate sent')
            } catch (err) {
              console.error('Failed to send ICE candidate:', err)
            }
          }
        }

        peerConnection.onicecandidateerror = (event) => {
          console.error(`ICE Error: ${event.errorCode} - ${event.errorText}`)
        }

        // Get broadcaster's SDP offer
        let broadcasterSDP = null
        let attempts = 0
        while (!broadcasterSDP && attempts < 30) {
          try {
            const sdpData = await signaling.getBroadcasterSDP(broadcasterId)
            if (sdpData.sdp) {
              broadcasterSDP = sdpData.sdp
              break
            }
          } catch (err) {
            console.log('Waiting for broadcaster SDP...')
          }
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        if (!broadcasterSDP) {
          throw new Error('Could not get broadcaster SDP after 15 seconds')
        }

        // Set remote description (broadcaster's offer)
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(broadcasterSDP))
        )
        console.log('Remote description set from broadcaster offer')

        // Create answer
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

        // Send answer back to broadcaster
        await signaling.storeViewerSDP(viewerId, peerConnection.localDescription)
        console.log('Viewer SDP answer sent')

        // Poll for ICE candidates from broadcaster
        iceCheckIntervalRef.current = setInterval(async () => {
          try {
            const candidates = await signaling.getICECandidates(broadcasterId)
            for (const candidateData of candidates) {
              try {
                const iceCandidate = new RTCIceCandidate({
                  candidate: candidateData.candidate,
                  sdpMLineIndex: candidateData.sdpMLineIndex,
                  sdpMid: candidateData.sdpMid,
                })
                await peerConnection.addIceCandidate(iceCandidate)
                console.log('Added broadcaster ICE candidate')
              } catch (err) {
                console.error('Error adding ICE candidate:', err)
              }
            }
          } catch (err) {
            console.error('Error polling ICE candidates:', err)
          }
        }, 1000)

      } catch (err) {
        setError(err.message)
        console.error('WebRTC initialization error:', err)
      }
    }

    initializeWebRTC()

    return () => {
      if (iceCheckIntervalRef.current) {
        clearInterval(iceCheckIntervalRef.current)
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [streamId, broadcasterId, viewerId])

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
