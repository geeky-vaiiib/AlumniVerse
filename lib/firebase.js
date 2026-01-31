/**
 * Firebase Client Configuration
 * Handles Firebase initialization for frontend
 */

import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBsNkAHOauhCvfFVP8feIuk9aEzKOo4mY8",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "alumniverse-13e80.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alumniverse-13e80",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "alumniverse-13e80.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "973829371020",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:973829371020:web:7119d572eeb02b8c5477a9",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VZYYDKZ77E"
}

// Initialize Firebase (singleton pattern)
let app
let auth
let db
let storage
let analytics = null

if (typeof window !== 'undefined') {
    // Client-side initialization
    if (!getApps().length) {
        app = initializeApp(firebaseConfig)
    } else {
        app = getApps()[0]
    }

    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    // Initialize analytics only in browser and if supported
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app)
        }
    }).catch(() => {
        // Analytics not supported
    })

    // Connect to emulators in development (optional)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
        connectFirestoreEmulator(db, 'localhost', 8080)
        connectStorageEmulator(storage, 'localhost', 9199)
    }
} else {
    // Server-side - minimal initialization
    if (!getApps().length) {
        app = initializeApp(firebaseConfig)
    } else {
        app = getApps()[0]
    }

    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
}

/**
 * Firebase Auth Helpers
 */
export const firebaseAuth = {
    // Get current user
    getCurrentUser: () => auth.currentUser,

    // Get current user ID
    getCurrentUserId: () => auth.currentUser?.uid || null,

    // Wait for auth state
    onAuthStateChange: (callback) => {
        return auth.onAuthStateChanged(callback)
    }
}

/**
 * Firestore Helpers
 */
export const firebaseDb = {
    // Collections
    collections: {
        users: 'users',
        jobs: 'jobs',
        events: 'events',
        badges: 'badges',
        posts: 'posts'
    }
}

export { app, auth, db, storage, analytics }
export default app
