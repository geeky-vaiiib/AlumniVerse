"use client"

import { useState, useEffect } from "react"
import JobSidebar from "./JobSidebar"
import JobGrid from "./JobGrid"
import JobPostModal from "./JobPostModal"
import { Button } from "../ui/button"

const JobBoard = () => {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [filters, setFilters] = useState({
    search: "",
    jobType: "all",
    location: "all",
    experience: "all",
    company: "",
  })
  const [showPostModal, setShowPostModal] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [activeTab, setActiveTab] = useState("all") // all, saved

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockJobs = [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "Google",
        location: "Bangalore, India",
        type: "Full-time",
        experience: "3-5 years",
        salary: "₹25-35 LPA",
        postedBy: {
          name: "Rahul Sharma",
          batch: "2019",
          avatar: "/professional-male.jpg",
        },
        description: "Join our team to build scalable systems that impact billions of users.",
        skills: ["React", "Node.js", "Python", "AWS"],
        postedDate: "2024-01-15",
        applicants: 45,
        isRemote: false,
      },
      {
        id: 2,
        title: "Frontend Developer Intern",
        company: "Microsoft",
        location: "Hyderabad, India",
        type: "Internship",
        experience: "0-1 years",
        salary: "₹50,000/month",
        postedBy: {
          name: "Priya Patel",
          batch: "2020",
          avatar: "/professional-female.png",
        },
        description: "Work on cutting-edge web technologies and learn from industry experts.",
        skills: ["JavaScript", "React", "CSS", "HTML"],
        postedDate: "2024-01-14",
        applicants: 128,
        isRemote: true,
      },
      {
        id: 3,
        title: "Data Scientist",
        company: "Amazon",
        location: "Chennai, India",
        type: "Full-time",
        experience: "2-4 years",
        salary: "₹20-28 LPA",
        postedBy: {
          name: "Arjun Kumar",
          batch: "2018",
          avatar: "/professional-male-indian.jpg",
        },
        description: "Analyze large datasets to drive business decisions and improve customer experience.",
        skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
        postedDate: "2024-01-13",
        applicants: 67,
        isRemote: false,
      },
      {
        id: 4,
        title: "DevOps Engineer",
        company: "Flipkart",
        location: "Bangalore, India",
        type: "Full-time",
        experience: "1-3 years",
        salary: "₹15-22 LPA",
        postedBy: {
          name: "Sneha Reddy",
          batch: "2021",
          avatar: "/professional-female-indian.jpg",
        },
        description: "Manage cloud infrastructure and automate deployment processes.",
        skills: ["Docker", "Kubernetes", "AWS", "Jenkins"],
        postedDate: "2024-01-12",
        applicants: 34,
        isRemote: true,
      },
      {
        id: 5,
        title: "Product Manager",
        company: "Zomato",
        location: "Gurgaon, India",
        type: "Full-time",
        experience: "3-6 years",
        salary: "₹30-40 LPA",
        postedBy: {
          name: "Vikram Singh",
          batch: "2017",
          avatar: "/professional-male-manager.jpg",
        },
        description: "Lead product strategy and work with cross-functional teams.",
        skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
        postedDate: "2024-01-11",
        applicants: 89,
        isRemote: false,
      },
      {
        id: 6,
        title: "Mobile App Developer",
        company: "Paytm",
        location: "Noida, India",
        type: "Full-time",
        experience: "2-4 years",
        salary: "₹18-25 LPA",
        postedBy: {
          name: "Anita Joshi",
          batch: "2019",
          avatar: "/professional-female-developer.jpg",
        },
        description: "Develop and maintain mobile applications for millions of users.",
        skills: ["React Native", "Flutter", "iOS", "Android"],
        postedDate: "2024-01-10",
        applicants: 56,
        isRemote: true,
      },
    ]
    setJobs(mockJobs)
    setFilteredJobs(mockJobs)
  }, [])

  // Filter jobs based on current filters
  useEffect(() => {
    let filtered = jobs

    if (activeTab === "saved") {
      filtered = jobs.filter((job) => savedJobs.includes(job.id))
    }

    if (filters.search) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.skills.some((skill) => skill.toLowerCase().includes(filters.search.toLowerCase())),
      )
    }

    if (filters.jobType !== "all") {
      filtered = filtered.filter((job) => job.type.toLowerCase() === filters.jobType)
    }

    if (filters.location !== "all") {
      if (filters.location === "remote") {
        filtered = filtered.filter((job) => job.isRemote)
      } else {
        filtered = filtered.filter((job) => job.location.toLowerCase().includes(filters.location.toLowerCase()))
      }
    }

    if (filters.experience !== "all") {
      filtered = filtered.filter((job) => {
        const jobExp = job.experience.toLowerCase()
        switch (filters.experience) {
          case "entry":
            return jobExp.includes("0-1") || jobExp.includes("0-2")
          case "mid":
            return jobExp.includes("2-4") || jobExp.includes("3-5") || jobExp.includes("1-3")
          case "senior":
            return jobExp.includes("5+") || jobExp.includes("3-6") || jobExp.includes("4+")
          default:
            return true
        }
      })
    }

    if (filters.company) {
      filtered = filtered.filter((job) => job.company.toLowerCase().includes(filters.company.toLowerCase()))
    }

    setFilteredJobs(filtered)
  }, [jobs, filters, activeTab, savedJobs])

  const handleSaveJob = (jobId) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const handleJobPost = (jobData) => {
    const newJob = {
      id: jobs.length + 1,
      ...jobData,
      postedBy: {
        name: "Current User", // In real app, get from auth context
        batch: "2020",
        avatar: "/current-user.jpg",
      },
      postedDate: new Date().toISOString().split("T")[0],
      applicants: 0,
    }
    setJobs((prev) => [newJob, ...prev])
    setShowPostModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Job Board</h1>
            <p className="text-gray-400 mt-1">Discover opportunities posted by fellow alumni</p>
          </div>
          <Button onClick={() => setShowPostModal(true)} className="bg-blue-600 hover:bg-blue-700">
            Post a Job
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Saved Jobs ({savedJobs.length})
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <JobSidebar filters={filters} setFilters={setFilters} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <JobGrid jobs={filteredJobs} savedJobs={savedJobs} onSaveJob={handleSaveJob} />
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostModal && <JobPostModal onClose={() => setShowPostModal(false)} onSubmit={handleJobPost} />}
    </div>
  )
}

export default JobBoard
