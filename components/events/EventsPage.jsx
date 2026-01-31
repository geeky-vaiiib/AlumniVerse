"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import CreateEventModal from "./CreateEventModal"
import { getInitials } from "../../lib/utils"
import { Calendar, Clock, MapPin, Users, Share2, Video } from "lucide-react"

// Demo events data
const DEMO_EVENTS = [
  {
    id: '1',
    title: 'Annual Alumni Reunion 2024',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM - 6:00 PM',
    location: 'SIT Main Auditorium, Tumkur',
    isVirtual: false,
    category: 'Reunions',
    description: 'Join us for the biggest alumni gathering of the year! Meet old friends, network with successful alumni, and celebrate our shared legacy. Food and refreshments will be provided.',
    attendees: 156,
    maxAttendees: 500,
    organizer: { name: 'Alumni Association', batch: '2015', avatar: null },
    tags: ['networking', 'reunion', 'celebration']
  },
  {
    id: '2',
    title: 'Tech Career Workshop - AI & ML',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '2:00 PM - 5:00 PM',
    location: 'Online via Zoom',
    isVirtual: true,
    category: 'Workshops',
    description: 'Learn about the latest trends in AI/ML careers from Google and Microsoft engineers. Interactive Q&A session included. Certificate of participation provided.',
    attendees: 89,
    maxAttendees: 200,
    organizer: { name: 'Career Development Cell', batch: '2020', avatar: null },
    tags: ['AI', 'ML', 'careers', 'workshop']
  },
  {
    id: '3',
    title: 'Startup Networking Night',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    time: '6:00 PM - 9:00 PM',
    location: 'Bangalore Tech Hub',
    isVirtual: false,
    category: 'Networking',
    description: 'Connect with fellow alumni entrepreneurs, investors, and startup enthusiasts. Pitch your ideas and find potential co-founders! Dinner included.',
    attendees: 45,
    maxAttendees: 100,
    organizer: { name: 'Entrepreneurship Cell', batch: '2018', avatar: null },
    tags: ['startup', 'networking', 'investors']
  },
  {
    id: '4',
    title: 'Alumni Webinar: Career in Cloud Computing',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '7:00 PM - 8:30 PM',
    location: 'Google Meet',
    isVirtual: true,
    category: 'Webinars',
    description: 'Join our senior alumni working at AWS and Azure to learn about career opportunities in cloud computing. Live Q&A at the end.',
    attendees: 120,
    maxAttendees: 300,
    organizer: { name: 'Tech Alumni Network', batch: '2017', avatar: null },
    tags: ['cloud', 'AWS', 'Azure', 'webinar']
  }
]

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [registeredEvents, setRegisteredEvents] = useState([])

  // Initialize with Firestore data + Demo data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)

        // Dynamic import for Firestore
        const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
        const { db } = await import('../../lib/firebase')

        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, orderBy('date', 'asc'), limit(20))
        const snapshot = await getDocs(q)

        const firestoreEvents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        console.log('✅ [EVENTS] Loaded', firestoreEvents.length, 'events from Firestore')
        setEvents([...firestoreEvents, ...DEMO_EVENTS])
      } catch (error) {
        console.error('❌ [EVENTS] Error loading from Firestore:', error)
        // Fallback to demo data
        setEvents(DEMO_EVENTS)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleCreateEvent = async (eventData) => {
    try {
      console.log('🔄 [EVENTS] Creating event in Firestore:', eventData)

      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../../lib/firebase')
      const { auth } = await import('../../lib/firebase')

      const user = auth.currentUser

      const newEvent = {
        ...eventData,
        createdAt: serverTimestamp(),
        attendees: 0,
        organizerId: user?.uid,
        organizer: {
          name: user?.displayName || 'Alumni Member',
          batch: '2024',
          avatar: user?.photoURL || null
        }
      }

      const docRef = await addDoc(collection(db, 'events'), newEvent)

      const eventWithId = { ...newEvent, id: docRef.id }
      setEvents(prev => [eventWithId, ...prev])
      setShowCreateModal(false)
      console.log('✅ [EVENTS] Event created successfully:', docRef.id)
    } catch (err) {
      console.error('❌ [EVENTS] Error creating event:', err)
      alert('Failed to create event: ' + err.message)
    }
  }

  const handleRegisterEvent = (eventId) => {
    setRegisteredEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    )
  }

  const filteredEvents = activeFilter === "registered"
    ? events.filter(e => registeredEvents.includes(e.id))
    : events

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#3D3D3D] rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#3D3D3D] rounded w-32"></div>
                    <div className="h-3 bg-[#3D3D3D] rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#3D3D3D] rounded"></div>
                  <div className="h-4 bg-[#3D3D3D] rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "all"
              ? "bg-[#4A90E2] text-white"
              : "bg-[#3D3D3D] text-[#B0B0B0] hover:bg-[#4D4D4D]"
              }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveFilter("registered")}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "registered"
              ? "bg-[#4A90E2] text-white"
              : "bg-[#3D3D3D] text-[#B0B0B0] hover:bg-[#4D4D4D]"
              }`}
          >
            Registered ({registeredEvents.length})
          </button>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
          <Calendar className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const eventDate = new Date(event.date)
            const isUpcoming = eventDate > new Date()

            return (
              <Card key={event.id} className="bg-[#2D2D2D] border-[#3D3D3D] hover:border-[#4A90E2]/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Organizer Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                      <AvatarFallback className="bg-[#4A90E2] text-white">
                        {getInitials(event.organizer.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{event.title}</h3>
                          <div className="flex items-center flex-wrap gap-3 text-sm text-[#B0B0B0] mt-2">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {eventDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.time}
                            </span>
                            <span className="flex items-center">
                              {event.isVirtual ? (
                                <><Video className="w-3 h-3 mr-1" />Virtual Event</>
                              ) : (
                                <><MapPin className="w-3 h-3 mr-1" />{event.location}</>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${event.category === 'Reunions' ? 'border-purple-500 text-purple-400' :
                                event.category === 'Workshops' ? 'border-green-500 text-green-400' :
                                  event.category === 'Webinars' ? 'border-blue-500 text-blue-400' :
                                    'border-orange-500 text-orange-400'
                                }`}
                            >
                              {event.category}
                            </Badge>
                            {isUpcoming && (
                              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                                ✓ Open for Registration
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <div className="text-right text-sm">
                            <div className="flex items-center text-[#B0B0B0]">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="font-bold text-white">
                                {event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''}
                              </span>
                            </div>
                            <div className="text-[#B0B0B0] text-xs">attendees</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-[#B0B0B0] hover:text-white">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRegisterEvent(event.id)}
                              className={registeredEvents.includes(event.id)
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                              }
                            >
                              {registeredEvents.includes(event.id) ? 'Registered ✓' : (isUpcoming ? 'Register Now' : 'View Details')}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[#B0B0B0] text-sm mb-3">{event.description}</p>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {event.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="border-[#4A90E2] text-[#4A90E2] text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-[#B0B0B0] border-t border-[#3D3D3D] pt-3">
                        <div className="flex items-center space-x-2">
                          <span>Organized by {event.organizer.name}</span>
                          {event.organizer.batch && (
                            <>
                              <span>•</span>
                              <span>Batch {event.organizer.batch}</span>
                            </>
                          )}
                        </div>
                        {event.registrationDeadline && isUpcoming && (
                          <span className="text-orange-400">
                            Registration closes: {new Date(event.registrationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-[#B0B0B0]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {activeFilter === "registered" ? "No Registered Events" : "No Events Yet"}
              </h3>
              <p className="text-[#B0B0B0] mb-4">
                {activeFilter === "registered"
                  ? "Register for events to see them here."
                  : "Be the first to create an event for the AlumniVerse community!"
                }
              </p>
              {activeFilter !== "registered" && (
                <Button size="sm" className="bg-[#4A90E2] hover:bg-[#357ABD] text-white" onClick={() => setShowCreateModal(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create First Event
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateEvent} />
      )}
    </div>
  )
}

export default EventsPage