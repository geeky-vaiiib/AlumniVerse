import JobCard from "./JobCard"

const JobGrid = ({ jobs, savedJobs, onSaveJob }) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
        <p className="text-gray-400 text-center max-w-md">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">
          Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}
        </p>
        <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
          <option>Sort by: Most Recent</option>
          <option>Sort by: Most Relevant</option>
          <option>Sort by: Salary (High to Low)</option>
          <option>Sort by: Salary (Low to High)</option>
        </select>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isSaved={savedJobs.includes(job.id)} onSave={() => onSaveJob(job.id)} />
        ))}
      </div>
    </div>
  )
}

export default JobGrid
