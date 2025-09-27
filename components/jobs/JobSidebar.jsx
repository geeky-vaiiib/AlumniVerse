"use client"
import { Input } from "../ui/input"

const JobSidebar = ({ filters, setFilters }) => {
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold text-white mb-6">Filters</h2>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Search Jobs</label>
        <Input
          type="text"
          placeholder="Job title, company, skills..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
        <select
          value={filters.jobType}
          onChange={(e) => handleFilterChange("jobType", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="internship">Internship</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <select
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Locations</option>
          <option value="remote">Remote</option>
          <option value="bangalore">Bangalore</option>
          <option value="hyderabad">Hyderabad</option>
          <option value="chennai">Chennai</option>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi/NCR</option>
          <option value="pune">Pune</option>
        </select>
      </div>

      {/* Experience Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
        <select
          value={filters.experience}
          onChange={(e) => handleFilterChange("experience", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Levels</option>
          <option value="entry">Entry Level (0-2 years)</option>
          <option value="mid">Mid Level (2-5 years)</option>
          <option value="senior">Senior Level (5+ years)</option>
        </select>
      </div>

      {/* Company */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
        <Input
          type="text"
          placeholder="Filter by company..."
          value={filters.company}
          onChange={(e) => handleFilterChange("company", e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      {/* Popular Companies */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Popular Companies</label>
        <div className="space-y-2">
          {["Google", "Microsoft", "Amazon", "Flipkart", "Zomato", "Paytm"].map((company) => (
            <button
              key={company}
              onClick={() => handleFilterChange("company", company)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          setFilters({
            search: "",
            jobType: "all",
            location: "all",
            experience: "all",
            company: "",
          })
        }
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  )
}

export default JobSidebar
