# Cloudflare Workers Deployment Guide

## Overview

This BIGO Live clone uses **Cloudflare Workers** as the WebRTC signaling server to facilitate peer-to-peer video streaming between broadcasters and viewers. The signaling server handles SDP (Session Description Protocol) offer/answer exchange and ICE (Interactive Connectivity Establishment) candidate collection.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                         │
│           (Vite + Tailwind CSS + Zustand)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  LiveBroadcaster      ←→    LiveViewer                  │
│  (Sends SDP Offer)           (Sends SDP Answer)         │
│  (Sends ICE Candidates)      (Sends ICE Candidates)     │
│                                                           │
└──────────────────┬──────────────────┬────────────────────┘
                   │                  │
                   ↓                  ↓
         ┌──────────────────────────────────────┐
         │  Cloudflare Workers (Signaling)      │
         │  - WebRTC Signaling Endpoints        │
         │  - Durable Objects (Room State)      │
         │  - SDP/ICE Exchange                  │
         └──────────────────────────────────────┘
                   ↕
         ┌──────────────────────────────────────┐
         │  Firebase                             │
         │  - Authentication                    │
         │  - Firestore Database                │
         │  - Cloud Storage                     │
         │  - Hosting                           │
         └──────────────────────────────────────┘
```

## Prerequisites

1. **Cloudflare Account** - Free tier available at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI** - Cloudflare's command-line tool
3. **Node.js 18+** - For development

## Setup Instructions

### 1. Install Wrangler

```bash
npm install -g wrangler
# or locally in the project
npm install --save-dev wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler with your Cloudflare account.

### 3. Update `wrangler.toml`

The workers configuration file `workers/wrangler.toml` already contains the basic setup. Update these fields:

```toml
[env.production]
route = "https://signaling.yourdomain.com/*"  # Update your domain
zone_id = "your_zone_id_here"                  # Get from Cloudflare dashboard
```

To find your zone ID:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Copy "Zone ID" from the right sidebar

### 4. Create a D1 Database (Optional, for persistence)

For storing room sessions and chat history:

```bash
cd workers
wrangler d1 create live_stream_signaling
```

This creates a D1 database. Add the database ID to `wrangler.toml`.

### 5. Development Mode

Test the signaling server locally:

```bash
cd workers
npm install
wrangler dev
```

The server will run at `http://localhost:8787` by default.

### 6. Update Frontend Configuration

Add the signaling server URL to `.env.local`:

```env
VITE_SIGNALING_SERVER_URL=http://localhost:8787
# Or production URL when deployed
# VITE_SIGNALING_SERVER_URL=https://signaling.yourdomain.com
```

### 7. Deploy to Cloudflare

```bash
cd workers
wrangler deploy
```

This deploys the signaling server to Cloudflare Workers globally.

## API Reference

### Endpoints

#### Create Room
```
POST /api/rooms
Body: {
  "broadcasterId": "uid_of_broadcaster",
  "streamId": "firebase_stream_id"
}
Response: { "roomId": "stream_id_timestamp", "message": "Room created" }
```

#### Store Broadcaster SDP
```
POST /api/rooms/:roomId/broadcaster-sdp
Body: {
  "broadcasterId": "uid",
  "sdp": "offer_sdp_string"
}
```

#### Get Broadcaster SDP
```
GET /api/rooms/:roomId/broadcaster-sdp?broadcasterId=uid
Response: { "sdp": "offer_sdp_string" }
```

#### Add Viewer
```
POST /api/rooms/:roomId/viewers
Body: { "viewerId": "uid" }
Response: { "success": true, "viewerId": "uid" }
```

#### Store Viewer SDP
```
POST /api/rooms/:roomId/viewer-sdp
Body: {
  "viewerId": "uid",
  "sdp": "answer_sdp_string"
}
```

#### Get Viewer SDP
```
GET /api/rooms/:roomId/viewer-sdp?viewerId=uid
Response: { "sdp": "answer_sdp_string" }
```

#### Add ICE Candidate
```
POST /api/rooms/:roomId/ice
Body: {
  "peerId": "broadcaster_or_viewer_uid",
  "candidate": {
    "candidate": "candidate_string",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  }
}
```

#### Get ICE Candidates
```
GET /api/rooms/:roomId/ice?peerId=uid
Response: { "candidates": [...] }
```

#### Get Room Info
```
GET /api/rooms/:roomId
Response: {
  "roomId": "...",
  "broadcasterId": "...",
  "viewerCount": 5,
  "viewerIds": ["uid1", "uid2", ...]
}
```

## How WebRTC Signaling Works

1. **Broadcaster Initializes**
   - Calls `signaling.createRoom(broadcasterId, streamId)`
   - Starts capturing camera/microphone
   - Creates RTCPeerConnection and generates SDP offer
   - Sends SDP offer to signaling server: `POST /api/rooms/:roomId/broadcaster-sdp`

2. **Viewer Joins**
   - Calls `signaling.addViewer(viewerId)` to register
   - Creates RTCPeerConnection
   - Polls for broadcaster's SDP offer: `GET /api/rooms/:roomId/broadcaster-sdp`
   - Sets remote description with broadcaster's offer
   - Creates SDP answer and sends it: `POST /api/rooms/:roomId/viewer-sdp`

3. **ICE Candidate Exchange**
   - Broadcaster sends ICE candidates: `POST /api/rooms/:roomId/ice`
   - Viewer polls for broadcaster's candidates: `GET /api/rooms/:roomId/ice`
   - Both parties add received candidates to their peer connections

4. **Peer Connection Established**
   - Once SDP and ICE candidates are exchanged, WebRTC establishes a direct P2P connection
   - Video/audio streams flow directly between peers (no server in the middle)

## Environment Variables

Add these to your frontend `.env.local`:

```env
# Cloudflare Workers Signaling Server
VITE_SIGNALING_SERVER_URL=https://signaling.yourdomain.com

# Or for development
# VITE_SIGNALING_SERVER_URL=http://localhost:8787
```

## Monitoring & Debugging

### View Worker Logs

```bash
wrangler tail
```

This streams real-time logs from your deployed Workers.

### Local Development

```bash
wrangler dev --local
```

### Inspect Requests

Add logging in `src/index.js`:

```javascript
console.log('Incoming request:', request.method, url.pathname)
console.log('Request body:', body)
```

## Scaling Considerations

### Durable Objects

Currently, each room is backed by a Durable Object for state management. Durable Objects are:
- **Scoped to a single region** but provide strong consistency
- **Billed per-millisecond** ($0.15 per million requests for computation)
- **Perfect for** session state, WebRTC signaling, real-time coordination

### Rate Limiting

Add rate limiting to your endpoints:

```javascript
const rateLimiter = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const limit = rateLimiter.get(ip) || []
  const recent = limit.filter(t => now - t < 60000)
  
  if (recent.length > 1000) {
    throw new Error('Rate limited')
  }
  
  rateLimiter.set(ip, [...recent, now])
}
```

### Database for Persistence

Use D1 (Cloudflare's serverless SQL database) to store:
- Stream metadata
- Chat history
- User follow relationships
- Stream recordings/archives

```javascript
const result = await env.DB.prepare(
  'INSERT INTO streams (stream_id, broadcaster_id, title) VALUES (?, ?, ?)'
).bind(streamId, broadcasterId, title).run()
```

## Troubleshooting

### "Worker not found"
- Ensure `wrangler deploy` ran successfully
- Check Cloudflare dashboard for deployment status
- Verify zone ID is correct

### ICE Candidates not flowing
- Check CORS headers - frontend URL must be in `Access-Control-Allow-Origin`
- Verify firewall isn't blocking WebRTC
- Try with Google's STUN servers (included by default)

### SDP Offer/Answer not exchanged
- Ensure broadcaster goes first (creates room, sends offer)
- Verify viewer polls after broadcaster
- Check browser console for fetch errors

### Connection timeout
- May take 5-15 seconds for full establishment
- ICE candidate gathering can take time
- Check network firewall/corporate proxy

## Cost Estimation

### Cloudflare Workers Pricing (Free Tier)
- **100,000 requests/day** free
- Overage: $0.50 per million requests
- Durable Objects: $0.15 per million request-milliseconds

### Monthly Estimate (1,000 active streams)
- Base signaling: ~$5-15/month
- Durable Objects: ~$20-50/month (depends on room duration)
- **Total: $25-65/month** for signaling layer

Combined with **Firebase free tier**:
- Authentication: Unlimited
- Firestore: 50k read/day, 20k write/day free
- **Total project cost**: ~$25-65/month until scaling beyond free tiers

## Next Steps

1. ✅ Deploy Workers to production
2. ✅ Update frontend `.env` with production signaling URL
3. ✅ Test end-to-end streaming
4. ✅ Monitor Worker logs for issues
5. ✅ Set up D1 database for persistence (optional)
6. ✅ Configure analytics/monitoring

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [WebRTC MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Durable Objects Guide](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
