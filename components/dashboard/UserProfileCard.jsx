"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { 
  User, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Code,
  Edit,
  Award,
  Users,
  TrendingUp
} from "lucide-react"

export default function UserProfileCard({ user }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Mock user data - in real app this would come from user prop or API
  const userData = {
    name: user?.email ? user.email.split('@')[0] : 'User',
    email: user?.email || 'user@sit.ac.in',
    avatar: null,
    branch: 'Computer Science',
    graduationYear: '2024',
    currentCompany: 'Tech Corp',
    designation: 'Software Engineer',
    location: 'Bangalore, India',
    connections: 156,
    profileViews: 89,
    profileCompletion: 85,
    linkedinUrl: 'https://linkedin.com/in/user',
    githubUrl: 'https://github.com/user',
    leetcodeUrl: 'https://leetcode.com/user',
    resumeUrl: '/resume.pdf',
    badges: ['Early Adopter', 'Active Contributor'],
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    bio: 'Passionate software engineer with expertise in full-stack development.'
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getProfileCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <Card className="bg-[#2D2D2D] border-[#3D3D3D] overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-16 h-16 border-2 border-[#4A90E2]">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="bg-[#4A90E2] text-white font-semibold">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-white">{userData.name}</h3>
              <p className="text-sm text-[#B0B0B0]">{userData.designation}</p>
              <p className="text-sm text-[#B0B0B0]">{userData.currentCompany}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D]"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Completion */}
        <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">Profile Completion</span>
            <span className={`text-sm font-semibold ${getProfileCompletionColor(userData.profileCompletion)}`}>
              {userData.profileCompletion}%
            </span>
          </div>
          <div className="w-full bg-[#3D3D3D] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#4A90E2] to-[#357ABD] h-2 rounded-full transition-all duration-300"
              style={{ width: `${userData.profileCompletion}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-[#4A90E2] mr-1" />
              <span className="text-lg font-semibold text-white">{userData.connections}</span>
            </div>
            <p className="text-xs text-[#B0B0B0]">Connections</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-[#4A90E2] mr-1" />
              <span className="text-lg font-semibold text-white">{userData.profileViews}</span>
            </div>
            <p className="text-xs text-[#B0B0B0]">Profile Views</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-[#4A90E2] mr-1" />
              <span className="text-lg font-semibold text-white">{userData.badges.length}</span>
            </div>
            <p className="text-xs text-[#B0B0B0]">Badges</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-[#B0B0B0]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Class of {userData.graduationYear}</span>
          </div>
          <div className="flex items-center text-sm text-[#B0B0B0]">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{userData.location}</span>
          </div>
          <div className="flex items-center text-sm text-[#B0B0B0]">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{userData.branch}</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-white">Quick Links</h4>
          <div className="flex flex-wrap gap-2">
            {userData.resumeUrl && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#4D4D4D] text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] text-xs"
                onClick={() => window.open(userData.resumeUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Resume
              </Button>
            )}
            {userData.linkedinUrl && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#4D4D4D] text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] text-xs"
                onClick={() => window.open(userData.linkedinUrl, '_blank')}
              >
                <Linkedin className="w-3 h-3 mr-1" />
                LinkedIn
              </Button>
            )}
            {userData.githubUrl && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#4D4D4D] text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] text-xs"
                onClick={() => window.open(userData.githubUrl, '_blank')}
              >
                <Github className="w-3 h-3 mr-1" />
                GitHub
              </Button>
            )}
            {userData.leetcodeUrl && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#4D4D4D] text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] text-xs"
                onClick={() => window.open(userData.leetcodeUrl, '_blank')}
              >
                <Code className="w-3 h-3 mr-1" />
                LeetCode
              </Button>
            )}
          </div>
        </div>

        {/* Badges */}
        {userData.badges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Recent Badges</h4>
            <div className="flex flex-wrap gap-1">
              {userData.badges.slice(0, 2).map((badge, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-xs"
                >
                  {badge}
                </Badge>
              ))}
              {userData.badges.length > 2 && (
                <Badge 
                  variant="outline"
                  className="border-[#4D4D4D] text-[#B0B0B0] text-xs"
                >
                  +{userData.badges.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expandable Section */}
        {isExpanded && (
          <div className="space-y-4 border-t border-[#3D3D3D] pt-4">
            {/* Bio */}
            {userData.bio && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">About</h4>
                <p className="text-sm text-[#B0B0B0]">{userData.bio}</p>
              </div>
            )}

            {/* Skills */}
            {userData.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {userData.skills.map((skill, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="border-[#4A90E2] text-[#4A90E2] text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 text-[#4A90E2] hover:text-white hover:bg-[#3D3D3D]"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      </CardContent>
    </Card>
  )
}
