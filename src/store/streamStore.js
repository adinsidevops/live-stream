import { create } from 'zustand'
import { db } from '../firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'

const useStreamStore = create((set, get) => ({
  streams: [],
  activeStream: null,
  loading: false,
  error: null,

  // Create a new live stream
  createStream: async (userId, streamData) => {
    try {
      set({ loading: true, error: null })
      const streamsRef = collection(db, 'streams')
      const docRef = await addDoc(streamsRef, {
        ...streamData,
        userId,
        createdAt: new Date(),
        viewers: [],
        isLive: true,
      })
      set({ loading: false })
      return docRef.id
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Fetch all active streams
  fetchActiveStreams: async () => {
    try {
      set({ loading: true, error: null })
      const streamsRef = collection(db, 'streams')
      const q = query(
        streamsRef,
        where('isLive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const snapshot = await getDocs(q)
      const streams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      set({ streams, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Fetch stream by ID
  fetchStreamById: async (streamId) => {
    try {
      set({ loading: true, error: null })
      const streamRef = doc(db, 'streams', streamId)
      const snapshot = await getDoc(streamRef)
      if (snapshot.exists()) {
        set({ activeStream: { id: streamId, ...snapshot.data() }, loading: false })
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Update stream
  updateStream: async (streamId, updates) => {
    try {
      const streamRef = doc(db, 'streams', streamId)
      await updateDoc(streamRef, updates)
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // End stream
  endStream: async (streamId) => {
    try {
      await get().updateStream(streamId, { isLive: false, endedAt: new Date() })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Delete stream
  deleteStream: async (streamId) => {
    try {
      await deleteDoc(doc(db, 'streams', streamId))
      set({ activeStream: null })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  setActiveStream: (stream) => set({ activeStream: stream }),
}))

export default useStreamStore
