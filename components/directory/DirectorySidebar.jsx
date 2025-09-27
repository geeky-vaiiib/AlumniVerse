"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

const branches = ["Computer Science", "Information Science", "Electronics", "Mechanical", "Civil", "Electrical"]

const popularSkills = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "JavaScript",
  "Machine Learning",
  "Data Science",
  "AWS",
  "Docker",
  "Product Management",
  "Leadership",
  "Full Stack",
]

const locations = [
  "Bangalore, India",
  "Mumbai, India",
  "Delhi, India",
  "Hyderabad, India",
  "Seattle, USA",
  "San Francisco, USA",
  "New York, USA",
  "London, UK",
]

export default function DirectorySidebar({ filters, onFilterChange, totalResults }) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSkillToggle = (skill) => {
    const currentSkills = localFilters.skills || []
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill]

    const newFilters = { ...localFilters, skills: newSkills }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleYearRangeChange = (index, value) => {
    const newRange = [...localFilters.yearRange]
    newRange[index] = Number.parseInt(value)
    const newFilters = { ...localFilters, yearRange: newRange }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const resetFilters = {
      search: "",
      branch: "",
      yearRange: [2010, 2024],
      location: "",
      skills: [],
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, company, or skills..."
            value={localFilters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Branch Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={localFilters.branch}
            onChange={(e) => handleInputChange("branch", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm bg-input border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Year Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Graduation Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="From"
                value={localFilters.yearRange[0]}
                onChange={(e) => handleYearRangeChange(0, e.target.value)}
                min="2010"
                max="2024"
                className="flex-1"
              />
              <span className="text-foreground-muted">to</span>
              <Input
                type="number"
                placeholder="To"
                value={localFilters.yearRange[1]}
                onChange={(e) => handleYearRangeChange(1, e.target.value)}
                min="2010"
                max="2024"
                className="flex-1"
              />
            </div>
            <div className="text-xs text-foreground-muted">
              Range: {localFilters.yearRange[0]} - {localFilters.yearRange[1]}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter city or country..."
            value={localFilters.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full mb-3"
          />
          <div className="space-y-1">
            <div className="text-xs text-foreground-muted mb-2">Popular locations:</div>
            {locations.slice(0, 4).map((location) => (
              <button
                key={location}
                onClick={() => handleInputChange("location", location)}
                className="block text-xs text-primary hover:text-primary-hover transition-colors"
              >
                {location}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  localFilters.skills?.includes(skill)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-foreground-muted border-border hover:border-primary hover:text-primary"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {localFilters.skills?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <div className="text-xs text-foreground-muted mb-2">Selected skills:</div>
              <div className="flex flex-wrap gap-1">
                {localFilters.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary & Clear */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="text-2xl font-bold text-primary">{totalResults}</div>
            <div className="text-sm text-foreground-muted">Alumni found</div>
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full bg-transparent">
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
