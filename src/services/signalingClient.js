/**
 * Signaling Client for WebRTC
 * Communicates with Cloudflare Workers to exchange SDP and ICE candidates
 */

class SignalingClient {
  constructor(signalingServerUrl) {
    this.signalingServerUrl = signalingServerUrl;
    this.roomId = null;
    this.peerId = null;
  }

  async createRoom(broadcasterId, streamId) {
    const response = await fetch(`${this.signalingServerUrl}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcasterId, streamId }),
    });

    const data = await response.json();
    this.roomId = data.roomId;
    this.peerId = broadcasterId;
    return data.roomId;
  }

  async storeBroadcasterSDP(broadcasterId, sdp) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/broadcaster-sdp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcasterId,
          sdp: sdp.sdp,
        }),
      }
    );
    return response.json();
  }

  async getBroadcasterSDP(broadcasterId) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/broadcaster-sdp?broadcasterId=${broadcasterId}`,
      { method: 'GET' }
    );
    return response.json();
  }

  async addViewer(viewerId) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/viewers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerId }),
      }
    );
    return response.json();
  }

  async storeViewerSDP(viewerId, sdp) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/viewer-sdp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerId,
          sdp: sdp.sdp,
        }),
      }
    );
    return response.json();
  }

  async getViewerSDP(viewerId) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/viewer-sdp?viewerId=${viewerId}`,
      { method: 'GET' }
    );
    return response.json();
  }

  async addICECandidate(peerId, candidate) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/ice`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId,
          candidate: {
            candidate: candidate.candidate,
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdpMid: candidate.sdpMid,
          },
        }),
      }
    );
    return response.json();
  }

  async getICECandidates(peerId) {
    const response = await fetch(
      `${this.signalingServerUrl}/api/rooms/${this.roomId}/ice?peerId=${peerId}`,
      { method: 'GET' }
    );
    const data = await response.json();
    return data.candidates || [];
  }

  async getRoomInfo() {
    const response = await fetch(`${this.signalingServerUrl}/api/rooms/${this.roomId}`, {
      method: 'GET',
    });
    return response.json();
  }
}

export default SignalingClient;
