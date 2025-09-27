"use client"

import { useState } from "react"
import { debounce } from "../../lib/utils"
import DirectorySidebar from "./DirectorySidebar"
import AlumniGrid from "./AlumniGrid"
import Pagination from "./Pagination"

// Mock data for demonstration
const mockAlumni = [
  {
    id: 1,
    name: "Priya Sharma",
    batch: "2020",
    branch: "Computer Science",
    company: "Google",
    designation: "Software Engineer",
    location: "Bangalore, India",
    skills: ["React", "Node.js", "Python", "Machine Learning"],
    linkedinUrl: "https://linkedin.com/in/priya-sharma",
    githubUrl: "https://github.com/priya-sharma",
    avatar: "PS",
    isConnected: false,
    connectionCount: 156,
  },
  {
    id: 2,
    name: "Rahul Kumar",
    batch: "2018",
    branch: "Information Science",
    company: "Microsoft",
    designation: "Product Manager",
    location: "Seattle, USA",
    skills: ["Product Management", "Data Analysis", "SQL", "Azure"],
    linkedinUrl: "https://linkedin.com/in/rahul-kumar",
    githubUrl: "https://github.com/rahul-kumar",
    avatar: "RK",
    isConnected: true,
    connectionCount: 234,
  },
  {
    id: 3,
    name: "Anita Patel",
    batch: "2019",
    branch: "Computer Science",
    company: "TechStart Inc.",
    designation: "Founder & CEO",
    location: "Mumbai, India",
    skills: ["Entrepreneurship", "Leadership", "Full Stack", "AI/ML"],
    linkedinUrl: "https://linkedin.com/in/anita-patel",
    githubUrl: "https://github.com/anita-patel",
    avatar: "AP",
    isConnected: false,
    connectionCount: 89,
  },
  {
    id: 4,
    name: "Vikram Singh",
    batch: "2017",
    branch: "Electronics",
    company: "Tesla",
    designation: "Hardware Engineer",
    location: "Austin, USA",
    skills: ["Hardware Design", "Embedded Systems", "IoT", "Automotive"],
    linkedinUrl: "https://linkedin.com/in/vikram-singh",
    githubUrl: "https://github.com/vikram-singh",
    avatar: "VS",
    isConnected: false,
    connectionCount: 178,
  },
  {
    id: 5,
    name: "Sneha Reddy",
    batch: "2021",
    branch: "Information Science",
    company: "Amazon",
    designation: "SDE-1",
    location: "Hyderabad, India",
    skills: ["Java", "AWS", "Microservices", "System Design"],
    linkedinUrl: "https://linkedin.com/in/sneha-reddy",
    githubUrl: "https://github.com/sneha-reddy",
    avatar: "SR",
    isConnected: true,
    connectionCount: 67,
  },
  {
    id: 6,
    name: "Arjun Mehta",
    batch: "2016",
    branch: "Mechanical",
    company: "SpaceX",
    designation: "Aerospace Engineer",
    location: "Los Angeles, USA",
    skills: ["Aerospace Engineering", "CAD", "Simulation", "Manufacturing"],
    linkedinUrl: "https://linkedin.com/in/arjun-mehta",
    githubUrl: "https://github.com/arjun-mehta",
    avatar: "AM",
    isConnected: false,
    connectionCount: 145,
  },
]

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState(mockAlumni)
  const [filteredAlumni, setFilteredAlumni] = useState(mockAlumni)
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    yearRange: [2010, 2024],
    location: "",
    skills: [],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 6

  // Debounced search function
  const debouncedSearch = debounce((searchTerm, currentFilters) => {
    applyFilters(searchTerm, currentFilters)
  }, 300)

  const applyFilters = (searchTerm = filters.search, currentFilters = filters) => {
    setIsLoading(true)

    let filtered = [...alumni]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Branch filter
    if (currentFilters.branch) {
      filtered = filtered.filter((person) => person.branch === currentFilters.branch)
    }

    // Year range filter
    filtered = filtered.filter((person) => {
      const year = Number.parseInt(person.batch)
      return year >= currentFilters.yearRange[0] && year <= currentFilters.yearRange[1]
    })

    // Location filter
    if (currentFilters.location) {
      filtered = filtered.filter((person) =>
        person.location.toLowerCase().includes(currentFilters.location.toLowerCase()),
      )
    }

    // Skills filter
    if (currentFilters.skills.length > 0) {
      filtered = filtered.filter((person) =>
        currentFilters.skills.some((skill) =>
          person.skills.some((personSkill) => personSkill.toLowerCase().includes(skill.toLowerCase())),
        ),
      )
    }

    setTimeout(() => {
      setFilteredAlumni(filtered)
      setCurrentPage(1)
      setIsLoading(false)
    }, 300)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    if (newFilters.search !== filters.search) {
      debouncedSearch(newFilters.search, newFilters)
    } else {
      applyFilters(newFilters.search, newFilters)
    }
  }

  const handleConnect = (alumniId) => {
    setAlumni((prev) =>
      prev.map((person) => (person.id === alumniId ? { ...person, isConnected: !person.isConnected } : person)),
    )
    setFilteredAlumni((prev) =>
      prev.map((person) => (person.id === alumniId ? { ...person, isConnected: !person.isConnected } : person)),
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAlumni = filteredAlumni.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Alumni Directory</h1>
              <p className="text-foreground-muted mt-1">
                Connect with {filteredAlumni.length} alumni from your network
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{filteredAlumni.length}</div>
              <div className="text-sm text-foreground-muted">Alumni Found</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <DirectorySidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              totalResults={filteredAlumni.length}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <AlumniGrid alumni={paginatedAlumni} isLoading={isLoading} onConnect={handleConnect} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
