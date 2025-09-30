"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export default function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "networking",
    maxAttendees: "",
    registrationDeadline: "",
    isVirtual: false,
    meetingLink: "",
    tags: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categories = [
    { value: "networking", label: "Networking" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
    { value: "social", label: "Social" },
    { value: "career", label: "Career" },
    { value: "reunion", label: "Reunion" },
    { value: "other", label: "Other" }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = "Event title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Event date is required"
    if (!formData.time) newErrors.time = "Event time is required"
    if (!formData.location.trim() && !formData.isVirtual) {
      newErrors.location = "Location is required for in-person events"
    }
    if (formData.isVirtual && !formData.meetingLink.trim()) {
      newErrors.meetingLink = "Meeting link is required for virtual events"
    }
    if (formData.maxAttendees && isNaN(formData.maxAttendees)) {
      newErrors.maxAttendees = "Max attendees must be a number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Create event object
      const eventData = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString(),
        attendees: [],
        status: 'upcoming'
      }
      
      // TODO: Replace with actual API call
      console.log('Creating event:', eventData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Call parent callback
      if (onEventCreated) {
        onEventCreated(eventData)
      }
      
      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "networking",
        maxAttendees: "",
        registrationDeadline: "",
        isVirtual: false,
        meetingLink: "",
        tags: ""
      })
      onClose()
      
    } catch (error) {
      console.error('Error creating event:', error)
      setErrors({ submit: 'Failed to create event. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Event</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Event Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={errors.time ? "border-red-500" : ""}
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Virtual Event Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVirtual"
                name="isVirtual"
                checked={formData.isVirtual}
                onChange={handleInputChange}
                className="rounded"
              />
              <label htmlFor="isVirtual" className="text-sm font-medium">
                Virtual Event
              </label>
            </div>

            {/* Location or Meeting Link */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {formData.isVirtual ? "Meeting Link *" : "Location *"}
              </label>
              <Input
                name={formData.isVirtual ? "meetingLink" : "location"}
                value={formData.isVirtual ? formData.meetingLink : formData.location}
                onChange={handleInputChange}
                placeholder={formData.isVirtual ? "Enter meeting link" : "Enter event location"}
                className={errors.location || errors.meetingLink ? "border-red-500" : ""}
              />
              {(errors.location || errors.meetingLink) && (
                <p className="text-red-500 text-xs mt-1">{errors.location || errors.meetingLink}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-medium mb-1">Max Attendees (Optional)</label>
              <Input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                min="1"
                className={errors.maxAttendees ? "border-red-500" : ""}
              />
              {errors.maxAttendees && <p className="text-red-500 text-xs mt-1">{errors.maxAttendees}</p>}
            </div>

            {/* Registration Deadline */}
            <div>
              <label className="block text-sm font-medium mb-1">Registration Deadline (Optional)</label>
              <Input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags (Optional)</label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-gray-500 mt-1">e.g., networking, tech, career</p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-500 text-sm">{errors.submit}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
