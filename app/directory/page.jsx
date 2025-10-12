"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useState } from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import RightSidebar from "@/components/dashboard/RightSidebar"
import AlumniGrid from "@/components/directory/AlumniGrid"
import DirectorySidebar from "@/components/directory/DirectorySidebar"
import Pagination from "@/components/directory/Pagination"
import { useAlumni } from "@/hooks/useRealTime"
import { debounce } from "@/lib/utils"

export default function DirectoryPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("directory")
  
  const { 
    alumni: alumniData, 
    loading: alumniLoading, 
    fetchAlumni, 
    error: alumniError 
  } = useAlumni()
  
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    yearRange: [2010, 2024],
    location: "",
    skills: [],
    page: 1,
    limit: 12
  })
  
  // Extract data from the alumni hook
  const alumni = Array.isArray(alumniData) ? alumniData : []
  const pagination = {
    totalPages: 1,
    currentPage: 1,
    totalCount: alumni.length
  }
  const isLoading = alumniLoading

  // Debounced search function
  const debouncedSearch = debounce((searchTerm, currentFilters) => {
    applyFilters(searchTerm, currentFilters)
  }, 300)

  const applyFilters = (searchTerm = filters.search, currentFilters = filters) => {
    // Transform filters to API format
    const apiFilters = {
      search: searchTerm,
      branch: currentFilters.branch,
      location: currentFilters.location,
      skills: Array.isArray(currentFilters.skills) ? currentFilters.skills.join(',') : currentFilters.skills,
      page: currentFilters.page || 1,
      limit: currentFilters.limit || 12
    }

    // Add year range filter (use the end year for now, could be enhanced)
    if (currentFilters.yearRange && currentFilters.yearRange[1] !== 2024) {
      apiFilters.year = currentFilters.yearRange[1]
    }

    // Fetch alumni with the new filters
    fetchAlumni(apiFilters)
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
    // Implement connection logic here
    console.log('Connecting with alumni:', alumniId)
    // You can add API call to connect with alumni
  }

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    applyFilters(newFilters.search, newFilters)
  }

  // Use API pagination data
  const totalPages = pagination.totalPages || 1
  const currentPage = pagination.currentPage || 1
  const totalCount = pagination.totalCount || 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-foreground-muted mb-6">Please log in to access the alumni directory.</p>
          <a
            href="/auth"
            className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-3 rounded-md transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Match Dashboard Style */}
      <div className="bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Alumni Directory</h1>
              <p className="text-foreground-muted">Connect with {totalCount} alumni from your network</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* AlumniVerse Logo/Branding */}
              <div className="flex items-center space-x-2 text-primary">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.5 8.5L20 7L14.5 12L21 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L3 7L10.5 8.5L12 2Z"/>
                </svg>
                <span className="text-lg font-bold hidden sm:block">AlumniVerse</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Match Dashboard */}
          <div className="lg:w-80 flex-shrink-0">
            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} onAddPost={() => {}} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Filter Sidebar in Main Content Area */}
            <DirectorySidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              totalResults={totalCount}
            />
            
            {/* Alumni Grid */}
            <AlumniGrid alumni={alumni} isLoading={isLoading} onConnect={handleConnect} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>

          {/* Right Sidebar - Match Dashboard */}
          <div className="lg:w-80 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
