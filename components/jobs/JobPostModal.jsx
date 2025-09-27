"use client"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

const JobPostModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experience: "",
    salary: "",
    description: "",
    skills: "",
    isRemote: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const jobData = {
      ...formData,
      skills: formData.skills.split(",").map((skill) => skill.trim()),
    }
    onSubmit(jobData)
  }

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Post a Job</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Title *</label>
                <Input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                <Input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g. Google"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                <Input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g. Bangalore, India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience *</label>
                <Input
                  type="text"
                  required
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g. 2-4 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salary</label>
                <Input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g. ₹15-25 LPA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skills *</label>
              <Input
                type="text"
                required
                value={formData.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g. React, Node.js, Python (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRemote"
                checked={formData.isRemote}
                onChange={(e) => handleChange("isRemote", e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isRemote" className="ml-2 text-sm text-gray-300">
                This is a remote position
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Post Job
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JobPostModal
