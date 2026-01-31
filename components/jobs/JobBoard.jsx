"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import JobPostModal from "./JobPostModal"
import { getInitials } from "../../lib/utils"
import { Briefcase, MapPin, Clock, DollarSign, Bookmark, ExternalLink } from "lucide-react"

// Demo jobs data
const DEMO_JOBS = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google India',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '₹25L - ₹45L',
    description: 'Join our team to build next-generation cloud infrastructure. Work with cutting-edge technologies and scale products to billions of users.',
    skills: ['Python', 'Go', 'Kubernetes', 'GCP'],
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 45,
    postedBy: { name: 'Priya Sharma', batch: '2019', avatar: null }
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Microsoft',
    location: 'Hyderabad, India (Hybrid)',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '₹20L - ₹35L',
    description: 'Drive product strategy for Azure cloud services. Work closely with engineering teams to deliver customer value.',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'SQL'],
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 32,
    postedBy: { name: 'Rahul Kumar', batch: '2018', avatar: null }
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'Amazon',
    location: 'Remote',
    type: 'Internship',
    experience: 'Entry Level',
    salary: '₹50K/month',
    description: 'Summer internship opportunity for passionate data science students. Learn from the best and work on real-world ML problems.',
    skills: ['Python', 'ML', 'Pandas', 'TensorFlow'],
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 78,
    postedBy: { name: 'Vikram Patil', batch: '2020', avatar: null }
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'TechStartup.io',
    location: 'Bangalore, India',
    type: 'Full-time',
    experience: '1-3 years',
    salary: '₹12L - ₹20L',
    description: 'Join an exciting early-stage startup! Work on building our MVP with React and Node.js. Equity included.',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 23,
    postedBy: { name: 'Aishwarya Hegde', batch: '2018', avatar: null }
  }
]

const JobBoard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [activeFilter, setActiveFilter] = useState("all") // all, saved

  // 🔄 Initialize with Firestore data + Demo data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)

        // Dynamic import for Firestore
        const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
        const { db } = await import('../../lib/firebase')

        const jobsRef = collection(db, 'jobs')
        const q = query(jobsRef, orderBy('postedDate', 'desc'), limit(20))
        const snapshot = await getDocs(q)

        const firestoreJobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        console.log('✅ [JOBS] Loaded', firestoreJobs.length, 'jobs from Firestore')
        setJobs([...firestoreJobs, ...DEMO_JOBS])
      } catch (error) {
        console.error('❌ [JOBS] Error loading from Firestore:', error)
        // Fallback to demo data
        setJobs(DEMO_JOBS)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    )
  }

  const handleJobPost = async (jobData) => {
    try {
      console.log('🔄 [JOBS] Posting job to Firestore:', jobData)

      // Dynamic import
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../../lib/firebase')
      const { auth } = await import('../../lib/firebase') // To get current user

      const user = auth.currentUser

      const newJob = {
        ...jobData,
        postedDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        applicants: 0,
        authorId: user?.uid,
        postedBy: {
          name: user?.displayName || 'Alumni Member',
          batch: '2024', // Ideally fetch from profile
          avatar: user?.photoURL || null
        }
      }

      const docRef = await addDoc(collection(db, 'jobs'), newJob)

      // Optimistic update
      const jobWithId = { ...newJob, id: docRef.id }
      setJobs(prev => [jobWithId, ...prev])
      setShowPostModal(false)
      console.log('✅ [JOBS] Job posted successfully:', docRef.id)

    } catch (err) {
      console.error('❌ [JOBS] Error posting job:', err)
      alert('Failed to post job: ' + err.message)
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
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveFilter("saved")}
            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "saved"
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