"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { useAlumni, useJobs, useEvents, usePosts, useToast, useNotifications } from "../../hooks/useRealTime"
import { 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Bell, 
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  UserPlus,
  Loader2
} from "lucide-react"

export default function DynamicTestPage() {
  const { alumni, alumniFilters, updateFilters: updateAlumniFilters, connectWithAlumni } = useAlumni()
  const { jobs, jobFilters, updateFilters: updateJobFilters, toggleSavedJob, createJob } = useJobs()
  const { events, eventFilters, updateFilters: updateEventFilters, toggleEventRegistration, createEvent } = useEvents()
  const { posts, createPost, likePost, addComment } = usePosts()
  const { showToast } = useToast()
  const { notifications, addNotification, markAsRead, clearAll } = useNotifications()

  const [testData, setTestData] = useState({
    newPost: '',
    newJob: { title: '', company: '', location: '' },
    newEvent: { title: '', date: '', location: '' },
    comment: ''
  })

  const handleTestConnection = async () => {
    if (alumni.length > 0) {
      const randomAlumni = alumni[Math.floor(Math.random() * alumni.length)]
      await connectWithAlumni(randomAlumni.id)
    }
  }

  const handleTestJobSave = async () => {
    if (jobs.length > 0) {
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)]
      await toggleSavedJob(randomJob.id)
    }
  }

  const handleTestEventRegistration = async () => {
    if (events.length > 0) {
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      await toggleEventRegistration(randomEvent.id)
    }
  }

  const handleTestPost = async () => {
    if (testData.newPost.trim()) {
      await createPost({
        author: {
          id: 'test-user',
          name: 'Test User',
          avatar: null,
          designation: 'Test Alumni',
          isVerified: true
        },
        content: testData.newPost,
        images: [],
        links: [],
        tags: ['test', 'dynamic']
      })
      setTestData(prev => ({ ...prev, newPost: '' }))
    }
  }

  const handleTestLike = async () => {
    if (posts.length > 0) {
      const randomPost = posts[Math.floor(Math.random() * posts.length)]
      await likePost(randomPost.id)
    }
  }

  const handleTestComment = async () => {
    if (posts.length > 0 && testData.comment.trim()) {
      const randomPost = posts[Math.floor(Math.random() * posts.length)]
      await addComment(randomPost.id, {
        author: {
          id: 'test-user',
          name: 'Test User',
          avatar: null
        },
        content: testData.comment
      })
      setTestData(prev => ({ ...prev, comment: '' }))
    }
  }

  const handleTestJobCreation = async () => {
    if (testData.newJob.title && testData.newJob.company && testData.newJob.location) {
      await createJob({
        ...testData.newJob,
        type: 'Full-time',
        experience: '2-4 years',
        salary: '₹20-30 LPA',
        description: 'Test job created dynamically',
        requirements: ['Test requirement'],
        skills: ['React', 'JavaScript'],
        postedBy: {
          id: 'test-user',
          name: 'Test User',
          avatar: null,
          designation: 'Test Alumni'
        }
      })
      setTestData(prev => ({ ...prev, newJob: { title: '', company: '', location: '' } }))
    }
  }

  const handleTestEventCreation = async () => {
    if (testData.newEvent.title && testData.newEvent.date && testData.newEvent.location) {
      await createEvent({
        ...testData.newEvent,
        type: 'Meetup',
        time: '18:00',
        mode: 'offline',
        organizer: {
          id: 'test-user',
          name: 'Test User',
          avatar: null,
          designation: 'Test Alumni'
        },
        description: 'Test event created dynamically',
        maxAttendees: 50,
        tags: ['test', 'networking']
      })
      setTestData(prev => ({ ...prev, newEvent: { title: '', date: '', location: '' } }))
    }
  }

  const handleTestToast = (type) => {
    showToast({
      type,
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a test ${type} notification to demonstrate real-time toast functionality.`
    })
  }

  const handleTestNotification = () => {
    addNotification({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification to demonstrate real-time updates.',
      icon: 'bell'
    })
  }

  const handleTestSearch = (section, query) => {
    switch (section) {
      case 'alumni':
        updateAlumniFilters({ search: query })
        break
      case 'jobs':
        updateJobFilters({ search: query })
        break
      case 'events':
        updateEventFilters({ search: query })
        break
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">AlumniVerse Dynamic Features Test</h1>
          <p className="text-[#B0B0B0] text-lg">
            Test all real-time dynamic features of the AlumniVerse platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-[#4A90E2]" />
                <div>
                  <p className="text-2xl font-bold text-white">{alumni.length}</p>
                  <p className="text-[#B0B0B0]">Alumni</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{jobs.length}</p>
                  <p className="text-[#B0B0B0]">Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{events.length}</p>
                  <p className="text-[#B0B0B0]">Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{posts.length}</p>
                  <p className="text-[#B0B0B0]">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Action Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alumni Tests */}
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Alumni Directory Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search alumni..."
                  value={alumniFilters.search}
                  onChange={(e) => handleTestSearch('alumni', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                />
                <p className="text-sm text-[#B0B0B0]">
                  Current search: "{alumniFilters.search}" | Results: {alumni.length}
                </p>
              </div>
              
              <Button
                onClick={handleTestConnection}
                className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Test Random Connection
              </Button>
            </CardContent>
          </Card>

          {/* Job Tests */}
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Job Board Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search jobs..."
                  value={jobFilters.search}
                  onChange={(e) => handleTestSearch('jobs', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                />
                <p className="text-sm text-[#B0B0B0]">
                  Current search: "{jobFilters.search}" | Results: {jobs.length}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Job title"
                  value={testData.newJob.title}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    newJob: { ...prev.newJob, title: e.target.value }
                  }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white text-sm"
                />
                <Input
                  placeholder="Company"
                  value={testData.newJob.company}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    newJob: { ...prev.newJob, company: e.target.value }
                  }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white text-sm"
                />
                <Input
                  placeholder="Location"
                  value={testData.newJob.location}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    newJob: { ...prev.newJob, location: e.target.value }
                  }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleTestJobSave}
                  variant="outline"
                  className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Test Save Job
                </Button>
                <Button
                  onClick={handleTestJobCreation}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Job
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Tests */}
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Events Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search events..."
                  value={eventFilters.search}
                  onChange={(e) => handleTestSearch('events', e.target.value)}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                />
                <p className="text-sm text-[#B0B0B0]">
                  Current search: "{eventFilters.search}" | Results: {events.length}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Event title"
                  value={testData.newEvent.title}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    newEvent: { ...prev.newEvent, title: e.target.value }
                  }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white text-sm"
                />
                <Input
                  type="date"
                  value={testData.newEvent.date}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    newEvent: { ...prev.newEvent, date: e.target.value }
                  }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white text-sm"
                />
                <Input
                  placeholder="Location"
                  value={testData.newEvent.location}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    newEvent: { ...prev.newEvent, location: e.target.value }
                  }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleTestEventRegistration}
                  variant="outline"
                  className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Test Registration
                </Button>
                <Button
                  onClick={handleTestEventCreation}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Tests */}
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                News Feed Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Write a test post..."
                  value={testData.newPost}
                  onChange={(e) => setTestData(prev => ({ ...prev, newPost: e.target.value }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                />
                <Button
                  onClick={handleTestPost}
                  className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Post
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Write a test comment..."
                  value={testData.comment}
                  onChange={(e) => setTestData(prev => ({ ...prev, comment: e.target.value }))}
                  className="bg-[#3D3D3D] border-[#4D4D4D] text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleTestLike}
                    variant="outline"
                    className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Test Like
                  </Button>
                  <Button
                    onClick={handleTestComment}
                    variant="outline"
                    className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Test Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Tests */}
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification & Toast Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleTestToast('success')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Success Toast
              </Button>
              <Button
                onClick={() => handleTestToast('error')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Error Toast
              </Button>
              <Button
                onClick={() => handleTestToast('warning')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Warning Toast
              </Button>
              <Button
                onClick={() => handleTestToast('info')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Info Toast
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                onClick={handleTestNotification}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Add Test Notification
              </Button>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-[#4A90E2] text-[#4A90E2]">
                  {notifications.length} Notifications
                </Badge>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardHeader>
            <CardTitle className="text-white">How to Test Dynamic Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#B0B0B0]">
              <div>
                <h4 className="font-semibold text-white mb-2">Real-time Search & Filtering</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Type in search boxes to see instant filtering</li>
                  <li>• Results update immediately as you type</li>
                  <li>• Search works across names, companies, skills</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Dynamic Content Creation</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Create posts, jobs, events in real-time</li>
                  <li>• Content appears immediately in feeds</li>
                  <li>• All interactions update state instantly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Interactive Actions</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Like, comment, share posts</li>
                  <li>• Connect with alumni</li>
                  <li>• Save jobs and register for events</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Real-time Notifications</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Toast notifications for all actions</li>
                  <li>• Persistent notification system</li>
                  <li>• Auto-clearing and manual management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
