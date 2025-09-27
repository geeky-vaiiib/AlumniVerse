"use client"

import { useState } from "react"

const JobCard = ({ job, isSaved, onSave }) => {
  const [showFullDescription, setShowFullDescription] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-white">{job.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.type === "Full-time"
                  ? "bg-green-900 text-green-300"
                  : job.type === "Internship"
                    ? "bg-blue-900 text-blue-300"
                    : "bg-purple-900 text-purple-300"
              }`}
            >
              {job.type}
            </span>
            {job.isRemote && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-300">Remote</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
            <span className="font-medium text-white">{job.company}</span>
            <span>•</span>
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.experience}</span>
            <span>•</span>
            <span className="text-green-400 font-medium">{job.salary}</span>
          </div>

          <p className="text-gray-300 mb-4">
            {showFullDescription ? job.description : `${job.description.substring(0, 120)}...`}
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-400 hover:text-blue-300 ml-2 text-sm"
            >
              {showFullDescription ? "Show less" : "Read more"}
            </button>
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <img
                src={job.postedBy.avatar || "/placeholder.svg"}
                alt={job.postedBy.name}
                className="w-6 h-6 rounded-full"
              />
              <span>
                Posted by {job.postedBy.name} (Batch {job.postedBy.batch})
              </span>
            </div>
            <span>•</span>
            <span>{formatDate(job.postedDate)}</span>
            <span>•</span>
            <span>{job.applicants} applicants</span>
          </div>
        </div>

        <button
          onClick={onSave}
          className={`p-2 rounded-lg transition-colors ${
            isSaved ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
          }`}
          title={isSaved ? "Remove from saved" : "Save job"}
        >
          <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
          Apply Now
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
          Contact Referrer
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
          Share
        </button>
      </div>
    </div>
  )
}

export default JobCard
