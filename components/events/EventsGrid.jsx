import EventCard from "./EventCard"

const EventsGrid = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
        <p className="text-gray-400 text-center max-w-md">
          Try adjusting your filters or check back later for new events.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">
          Showing {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
        <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
          <option>Sort by: Date (Nearest First)</option>
          <option>Sort by: Most Popular</option>
          <option>Sort by: Recently Added</option>
        </select>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default EventsGrid
