"use client"

import { createContext, useContext, useReducer, useEffect } from 'react'
import { mockAPI } from '../lib/mockAPI'

// Initial state
const initialState = {
  // User data
  user: null,
  isAuthenticated: false,
  
  // Alumni directory
  alumni: [],
  alumniFilters: {
    search: '',
    branch: 'all',
    year: 'all',
    location: 'all',
    skills: ''
  },
  alumniLoading: false,
  
  // Jobs
  jobs: [],
  jobFilters: {
    search: '',
    type: 'all',
    location: 'all',
    experience: 'all'
  },
  savedJobs: [],
  jobsLoading: false,
  
  // Events
  events: [],
  eventFilters: {
    search: '',
    type: 'all',
    mode: 'all',
    status: 'all'
  },
  registeredEvents: [],
  eventsLoading: false,
  
  // News Feed
  posts: [],
  postsLoading: false,
  
  // Badges
  userBadges: [],
  availableBadges: [],
  leaderboard: [],
  userStats: {
    points: 0,
    rank: 0,
    streak: 0,
    badgeCount: 0
  },
  
  // Connections
  connections: [],
  connectionRequests: [],
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // UI state
  loading: false,
  error: null,
  toast: null
}

// Action types
const actionTypes = {
  // Auth actions
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  
  // Alumni actions
  SET_ALUMNI: 'SET_ALUMNI',
  SET_ALUMNI_FILTERS: 'SET_ALUMNI_FILTERS',
  SET_ALUMNI_LOADING: 'SET_ALUMNI_LOADING',
  ADD_CONNECTION: 'ADD_CONNECTION',
  
  // Job actions
  SET_JOBS: 'SET_JOBS',
  SET_JOB_FILTERS: 'SET_JOB_FILTERS',
  SET_JOBS_LOADING: 'SET_JOBS_LOADING',
  TOGGLE_SAVED_JOB: 'TOGGLE_SAVED_JOB',
  ADD_JOB: 'ADD_JOB',
  
  // Event actions
  SET_EVENTS: 'SET_EVENTS',
  SET_EVENT_FILTERS: 'SET_EVENT_FILTERS',
  SET_EVENTS_LOADING: 'SET_EVENTS_LOADING',
  TOGGLE_EVENT_REGISTRATION: 'TOGGLE_EVENT_REGISTRATION',
  ADD_EVENT: 'ADD_EVENT',
  
  // Post actions
  SET_POSTS: 'SET_POSTS',
  SET_POSTS_LOADING: 'SET_POSTS_LOADING',
  ADD_POST: 'ADD_POST',
  LIKE_POST: 'LIKE_POST',
  ADD_COMMENT: 'ADD_COMMENT',
  
  // Badge actions
  SET_USER_BADGES: 'SET_USER_BADGES',
  SET_AVAILABLE_BADGES: 'SET_AVAILABLE_BADGES',
  SET_LEADERBOARD: 'SET_LEADERBOARD',
  UPDATE_USER_STATS: 'UPDATE_USER_STATS',
  EARN_BADGE: 'EARN_BADGE',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // UI actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TOAST: 'SET_TOAST',
  CLEAR_TOAST: 'CLEAR_TOAST'
}

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      }
    
    case actionTypes.LOGOUT:
      return {
        ...initialState
      }
    
    case actionTypes.SET_ALUMNI:
      return {
        ...state,
        alumni: Array.isArray(action.payload) ? action.payload : [],
        alumniLoading: false
      }
    
    case actionTypes.SET_ALUMNI_FILTERS:
      return {
        ...state,
        alumniFilters: { ...state.alumniFilters, ...action.payload }
      }
    
    case actionTypes.SET_ALUMNI_LOADING:
      return {
        ...state,
        alumniLoading: action.payload
      }
    
    case actionTypes.ADD_CONNECTION:
      return {
        ...state,
        connections: [...(Array.isArray(state.connections) ? state.connections : []), action.payload],
        alumni: Array.isArray(state.alumni) ? state.alumni.map(person =>
          person.id === action.payload.id
            ? { ...person, isConnected: true, connections: (person.connections || 0) + 1 }
            : person
        ) : []
      }
    
    case actionTypes.SET_JOBS:
      return {
        ...state,
        jobs: Array.isArray(action.payload) ? action.payload : [],
        jobsLoading: false
      }
    
    case actionTypes.SET_JOB_FILTERS:
      return {
        ...state,
        jobFilters: { ...state.jobFilters, ...action.payload }
      }
    
    case actionTypes.SET_JOBS_LOADING:
      return {
        ...state,
        jobsLoading: action.payload
      }
    
    case actionTypes.TOGGLE_SAVED_JOB:
      const jobId = action.payload
      const isSaved = state.savedJobs.includes(jobId)
      return {
        ...state,
        savedJobs: isSaved 
          ? state.savedJobs.filter(id => id !== jobId)
          : [...state.savedJobs, jobId],
        jobs: Array.isArray(state.jobs) ? state.jobs.map(job =>
          job.id === jobId
            ? { ...job, isBookmarked: !job.isBookmarked }
            : job
        ) : []
      }
    
    case actionTypes.ADD_JOB:
      return {
        ...state,
        jobs: [action.payload, ...(Array.isArray(state.jobs) ? state.jobs : [])]
      }
    
    case actionTypes.SET_EVENTS:
      return {
        ...state,
        events: Array.isArray(action.payload) ? action.payload : [],
        eventsLoading: false
      }
    
    case actionTypes.SET_EVENT_FILTERS:
      return {
        ...state,
        eventFilters: { ...state.eventFilters, ...action.payload }
      }
    
    case actionTypes.SET_EVENTS_LOADING:
      return {
        ...state,
        eventsLoading: action.payload
      }
    
    case actionTypes.TOGGLE_EVENT_REGISTRATION:
      const eventId = action.payload
      const isRegistered = state.registeredEvents.includes(eventId)
      return {
        ...state,
        registeredEvents: isRegistered
          ? state.registeredEvents.filter(id => id !== eventId)
          : [...state.registeredEvents, eventId],
        events: Array.isArray(state.events) ? state.events.map(event =>
          event.id === eventId
            ? {
                ...event,
                isRegistered: !event.isRegistered,
                currentAttendees: event.isRegistered
                  ? (event.currentAttendees || 0) - 1
                  : (event.currentAttendees || 0) + 1
              }
            : event
        ) : []
      }
    
    case actionTypes.ADD_EVENT:
      return {
        ...state,
        events: [action.payload, ...(Array.isArray(state.events) ? state.events : [])]
      }
    
    case actionTypes.SET_POSTS:
      return {
        ...state,
        posts: Array.isArray(action.payload) ? action.payload : [],
        postsLoading: false
      }
    
    case actionTypes.SET_POSTS_LOADING:
      return {
        ...state,
        postsLoading: action.payload
      }
    
    case actionTypes.ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...(Array.isArray(state.posts) ? state.posts : [])]
      }
    
    case actionTypes.LIKE_POST:
      return {
        ...state,
        posts: Array.isArray(state.posts) ? state.posts.map(post =>
          post.id === action.payload
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        ) : []
      }
    
    case actionTypes.ADD_COMMENT:
      return {
        ...state,
        posts: Array.isArray(state.posts) ? state.posts.map(post =>
          post.id === action.payload.postId
            ? {
                ...post,
                comments: [...(Array.isArray(post.comments) ? post.comments : []), action.payload.comment],
                commentCount: (post.commentCount || 0) + 1
              }
            : post
        ) : []
      }
    
    case actionTypes.SET_USER_BADGES:
      return {
        ...state,
        userBadges: action.payload
      }
    
    case actionTypes.SET_AVAILABLE_BADGES:
      return {
        ...state,
        availableBadges: action.payload
      }
    
    case actionTypes.SET_LEADERBOARD:
      return {
        ...state,
        leaderboard: action.payload
      }
    
    case actionTypes.UPDATE_USER_STATS:
      return {
        ...state,
        userStats: { ...state.userStats, ...action.payload }
      }
    
    case actionTypes.EARN_BADGE:
      return {
        ...state,
        userBadges: [...state.userBadges, action.payload],
        userStats: {
          ...state.userStats,
          badgeCount: state.userStats.badgeCount + 1,
          points: state.userStats.points + action.payload.points
        }
      }
    
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...(Array.isArray(state.notifications) ? state.notifications : [])],
        unreadCount: (state.unreadCount || 0) + 1
      }
    
    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: Array.isArray(state.notifications) ? state.notifications.map(notif =>
          notif.id === action.payload
            ? { ...notif, read: true }
            : notif
        ) : [],
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    
    case actionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    case actionTypes.SET_TOAST:
      return {
        ...state,
        toast: action.payload
      }
    
    case actionTypes.CLEAR_TOAST:
      return {
        ...state,
        toast: null
      }
    
    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize data on mount
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      
      // Load initial data
      const [alumni, jobs, events, posts, badges, leaderboard] = await Promise.all([
        mockAPI.getAlumni(),
        mockAPI.getJobs(),
        mockAPI.getEvents(),
        mockAPI.getPosts(),
        mockAPI.getBadges(),
        mockAPI.getLeaderboard()
      ])
      
      dispatch({ type: actionTypes.SET_ALUMNI, payload: alumni })
      dispatch({ type: actionTypes.SET_JOBS, payload: jobs })
      dispatch({ type: actionTypes.SET_EVENTS, payload: events })
      dispatch({ type: actionTypes.SET_POSTS, payload: posts })
      dispatch({ type: actionTypes.SET_AVAILABLE_BADGES, payload: badges })
      dispatch({ type: actionTypes.SET_LEADERBOARD, payload: leaderboard })
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
    }
  }

  const value = {
    state,
    dispatch,
    actionTypes
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { actionTypes }
