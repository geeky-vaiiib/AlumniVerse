"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter,
  Search,
  ExternalLink,
  Video,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

// Mock events data
const mockEvents = [
  {
    id: 1,
    title: "Alumni Tech Meetup 2024",
    type: "Meetup",
    date: "2024-02-15",
    time: "18:00",
    location: "Bangalore Tech Park",
    mode: "offline",
    organizer: {
      name: "Priya Sharma",
      avatar: null,
      designation: "Software Engineer at Google"
    },
    description: "Join us for an evening of networking, tech talks, and career insights from industry leaders.",
    maxAttendees: 100,
    currentAttendees: 67,
    isRegistered: true,
    registrationDeadline: "2024-02-10",
    tags: ["Networking", "Technology", "Career"],
    status: "upcoming",
    isPopular: true
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
      name: "Rahul Kumar",
      avatar: null,
      designation: "Senior Developer at Microsoft"
    },
    description: "Learn modern web development techniques with React, Node.js, and cloud deployment.",
    maxAttendees: 50,
    currentAttendees: 23,
    isRegistered: false,
    registrationDeadline: "2024-02-18",
    tags: ["Workshop", "Web Development", "React"],
    status: "upcoming",
    isPopular: false
  },
  {
    id: 3,
    title: "Annual Alumni Reunion",
    type: "Reunion",
    date: "2024-03-15",
    time: "10:00",
    location: "SIT Campus, Tumkur",
    mode: "offline",
    organizer: {
      name: "Alumni Association",
      avatar: null,
      designation: "Official"
    },
    description: "Celebrate memories, reconnect with classmates, and create new bonds at our annual reunion.",
    maxAttendees: 500,
    currentAttendees: 234,
    isRegistered: true,
    registrationDeadline: "2024-03-10",
    tags: ["Reunion", "Networking", "Campus"],
    status: "upcoming",
    isPopular: true
  },
  {
    id: 4,
    title: "AI/ML Career Webinar",
    type: "Webinar",
    date: "2024-01-10",
    time: "19:00",
    location: "Zoom",
    mode: "online",
    organizer: {
      name: "Anita Reddy",
      avatar: null,
      designation: "Data Scientist at Amazon"
    },
    description: "Insights into AI/ML career paths, required skills, and industry trends.",
    maxAttendees: 200,
    currentAttendees: 156,
    isRegistered: true,
    registrationDeadline: "2024-01-08",
    tags: ["AI/ML", "Career", "Webinar"],
    status: "completed",
    isPopular: false
  },
  {
    id: 5,
    title: "Startup Pitch Competition",
    type: "Competition",
    date: "2024-02-25",
    time: "09:00",
    location: "Innovation Hub, Bangalore",
    mode: "offline",
    organizer: {
      name: "Vikram Singh",
      avatar: null,
      designation: "Entrepreneur"
    },
    description: "Present your startup ideas to a panel of investors and industry experts.",
    maxAttendees: 30,
    currentAttendees: 18,
    isRegistered: false,
    registrationDeadline: "2024-02-20",
    tags: ["Startup", "Competition", "Innovation"],
    status: "upcoming",
    isPopular: true
  }
]

export default function EventsPage() {
  const [events, setEvents] = useState(mockEvents)
  const [filteredEvents, setFilteredEvents] = useState(mockEvents)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMode, setSelectedMode] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const eventTypes = [...new Set(events.map(event => event.type))]
  const eventModes = [...new Set(events.map(event => event.mode))]

  // Filter events based on tab, search, and filters
  useEffect(() => {
    let filtered = events

    // Tab filter
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => event.status === 'upcoming')
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => event.status === 'completed')
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType)
    }

    // Mode filter
    if (selectedMode !== 'all') {
      filtered = filtered.filter(event => event.mode === selectedMode)
    }

    setFilteredEvents(filtered)
  }, [activeTab, searchTerm, selectedType, selectedMode, events])

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-green-400'
      case 'completed': return 'text-gray-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getEventStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getAttendancePercentage = (current, max) => {
    return Math.round((current / max) * 100)
  }

  const handleRegister = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isRegistered: !event.isRegistered,
            currentAttendees: event.isRegistered 
              ? event.currentAttendees - 1 
              : event.currentAttendees + 1
          }
        : event
    ))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedType('all')
    setSelectedMode('all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Events & Reunions</h2>
          <p className="text-[#B0B0B0]">Discover and join alumni events, workshops, and reunions</p>
        </div>
        <Button className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#2D2D2D] p-1 rounded-lg">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'past', label: 'Past Events' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id 
              ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white" 
              : "text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D]"
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#3D3D3D] border border-[#4D4D4D] rounded-md text-white placeholder-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#3D3D3D] border border-[#4D4D4D] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-[#3D3D3D] border border-[#4D4D4D] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            {(searchTerm || selectedType !== 'all' || selectedMode !== 'all') && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-[#2D2D2D] border-[#3D3D3D] hover:border-[#4A90E2] transition-colors">
            <CardContent className="p-6">
              {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                    {event.isPopular && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="outline"
                      className="border-[#4A90E2] text-[#4A90E2]"
                    >
                      {event.type}
                    </Badge>
                    <div className={`flex items-center space-x-1 ${getEventStatusColor(event.status)}`}>
                      {getEventStatusIcon(event.status)}
                      <span className="text-sm capitalize">{event.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-[#B0B0B0]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-sm text-[#B0B0B0]">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-[#B0B0B0]">
                  {event.mode === 'online' ? (
                    <Video className="w-4 h-4 mr-2" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  <span>{event.location}</span>
                  {event.mode === 'online' && (
                    <Badge variant="outline" className="ml-2 border-green-500 text-green-400">
                      Online
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-[#B0B0B0] text-sm mb-4 line-clamp-2">{event.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="border-[#4D4D4D] text-[#B0B0B0] text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Organizer */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                  <AvatarFallback className="bg-[#4A90E2] text-white text-xs">
                    {getInitials(event.organizer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-white">Organized by {event.organizer.name}</p>
                  <p className="text-xs text-[#B0B0B0]">{event.organizer.designation}</p>
                </div>
              </div>

              {/* Attendance Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-[#B0B0B0]">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{event.currentAttendees}/{event.maxAttendees} attendees</span>
                  </div>
                  <span className="text-sm text-[#4A90E2]">
                    {getAttendancePercentage(event.currentAttendees, event.maxAttendees)}%
                  </span>
                </div>
                <div className="w-full bg-[#3D3D3D] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getAttendancePercentage(event.currentAttendees, event.maxAttendees)}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                
                {event.status === 'upcoming' && (
                  <Button
                    onClick={() => handleRegister(event.id)}
                    className={event.isRegistered 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                    }
                  >
                    {event.isRegistered ? 'Registered' : 'Register'}
                  </Button>
                )}
                
                {event.status === 'completed' && (
                  <Button
                    variant="outline"
                    className="bg-transparent border-[#4D4D4D] text-[#B0B0B0] cursor-not-allowed"
                    disabled
                  >
                    Event Ended
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-[#B0B0B0] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
            <p className="text-[#B0B0B0] mb-4">Try adjusting your search criteria or filters</p>
            <Button
              onClick={clearFilters}
              className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
