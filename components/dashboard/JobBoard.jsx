"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useJobs } from "../../hooks/useRealTime"
import { getInitials, getTimeAgo, safeMap, ensureArray, safeLength } from "../../lib/utils"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Plus,
  Clock,
  Users,
  ChevronDown,
  Building,
  Loader2,
  Send
} from "lucide-react"

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Google",
    companyLogo: null,
    location: "Bangalore, India",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹25-35 LPA",
    postedBy: {
      name: "Priya Sharma",
      avatar: null,
      designation: "Engineering Manager"
    },
    postedDate: "2024-01-15",
    description: "We're looking for a senior software engineer to join our cloud infrastructure team...",
    skills: ["React", "Node.js", "AWS", "Kubernetes"],
    applicants: 45,
    isBookmarked: false,
    isUrgent: false
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Microsoft",
    companyLogo: null,
    location: "Hyderabad, India",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹20-30 LPA",
    postedBy: {
      name: "Rahul Kumar",
      avatar: null,
      designation: "Senior Product Manager"
    },
    postedDate: "2024-01-14",
    description: "Join our Azure team to drive product strategy and execution...",
    skills: ["Product Strategy", "Analytics", "Agile", "Leadership"],
    applicants: 32,
    isBookmarked: true,
    isUrgent: true
  },
  {
    id: 3,
    title: "Frontend Developer Intern",
    company: "Startup Inc",
    companyLogo: null,
    location: "Remote",
    type: "Internship",
    experience: "0-1 years",
    salary: "₹15-20k/month",
    postedBy: {
      name: "Sneha Patel",
      avatar: null,
      designation: "Tech Lead"
    },
    postedDate: "2024-01-13",
    description: "Great opportunity for fresh graduates to work on cutting-edge web technologies...",
    skills: ["React", "JavaScript", "CSS", "Git"],
    applicants: 78,
    isBookmarked: false,
    isUrgent: false
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "Amazon",
    companyLogo: null,
    location: "Seattle, USA",
    type: "Full-time",
    experience: "2-5 years",
    salary: "$120-150k",
    postedBy: {
      name: "Anita Reddy",
      avatar: null,
      designation: "Principal Data Scientist"
    },
    postedDate: "2024-01-12",
    description: "Work on machine learning models for recommendation systems...",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    applicants: 23,
    isBookmarked: false,
    isUrgent: true
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Netflix",
    companyLogo: null,
    location: "Mumbai, India",
    type: "Full-time",
    experience: "3-6 years",
    salary: "₹30-45 LPA",
    postedBy: {
      name: "Vikram Singh",
      avatar: null,
      designation: "DevOps Lead"
    },
    postedDate: "2024-01-11",
    description: "Scale our infrastructure to serve millions of users worldwide...",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    applicants: 56,
    isBookmarked: true,
    isUrgent: false
  }
]

export default function JobBoard() {
  const {
    jobs,
    jobFilters,
    jobsLoading,
    savedJobs,
    updateFilters,
    toggleSavedJob,
    createJob
  } = useJobs()

  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredJobs, setFilteredJobs] = useState([])
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experience: '0-2 years',
    salary: '',
    description: '',
    requirements: [''],
    skills: ['']
  })

  const itemsPerPage = 4

  // Get unique values for filters (with safety checks)
  const safeJobs = ensureArray(jobs)
  const jobTypes = [...new Set(safeJobs.map(job => job?.type).filter(Boolean))]
  const locations = [...new Set(safeJobs.map(job => job?.location).filter(Boolean))]
  const experienceLevels = [...new Set(safeJobs.map(job => job?.experience).filter(Boolean))]

  // Apply local filtering based on current jobs data
  useEffect(() => {
    let filtered = ensureArray(jobs)

    // Bookmarked filter
    if (showBookmarkedOnly) {
      filtered = filtered.filter(job => savedJobs.includes(job.id))
    }

    // Search filter
    if (jobFilters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(jobFilters.search.toLowerCase()))
      )
    }

    // Type filter
    if (jobFilters.type !== 'all') {
      filtered = filtered.filter(job => job.type === jobFilters.type)
    }

    // Location filter
    if (jobFilters.location !== 'all') {
      filtered = filtered.filter(job => job.location === jobFilters.location)
    }

    // Experience filter
    if (jobFilters.experience !== 'all') {
      filtered = filtered.filter(job => job.experience === jobFilters.experience)
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }, [jobs, jobFilters, showBookmarkedOnly, savedJobs])

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage)

  const handleBookmark = async (jobId) => {
    await toggleSavedJob(jobId)
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
      type: 'all',
      location: 'all',
      experience: 'all'
    })
    setShowBookmarkedOnly(false)
  }

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.location) return

    try {
      await createJob({
        ...newJob,
        postedBy: {
          id: 'current-user',
          name: 'You',
          avatar: null,
          designation: 'Alumni Member'
        }
      })

      setNewJob({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        experience: '0-2 years',
        salary: '',
        description: '',
        requirements: [''],
        skills: ['']
      })
      setIsCreatingJob(false)
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Job & Internship Board</h2>
          <p className="text-[#B0B0B0]">Discover {filteredJobs.length} opportunities posted by alumni</p>
        </div>
        <Button className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Post a Job
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] w-4 h-4" />
              <Input
                placeholder="Search jobs by title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#3D3D3D] border-[#4D4D4D] text-white placeholder-[#B0B0B0]"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-4">
              <Button
                variant={showBookmarkedOnly ? "default" : "outline"}
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={showBookmarkedOnly 
                  ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white" 
                  : "bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                }
                size="sm"
              >
                <BookmarkCheck className="w-4 h-4 mr-2" />
                Saved Jobs
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {(selectedType !== 'all' || selectedLocation !== 'all' || selectedExperience !== 'all' || showBookmarkedOnly) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-[#4A90E2] hover:text-white hover:bg-[#3D3D3D]"
                  size="sm"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#3D3D3D]">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Job Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-[#3D3D3D] border-[#4D4D4D] text-white rounded-md px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-[#3D3D3D] border-[#4D4D4D] text-white rounded-md px-3 py-2"
                  >
                    <option value="all">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Experience</label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full bg-[#3D3D3D] border-[#4D4D4D] text-white rounded-md px-3 py-2"
                  >
                    <option value="all">All Levels</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {safeMap(paginatedJobs, (job) => (
          <Card key={job.id} className="bg-[#2D2D2D] border-[#3D3D3D] hover:border-[#4A90E2] transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#3D3D3D] rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-[#4A90E2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      {job.isUrgent && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#4A90E2] font-medium">{job.company}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-[#B0B0B0]">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {getTimeAgo(job.postedDate)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => toggleBookmark(job.id)}
                  className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D] p-2"
                >
                  {job.isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-[#4A90E2]" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <p className="text-[#B0B0B0] mb-4 line-clamp-2">{job.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="border-[#4A90E2] text-[#4A90E2]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Posted By & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={job.postedBy.avatar} alt={job.postedBy.name} />
                    <AvatarFallback className="bg-[#4A90E2] text-white text-xs">
                      {getInitials(job.postedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white">Posted by {job.postedBy.name}</p>
                    <p className="text-xs text-[#B0B0B0]">{job.postedBy.designation}</p>
                  </div>
                  <div className="flex items-center text-sm text-[#B0B0B0]">
                    <Users className="w-4 h-4 mr-1" />
                    {job.applicants} applicants
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                  >
                    View Details
                  </Button>
                  <Button className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
                    Apply Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
      {filteredJobs.length === 0 && (
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-[#B0B0B0] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
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
