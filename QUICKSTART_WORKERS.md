# Quick Start: Firebase + Cloudflare Workers

Get your BIGO Live clone streaming in 5 minutes!

## Prerequisites
- Node.js 16+ (`node --version`)
- Cloudflare account (free at [cloudflare.com](https://cloudflare.com))
- Firebase project (free at [firebase.google.com](https://firebase.google.com))
- GitHub (code already committed ✅)

## Setup (5 minutes)

### 1. Install Wrangler (1 minute)
```bash
npm install -g wrangler
wrangler login
```

### 2. Install Dependencies (1 minute)
```bash
cd /workspaces/live-stream
npm install
cd workers && npm install && cd ..
```

### 3. Configure Environment (1 minute)
```bash
# Copy template
cp .env.example .env.local

# Edit with your Firebase credentials (from Firebase Console)
# Leave VITE_SIGNALING_SERVER_URL as is for development
nano .env.local
```

**Need Firebase credentials?**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (bigo-live-clone-cc40c)
3. Click "Project Settings" → "Your apps"
4. Copy the config values

### 4. Start Development Servers (2 minutes)

**Terminal 1 - React Frontend:**
```bash
npm run dev
```
→ Opens at `http://localhost:3000`

**Terminal 2 - Cloudflare Workers Signaling:**
```bash
cd workers
wrangler dev
```
→ Runs at `http://localhost:8787`

## Testing the Stream

### Sign In
1. Go to `http://localhost:3000`
2. Click "Sign In with Google"
3. Complete Google OAuth

### Start Broadcasting
1. Click "Go Live" or navigate to `/stream`
2. Enter title: `Test Stream`
3. Select category: `Just Chatting`
4. Click "🔴 Go Live"
5. Allow camera/microphone permissions

### Watch Stream
1. Open another browser tab/incognito
2. Sign in with different Google account (or same account)
3. Click "Discover" or home
4. Find your stream
5. Click to watch

### Test Chat
- Type messages in the chat sidebar
- Messages appear in real-time

## Project Structure

```
live-stream/
├── src/                           # React frontend
│   ├── components/
│   │   ├── LiveBroadcaster.jsx   # ← Updated for signaling
│   │   ├── LiveViewer.jsx         # ← Updated for signaling
│   │   ├── Navbar.jsx
│   │   └── StreamCard.jsx
│   ├── pages/
│   ├── services/
│   │   └── signalingClient.js    # ← NEW: Signaling client
│   ├── store/
│   ├── firebase.js
│   └── App.jsx
├── workers/                       # ← NEW: Cloudflare Workers
│   ├── src/index.js              # Signaling server (500+ lines)
│   ├── wrangler.toml             # Workers config
│   └── package.json
├── CLOUDFLARE_SETUP.md           # ← NEW: Deployment guide
├── WORKERS_INTEGRATION.md        # ← NEW: Architecture overview
├── README.md                      # Updated with Workers info
└── .env.example                   # Updated with VITE_SIGNALING_SERVER_URL
```

## Common Commands

```bash
# Development
npm run dev                  # Start React dev server
cd workers && wrangler dev   # Start Cloudflare Workers locally

# Building
npm run build               # Build for production

# Deployment
cd workers && wrangler deploy    # Deploy signaling server
firebase deploy --only hosting   # Deploy React app

# Debugging
cd workers && wrangler tail      # Live logs from Workers
```

## Architecture at a Glance

```
Broadcaster (localhost:3000)
    ↓ Camera/Mic
    ↓ Creates WebRTC peer connection
    ↓
Cloudflare Workers (localhost:8787)
    ├─ Stores broadcaster's SDP offer
    ├─ Relays ICE candidates
    └─ Manages room state
    ↑
Viewer (localhost:3000)
    ↓ WebRTC peer connection
    ↓ Receives broadcaster's SDP
    ↓ Sends own SDP answer
    ↓ Exchanges ICE candidates
    ↑
    Direct P2P video/audio stream
    (no media server needed!)
```

## Key Features

✅ **Real-time Streaming** - P2P video/audio via WebRTC
✅ **Live Chat** - Real-time messaging
✅ **Stream Discovery** - Browse and filter by category
✅ **User Profiles** - Follow creators
✅ **Analytics** - Creator dashboard with stats
✅ **Responsive Design** - Works on desktop and mobile

## Free Tier Limits

| Service | Free Limit | Status |
|---------|-----------|--------|
| Firebase Auth | Unlimited | ✅ |
| Firestore | 50k reads/day | ✅ |
| Firestore | 20k writes/day | ✅ |
| Cloud Storage | 5GB | ✅ |
| Cloudflare Workers | 100k requests/day | ✅ |
| Signaling | No media server | ✅ |

**Your app will not exceed free tier limits with < 1,000 daily active users!**

## Troubleshooting

### "Signaling server not reachable"
```bash
# Make sure Workers dev server is running
cd workers && wrangler dev

# Check frontend .env has correct URL
cat .env.local | grep SIGNALING
# Should show: VITE_SIGNALING_SERVER_URL=http://localhost:8787
```

### "Camera permission denied"
- Firefox: Settings → Privacy → Camera
- Chrome: Click lock icon in address bar → Permissions
- Safari: System Preferences → Security & Privacy → Camera

### "Firebase not initialized"
```bash
# Verify .env.local has all Firebase variables
cat .env.local

# Should have:
# - VITE_FIREBASE_API_KEY
# - VITE_FIREBASE_AUTH_DOMAIN
# - VITE_FIREBASE_PROJECT_ID
# - etc.
```

### WebRTC connection timeout
- Takes 5-15 seconds to establish
- Check browser Network tab for failed requests
- Ensure broadcaster goes FIRST, then viewer joins

## Next Steps

1. ✅ Test locally (you are here)
2. 📍 Update Firestore security rules in Firebase Console
3. 🚀 Deploy Cloudflare Workers to production
4. 🌍 Deploy React app to Firebase Hosting
5. 📊 Monitor logs and analytics

## Documentation

- **Full Setup**: [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) (detailed instructions)
- **Architecture**: [WORKERS_INTEGRATION.md](./WORKERS_INTEGRATION.md) (how it all works)
- **Project Info**: [README.md](./README.md) (features and tech stack)
- **Original Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) (Firebase setup)

## Support

All code is in GitHub at: https://github.com/adinsidevops/live-stream

Latest commit: WebRTC signaling with Cloudflare Workers

---

**Ready to stream? Start with:**
```bash
npm run dev              # Terminal 1
cd workers && wrangler dev  # Terminal 2
```

Then open http://localhost:3000 and sign in!
