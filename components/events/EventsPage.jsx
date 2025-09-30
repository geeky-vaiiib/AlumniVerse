"use client"

import { useState, useEffect } from "react"
import EventsSidebar from "./EventsSidebar"
import EventsGrid from "./EventsGrid"
import CreateEventModal from "./CreateEventModal"
import { Button } from "../ui/button"

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    timeframe: "all",
    status: "all",
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all") // all, registered, hosting

  // Mock events data
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: "Annual Tech Reunion 2024",
        category: "Reunions",
        date: "2024-03-15",
        time: "18:00",
        location: "SIT Campus, Tumkur",
        organizer: {
          name: "Alumni Association",
          avatar: "/organizer-1.jpg",
        },
        description:
          "Join us for the biggest tech reunion of the year! Connect with fellow alumni, share experiences, and network.",
        attendees: 245,
        maxAttendees: 300,
        isVirtual: false,
        registrationDeadline: "2024-03-10",
        tags: ["networking", "reunion", "tech"],
        status: "upcoming",
        image: "/event-reunion.jpg",
      },
      {
        id: 2,
        title: "Web Development Workshop",
        category: "Workshops",
        date: "2024-02-20",
        time: "14:00",
        location: "Online",
        organizer: {
          name: "Rahul Sharma",
          batch: "2019",
          avatar: "/rahul-sharma.jpg",
        },
        description:
          "Learn modern web development techniques with React, Next.js, and TypeScript from industry experts.",
        attendees: 89,
        maxAttendees: 100,
        isVirtual: true,
        registrationDeadline: "2024-02-18",
        tags: ["workshop", "web-dev", "react"],
        status: "upcoming",
        image: "/event-workshop.jpg",
      },
      {
        id: 3,
        title: "Career Guidance Webinar",
        category: "Webinars",
        date: "2024-02-25",
        time: "19:00",
        location: "Zoom",
        organizer: {
          name: "Priya Patel",
          batch: "2018",
          avatar: "/priya-patel.jpg",
        },
        description:
          "Get insights on career transitions, interview preparation, and industry trends from senior professionals.",
        attendees: 156,
        maxAttendees: 200,
        isVirtual: true,
        registrationDeadline: "2024-02-23",
        tags: ["career", "guidance", "webinar"],
        status: "upcoming",
        image: "/event-webinar.jpg",
      },
      {
        id: 4,
        title: "Bangalore Alumni Meetup",
        category: "Meetups",
        date: "2024-01-28",
        time: "16:00",
        location: "Koramangala, Bangalore",
        organizer: {
          name: "Arjun Kumar",
          batch: "2020",
          avatar: "/arjun-kumar.jpg",
        },
        description: "Casual meetup for Bangalore-based alumni. Great opportunity to network and catch up over coffee.",
        attendees: 34,
        maxAttendees: 50,
        isVirtual: false,
        registrationDeadline: "2024-01-26",
        tags: ["meetup", "bangalore", "networking"],
        status: "past",
        image: "/event-meetup.jpg",
      },
      {
        id: 5,
        title: "Startup Pitch Competition",
        category: "Competitions",
        date: "2024-03-05",
        time: "10:00",
        location: "SIT Innovation Hub",
        organizer: {
          name: "Innovation Cell",
          avatar: "/innovation-cell.jpg",
        },
        description:
          "Present your startup ideas to a panel of investors and industry experts. Win funding and mentorship!",
        attendees: 67,
        maxAttendees: 80,
        isVirtual: false,
        registrationDeadline: "2024-03-01",
        tags: ["startup", "competition", "innovation"],
        status: "upcoming",
        image: "/event-competition.jpg",
      },
    ]
    setEvents(mockEvents)
    setFilteredEvents(mockEvents)
  }, [])

  // Filter events
  useEffect(() => {
    let filtered = events

    if (activeTab === "registered") {
      // In real app, filter by user's registered events
      filtered = events.slice(0, 2)
    } else if (activeTab === "hosting") {
      // In real app, filter by events user is hosting
      filtered = events.slice(0, 1)
    }

    if (filters.search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase())),
      )
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((event) => event.category.toLowerCase() === filters.category)
    }

    if (filters.timeframe !== "all") {
      const now = new Date()
      const eventDate = new Date()

      filtered = filtered.filter((event) => {
        const eDate = new Date(event.date)
        switch (filters.timeframe) {
          case "this-week": {
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return eDate >= now && eDate <= weekFromNow
          }
          case "this-month":
            return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear()
          case "upcoming":
            return eDate >= now
          case "past":
            return eDate < now
          default:
            return true
        }
      })
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((event) => event.status === filters.status)
    }

    setFilteredEvents(filtered)
  }, [events, filters, activeTab])

  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: events.length + 1,
      ...eventData,
      organizer: {
        name: "Current User", // In real app, get from auth context
        batch: "2020",
        avatar: "/current-user.jpg",
      },
      attendees: 0,
      status: "upcoming",
    }
    setEvents((prev) => [newEvent, ...prev])
    setShowCreateModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Events & Reunions</h1>
            <p className="text-gray-400 mt-1">Discover and join alumni events happening around you</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            Create Event
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "registered"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Registered (2)
          </button>
          <button
            onClick={() => setActiveTab("hosting")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "hosting"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Hosting (1)
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <EventsSidebar filters={filters} setFilters={setFilters} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <EventsGrid events={filteredEvents} />
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && <CreateEventModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateEvent} />}
    </div>
  )
}

export default EventsPage
