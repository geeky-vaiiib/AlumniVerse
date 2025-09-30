import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"

// Mock data
const platformStats = {
  totalAlumni: 1247,
  activeUsers: 89,
  newConnections: 23,
  upcomingEvents: 5,
}

const recentUpdates = [
  {
    id: 1,
    title: "New Feature: Video Calls",
    description: "Connect with alumni through video calls",
    time: "2 hours ago",
    type: "feature",
  },
  {
    id: 2,
    title: "Alumni Meetup - Bangalore",
    description: "Join us for networking and fun",
    time: "1 day ago",
    type: "event",
  },
  {
    id: 3,
    title: "Job Fair 2024",
    description: "Exclusive opportunities for our alumni",
    time: "3 days ago",
    type: "opportunity",
  },
]

const suggestedConnections = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Apple",
    batch: "2019",
    mutualConnections: 12,
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "Netflix",
    batch: "2021",
    mutualConnections: 8,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Davis",
    company: "Uber",
    batch: "2018",
    mutualConnections: 15,
    avatar: "ED",
  },
]

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{platformStats.totalAlumni}</div>
              <div className="text-xs text-foreground-muted">Total Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{platformStats.activeUsers}%</div>
              <div className="text-xs text-foreground-muted">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-2">{platformStats.newConnections}</div>
              <div className="text-xs text-foreground-muted">New Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{platformStats.upcomingEvents}</div>
              <div className="text-xs text-foreground-muted">Upcoming Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Updates Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex space-x-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    update.type === "feature" ? "bg-primary" : update.type === "event" ? "bg-success" : "bg-warning"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{update.title}</h4>
                  <p className="text-xs text-foreground-muted mt-1">{update.description}</p>
                  <p className="text-xs text-foreground-muted mt-1">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connect With Alumni */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connect With Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedConnections.map((person) => (
              <div key={person.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-chart-2 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {person.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{person.name}</h4>
                  <p className="text-xs text-foreground-muted">
                    {person.company} • {person.batch}
                  </p>
                  <p className="text-xs text-primary">{person.mutualConnections} mutual connections</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  Connect
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <a href="/directory">View All Alumni</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
