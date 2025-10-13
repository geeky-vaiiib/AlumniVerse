"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import CreateEventModal from "./CreateEventModal"
import { getInitials } from "../../lib/utils"
import { useEventsRealtime } from "../../hooks/useSupabaseRealtime"
import apiService from "../../lib/api"
import { getSupabaseClient } from "../../lib/supabase-singleton"
import { Calendar, Clock, MapPin, Users, Share2, Video } from "lucide-react"

const supabase = getSupabaseClient()

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [registeredEvents, setRegisteredEvents] = useState([])

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.events.getAll()
      if (response.success && response.data) {
        setEvents(response.data.events || [])
        console.log('✅ [EVENTS] Loaded', response.data.events?.length || 0, 'events')
      }
    } catch (err) {
      console.error('❌ [EVENTS] Error:', err)
      setError(err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleRealtimeUpdate = useCallback((payload) => {
    if (payload.eventType === 'INSERT') {
      setEvents(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
    } else if (payload.eventType === 'DELETE') {
      setEvents(prev => prev.filter(e => e.id !== payload.old.id))
    }
  }, [])

  useEventsRealtime(handleRealtimeUpdate)

  const handleCreateEvent = async (eventData) => {
    try {
      const { session } = await supabase.auth.getSession()
      const response = await apiService.events.create(eventData, session?.access_token)
      
      if (response.success) {
        console.log('✅ [EVENTS] Event created successfully')
        setShowCreateModal(false)
        await fetchEvents() // Refresh events list
      }
    } catch (err) {
      console.error('❌ [EVENTS] Error creating event:', err)
      alert('Failed to create event. Please try again.')
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

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Button onClick={() => setShowCreateModal(true)} className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Events</h3>
            <p className="text-[#B0B0B0] mb-4">{error}</p>
            <Button onClick={fetchEvents} className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">Try Again</Button>
          </CardContent>
        </Card>
        {showCreateModal && (
          <CreateEventModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateEvent} />
        )}
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
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === "all"
                ? "bg-[#4A90E2] text-white"
                : "bg-[#3D3D3D] text-[#B0B0B0] hover:bg-[#4D4D4D]"
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveFilter("registered")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === "registered"
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
                              className={`text-xs ${
                                event.category === 'Reunions' ? 'border-purple-500 text-purple-400' :
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