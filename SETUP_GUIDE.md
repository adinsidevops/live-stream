# BIGO Live Clone - Setup Guide

This guide will help you set up the BIGO Live Clone application with Firebase backend and Google authentication.

## Firebase Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `bigo-live-clone`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Required Services

#### Authentication
1. Go to **Build** → **Authentication**
2. Click "Get started"
3. Under "Sign-in providers", click **Google**
4. Enable it and set Project support email
5. Click "Save"

#### Firestore Database
1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select region close to you (e.g., `us-central1`)
4. Choose "Start in test mode" (for development)
5. Click "Create"
6. Deploy the security rules from `firestore.rules` file

#### Cloud Storage
1. Go to **Build** → **Storage**
2. Click "Get started"
3. Choose region same as Firestore
4. Start in test mode
5. Click "Done"

#### Realtime Database
1. Go to **Build** → **Realtime Database**
2. Click "Create database"
3. Choose region same as Firestore
4. Start in test mode
5. Click "Enable"

#### Hosting
1. Go to **Build** → **Hosting**
2. Click "Get started"
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Initialize: `firebase init hosting`

### 3. Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Click **Your apps** section
3. Click **Web app** (if not created, create one)
4. Copy the Firebase config object
5. Paste into `.env.local`:
```
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_STORAGE_BUCKET=<storageBucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
VITE_FIREBASE_APP_ID=<appId>
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - Your Firebase hosting URL
7. Copy the Client ID
8. Paste into `.env.local`:
```
VITE_GOOGLE_CLIENT_ID=<your_client_id>.apps.googleusercontent.com
```

### 5. Update Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with content from `firestore.rules`
3. Click **Publish**

## Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` with your credentials (see above)

3. Start dev server:
```bash
npm run dev
```

4. Open `http://localhost:3000`

## Deployment to Firebase Hosting

1. Build the app:
```bash
npm run build
```

2. Deploy:
```bash
firebase deploy
```

3. Your app will be live at: `https://your-project.web.app`

## Free Tier Considerations

- **Firestore reads**: 50,000/day (about 0.58 reads per second)
- **Realtime Database**: 100 simultaneous connections
- **Cloud Storage**: 5GB total
- **Cloud Functions**: 2,000,000 invocations/month

Tips for staying within limits:
- Cache frequently read data
- Paginate stream listings
- Clean up old streams and user data
- Monitor usage in Firebase Console

## Firestore Database Structure

```
collections/
├── users/
│   └── {userId}
│       ├── displayName: string
│       ├── email: string
│       ├── profilePicture: string
│       ├── followers: number
│       ├── following: number
│       ├── totalViews: number
│       └── createdAt: timestamp
│
├── streams/
│   └── {streamId}
│       ├── title: string
│       ├── category: string
│       ├── streamerName: string
│       ├── streamerAvatar: string
│       ├── userId: string
│       ├── isLive: boolean
│       ├── viewers: array
│       ├── thumbnail: string
│       ├── createdAt: timestamp
│       └── endedAt: timestamp
│
└── follows/
    └── {followId}
        ├── followerId: string
        ├── followingId: string
        └── createdAt: timestamp
```

## Environment Variables Reference

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# App Configuration
VITE_APP_URL=http://localhost:3000
```

## Troubleshooting

### Firebase Connection Error
- Verify all environment variables are correct
- Check that Firebase services are enabled
- Ensure browser console shows no CORS errors

### Google Login Not Working
- Check Google Client ID is correct
- Verify redirect URIs are configured
- Clear browser cookies and cache

### Camera/Mic Permission Denied
- Check browser security settings
- Ensure HTTPS (or localhost) for production
- Grant camera/microphone permissions

### WebRTC Connection Issues
- Check STUN server accessibility
- Verify peer connection state in browser console
- Test with different networks if possible

## Upgrading from Free Tier

When your app grows, consider upgrading Firebase to a paid plan:
- Increased read/write limits
- More database instances
- Better performance and reliability
- Customer support

## Next Steps

1. Customize the branding and colors
2. Add more streaming features (filters, recommendations)
3. Implement offline support with Service Workers
4. Add notifications and messaging
5. Set up Cloud Functions for auto-cleanup and analytics
6. Implement monetization (donations, ads, premium features)

## Support

For issues or questions:
- Firebase Support: https://firebase.google.com/support
- GitHub Issues: [Your repo URL]
- Google Cloud Support: https://cloud.google.com/support
