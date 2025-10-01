"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { useUser } from "../../contexts/UserContext"
import { usePlatformStats, useRecentUpdates, useSuggestedConnections } from "../../hooks/usePlatformStats"

export default function RightSidebar() {
  const { userProfile } = useUser()
  const platformStats = usePlatformStats()
  const { updates: recentUpdates, loading: updatesLoading } = useRecentUpdates()
  const { suggestions: suggestedConnections, loading: suggestionsLoading } = useSuggestedConnections(userProfile?.id, 3)
  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {platformStats.loading ? (
            <div className="grid grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Updates Panel</CardTitle>
        </CardHeader>
        <CardContent>
          {updatesLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentUpdates.length > 0 ? (
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
          ) : (
            <p className="text-sm text-foreground-muted text-center py-4">No recent updates</p>
          )}
        </CardContent>
      </Card>

      {/* Connect With Alumni */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connect With Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestionsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestedConnections.length > 0 ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-foreground-muted text-center py-4">No suggestions available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
