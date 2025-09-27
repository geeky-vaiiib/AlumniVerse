"use client"

import { useState } from "react"

const EventCard = ({ event }) => {
  const [isRegistered, setIsRegistered] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getAttendancePercentage = () => {
    return Math.round((event.attendees / event.maxAttendees) * 100)
  }

  const getCategoryColor = (category) => {
    const colors = {
      Reunions: "bg-purple-900 text-purple-300",
      Webinars: "bg-blue-900 text-blue-300",
      Workshops: "bg-green-900 text-green-300",
      Meetups: "bg-orange-900 text-orange-300",
      Competitions: "bg-red-900 text-red-300",
    }
    return colors[category] || "bg-gray-900 text-gray-300"
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
      <div className="flex">
        {/* Event Image */}
        <div className="w-48 h-48 flex-shrink-0">
          <img
            src={event.image || "/placeholder.svg?height=192&width=192&query=event"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
                {event.isVirtual && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-900 text-indigo-300">
                    Virtual
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{formatTime(event.time)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-2">{event.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <img
                    src={event.organizer.avatar || "/placeholder.svg"}
                    alt={event.organizer.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>
                    Organized by {event.organizer.name}
                    {event.organizer.batch && ` (Batch ${event.organizer.batch})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="text-right">
              <div className="mb-2">
                <span className="text-2xl font-bold text-white">{event.attendees}</span>
                <span className="text-gray-400">/{event.maxAttendees}</span>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getAttendancePercentage()}%` }}></div>
              </div>
              <p className="text-xs text-gray-400">{getAttendancePercentage()}% filled</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsRegistered(!isRegistered)}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium ${
                isRegistered ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isRegistered ? "Registered ✓" : "Register Now"}
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
              Share
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
