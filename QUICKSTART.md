# Quick Start Guide

## 5-Minute Setup

### Step 1: Clone and Install (2 min)
```bash
cd live-stream
npm install
```

### Step 2: Firebase Setup (2 min)
1. Go to https://console.firebase.google.com/
2. Create a new project named "bigo-live-clone"
3. Go to Project Settings → Your Apps → Create Web App
4. Copy the Firebase config

### Step 3: Configure Environment (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Step 4: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## Key Features

### 🔐 Google Sign-In
- Click "Sign In with Google" on login page
- Automatic user profile creation

### 📺 Stream Discovery
- Browse live streams by category
- Real-time viewer count

### 🎥 Go Live
- Stream your camera and microphone
- Set title and category
- Live chat with viewers

### 👤 Creator Dashboard
- View your streaming stats
- Manage your streams
- Follow other creators

---

## Project Structure

```
live-stream/
├── src/
│   ├── components/          # UI Components
│   ├── pages/              # Page Routes
│   ├── store/              # Zustand state management
│   ├── App.jsx             # Main app
│   ├── firebase.js         # Firebase config
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
├── firebase.json           # Firebase config
├── firestore.rules         # Database security rules
└── SETUP_GUIDE.md          # Detailed setup
```

---

## Frontend Architecture

### Pages
- **Home** - Landing page with live streams
- **Login** - Google OAuth sign-in
- **Discover** - Browse and filter streams
- **Stream** - Start broadcasting
- **Watch** - View live stream and chat
- **Dashboard** - Creator analytics

### Components
- **Navbar** - Navigation and user menu
- **StreamCard** - Stream preview card
- **LiveBroadcaster** - Camera/mic capture (WebRTC)
- **LiveViewer** - Watch stream (WebRTC)

### State Management (Zustand)
- **authStore** - User authentication
- **streamStore** - Stream CRUD operations
- **userStore** - User profiles and following

---

## Backend Architecture

### Firebase Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Authentication** | Google OAuth | Unlimited |
| **Firestore** | Database | 50K reads/day, 1GB |
| **Realtime DB** | Real-time chat | 100 connections, 1GB |
| **Cloud Storage** | Profile pics, thumbnails | 5GB |
| **Hosting** | Deploy app | Unlimited |

### Database Collections

```
users/
  ├── displayName
  ├── email
  ├── profilePicture
  ├── followers
  └── following

streams/
  ├── title
  ├── category
  ├── streamerName
  ├── userId
  ├── isLive
  ├── viewers[]
  └── createdAt

follows/
  ├── followerId
  ├── followingId
  └── createdAt
```

---

## Common Tasks

### Add a New Feature
1. Create component in `src/components/` or `src/pages/`
2. Add store logic in `src/store/` if needed
3. Update routing in `App.jsx`
4. Import and use the component

### Customize Branding
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
    }
  }
}
```

### Deploy to Production
```bash
npm run build
firebase deploy
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase not configured" | Check `.env.local` values |
| "Camera not working" | Grant permissions in browser settings |
| "Can't sign in" | Enable Google auth in Firebase console |
| "Database errors" | Check Firestore security rules |

---

## Next Steps

1. ✅ Set up Firebase
2. ✅ Create `.env.local`
3. ✅ Run `npm install && npm run dev`
4. 📝 Customize branding and colors
5. 🚀 Add more features
6. 🌐 Deploy to Firebase Hosting

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Tailwind CSS](https://tailwindcss.com)

---

## Support

Need help? Check:
1. SETUP_GUIDE.md for detailed instructions
2. [Firebase Docs](https://firebase.google.com/docs)
3. Browser console for error messages

Happy streaming! 🎥
