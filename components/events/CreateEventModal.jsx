"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

export default function CreateEventModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "Workshops",
    date: "",
    time: "",
    location: "",
    description: "",
    maxAttendees: "",
    isVirtual: false,
    registrationDeadline: "",
    tags: "",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = "Event title is required"
    if (!formData.date) newErrors.date = "Event date is required"
    if (!formData.time) newErrors.time = "Event time is required"
    if (!formData.location.trim()) newErrors.location = "Event location is required"
    if (!formData.description.trim()) newErrors.description = "Event description is required"
    if (!formData.maxAttendees || formData.maxAttendees < 1) newErrors.maxAttendees = "Maximum attendees must be at least 1"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const eventData = {
      ...formData,
      id: Date.now(),
      organizer: {
        name: "Current User", // This would come from auth context
        avatar: "/placeholder-user.jpg"
      },
      attendees: 0,
      status: "upcoming",
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      image: "/placeholder.jpg"
    }

    onSubmit(eventData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Create New Event</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground"
          >
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Alumni Tech Meetup 2024"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background"
              >
                <option value="Workshops" className="text-foreground bg-background">🛠️ Workshops</option>
                <option value="Reunions" className="text-foreground bg-background">🎉 Reunions</option>
                <option value="Networking" className="text-foreground bg-background">🤝 Networking</option>
                <option value="Career" className="text-foreground bg-background">💼 Career</option>
                <option value="Social" className="text-foreground bg-background">🎊 Social</option>
                <option value="Sports" className="text-foreground bg-background">⚽ Sports</option>
                <option value="Cultural" className="text-foreground bg-background">🎭 Cultural</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Date *
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? "border-destructive" : ""}
                />
                {errors.date && <p className="text-destructive text-sm mt-1">{errors.date}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Time *
                </label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={errors.time ? "border-destructive" : ""}
                />
                {errors.time && <p className="text-destructive text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location *
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., College Campus, Main Auditorium or Virtual (Zoom)"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Virtual Event Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isVirtual"
                id="isVirtual"
                checked={formData.isVirtual}
                onChange={handleChange}
                className="rounded border-border"
              />
              <label htmlFor="isVirtual" className="text-sm text-foreground">
                This is a virtual event
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event, agenda, speakers, and what attendees can expect..."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Max Attendees and Registration Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Attendees *
                </label>
                <Input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="1"
                  className={errors.maxAttendees ? "border-destructive" : ""}
                />
                {errors.maxAttendees && <p className="text-destructive text-sm mt-1">{errors.maxAttendees}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registration Deadline
                </label>
                <Input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (comma-separated)
              </label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., networking, tech, career, fun"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Add relevant tags to help people discover your event
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 hover-glow"
              >
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}