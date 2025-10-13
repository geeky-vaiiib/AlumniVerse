"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-singleton"
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react"

const supabase = getSupabaseClient()

export default function SimplifiedRightSidebar() {
  const [stats, setStats] = useState({
    alumni: 0,
    openJobs: 0,
    upcomingEvents: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all stats in parallel
        const [
          { count: alumniCount },
          { count: jobsCount },
          { count: eventsCount }
        ] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("is_active", true)
        ])

        setStats({
          alumni: alumniCount || 0,
          openJobs: jobsCount || 0,
          upcomingEvents: eventsCount || 0,
          loading: false
        })
      } catch (error) {
        console.error("Error fetching platform stats:", error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#4A90E2]" />
              Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center p-3 bg-[#3D3D3D] rounded-lg">
                  <div className="h-6 bg-[#4D4D4D] rounded mb-2"></div>
                  <div className="h-3 bg-[#4D4D4D] rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Live Platform Stats */}
      <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4A90E2]" />
            Live Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-[#4A90E2] mr-1" />
                <div className="text-2xl font-bold text-[#4A90E2]">{stats.alumni}</div>
              </div>
              <div className="text-xs text-[#B0B0B0]">Alumni</div>
            </div>
            <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="w-4 h-4 text-green-400 mr-1" />
                <div className="text-2xl font-bold text-green-400">{stats.openJobs}</div>
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
        </CardContent>
      </Card>
    </div>
  )
}