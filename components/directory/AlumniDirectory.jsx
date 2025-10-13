"use client"

import { useState, useEffect } from "react"
import { debounce } from "../../lib/utils"
import MainLayout from "../layouts/MainLayout"
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

  const sidebarContent = (
    <DirectorySidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      totalResults={totalCount}
    />
  )

  return (
    <MainLayout 
      title="Alumni Directory" 
      subtitle={`Connect with ${totalCount} alumni from your network`}
      rightSidebar={sidebarContent}
    >
      <div className="space-y-6">
        <AlumniGrid alumni={alumni} isLoading={isLoading} onConnect={handleConnect} />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>
    </MainLayout>
  )
}
