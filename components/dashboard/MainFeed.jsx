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

  // Demo events data
  const demoEvents = [
    {
      id: '1',
      title: 'Annual Alumni Reunion 2024',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'SIT Main Auditorium, Tumkur',
      isVirtual: false,
      category: 'reunion',
      description: 'Join us for the biggest alumni gathering of the year! Meet old friends, network with successful alumni, and celebrate our shared legacy.',
      attendeesCount: 156,
      maxAttendees: 500,
      organizer: { name: 'Alumni Association' }
    },
    {
      id: '2',
      title: 'Tech Career Workshop - AI & ML',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Online via Zoom',
      isVirtual: true,
      category: 'workshop',
      description: 'Learn about the latest trends in AI/ML careers from Google and Microsoft engineers. Interactive Q&A session included.',
      attendeesCount: 89,
      maxAttendees: 200,
      organizer: { name: 'Career Development Cell' }
    },
    {
      id: '3',
      title: 'Startup Networking Night',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bangalore Tech Hub',
      isVirtual: false,
      category: 'networking',
      description: 'Connect with fellow alumni entrepreneurs, investors, and startup enthusiasts. Pitch your ideas and find potential co-founders!',
      attendeesCount: 45,
      maxAttendees: 100,
      organizer: { name: 'Entrepreneurship Cell' }
    }
  ]

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await fetchEvents({ limit: 20 })
      if (!error && data && data.length > 0) {
        setEvents(data)
      } else {
        setEvents(demoEvents)
      }
    } catch (error) {
      console.log('Using demo events data')
      setEvents(demoEvents)
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.category === 'networking' ? 'bg-blue-100 text-blue-800' :
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

  // Demo jobs data
  const demoJobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Google India',
      location: 'Bangalore, India',
      type: 'Full-time',
      experienceLevel: '3-5 years',
      salaryRange: '₹25L - ₹45L',
      description: 'Join our team to build next-generation cloud infrastructure. Work with cutting-edge technologies and scale products to billions of users.',
      requiredSkills: ['Python', 'Go', 'Kubernetes', 'GCP'],
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      postedBy: { name: 'Priya Sharma (2019 Batch)' }
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Microsoft',
      location: 'Hyderabad, India (Hybrid)',
      type: 'Full-time',
      experienceLevel: '2-4 years',
      salaryRange: '₹20L - ₹35L',
      description: 'Drive product strategy for Azure cloud services. Work closely with engineering teams to deliver customer value.',
      requiredSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'SQL'],
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      postedBy: { name: 'Rahul Kumar (2018 Batch)' }
    },
    {
      id: '3',
      title: 'Data Science Intern',
      company: 'Amazon',
      location: 'Remote',
      type: 'Internship',
      experienceLevel: 'Entry Level',
      salaryRange: '₹50K/month',
      description: 'Summer internship opportunity for passionate data science students. Learn from the best and work on real-world ML problems.',
      requiredSkills: ['Python', 'ML', 'Pandas', 'TensorFlow'],
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      postedBy: { name: 'Vikram Patil (2020 Batch)' }
    },
    {
      id: '4',
      title: 'Full Stack Developer',
      company: 'TechStartup.io',
      location: 'Bangalore, India',
      type: 'Full-time',
      experienceLevel: '1-3 years',
      salaryRange: '₹12L - ₹20L',
      description: 'Join an exciting early-stage startup! Work on building our MVP with React and Node.js. Equity included.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      postedBy: { name: 'Aishwarya Hegde (2018 Batch)' }
    }
  ]

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const { data, error } = await fetchJobs({ limit: 20 })
      if (!error && data && data.length > 0) {
        setJobs(data)
      } else {
        setJobs(demoJobs)
      }
    } catch (error) {
      console.log('Using demo jobs data')
      setJobs(demoJobs)
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
  const { user } = useAuth() // Firebase uses 'user' instead of 'session'

  useEffect(() => {
    if (activeTab === 'feed') {
      loadPosts()
    }
  }, [activeTab])

  // Demo posts data
  const DEMO_POSTS = [
    {
      id: '1',
      author: {
        name: 'Priya Sharma',
        designation: 'Software Engineer',
        company: 'Google',
        batch: '2021',
        avatar: null
      },
      content: '🎉 Exciting news! Just got promoted to Senior Software Engineer at Google! Thank you to all my SIT professors and batchmates who supported me throughout my journey. #SITAlumni #GoogleCareers #TechLife',
      timestamp: '2 hours ago',
      likes: 142,
      comments: 28,
      shares: 12,
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Rahul Kumar',
        designation: 'Product Manager',
        company: 'Microsoft',
        batch: '2019',
        avatar: null
      },
      content: 'Looking for passionate SIT juniors interested in UI/UX design! We have internship openings at Microsoft for summer 2024. DM me if interested! 🚀 #Internship #Microsoft #SITCareers',
      timestamp: '5 hours ago',
      likes: 89,
      comments: 45,
      shares: 32,
      isLiked: true
    },
    {
      id: '3',
      author: {
        name: 'Aishwarya Hegde',
        designation: 'Founder & CEO',
        company: 'TechStartup.io',
        batch: '2018',
        avatar: null
      },
      content: 'Proud moment! Our startup just raised $2M in seed funding! 💰 Special thanks to our investors and the SIT entrepreneurship cell for the early support. If you\'re an alumnus looking to work in an exciting startup, we\'re hiring! #StartupLife #Funding #SITStartup',
      timestamp: 'Yesterday',
      likes: 256,
      comments: 67,
      shares: 45,
      isLiked: false
    },
    {
      id: '4',
      author: {
        name: 'Vikram Patil',
        designation: 'Data Scientist',
        company: 'Amazon',
        batch: '2020',
        avatar: null
      },
      content: 'Just published my first research paper on Machine Learning! 📚 Thank you Dr. Kumar for your guidance. Check it out: "Efficient Deep Learning Models for Real-time Object Detection" #ML #Research #SITResearch',
      timestamp: '2 days ago',
      likes: 198,
      comments: 34,
      shares: 21,
      isLiked: false
    }
  ]

  const loadPosts = async () => {
    setLoading(true)
    try {
      // Dynamic import for Firestore
      const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
      const { db } = await import('../../lib/firebase')

      const postsRef = collection(db, 'posts')
      const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20))
      const snapshot = await getDocs(q)

      const firestorePosts = snapshot.docs.map(doc => {
        const data = doc.data()
        // Simple relative time formatter
        let timeString = 'Just now'
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
          const diff = (new Date() - date) / 1000 // seconds
          if (diff < 60) timeString = 'Just now'
          else if (diff < 3600) timeString = `${Math.floor(diff / 60)}m ago`
          else if (diff < 86400) timeString = `${Math.floor(diff / 3600)}h ago`
          else timeString = `${Math.floor(diff / 86400)}d ago`
        }

        return {
          id: doc.id,
          ...data,
          timestamp: timeString
        }
      })

      console.log('✅ [FEED] Loaded', firestorePosts.length, 'posts from Firestore')
      // Merge: Firestore posts first (newest), then Demo posts
      setPosts([...firestorePosts, ...DEMO_POSTS])

    } catch (error) {
      console.error('❌ [FEED] Error loading posts from Firestore:', error)
      setPosts(DEMO_POSTS)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = async (newPost) => {
    try {
      console.log('🔄 [FEED] Creating post in Firestore:', newPost)

      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../../lib/firebase')

      const postData = {
        content: newPost.content,
        author: {
          name: userProfile?.firstName + ' ' + userProfile?.lastName || user?.displayName || 'Alumni Member',
          designation: userProfile?.designation || 'Alumni',
          company: userProfile?.currentCompany || '',
          batch: userProfile?.passingYear || '',
          avatar: userProfile?.avatarUrl || user?.photoURL || null
        },
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: serverTimestamp(),
        authorId: user?.uid,
        tags: newPost.tags || []
      }

      // Optimistic update
      const optimisticPost = {
        id: Date.now().toString(),
        ...postData,
        timestamp: 'Just now'
      }
      setPosts(prevPosts => [optimisticPost, ...prevPosts])

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'posts'), postData)
      console.log('✅ [FEED] Post created successfully:', docRef.id)

    } catch (error) {
      console.error('❌ [FEED] Error creating post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  const handleLike = async (postId) => {
    // Optimistic only for now (DB sync is complex for likes without subcollections)
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
        : post
    ))
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
