"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { generateAvatar } from "../../lib/utils"

export default function AlumniCard({ alumni, onConnect, animationDelay = 0 }) {
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Transform API data to component format
  const transformedAlumni = {
    id: alumni.id,
    name: alumni.fullName || `${alumni.first_name || ''} ${alumni.last_name || ''}`.trim(),
    designation: alumni.current_position || alumni.designation || 'N/A',
    company: alumni.company || 'N/A',
    branch: alumni.branch || 'N/A',
    batch: alumni.graduationYear || alumni.passing_year || alumni.batch || 'N/A',
    location: alumni.location || 'N/A',
    skills: alumni.skills || [],
    connectionCount: alumni.connectionCount || 0,
    isConnected: alumni.isConnected || false,
    linkedinUrl: alumni.linkedin_url || alumni.linkedinUrl || alumni.social_links?.linkedin,
    githubUrl: alumni.github_url || alumni.githubUrl || alumni.social_links?.github,
    avatar: alumni.avatar || null,
    profilePictureUrl: alumni.profilePictureUrl || alumni.profile_picture_url
  }
  
  const avatar = generateAvatar(transformedAlumni.name)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await onConnect(transformedAlumni.id)
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleViewProfile = () => {
    // Navigate to detailed profile view
    console.log("View profile:", transformedAlumni.id)
    // TODO: Implement navigation to profile page
  }

  return (
    <Card
      className="group hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-slide-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {transformedAlumni.profilePictureUrl ? (
              <img 
                src={transformedAlumni.profilePictureUrl} 
                alt={transformedAlumni.name}
                className="w-full h-full object-cover"
              />
            ) : (
              transformedAlumni.avatar || avatar.initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate">{transformedAlumni.name}</h3>
            <p className="text-foreground-muted text-sm">
              {transformedAlumni.designation} at {transformedAlumni.company}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{transformedAlumni.branch}</span>
              <span className="text-xs text-foreground-muted">Class of {transformedAlumni.batch}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-foreground-muted text-sm mb-4">
          <span className="mr-1">📍</span>
          {transformedAlumni.location}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="text-xs text-foreground-muted mb-2">Skills:</div>
          <div className="flex flex-wrap gap-1">
            {transformedAlumni.skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-surface text-foreground-muted rounded border">
                {skill}
              </span>
            ))}
            {transformedAlumni.skills.length > 4 && (
              <span className="px-2 py-1 text-xs text-primary">+{transformedAlumni.skills.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Connection count */}
        <div className="flex items-center text-foreground-muted text-sm mb-4">
          <span className="mr-1">🤝</span>
          {transformedAlumni.connectionCount} connections
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`flex-1 ${transformedAlumni.isConnected ? "bg-success hover:bg-success/80" : "hover-glow"}`}
            variant={transformedAlumni.isConnected ? "secondary" : "default"}
          >
            {isConnecting ? "Connecting..." : transformedAlumni.isConnected ? "Connected" : "Connect"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewProfile} className="px-3 bg-transparent">
            View
          </Button>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-4 mt-4 pt-4 border-t border-border-subtle">
          {transformedAlumni.linkedinUrl && (
            <a
              href={transformedAlumni.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-primary transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
          {transformedAlumni.githubUrl && (
            <a
              href={transformedAlumni.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-primary transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
