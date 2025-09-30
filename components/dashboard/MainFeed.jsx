"use client"

import { useState } from "react"
import PostCreator from "./PostCreator"
import FeedPost from "./FeedPost"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"

// Events Section Component
function EventsSection() {
  const events = [
    {
      id: 1,
      title: "Alumni Tech Meetup - Bangalore",
      date: "2024-11-15",
      time: "6:00 PM - 9:00 PM",
      location: "UB City Mall, Bangalore",
      type: "Networking",
      attendees: 45,
      maxAttendees: 80,
      organizer: "Rahul Sharma (2018 Batch)",
      description: "Join us for an evening of networking with fellow tech alumni. Discussions on latest trends in AI, Cloud Computing, and Career Growth.",
      image: "🌆",
      status: "upcoming"
    },
    {
      id: 2,
      title: "Career Guidance Workshop",
      date: "2024-11-22",
      time: "2:00 PM - 5:00 PM",
      location: "Virtual (Zoom)",
      type: "Workshop",
      attendees: 120,
      maxAttendees: 200,
      organizer: "Dr. Priya Menon (Faculty)",
      description: "Interactive workshop on resume building, interview preparation, and career transitions. Featuring guest speakers from top companies.",
      image: "💼",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Annual Alumni Reunion 2024",
      date: "2024-12-20",
      time: "11:00 AM - 10:00 PM",
      location: "College Campus, Main Auditorium",
      type: "Reunion",
      attendees: 280,
      maxAttendees: 500,
      organizer: "Alumni Association",
      description: "Grand reunion celebration with cultural programs, networking sessions, achievement awards, and dinner. Reconnect with your batchmates!",
      image: "🎉",
      status: "upcoming"
    },
    {
      id: 4,
      title: "Startup Pitch Competition",
      date: "2024-10-28",
      time: "10:00 AM - 6:00 PM",
      location: "Innovation Hub, Whitefield",
      type: "Competition",
      attendees: 65,
      maxAttendees: 100,
      organizer: "Entrepreneurship Cell",
      description: "Alumni entrepreneurs pitch their startups. Winner gets mentorship and seed funding opportunities. Great networking event!",
      image: "🚀",
      status: "completed"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
        <Button size="sm" className="hover-glow">Create Event</Button>
      </div>
      
      {events.map((event) => (
        <Card key={event.id} className={event.status === 'completed' ? 'opacity-60' : ''}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{event.image}</div>
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
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>👤</span>
                        <span>Organized by {event.organizer}</span>
                      </div>
                    </div>
                    <p className="text-foreground-muted text-sm mb-4">{event.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'Networking' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'Workshop' ? 'bg-green-100 text-green-800' :
                        event.type === 'Reunion' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-foreground-muted">
                        {event.attendees}/{event.maxAttendees} attendees
                      </span>
                      <span className={`font-medium ${event.status === 'completed' ? 'text-gray-500' : 'text-green-600'}`}>
                        {event.status === 'completed' ? 'Completed' : 'Open for Registration'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {event.status !== 'completed' && (
                      <Button size="sm" className="hover-glow">
                        Register
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Jobs Section Component
function JobsSection() {
  const jobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Google",
      location: "Bangalore, India",
      type: "Full-time",
      experience: "4-6 years",
      salary: "₹25-35 LPA",
      postedBy: "Arjun Patel (2017 Batch)",
      postedDate: "2024-10-25",
      applicants: 12,
      skills: ["React", "Node.js", "Python", "AWS", "System Design"],
      description: "We're looking for a passionate Senior Software Engineer to join our Cloud Infrastructure team. You'll be working on scalable systems that serve millions of users.",
      logo: "🔍",
      status: "active",
      urgency: "high"
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Microsoft",
      location: "Hyderabad, India",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹20-28 LPA",
      postedBy: "Sneha Reddy (2016 Batch)",
      postedDate: "2024-10-23",
      applicants: 8,
      skills: ["Product Strategy", "Analytics", "User Research", "Agile", "SQL"],
      description: "Join our Office 365 team as a Product Manager. Drive product roadmap, work with engineering teams, and shape the future of productivity tools.",
      logo: "📊",
      status: "active",
      urgency: "medium"
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "Flipkart",
      location: "Bangalore, India",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹18-25 LPA",
      postedBy: "Karthik Nair (2015 Batch)",
      postedDate: "2024-10-20",
      applicants: 15,
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
      description: "Work on recommendation systems, pricing algorithms, and customer behavior analysis. Impact millions of customers with your ML models.",
      logo: "🧠",
      status: "active",
      urgency: "low"
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "Zomato",
      location: "Gurgaon, India",
      type: "Full-time",
      experience: "2-3 years",
      salary: "₹12-18 LPA",
      postedBy: "Rohit Singh (2019 Batch)",
      postedDate: "2024-10-18",
      applicants: 20,
      skills: ["React", "TypeScript", "CSS", "Redux", "Jest"],
      description: "Build beautiful and performant user interfaces for Zomato's consumer app. Work closely with design and backend teams.",
      logo: "🎨",
      status: "active",
      urgency: "medium"
    },
    {
      id: 5,
      title: "DevOps Engineer",
      company: "PayTM",
      location: "Noida, India",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹15-22 LPA",
      postedBy: "Alumni Referral Network",
      postedDate: "2024-10-15",
      applicants: 6,
      skills: ["Kubernetes", "Docker", "AWS", "Jenkins", "Terraform"],
      description: "Manage and scale infrastructure for one of India's largest fintech platforms. Work with cutting-edge technologies.",
      logo: "⚙️",
      status: "closing_soon",
      urgency: "high"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Job Opportunities</h2>
        <Button size="sm" className="hover-glow">Post Job</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{job.logo}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                      <p className="text-foreground-muted font-medium">{job.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.urgency === 'high' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          🔥 Hot
                        </span>
                      )}
                      {job.status === 'closing_soon' && (
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
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💰</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  
                  <p className="text-foreground-muted text-sm mb-3">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-foreground-muted">
                      <p>Posted by {job.postedBy}</p>
                      <p>{new Date(job.postedDate).toLocaleDateString()} • {job.applicants} applicants</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Save
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
        ))}
      </div>
    </div>
  )
}

// Badges Section Component
function BadgesSection() {
  const userBadges = [
    {
      id: 1,
      name: "Early Adopter",
      icon: "🚀",
      description: "One of the first 100 alumni to join the platform",
      earned: true,
      earnedDate: "2024-10-01",
      rarity: "legendary",
      points: 500
    },
    {
      id: 2,
      name: "Network Builder",
      icon: "🤝",
      description: "Connected with 50+ fellow alumni",
      earned: true,
      earnedDate: "2024-10-15",
      rarity: "rare",
      points: 200
    },
    {
      id: 3,
      name: "Event Enthusiast",
      icon: "🎉",
      description: "Attended 10+ alumni events",
      earned: true,
      earnedDate: "2024-10-20",
      rarity: "common",
      points: 100
    },
    {
      id: 4,
      name: "Mentor",
      icon: "👨‍🏫",
      description: "Mentored 5+ junior alumni",
      earned: false,
      progress: 2,
      target: 5,
      rarity: "epic",
      points: 300
    },
    {
      id: 5,
      name: "Job Referrer",
      icon: "💼",
      description: "Successfully referred 3+ candidates",
      earned: false,
      progress: 1,
      target: 3,
      rarity: "rare",
      points: 250
    },
    {
      id: 6,
      name: "Content Creator",
      icon: "✍️",
      description: "Published 25+ posts and articles",
      earned: false,
      progress: 12,
      target: 25,
      rarity: "uncommon",
      points: 150
    }
  ]

  const achievements = {
    totalPoints: 800,
    rank: 15,
    totalUsers: 1247,
    badgesEarned: 3,
    totalBadges: 15
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Badges & Achievements</h2>
        <div className="text-sm text-foreground-muted">
          Rank #{achievements.rank} of {achievements.totalUsers}
        </div>
      </div>

      {/* Achievement Stats */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{achievements.totalPoints}</div>
              <div className="text-sm text-foreground-muted">Total Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">#{achievements.rank}</div>
              <div className="text-sm text-foreground-muted">Global Rank</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{achievements.badgesEarned}</div>
              <div className="text-sm text-foreground-muted">Badges Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{Math.round((achievements.badgesEarned / achievements.totalBadges) * 100)}%</div>
              <div className="text-sm text-foreground-muted">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userBadges.map((badge) => (
          <Card key={badge.id} className={`transition-all duration-200 ${
            badge.earned 
              ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-lg' 
              : 'opacity-60 hover:opacity-80'
          }`}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <h3 className={`font-semibold mb-1 ${badge.earned ? 'text-foreground' : 'text-foreground-muted'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-foreground-muted mb-3 min-h-[32px]">
                  {badge.description}
                </p>
                
                <div className="space-y-2">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    badge.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {badge.rarity}
                  </div>
                  
                  {badge.earned ? (
                    <div className="text-xs text-green-600 font-medium">
                      ✅ Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs text-foreground-muted">
                        Progress: {badge.progress}/{badge.target}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs font-medium text-primary">
                    {badge.points} points
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard Preview */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">🏆 Top Contributors</h3>
          <div className="space-y-3">
            {[
              { rank: 1, name: "Arjun Patel", points: 1250, badge: "🥇" },
              { rank: 2, name: "Priya Sharma", points: 1180, badge: "🥈" },
              { rank: 3, name: "Rohit Kumar", points: 1050, badge: "🥉" },
              { rank: 4, name: "Sneha Reddy", points: 950, badge: "🏅" },
              { rank: 5, name: "You", points: 800, badge: "⭐", isCurrentUser: true }
            ].map((user) => (
              <div key={user.rank} className={`flex items-center justify-between p-2 rounded-lg ${
                user.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-hover'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{user.badge}</span>
                  <div>
                    <div className={`font-medium ${user.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                      {user.name}
                    </div>
                    <div className="text-xs text-foreground-muted">
                      Rank #{user.rank}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {user.points} pts
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Mock posts data
const mockPosts = [
  {
    id: 1,
    author: {
      name: "Priya Sharma",
      avatar: "PS",
      batch: "2020",
      company: "Google",
      designation: "Software Engineer",
    },
    content:
      "Excited to share that I've been promoted to Senior Software Engineer at Google! 🎉 Grateful for all the support from my alumni network. Looking forward to mentoring junior developers.",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    badge: "Career Milestone",
    image: null,
  },
  {
    id: 2,
    author: {
      name: "Rahul Kumar",
      avatar: "RK",
      batch: "2018",
      company: "Microsoft",
      designation: "Product Manager",
    },
    content:
      "Just launched a new feature that will impact millions of users! The journey from idea to production was incredible. Special thanks to the amazing engineering team. #ProductManagement #Microsoft",
    timestamp: "5 hours ago",
    likes: 18,
    comments: 12,
    shares: 5,
    isLiked: true,
    badge: "Achievement",
    image: null,
  },
  {
    id: 3,
    author: {
      name: "Anita Patel",
      avatar: "AP",
      batch: "2019",
      company: "TechStart Inc.",
      designation: "Founder & CEO",
    },
    content:
      "We're hiring! Looking for passionate developers to join our startup. Great opportunity for recent graduates. DM me for details. #Hiring #Startup #Opportunities",
    timestamp: "1 day ago",
    likes: 31,
    comments: 15,
    shares: 8,
    isLiked: false,
    badge: "Job Opportunity",
    image: null,
  },
]

const trendingTopics = [
  { tag: "#TechCareers", posts: 156 },
  { tag: "#Placements2024", posts: 89 },
  { tag: "#StartupLife", posts: 67 },
  { tag: "#AlumniMeet", posts: 45 },
  { tag: "#Mentorship", posts: 34 },
]

export default function MainFeed({ activeTab, userPosts = [] }) {
  const [posts, setPosts] = useState(mockPosts)
  
  // Combine user posts with mock posts
  const allPosts = [...userPosts, ...posts]

  const handleNewPost = (newPost) => {
    const post = {
      id: Date.now(),
      author: {
        name: "John Doe",
        avatar: "JD",
        batch: "2020",
        company: "Tech Corp",
        designation: "Software Engineer",
      },
      content: newPost.content,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      badge: newPost.type === "job" ? "Job Opportunity" : newPost.type === "achievement" ? "Achievement" : null,
      image: newPost.image,
    }
    setPosts([post, ...posts])
  }

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  // Render different content based on activeTab
  if (activeTab === "events") {
    return <EventsSection />
  }

  if (activeTab === "jobs") {
    return <JobsSection />
  }

  if (activeTab === "badges") {
    return <BadgesSection />
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
        {allPosts.map((post) => (
          <FeedPost key={post.id} post={post} onLike={handleLike} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <button className="px-6 py-2 text-primary hover:text-primary-hover font-medium transition-colors">
          Load More Posts
        </button>
      </div>
    </div>
  )
}
