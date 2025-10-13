"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import JobPostModal from "./JobPostModal"
import { getInitials } from "../../lib/utils"
import { useJobsRealtime } from "../../hooks/useSupabaseRealtime"
import apiService from "../../lib/api"
import { getSupabaseClient } from "../../lib/supabase-singleton"
import { Briefcase, MapPin, Clock, DollarSign, Bookmark, ExternalLink } from "lucide-react"

const supabase = getSupabaseClient()

const JobBoard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [activeFilter, setActiveFilter] = useState("all") // all, saved

  // 🔄 Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.jobs.getAll()
      
      if (response.success && response.data) {
        setJobs(response.data.jobs || [])
        console.log('✅ [JOBS] Loaded', response.data.jobs?.length || 0, 'jobs')
      }
    } catch (err) {
      console.error('❌ [JOBS] Error fetching jobs:', err)
      setError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // 🔄 Real-time updates for jobs
  const handleRealtimeUpdate = useCallback((payload) => {
    console.log('🔄 [JOBS] Real-time update:', payload.eventType)
    
    if (payload.eventType === 'INSERT') {
      setJobs(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setJobs(prev => prev.map(job => 
        job.id === payload.new.id ? payload.new : job
      ))
    } else if (payload.eventType === 'DELETE') {
      setJobs(prev => prev.filter(job => job.id !== payload.old.id))
    }
  }, [])

  // Subscribe to real-time updates
  useJobsRealtime(handleRealtimeUpdate)

  const handleSaveJob = (jobId) => {
    setSavedJobs((prev) => 
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    )
  }

  const handleJobPost = async (jobData) => {
    try {
      console.log('🔄 [JOBS] Posting job:', jobData)
      const response = await apiService.jobs.create(jobData)
      
      if (response.success) {
        console.log('✅ [JOBS] Job posted successfully')
        setShowPostModal(false)
        await fetchJobs() // Refresh jobs list
      }
    } catch (err) {
      console.error('❌ [JOBS] Error posting job:', err)
      alert('Failed to post job. Please try again.')
    }
  }

  const filteredJobs = activeFilter === "saved" 
    ? jobs.filter((job) => savedJobs.includes(job.id))
    : jobs

  // 🔄 Loading state
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

  // ❌ Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Button onClick={() => setShowPostModal(true)} className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
            <Briefcase className="w-4 h-4 mr-2" />
            Post a Job
          </Button>
        </div>
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Jobs</h3>
            <p className="text-[#B0B0B0] mb-4">{error}</p>
            <Button onClick={fetchJobs} className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">Try Again</Button>
          </CardContent>
        </Card>
        {showPostModal && (
          <JobPostModal onClose={() => setShowPostModal(false)} onSubmit={handleJobPost} />
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
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveFilter("saved")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === "saved"
                ? "bg-[#4A90E2] text-white"
                : "bg-[#3D3D3D] text-[#B0B0B0] hover:bg-[#4D4D4D]"
            }`}
          >
            Saved Jobs ({savedJobs.length})
          </button>
        </div>
        <Button onClick={() => setShowPostModal(true)} className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
          <Briefcase className="w-4 h-4 mr-2" />
          Post a Job
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="bg-[#2D2D2D] border-[#3D3D3D] hover:border-[#4A90E2]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Company/Poster Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={job.postedBy.avatar} alt={job.postedBy.name} />
                    <AvatarFallback className="bg-[#4A90E2] text-white">
                      {getInitials(job.postedBy.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{job.title}</h3>
                        <p className="text-[#B0B0B0] font-medium">{job.company}</p>
                        <div className="flex items-center flex-wrap gap-3 text-sm text-[#B0B0B0] mt-2">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.type}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.experience}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveJob(job.id)}
                          className={savedJobs.includes(job.id) ? "text-yellow-400" : "text-[#B0B0B0] hover:text-white"}
                        >
                          <Bookmark className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button size="sm" className="bg-[#4A90E2] hover:bg-[#357ABD] text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[#B0B0B0] text-sm mb-3">{job.description}</p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="border-[#4A90E2] text-[#4A90E2] text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-[#B0B0B0] border-t border-[#3D3D3D] pt-3">
                      <div className="flex items-center space-x-2">
                        <span>Posted by {job.postedBy.name}</span>
                        {job.postedBy.batch && (
                          <>
                            <span>•</span>
                            <span>Batch {job.postedBy.batch}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                      </div>
                      <span>{job.applicants} applicants</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-12 h-12 text-[#B0B0B0]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {activeFilter === "saved" ? "No Saved Jobs" : "No Jobs Posted Yet"}
              </h3>
              <p className="text-[#B0B0B0] mb-4">
                {activeFilter === "saved" 
                  ? "Save jobs you're interested in to view them here."
                  : "Be the first to post a job opportunity for the AlumniVerse community!"
                }
              </p>
              {activeFilter !== "saved" && (
                <Button size="sm" className="bg-[#4A90E2] hover:bg-[#357ABD] text-white" onClick={() => setShowPostModal(true)}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post First Job
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <JobPostModal onClose={() => setShowPostModal(false)} onSubmit={handleJobPost} />
      )}
    </div>
  )
}

export default JobBoard