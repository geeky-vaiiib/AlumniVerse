"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useUser } from "../../contexts/UserContext"
import { getSupabaseClient } from "../../lib/supabase-singleton"
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react"

const supabase = getSupabaseClient()

export default function TrendingAndConnections() {
  const { userProfile } = useUser()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    upcomingEvents: 0,
    loading: true
  })

  // Fetch real platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_deleted', false)

        // Get active jobs count
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Get upcoming events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('event_date', new Date().toISOString())

        setStats({
          totalUsers: usersCount || 0,
          activeJobs: jobsCount || 0,
          upcomingEvents: eventsCount || 0,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Live Platform Stats */}
      <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Live Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.loading ? (
            <div className="grid grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-[#3D3D3D] rounded mb-2"></div>
                  <div className="h-3 bg-[#3D3D3D] rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-primary mr-1" />
                  <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
                </div>
                <div className="text-xs text-[#B0B0B0]">Alumni</div>
              </div>
              <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4 text-green-400 mr-1" />
                  <div className="text-2xl font-bold text-green-400">{stats.activeJobs}</div>
                </div>
                <div className="text-xs text-[#B0B0B0]">Open Jobs</div>
              </div>
              <div className="text-center p-3 bg-[#3D3D3D] rounded-lg col-span-2">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4 text-yellow-400 mr-1" />
                  <div className="text-2xl font-bold text-yellow-400">{stats.upcomingEvents}</div>
                </div>
                <div className="text-xs text-[#B0B0B0]">Upcoming Events</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
