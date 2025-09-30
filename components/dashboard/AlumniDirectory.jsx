"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAlumni } from "../../hooks/useRealTime"
import { getInitials, safeMap, ensureArray, safeLength } from "../../lib/utils"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  ExternalLink,
  Github,
  Linkedin,
  Code,
  ChevronDown,
  UserPlus,
  Loader2
} from "lucide-react"

// Mock alumni data
const mockAlumni = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    avatar: null,
    branch: "Computer Science",
    graduationYear: 2022,
    currentCompany: "Google",
    designation: "Software Engineer",
    location: "Bangalore, India",
    skills: ["React", "Python", "Machine Learning"],
    linkedinUrl: "https://linkedin.com/in/priya-sharma",
    githubUrl: "https://github.com/priya-sharma",
    isVerified: true,
    connections: 234
  },
  {
    id: 2,
    name: "Rahul Kumar",
    email: "rahul.kumar@example.com",
    avatar: null,
    branch: "Information Science",
    graduationYear: 2021,
    currentCompany: "Microsoft",
    designation: "Senior Developer",
    location: "Hyderabad, India",
    skills: ["Node.js", "Azure", "DevOps"],
    linkedinUrl: "https://linkedin.com/in/rahul-kumar",
    githubUrl: "https://github.com/rahul-kumar",
    isVerified: true,
    connections: 189
  },
  {
    id: 3,
    name: "Anita Reddy",
    email: "anita.reddy@example.com",
    avatar: null,
    branch: "Electronics & Communication",
    graduationYear: 2023,
    currentCompany: "Amazon",
    designation: "Product Manager",
    location: "Seattle, USA",
    skills: ["Product Strategy", "Analytics", "Leadership"],
    linkedinUrl: "https://linkedin.com/in/anita-reddy",
    isVerified: true,
    connections: 156
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    avatar: null,
    branch: "Mechanical Engineering",
    graduationYear: 2020,
    currentCompany: "Tesla",
    designation: "Design Engineer",
    location: "California, USA",
    skills: ["CAD", "Manufacturing", "Innovation"],
    linkedinUrl: "https://linkedin.com/in/vikram-singh",
    githubUrl: "https://github.com/vikram-singh",
    isVerified: true,
    connections: 298
  },
  {
    id: 5,
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    avatar: null,
    branch: "Computer Science",
    graduationYear: 2024,
    currentCompany: "Startup Inc",
    designation: "Full Stack Developer",
    location: "Mumbai, India",
    skills: ["React", "Node.js", "MongoDB"],
    linkedinUrl: "https://linkedin.com/in/sneha-patel",
    githubUrl: "https://github.com/sneha-patel",
    leetcodeUrl: "https://leetcode.com/sneha-patel",
    isVerified: false,
    connections: 67
  }
]

export default function AlumniDirectory() {
  const {
    alumni,
    alumniFilters,
    alumniLoading,
    updateFilters,
    connectWithAlumni
  } = useAlumni()

  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredAlumni, setFilteredAlumni] = useState([])
  const [isConnecting, setIsConnecting] = useState({})

  const itemsPerPage = 6

  // Get unique values for filters (with safety checks)
  const safeAlumni = ensureArray(alumni)
  const branches = [...new Set(safeAlumni.map(person => person?.branch).filter(Boolean))]
  const years = [...new Set(safeAlumni.map(person => person?.graduationYear).filter(Boolean))].sort((a, b) => b - a)
  const locations = [...new Set(safeAlumni.map(person => {
    const location = person?.location || ''
    return location.split(',')[1]?.trim() || location
  }).filter(Boolean))]

  // Apply local filtering based on current alumni data
  useEffect(() => {
    let filtered = ensureArray(alumni)

    // Search filter
    if (alumniFilters.search) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(alumniFilters.search.toLowerCase()) ||
        person.currentCompany.toLowerCase().includes(alumniFilters.search.toLowerCase()) ||
        person.designation.toLowerCase().includes(alumniFilters.search.toLowerCase()) ||
        person.skills.some(skill => skill.toLowerCase().includes(alumniFilters.search.toLowerCase()))
      )
    }

    // Branch filter
    if (alumniFilters.branch !== 'all') {
      filtered = filtered.filter(person => person.branch === alumniFilters.branch)
    }

    // Year filter
    if (alumniFilters.year !== 'all') {
      filtered = filtered.filter(person => person.graduationYear === parseInt(alumniFilters.year))
    }

    // Location filter
    if (alumniFilters.location !== 'all') {
      filtered = filtered.filter(person => person.location.includes(alumniFilters.location))
    }

    setFilteredAlumni(filtered)
    setCurrentPage(1)
  }, [alumni, alumniFilters])

  // Pagination
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAlumni = filteredAlumni.slice(startIndex, startIndex + itemsPerPage)

  const handleConnect = async (alumniId) => {
    setIsConnecting(prev => ({ ...prev, [alumniId]: true }))
    try {
      await connectWithAlumni(alumniId)
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setIsConnecting(prev => ({ ...prev, [alumniId]: false }))
    }
  }

  const handleSearchChange = (value) => {
    updateFilters({ search: value })
  }

  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value })
  }

  const clearFilters = () => {
    updateFilters({
      search: '',
      branch: 'all',
      year: 'all',
      location: 'all'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alumni Directory</h2>
          <p className="text-[#B0B0B0]">Connect with {filteredAlumni.length} alumni from your network</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#4A90E2]" />
          <span className="text-white font-medium">{filteredAlumni.length} Results</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] w-4 h-4" />
              <Input
                placeholder="Search by name, company, role, or skills..."
                value={alumniFilters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-[#3D3D3D] border-[#4D4D4D] text-white placeholder-[#B0B0B0]"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {(alumniFilters.branch !== 'all' || alumniFilters.year !== 'all' || alumniFilters.location !== 'all' || alumniFilters.search) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-[#4A90E2] hover:text-white hover:bg-[#3D3D3D]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#3D3D3D]">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Branch</label>
                  <select
                    value={alumniFilters.branch}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full bg-[#3D3D3D] border-[#4D4D4D] text-white rounded-md px-3 py-2"
                  >
                    <option value="all">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Graduation Year</label>
                  <select
                    value={alumniFilters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full bg-[#3D3D3D] border-[#4D4D4D] text-white rounded-md px-3 py-2"
                  >
                    <option value="all">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Location</label>
                  <select
                    value={alumniFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full bg-[#3D3D3D] border-[#4D4D4D] text-white rounded-md px-3 py-2"
                  >
                    <option value="all">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {alumniLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-[#2D2D2D] border-[#3D3D3D]">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-[#3D3D3D] rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-[#3D3D3D] rounded w-32"></div>
                      <div className="h-3 bg-[#3D3D3D] rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-[#3D3D3D] rounded"></div>
                    <div className="h-3 bg-[#3D3D3D] rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alumni Grid */}
      {!alumniLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMap(paginatedAlumni, (person) => (
            <Card key={person.id} className="bg-[#2D2D2D] border-[#3D3D3D] hover:border-[#4A90E2] transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className="bg-[#4A90E2] text-white font-semibold">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{person.name}</h3>
                      {person.isVerified && (
                        <div className="w-4 h-4 bg-[#4A90E2] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#B0B0B0]">{person.designation}</p>
                    <p className="text-sm text-[#B0B0B0]">{person.currentCompany}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-[#B0B0B0]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Class of {person.graduationYear}</span>
                </div>
                <div className="flex items-center text-sm text-[#B0B0B0]">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{person.branch}</span>
                </div>
                <div className="flex items-center text-sm text-[#B0B0B0]">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{person.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {person.skills.slice(0, 3).map((skill, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="border-[#4A90E2] text-[#4A90E2] text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {person.skills.length > 3 && (
                    <Badge 
                      variant="outline"
                      className="border-[#4D4D4D] text-[#B0B0B0] text-xs"
                    >
                      +{person.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {person.linkedinUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(person.linkedinUrl, '_blank')}
                      className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] p-2"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  )}
                  {person.githubUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(person.githubUrl, '_blank')}
                      className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] p-2"
                    >
                      <Github className="w-4 h-4" />
                    </Button>
                  )}
                  {person.leetcodeUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(person.leetcodeUrl, '_blank')}
                      className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] p-2"
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {person.isConnected ? (
                  <Button
                    disabled
                    className="bg-green-600 text-white cursor-not-allowed"
                    size="sm"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Connected
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(person.id)}
                    disabled={isConnecting[person.id]}
                    className="bg-[#4A90E2] hover:bg-[#357ABD] text-white disabled:opacity-50"
                    size="sm"
                  >
                    {isConnecting[person.id] ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-1" />
                    )}
                    {isConnecting[person.id] ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page 
                  ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white" 
                  : "bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                }
                size="sm"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
          >
            Next
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredAlumni.length === 0 && (
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-[#B0B0B0] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No alumni found</h3>
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
