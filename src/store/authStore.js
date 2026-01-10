import { create } from 'zustand'
import { auth } from '../firebase'
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  signInWithGoogle: async () => {
    try {
      set({ error: null })
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      set({ user: result.user, error: null })
      return result.user
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  signOutUser: async () => {
    try {
      await signOut(auth)
      set({ user: null, error: null })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  setUser: (user) => set({ user, loading: false }),

  initializeAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })
  },
}))

export default useAuthStore
