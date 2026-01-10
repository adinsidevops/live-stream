import { create } from 'zustand'
import { db, storage } from '../firebase'
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const useUserStore = create((set, get) => ({
  currentUser: null,
  userProfile: null,
  followers: [],
  following: [],
  loading: false,
  error: null,

  // Create user profile
  createUserProfile: async (userId, profileData) => {
    try {
      set({ loading: true, error: null })
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, {
        ...profileData,
        createdAt: new Date(),
        followers: 0,
        following: 0,
        totalViews: 0,
      })
      set({ currentUser: { id: userId, ...profileData }, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        set({ userProfile: { id: userId, ...snapshot.data() } })
        return { id: userId, ...snapshot.data() }
      }
    } catch (error) {
      set({ error: error.message })
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      set({ loading: true, error: null })
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, updates)
      set({ currentUser: { ...get().currentUser, ...updates }, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (userId, file) => {
    try {
      set({ loading: true, error: null })
      const storageRef = ref(storage, `profiles/${userId}/avatar`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      await get().updateUserProfile(userId, { profilePicture: downloadURL })
      set({ loading: false })
      return downloadURL
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Follow user
  followUser: async (followerId, followingId) => {
    try {
      const followRef = collection(db, 'follows')
      await addDoc(followRef, {
        followerId,
        followingId,
        createdAt: new Date(),
      })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  setUserProfile: (profile) => set({ userProfile: profile }),
}))

export default useUserStore
