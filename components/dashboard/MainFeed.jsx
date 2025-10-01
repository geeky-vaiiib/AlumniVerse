"use client"

import { useState, useEffect } from "react"
import PostCreator from "./PostCreator"
import FeedPost from "./FeedPost"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useUser } from "../../contexts/UserContext"
import { useAuth } from "../providers/AuthProvider"
import apiService from "../../lib/api"
import { fetchEvents } from "../../lib/api/events"
import { fetchJobs } from "../../lib/api/jobs"

// Events Section Component
function EventsSection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    const { data, error } = await fetchEvents({ limit: 20 })
    if (!error && data) {
      setEvents(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
          <Button size="sm" className="hover-glow">Create Event</Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
        <Button size="sm" className="hover-glow">Create Event</Button>
      </div>

      {events.length > 0 ? (
        events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">
                  {event.category === 'networking' ? '🌆' :
                   event.category === 'workshop' ? '💼' :
                   event.category === 'reunion' ? '🎉' : '📅'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-foreground-muted mb-3">
                        <div className="flex items-center space-x-2">
                          <span>📅</span>
                          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>🕐</span>
                          <span>{new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>📍</span>
                          <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>👤</span>
                          <span>Organized by {event.organizer?.name || 'Alumni Association'}</span>
                        </div>
                      </div>
                      <p className="text-foreground-muted text-sm mb-4">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.category === 'networking' ? 'bg-blue-100 text-blue-800' :
                          event.category === 'workshop' ? 'bg-green-100 text-green-800' :
                          event.category === 'reunion' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {event.category}
                        </span>
                        <span className="text-foreground-muted">
                          {event.attendeesCount}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attendees
                        </span>
                        <span className="font-medium text-green-600">
                          Open for Registration
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" className="hover-glow">
                        {event.isRegistered ? 'Registered' : 'Register'}
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Events Yet</h3>
            <p className="text-foreground-muted mb-4">
              Be the first to create an event for the AlumniVerse community!
            </p>
            <Button size="sm" className="hover-glow">Create First Event</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Jobs Section Component
function JobsSection() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    const { data, error } = await fetchJobs({ limit: 20 })
    if (!error && data) {
      setJobs(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Job Opportunities</h2>
          <Button size="sm" className="hover-glow">Post Job</Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Job Opportunities</h2>
        <Button size="sm" className="hover-glow">Post Job</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">💼</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        <p className="text-foreground-muted font-medium">{job.company}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.deadline && new Date(job.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            ⏰ Closing Soon
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-foreground-muted mb-3">
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💼</span>
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⏳</span>
                        <span>{job.experienceLevel || 'Any'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💰</span>
                        <span>{job.salaryRange || 'Not specified'}</span>
                      </div>
                    </div>

                    <p className="text-foreground-muted text-sm mb-3">{job.description}</p>

                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-foreground-muted">
                        <p>Posted by {job.postedBy?.name || 'Alumni'}</p>
                        <p>{new Date(job.postedDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          {job.isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Button size="sm" className="hover-glow">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Posted Yet</h3>
              <p className="text-foreground-muted mb-4">
                Be the first to post a job opportunity for the AlumniVerse community!
              </p>
              <Button size="sm" className="hover-glow">Post First Job</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Mock posts data - removed, will use Supabase data

const trendingTopics = [
  { tag: "#TechCareers", posts: 156 },
  { tag: "#Placements2024", posts: 89 },
  { tag: "#StartupLife", posts: 67 },
  { tag: "#AlumniMeet", posts: 45 },
  { tag: "#Mentorship", posts: 34 },
]

export default function MainFeed({ activeTab, userPosts = [] }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { userProfile } = useUser()
  const { session } = useAuth()

  useEffect(() => {
    if (activeTab === 'feed') {
      loadPosts()
    }
  }, [activeTab])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const token = session?.access_token
      const response = await apiService.posts.getAll({}, token)
      
      if (response.success && response.data.posts) {
        setPosts(response.data.posts)
      } else {
        // Fallback to mock data if API fails
        setPosts([
          {
            id: '1',
            author: {
              name: 'Sample Alumni',
              designation: 'Software Engineer',
              company: 'Tech Corp',
              batch: '2023',
              avatar: null
            },
            content: 'Welcome to AlumniVerse! This is a sample post to demonstrate the feed functionality.',
            timestamp: 'Just now',
            likes: 5,
            comments: 2,
            shares: 1,
            isLiked: false
          }
        ])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      // Fallback to mock data
      setPosts([
        {
          id: '1',
          author: {
            name: 'Sample Alumni',
            designation: 'Software Engineer',
            company: 'Tech Corp',
            batch: '2023',
            avatar: null
          },
          content: 'Welcome to AlumniVerse! This is a sample post to demonstrate the feed functionality.',
          timestamp: 'Just now',
          likes: 5,
          comments: 2,
          shares: 1,
          isLiked: false
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = async (newPost) => {
    try {
      // Add the new post to the feed immediately for better UX
      const optimisticPost = {
        id: Date.now().toString(),
        author: {
          name: userProfile?.firstName + ' ' + userProfile?.lastName || 'Current User',
          designation: userProfile?.designation || 'Alumni',
          company: userProfile?.currentCompany || 'Not specified',
          batch: userProfile?.passingYear || 'Not specified',
          avatar: userProfile?.avatarUrl
        },
        content: newPost.content,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false
      }
      
      setPosts(prevPosts => [optimisticPost, ...prevPosts])
      
      // Try to create via API in background
      try {
        const token = session?.access_token
        await apiService.posts.create({
          content: newPost.content,
          post_type: newPost.post_type || 'general',
          images: newPost.images || [],
          tags: newPost.tags || []
        }, token)
      } catch (apiError) {
        console.log('API creation failed, keeping optimistic update:', apiError)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLike = async (postId) => {
    try {
      // Optimistically update UI
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ))

      // Try to call API
      try {
        const token = session?.access_token
        await apiService.posts.toggleLike(postId, token)
      } catch (apiError) {
        console.log('API like failed, keeping optimistic update:', apiError)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // Render different content based on activeTab
  if (activeTab === "events") {
    return <EventsSection />
  }

  if (activeTab === "jobs") {
    return <JobsSection />
  }

  if (activeTab !== "feed") {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-foreground-muted">This section is under development.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PostCreator onPost={handleNewPost} />
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Post Creator */}
      <PostCreator onPost={handleNewPost} />

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <button
                key={topic.tag}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {topic.tag} ({topic.posts})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedPost key={post.id} post={post} onLike={handleLike} />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Posts Yet</h3>
              <p className="text-foreground-muted mb-4">
                Be the first to share something with the AlumniVerse community!
              </p>
              <p className="text-sm text-foreground-muted">
                Create a post above to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Load More - only show if there are posts */}
      {posts.length > 0 && (
        <div className="text-center py-8">
          <button
            onClick={loadPosts}
            className="px-6 py-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Refresh Posts
          </button>
        </div>
      )}
    </div>
  )
}
