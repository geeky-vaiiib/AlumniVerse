/**
 * Mock API for AlumniVerse Platform
 * Simulates real-time data operations with in-memory storage
 */

// In-memory data store
let dataStore = {
  alumni: [],
  jobs: [],
  events: [],
  posts: [],
  badges: [],
  leaderboard: [],
  users: [],
  notifications: []
}

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9)

// Mock data generators
const generateMockAlumni = () => [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    avatar: null,
    branch: "Computer Science",
    graduationYear: 2022,
    currentCompany: "Google",
    designation: "Software Engineer",
    location: "Bangalore, India",
    skills: ["React", "Python", "Machine Learning", "AWS"],
    linkedinUrl: "https://linkedin.com/in/priya-sharma",
    githubUrl: "https://github.com/priya-sharma",
    leetcodeUrl: "https://leetcode.com/priya-sharma",
    isVerified: true,
    connections: 234,
    isConnected: false,
    bio: "Passionate software engineer with 3+ years of experience in full-stack development.",
    achievements: ["Google Code Jam Finalist", "Open Source Contributor"],
    joinedDate: "2024-01-01",
    lastActive: "2024-01-20"
  },
  {
    id: 2,
    name: "Rahul Kumar",
    email: "rahul.kumar@example.com",
    avatar: null,
    branch: "Information Science",
    graduationYear: 2021,
    currentCompany: "Microsoft",
    designation: "Senior Developer",
    location: "Hyderabad, India",
    skills: ["Node.js", "Azure", "DevOps", "Kubernetes"],
    linkedinUrl: "https://linkedin.com/in/rahul-kumar",
    githubUrl: "https://github.com/rahul-kumar",
    isVerified: true,
    connections: 189,
    isConnected: false,
    bio: "Cloud architect and DevOps enthusiast building scalable solutions.",
    achievements: ["Microsoft MVP", "Azure Certified"],
    joinedDate: "2024-01-02",
    lastActive: "2024-01-19"
  },
  {
    id: 3,
    name: "Anita Reddy",
    email: "anita.reddy@example.com",
    avatar: null,
    branch: "Electronics & Communication",
    graduationYear: 2023,
    currentCompany: "Amazon",
    designation: "Product Manager",
    location: "Seattle, USA",
    skills: ["Product Strategy", "Analytics", "Leadership", "Agile"],
    linkedinUrl: "https://linkedin.com/in/anita-reddy",
    isVerified: true,
    connections: 156,
    isConnected: true,
    bio: "Product manager driving innovation in e-commerce and cloud services.",
    achievements: ["Product Launch Excellence", "Team Leadership Award"],
    joinedDate: "2024-01-03",
    lastActive: "2024-01-18"
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    avatar: null,
    branch: "Mechanical Engineering",
    graduationYear: 2020,
    currentCompany: "Tesla",
    designation: "Design Engineer",
    location: "California, USA",
    skills: ["CAD", "Manufacturing", "Innovation", "3D Modeling"],
    linkedinUrl: "https://linkedin.com/in/vikram-singh",
    githubUrl: "https://github.com/vikram-singh",
    isVerified: true,
    connections: 298,
    isConnected: false,
    bio: "Mechanical engineer passionate about sustainable transportation.",
    achievements: ["Innovation Award", "Patent Holder"],
    joinedDate: "2024-01-04",
    lastActive: "2024-01-17"
  },
  {
    id: 5,
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    avatar: null,
    branch: "Computer Science",
    graduationYear: 2024,
    currentCompany: "Startup Inc",
    designation: "Full Stack Developer",
    location: "Mumbai, India",
    skills: ["React", "Node.js", "MongoDB", "GraphQL"],
    linkedinUrl: "https://linkedin.com/in/sneha-patel",
    githubUrl: "https://github.com/sneha-patel",
    leetcodeUrl: "https://leetcode.com/sneha-patel",
    isVerified: false,
    connections: 67,
    isConnected: false,
    bio: "Fresh graduate excited about building innovative web applications.",
    achievements: ["Hackathon Winner", "Dean's List"],
    joinedDate: "2024-01-05",
    lastActive: "2024-01-20"
  }
]

const generateMockJobs = () => [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Google",
    companyLogo: null,
    location: "Bangalore, India",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹25-35 LPA",
    postedBy: {
      id: 1,
      name: "Priya Sharma",
      avatar: null,
      designation: "Engineering Manager"
    },
    postedDate: "2024-01-15",
    description: "We're looking for a senior software engineer to join our cloud infrastructure team. You'll work on building scalable systems that serve billions of users worldwide.",
    requirements: [
      "3+ years of experience in software development",
      "Strong knowledge of distributed systems",
      "Experience with cloud platforms (GCP, AWS, Azure)",
      "Proficiency in Go, Java, or Python"
    ],
    skills: ["React", "Node.js", "AWS", "Kubernetes"],
    applicants: 45,
    isBookmarked: false,
    isUrgent: false,
    applicationDeadline: "2024-02-15",
    benefits: ["Health Insurance", "Stock Options", "Remote Work", "Learning Budget"]
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Microsoft",
    companyLogo: null,
    location: "Hyderabad, India",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹20-30 LPA",
    postedBy: {
      id: 2,
      name: "Rahul Kumar",
      avatar: null,
      designation: "Senior Product Manager"
    },
    postedDate: "2024-01-14",
    description: "Join our Azure team to drive product strategy and execution for cloud services used by millions of developers worldwide.",
    requirements: [
      "2+ years of product management experience",
      "Strong analytical and problem-solving skills",
      "Experience with cloud technologies",
      "Excellent communication skills"
    ],
    skills: ["Product Strategy", "Analytics", "Agile", "Leadership"],
    applicants: 32,
    isBookmarked: true,
    isUrgent: true,
    applicationDeadline: "2024-02-10",
    benefits: ["Health Insurance", "Stock Options", "Flexible Hours", "Career Development"]
  },
  {
    id: 3,
    title: "Frontend Developer Intern",
    company: "Startup Inc",
    companyLogo: null,
    location: "Remote",
    type: "Internship",
    experience: "0-1 years",
    salary: "₹15-20k/month",
    postedBy: {
      id: 5,
      name: "Sneha Patel",
      avatar: null,
      designation: "Tech Lead"
    },
    postedDate: "2024-01-13",
    description: "Great opportunity for fresh graduates to work on cutting-edge web technologies and gain hands-on experience in a fast-paced startup environment.",
    requirements: [
      "Recent graduate or final year student",
      "Knowledge of React and JavaScript",
      "Understanding of HTML/CSS",
      "Eagerness to learn and grow"
    ],
    skills: ["React", "JavaScript", "CSS", "Git"],
    applicants: 78,
    isBookmarked: false,
    isUrgent: false,
    applicationDeadline: "2024-02-20",
    benefits: ["Mentorship", "Learning Opportunities", "Flexible Schedule", "Certificate"]
  }
]

const generateMockEvents = () => [
  {
    id: 1,
    title: "Alumni Tech Meetup 2024",
    type: "Meetup",
    date: "2024-02-15",
    time: "18:00",
    location: "Bangalore Tech Park",
    mode: "offline",
    organizer: {
      id: 1,
      name: "Priya Sharma",
      avatar: null,
      designation: "Software Engineer at Google"
    },
    description: "Join us for an evening of networking, tech talks, and career insights from industry leaders. Great opportunity to connect with fellow alumni and share experiences.",
    agenda: [
      "6:00 PM - Registration & Networking",
      "6:30 PM - Welcome Address",
      "7:00 PM - Tech Talks",
      "8:00 PM - Panel Discussion",
      "9:00 PM - Networking Dinner"
    ],
    maxAttendees: 100,
    currentAttendees: 67,
    isRegistered: true,
    registrationDeadline: "2024-02-10",
    tags: ["Networking", "Technology", "Career"],
    status: "upcoming",
    isPopular: true,
    ticketPrice: "Free",
    requirements: ["Valid ID", "Alumni Status Verification"]
  },
  {
    id: 2,
    title: "Web Development Workshop",
    type: "Workshop",
    date: "2024-02-20",
    time: "14:00",
    location: "Online",
    mode: "online",
    organizer: {
      id: 2,
      name: "Rahul Kumar",
      avatar: null,
      designation: "Senior Developer at Microsoft"
    },
    description: "Learn modern web development techniques with React, Node.js, and cloud deployment. Hands-on workshop with real-world projects.",
    agenda: [
      "2:00 PM - Introduction to Modern Web Dev",
      "2:30 PM - React Fundamentals",
      "3:30 PM - Backend with Node.js",
      "4:30 PM - Cloud Deployment",
      "5:30 PM - Q&A Session"
    ],
    maxAttendees: 50,
    currentAttendees: 23,
    isRegistered: false,
    registrationDeadline: "2024-02-18",
    tags: ["Workshop", "Web Development", "React"],
    status: "upcoming",
    isPopular: false,
    ticketPrice: "₹500",
    requirements: ["Laptop", "Basic Programming Knowledge"]
  }
]

const generateMockPosts = () => [
  {
    id: 1,
    author: {
      id: 1,
      name: "Priya Sharma",
      avatar: null,
      designation: "Software Engineer at Google",
      isVerified: true
    },
    content: "Excited to share that our team just launched a new feature that will impact millions of users! The journey from idea to production was incredible. Grateful for the amazing team and the learning opportunities. #TechLife #Google",
    images: [],
    links: [],
    timestamp: "2024-01-20T10:30:00Z",
    likes: 45,
    comments: [
      {
        id: 1,
        author: { name: "Rahul Kumar", avatar: null },
        content: "Congratulations! That's amazing news!",
        timestamp: "2024-01-20T11:00:00Z"
      }
    ],
    shares: 12,
    isLiked: false,
    commentCount: 8,
    tags: ["Technology", "Achievement"]
  },
  {
    id: 2,
    author: {
      id: 3,
      name: "Anita Reddy",
      avatar: null,
      designation: "Product Manager at Amazon",
      isVerified: true
    },
    content: "Just wrapped up an amazing product strategy session. The future of e-commerce is so exciting! Looking forward to sharing more insights at the upcoming alumni meetup. Who's joining? 🚀",
    images: [],
    links: [],
    timestamp: "2024-01-19T15:45:00Z",
    likes: 32,
    comments: [],
    shares: 8,
    isLiked: true,
    commentCount: 5,
    tags: ["Product", "Strategy", "Events"]
  }
]

const generateMockBadges = () => [
  {
    id: 1,
    name: "Early Adopter",
    description: "One of the first 100 members to join AlumniVerse",
    icon: "star",
    category: "Community",
    rarity: "rare",
    points: 100,
    requirement: "Join within first 100 members"
  },
  {
    id: 2,
    name: "Super Connector",
    description: "Connected with 50+ alumni",
    icon: "users",
    category: "Networking",
    rarity: "common",
    points: 50,
    requirement: "Connect with 50 alumni"
  },
  {
    id: 3,
    name: "Content Creator",
    description: "Posted 25+ helpful posts and updates",
    icon: "message-circle",
    category: "Engagement",
    rarity: "uncommon",
    points: 75,
    requirement: "Create 25 posts"
  }
]

const generateMockLeaderboard = () => [
  {
    rank: 1,
    user: { id: 1, name: "Priya Sharma", avatar: null },
    points: 2450,
    badgeCount: 12
  },
  {
    rank: 2,
    user: { id: 2, name: "Rahul Kumar", avatar: null },
    points: 2380,
    badgeCount: 11
  },
  {
    rank: 3,
    user: { id: 3, name: "Anita Reddy", avatar: null },
    points: 1890,
    badgeCount: 8
  }
]

// Initialize data store
const initializeDataStore = () => {
  dataStore.alumni = generateMockAlumni()
  dataStore.jobs = generateMockJobs()
  dataStore.events = generateMockEvents()
  dataStore.posts = generateMockPosts()
  dataStore.badges = generateMockBadges()
  dataStore.leaderboard = generateMockLeaderboard()
}

// Initialize on module load
initializeDataStore()

// Mock API functions
export const mockAPI = {
  // Alumni endpoints
  async getAlumni(filters = {}) {
    await delay(500) // Simulate network delay
    let alumni = Array.isArray(dataStore.alumni) ? [...dataStore.alumni] : []
    
    // Apply filters
    if (filters.search) {
      alumni = alumni.filter(person => 
        person.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        person.currentCompany.toLowerCase().includes(filters.search.toLowerCase()) ||
        person.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }
    
    if (filters.branch && filters.branch !== 'all') {
      alumni = alumni.filter(person => person.branch === filters.branch)
    }
    
    if (filters.year && filters.year !== 'all') {
      alumni = alumni.filter(person => person.graduationYear === parseInt(filters.year))
    }
    
    if (filters.location && filters.location !== 'all') {
      alumni = alumni.filter(person => person.location.includes(filters.location))
    }
    
    return { success: true, data: alumni }
  },

  async connectWithAlumni(alumniId) {
    await delay(300)
    const alumni = dataStore.alumni.find(person => person.id === alumniId)
    if (alumni) {
      alumni.isConnected = true
      alumni.connections += 1
      return { success: true, data: alumni }
    }
    throw new Error('Alumni not found')
  },

  // Job endpoints
  async getJobs(filters = {}) {
    await delay(400)
    let jobs = Array.isArray(dataStore.jobs) ? [...dataStore.jobs] : []
    
    // Apply filters
    if (filters.search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }
    
    if (filters.type && filters.type !== 'all') {
      jobs = jobs.filter(job => job.type === filters.type)
    }
    
    if (filters.location && filters.location !== 'all') {
      jobs = jobs.filter(job => job.location === filters.location)
    }
    
    return { success: true, data: jobs }
  },

  async createJob(jobData) {
    await delay(500)
    const newJob = {
      id: generateId(),
      ...jobData,
      postedDate: new Date().toISOString(),
      applicants: 0,
      isBookmarked: false
    }
    dataStore.jobs.unshift(newJob)
    return { success: true, data: newJob }
  },

  async toggleJobBookmark(jobId) {
    await delay(200)
    const job = dataStore.jobs.find(j => j.id === jobId)
    if (job) {
      job.isBookmarked = !job.isBookmarked
      return { success: true, data: job }
    }
    throw new Error('Job not found')
  },

  // Event endpoints
  async getEvents(filters = {}) {
    await delay(400)
    let events = Array.isArray(dataStore.events) ? [...dataStore.events] : []
    
    // Apply filters
    if (filters.search) {
      events = events.filter(event => 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }
    
    if (filters.type && filters.type !== 'all') {
      events = events.filter(event => event.type === filters.type)
    }
    
    if (filters.mode && filters.mode !== 'all') {
      events = events.filter(event => event.mode === filters.mode)
    }
    
    return { success: true, data: events }
  },

  async createEvent(eventData) {
    await delay(600)
    const newEvent = {
      id: generateId(),
      ...eventData,
      currentAttendees: 0,
      isRegistered: false,
      status: 'upcoming'
    }
    dataStore.events.unshift(newEvent)
    return { success: true, data: newEvent }
  },

  async toggleEventRegistration(eventId) {
    await delay(300)
    const event = dataStore.events.find(e => e.id === eventId)
    if (event) {
      event.isRegistered = !event.isRegistered
      event.currentAttendees += event.isRegistered ? 1 : -1
      return { success: true, data: event }
    }
    throw new Error('Event not found')
  },

  // Post endpoints
  async getPosts() {
    await delay(400)
    return { success: true, data: Array.isArray(dataStore.posts) ? [...dataStore.posts] : [] }
  },

  async createPost(postData) {
    await delay(500)
    const newPost = {
      id: generateId(),
      ...postData,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      commentCount: 0
    }
    dataStore.posts.unshift(newPost)
    return { success: true, data: newPost }
  },

  async likePost(postId) {
    await delay(200)
    const post = dataStore.posts.find(p => p.id === postId)
    if (post) {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
      return { success: true, data: post }
    }
    throw new Error('Post not found')
  },

  async addComment(postId, commentData) {
    await delay(300)
    const post = dataStore.posts.find(p => p.id === postId)
    if (post) {
      const newComment = {
        id: generateId(),
        ...commentData,
        timestamp: new Date().toISOString()
      }
      post.comments.push(newComment)
      post.commentCount += 1
      return { success: true, data: newComment }
    }
    throw new Error('Post not found')
  },

  // Badge endpoints
  async getBadges() {
    await delay(300)
    return { success: true, data: [...dataStore.badges] }
  },

  async getLeaderboard() {
    await delay(300)
    return { success: true, data: [...dataStore.leaderboard] }
  },

  // User endpoints
  async updateUserProfile(userId, profileData) {
    await delay(500)
    // In a real app, this would update the user in the database
    return { success: true, data: { id: userId, ...profileData } }
  }
}
