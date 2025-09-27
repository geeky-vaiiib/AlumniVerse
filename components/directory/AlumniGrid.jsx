import AlumniCard from "./AlumniCard"

export default function AlumniGrid({ alumni, isLoading, onConnect }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (alumni.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No alumni found</h3>
        <p className="text-foreground-muted">Try adjusting your filters or search terms to find more alumni.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {alumni.map((person, index) => (
        <AlumniCard key={person.id} alumni={person} onConnect={onConnect} animationDelay={index * 100} />
      ))}
    </div>
  )
}
