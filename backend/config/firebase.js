/**
 * Firebase Admin Configuration
 * Handles Firebase Admin SDK initialization for server-side operations
 */

const admin = require('firebase-admin');
const logger = require('../utils/logger');

// Firebase Admin configuration
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "alumniverse-13e80",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "alumniverse-13e80.firebasestorage.app",
};

// Initialize Firebase Admin (singleton pattern)
let app;
let auth;
let db;
let storage;

try {
    if (!admin.apps.length) {
        // Check if running with service account credentials
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccount) {
            // Parse service account from environment variable
            const credentials = JSON.parse(serviceAccount);
            app = admin.initializeApp({
                credential: admin.credential.cert(credentials),
                storageBucket: firebaseConfig.storageBucket
            });
        } else {
            // Use application default credentials (for local development or Cloud Run)
            app = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket
            });
        }

        logger.info('Firebase Admin SDK initialized successfully');
    } else {
        app = admin.apps[0];
    }

    auth = admin.auth();
    db = admin.firestore();
    storage = admin.storage();

} catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
}

/**
 * Firestore Helper Functions
 * Equivalent to supabaseHelpers for database operations
 */
const firebaseHelpers = {
    // User operations
    users: {
        findByEmail: async (email) => {
            const snapshot = await db.collection('users')
                .where('email', '==', email)
                .where('isDeleted', '==', false)
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        },

        findById: async (id) => {
            const doc = await db.collection('users').doc(id).get();
            if (!doc.exists) return null;
            const data = doc.data();
            if (data.isDeleted) return null;
            return { id: doc.id, ...data };
        },

        findByAuthId: async (authId) => {
            const snapshot = await db.collection('users')
                .where('authId', '==', authId)
                .where('isDeleted', '==', false)
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        },

        create: async (userData) => {
            const docRef = await db.collection('users').add({
                ...userData,
                isDeleted: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: doc.id, ...doc.data() };
        },

        update: async (id, updateData) => {
            await db.collection('users').doc(id).update({
                ...updateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await db.collection('users').doc(id).get();
            return { id: doc.id, ...doc.data() };
        },

        getAll: async (filters = {}, pagination = {}) => {
            let query = db.collection('users')
                .where('isDeleted', '==', false)
                .where('isEmailVerified', '==', true);

            // Apply filters
            if (filters.branch) query = query.where('branch', '==', filters.branch);
            if (filters.graduationYear) query = query.where('passingYear', '==', parseInt(filters.graduationYear));

            // Apply sorting
            const sortBy = pagination.sortBy || 'firstName';
            const sortOrder = pagination.sortOrder || 'asc';
            query = query.orderBy(sortBy, sortOrder);

            // Apply pagination
            if (pagination.limit) {
                query = query.limit(parseInt(pagination.limit));
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        delete: async (id) => {
            await db.collection('users').doc(id).update({
                isDeleted: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await db.collection('users').doc(id).get();
            return { id: doc.id, ...doc.data() };
        }
    },

    // Job operations
    jobs: {
        findById: async (id) => {
            const doc = await db.collection('jobs').doc(id).get();
            if (!doc.exists) return null;
            const data = doc.data();
            if (!data.isActive) return null;
            return { id: doc.id, ...data };
        },

        create: async (jobData) => {
            const docRef = await db.collection('jobs').add({
                ...jobData,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: doc.id, ...doc.data() };
        },

        update: async (id, updateData) => {
            await db.collection('jobs').doc(id).update({
                ...updateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await db.collection('jobs').doc(id).get();
            return { id: doc.id, ...doc.data() };
        },

        getAll: async (filters = {}, pagination = {}) => {
            let query = db.collection('jobs').where('isActive', '==', true);

            // Apply filters
            if (filters.type) query = query.where('type', '==', filters.type);
            if (filters.experienceLevel) query = query.where('experienceLevel', '==', filters.experienceLevel);

            // Apply sorting
            const sortBy = pagination.sortBy || 'createdAt';
            const sortOrder = pagination.sortOrder || 'desc';
            query = query.orderBy(sortBy, sortOrder);

            // Apply pagination
            if (pagination.limit) {
                query = query.limit(parseInt(pagination.limit));
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        delete: async (id) => {
            await db.collection('jobs').doc(id).update({
                isActive: false,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await db.collection('jobs').doc(id).get();
            return { id: doc.id, ...doc.data() };
        },

        getByUserId: async (userId) => {
            const snapshot = await db.collection('jobs')
                .where('postedBy', '==', userId)
                .where('isActive', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    },

    // Event operations
    events: {
        findById: async (id) => {
            const doc = await db.collection('events').doc(id).get();
            if (!doc.exists) return null;
            const data = doc.data();
            if (!data.isActive) return null;
            return { id: doc.id, ...data };
        },

        create: async (eventData) => {
            const docRef = await db.collection('events').add({
                ...eventData,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: doc.id, ...doc.data() };
        },

        update: async (id, updateData) => {
            await db.collection('events').doc(id).update({
                ...updateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await db.collection('events').doc(id).get();
            return { id: doc.id, ...doc.data() };
        },

        getAll: async (filters = {}, pagination = {}) => {
            let query = db.collection('events').where('isActive', '==', true);

            // Apply filters
            if (filters.category) query = query.where('category', '==', filters.category);

            // Apply sorting
            const sortBy = pagination.sortBy || 'eventDate';
            const sortOrder = pagination.sortOrder || 'asc';
            query = query.orderBy(sortBy, sortOrder);

            // Apply pagination
            if (pagination.limit) {
                query = query.limit(parseInt(pagination.limit));
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        delete: async (id) => {
            await db.collection('events').doc(id).update({
                isActive: false,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await db.collection('events').doc(id).get();
            return { id: doc.id, ...doc.data() };
        },

        // Event attendee operations
        addAttendee: async (eventId, userId) => {
            const attendeeRef = db.collection('events').doc(eventId)
                .collection('attendees').doc(userId);

            await attendeeRef.set({
                userId,
                attendanceStatus: 'registered',
                registeredAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const doc = await attendeeRef.get();
            return { id: doc.id, ...doc.data() };
        },

        removeAttendee: async (eventId, userId) => {
            await db.collection('events').doc(eventId)
                .collection('attendees').doc(userId).delete();
            return { eventId, userId };
        },

        getAttendees: async (eventId) => {
            const snapshot = await db.collection('events').doc(eventId)
                .collection('attendees').get();

            const attendees = [];
            for (const doc of snapshot.docs) {
                const attendeeData = doc.data();
                const userDoc = await db.collection('users').doc(attendeeData.userId).get();
                if (userDoc.exists) {
                    attendees.push({
                        id: doc.id,
                        ...attendeeData,
                        user: { id: userDoc.id, ...userDoc.data() }
                    });
                }
            }
            return attendees;
        },

        isUserAttending: async (eventId, userId) => {
            const doc = await db.collection('events').doc(eventId)
                .collection('attendees').doc(userId).get();
            return doc.exists;
        }
    },

    // Badge operations
    badges: {
        findById: async (id) => {
            const doc = await db.collection('badges').doc(id).get();
            if (!doc.exists) return null;
            const data = doc.data();
            if (!data.isActive) return null;
            return { id: doc.id, ...data };
        },

        create: async (badgeData) => {
            const docRef = await db.collection('badges').add({
                ...badgeData,
                isActive: true,
                awardedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: doc.id, ...doc.data() };
        },

        getByUserId: async (userId) => {
            const snapshot = await db.collection('badges')
                .where('userId', '==', userId)
                .where('isActive', '==', true)
                .orderBy('awardedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        getLeaderboard: async (limit = 50) => {
            // Get all verified users
            const usersSnapshot = await db.collection('users')
                .where('isDeleted', '==', false)
                .where('isEmailVerified', '==', true)
                .limit(limit)
                .get();

            const leaderboard = [];

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const badgesSnapshot = await db.collection('badges')
                    .where('userId', '==', userDoc.id)
                    .where('isActive', '==', true)
                    .get();

                const totalPoints = badgesSnapshot.docs.reduce((sum, badge) =>
                    sum + (badge.data().points || 0), 0);

                leaderboard.push({
                    id: userDoc.id,
                    ...userData,
                    totalPoints,
                    totalBadges: badgesSnapshot.size
                });
            }

            // Sort by points
            leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

            return leaderboard;
        }
    },

    // Storage operations
    storage: {
        uploadFile: async (bucket, path, buffer, contentType) => {
            const file = storage.bucket().file(path);
            await file.save(buffer, { contentType });
            return { path };
        },

        deleteFile: async (path) => {
            await storage.bucket().file(path).delete();
            return { path };
        },

        getPublicUrl: (path) => {
            return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/${path}`;
        },

        createSignedUrl: async (path, expiresIn = 3600) => {
            const [url] = await storage.bucket().file(path).getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresIn * 1000
            });
            return url;
        }
    }
};

/**
 * Verify Firebase ID token from client
 */
const verifyIdToken = async (idToken) => {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        logger.error('Error verifying Firebase ID token:', error);
        throw error;
    }
};

/**
 * Get user by UID from Firebase Auth
 */
const getUserByUid = async (uid) => {
    try {
        const userRecord = await auth.getUser(uid);
        return userRecord;
    } catch (error) {
        logger.error('Error getting user by UID:', error);
        throw error;
    }
};

module.exports = {
    admin,
    app,
    auth,
    db,
    storage,
    firebaseHelpers,
    verifyIdToken,
    getUserByUid
};
