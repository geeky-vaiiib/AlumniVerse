"use client"

import { useState, useEffect } from "react"
import { debounce } from "../../lib/utils"
import DirectorySidebar from "./DirectorySidebar"
import AlumniGrid from "./AlumniGrid"
import Pagination from "./Pagination"
import { useAlumni } from "../../hooks/useRealTime"


export default function AlumniDirectory() {
  const { 
    alumni: alumniData, 
    alumniLoading, 
    loadAlumni, 
    updateFilters: updateAlumniFilters, 
    connectWithAlumni 
  } = useAlumni()
  
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    yearRange: [2010, 2024],
    location: "",
    skills: [],
    page: 1,
    limit: 6
  })
  
  // Extract data from the alumni hook
  const alumni = alumniData?.alumni || []
  const pagination = alumniData?.pagination || {}
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
      limit: currentFilters.limit || 6
    }

    // Add year range filter (use the end year for now, could be enhanced)
    if (currentFilters.yearRange && currentFilters.yearRange[1] !== 2024) {
      apiFilters.year = currentFilters.yearRange[1]
    }

    // Update the alumni filters which will trigger a reload
    updateAlumniFilters(apiFilters)
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
    connectWithAlumni(alumniId)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Alumni Directory</h1>
              <p className="text-foreground-muted mt-1">
                Connect with {totalCount} alumni from your network
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalCount}</div>
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
              totalResults={totalCount}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <AlumniGrid alumni={alumni} isLoading={isLoading} onConnect={handleConnect} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
