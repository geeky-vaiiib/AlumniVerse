"use client"
import { Input } from "../ui/input"

const EventsSidebar = ({ filters, setFilters }) => {
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold text-white mb-6">Filters</h2>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Search Events</label>
        <Input
          type="text"
          placeholder="Event title, description, tags..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="reunions">Reunions</option>
          <option value="webinars">Webinars</option>
          <option value="workshops">Workshops</option>
          <option value="meetups">Meetups</option>
          <option value="competitions">Competitions</option>
        </select>
      </div>

      {/* Timeframe */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
        <select
          value={filters.timeframe}
          onChange={(e) => handleFilterChange("timeframe", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Time</option>
          <option value="this-week">This Week</option>
          <option value="this-month">This Month</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past Events</option>
        </select>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Popular Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Popular Categories</label>
        <div className="space-y-2">
          {["Reunions", "Webinars", "Workshops", "Meetups", "Competitions"].map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange("category", category.toLowerCase())}
              className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          setFilters({
            search: "",
            category: "all",
            timeframe: "all",
            status: "all",
          })
        }
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  )
}

export default EventsSidebar
