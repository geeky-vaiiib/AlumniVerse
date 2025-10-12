// Mock API for development and testing
export const mockAPI = {
  // Get alumni data
  getAlumni: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'John Doe',
            designation: 'Software Engineer',
            company: 'Google',
            batch: '2020',
            branch: 'Computer Science',
            location: 'Bangalore',
            avatar: 'JD',
            isConnected: false,
            connections: 150,
            skills: ['React', 'Node.js', 'Python'],
            linkedinUrl: 'https://linkedin.com/in/johndoe',
            githubUrl: 'https://github.com/johndoe'
          },
          {
            id: '2',
            name: 'Sarah Chen',
            designation: 'Product Manager',
            company: 'Microsoft',
            batch: '2019',
            branch: 'Information Technology',
            location: 'Seattle',
            avatar: 'SC',
            isConnected: true,
            connections: 200,
            skills: ['Product Strategy', 'Agile', 'Data Analysis'],
            linkedinUrl: 'https://linkedin.com/in/sarahchen',
            githubUrl: null
          },
          {
            id: '3',
            name: 'Raj Patel',
            designation: 'Data Scientist',
            company: 'Amazon',
            batch: '2021',
            branch: 'Electronics',
            location: 'Hyderabad',
            avatar: 'RP',
            isConnected: false,
            connections: 89,
            skills: ['Machine Learning', 'Python', 'SQL'],
            linkedinUrl: 'https://linkedin.com/in/rajpatel',
            githubUrl: 'https://github.com/rajpatel'
          }
        ])
      }, 500)
    })
  },

  // Get jobs data
  getJobs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'Bangalore',
            type: 'Full-time',
            experience: '3-5 years',
            description: 'Looking for an experienced software engineer to join our team...',
            requirements: ['React', 'Node.js', 'MongoDB'],
            salary: '₹15-25 LPA',
            postedBy: { name: 'Alumni Recruiter', id: '101' },
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isBookmarked: false,
            applicants: 23
          },
          {
            id: '2',
            title: 'Product Manager',
            company: 'Startup Inc',
            location: 'Remote',
            type: 'Full-time',
            experience: '2-4 years',
            description: 'Join our growing startup as a Product Manager...',
            requirements: ['Product Strategy', 'Analytics', 'Communication'],
            salary: '₹20-30 LPA',
            postedBy: { name: 'Hiring Manager', id: '102' },
            postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            isBookmarked: true,
            applicants: 45
          }
        ])
      }, 400)
    })
  },

  // Get events data
  getEvents: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Alumni Networking Meet',
            description: 'Join us for an evening of networking and catching up with fellow alumni...',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
            location: 'Bangalore Tech Park',
            venue: 'Conference Hall A',
            type: 'networking',
            mode: 'offline',
            organizer: { name: 'Alumni Association', id: '201' },
            maxAttendees: 100,
            currentAttendees: 45,
            isRegistered: false,
            registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ['networking', 'career', 'alumni']
          },
          {
            id: '2',
            title: 'Tech Talk: AI in Healthcare',
            description: 'Explore the latest developments in AI applications for healthcare...',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            location: 'Online',
            venue: 'Zoom Meeting',
            type: 'workshop',
            mode: 'online',
            organizer: { name: 'Tech Society', id: '202' },
            maxAttendees: 200,
            currentAttendees: 120,
            isRegistered: true,
            registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ['technology', 'AI', 'healthcare']
          }
        ])
      }, 600)
    })
  },

  // Get posts data
  getPosts: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            author: {
              name: 'John Doe',
              designation: 'Software Engineer',
              company: 'Google',
              batch: '2020',
              avatar: 'JD'
            },
            content: 'Excited to share that I just completed my first year at Google! The journey has been incredible so far.',
            type: 'achievement',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 15,
            comments: 3,
            shares: 2,
            isLiked: false,
            tags: ['career', 'milestone']
          },
          {
            id: '2',
            author: {
              name: 'Sarah Chen',
              designation: 'Product Manager',
              company: 'Microsoft',
              batch: '2019',
              avatar: 'SC'
            },
            content: 'Looking for talented developers to join our team. We\'re working on some exciting projects in cloud computing!',
            type: 'job',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            likes: 8,
            comments: 5,
            shares: 12,
            isLiked: true,
            tags: ['hiring', 'cloud', 'development']
          }
        ])
      }, 300)
    })
  },

  // Get badges data
  getBadges: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Early Adopter',
            description: 'One of the first 100 users to join the platform',
            icon: '🚀',
            rarity: 'rare',
            points: 50,
            earned: true,
            earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: 'Networking Pro',
            description: 'Connected with 50+ alumni',
            icon: '🤝',
            rarity: 'common',
            points: 25,
            earned: false,
            progress: { current: 23, target: 50 }
          },
          {
            id: '3',
            name: 'Content Creator',
            description: 'Created 10+ posts',
            icon: '✍️',
            rarity: 'common',
            points: 20,
            earned: false,
            progress: { current: 3, target: 10 }
          }
        ])
      }, 400)
    })
  },

  // Get leaderboard data
  getLeaderboard: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            rank: 1,
            name: 'Sarah Chen',
            batch: '2019',
            branch: 'IT',
            points: 450,
            badges: 12,
            avatar: 'SC'
          },
          {
            id: '2',
            rank: 2,
            name: 'John Doe',
            batch: '2020',
            branch: 'CSE',
            points: 380,
            badges: 8,
            avatar: 'JD'
          },
          {
            id: '3',
            rank: 3,
            name: 'Raj Patel',
            batch: '2021',
            branch: 'ECE',
            points: 320,
            badges: 6,
            avatar: 'RP'
          }
        ])
      }, 350)
    })
  }
}