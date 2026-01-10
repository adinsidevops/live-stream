# BIGO Live Clone

A modern live streaming web application built with React, Firebase, and WebRTC. Stream live video content, discover creators, and connect with viewers in real-time.

## Features

- 🔐 **Google Authentication** - Sign in securely with your Google account
- 📺 **Live Streaming** - Broadcast video and audio using WebRTC
- 🎥 **Stream Discovery** - Browse and filter live streams by category
- 💬 **Live Chat** - Real-time messaging during streams
- 👤 **User Profiles** - View creator profiles and follow/unfollow
- 📊 **Creator Dashboard** - Analytics and stream management
- 🎨 **Modern UI** - Tailwind CSS responsive design

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **WebRTC** - Real-time video/audio communication

### Backend & Services
- **Firebase** - Free tier cloud services
  - **Authentication** - Google OAuth integration
  - **Firestore** - NoSQL database for streams, users, profiles
  - **Realtime Database** - Real-time stream and chat data
  - **Cloud Storage** - Profile pictures and thumbnails
  - **Cloud Functions** - Serverless backend logic
  - **Hosting** - Deploy web app

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd live-stream
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable these services:
     - Authentication (Google sign-in)
     - Firestore Database
     - Realtime Database
     - Cloud Storage
     - Hosting
   - Copy your Firebase config

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials (Web Application)
   - Add localhost URLs to authorized origins

5. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and Google credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

6. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── Navbar.jsx
│   ├── StreamCard.jsx
│   ├── LiveViewer.jsx
│   └── LiveBroadcaster.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Stream.jsx
│   ├── Watch.jsx
│   ├── Discover.jsx
│   └── Dashboard.jsx
├── store/            # Zustand store management
│   ├── authStore.js
│   ├── streamStore.js
│   └── userStore.js
├── firebase.js       # Firebase config & initialization
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles with Tailwind
```

## Firestore Database Schema

### Collections

**users**
```
{
  displayName: string,
  email: string,
  profilePicture: string,
  followers: number,
  following: number,
  totalViews: number,
  createdAt: timestamp
}
```

**streams**
```
{
  title: string,
  category: string,
  streamerName: string,
  streamerAvatar: string,
  userId: string,
  isLive: boolean,
  viewers: array,
  thumbnail: string,
  createdAt: timestamp,
  endedAt: timestamp (optional)
}
```

**follows**
```
{
  followerId: string,
  followingId: string,
  createdAt: timestamp
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

2. Initialize Firebase
```bash
firebase init hosting
```

3. Build the app
```bash
npm run build
```

4. Deploy
```bash
firebase deploy
```

## WebRTC Setup

The app uses WebRTC for peer-to-peer video/audio streaming:

- **Broadcaster** (`LiveBroadcaster.jsx`) - Captures camera/mic and creates peer connection
- **Viewer** (`LiveViewer.jsx`) - Receives remote media stream
- **Signaling** - Firebase Realtime Database handles SDP and ICE candidate exchange

STUN servers used:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

## Free Tier Limits

### Firebase Free Plan
- **Firestore**: 1 GB storage, 50K read/day
- **Realtime Database**: 1 GB storage, 100 simultaneous connections
- **Cloud Storage**: 5 GB storage
- **Cloud Functions**: 2M invocations/month
- **Hosting**: Unlimited bandwidth

## Next Steps to Enhance

1. **Add Cloud Functions**
   - Stream recording and VOD support
   - Automatic stream cleanup
   - Viewer count updates

2. **Improve WebRTC**
   - TURN server for better connectivity
   - Multiple quality options
   - Adaptive bitrate streaming

3. **Add Social Features**
   - Direct messaging
   - Notifications
   - User recommendations
   - Gifting system

4. **Content Moderation**
   - Content filtering
   - Report system
   - User blocking

5. **Analytics**
   - Stream performance metrics
   - Viewer demographics
   - Engagement stats

## Troubleshooting

### Camera/Microphone not working
- Check browser permissions
- Ensure HTTPS in production
- Check WebRTC is supported

### Firebase connection issues
- Verify environment variables
- Check Firestore security rules
- Ensure services are enabled

### WebRTC connection fails
- Check STUN/TURN server accessibility
- Verify peer connection state
- Check browser console for errors

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.