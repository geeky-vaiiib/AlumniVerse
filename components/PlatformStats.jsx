"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { getSupabaseClient } from "@/lib/supabase-singleton"
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react"

const supabase = getSupabaseClient()

export default function PlatformStats({ className = "" }) {
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

  const statsData = [
    {
      label: "Alumni",
      value: stats.alumni,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Open Jobs",
      value: stats.openJobs,
      icon: Briefcase,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: Calendar,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ]

  if (stats.loading) {
    return (
      <Card className={`bg-[#2D2D2D] border-[#3D3D3D] ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#4A90E2]" />
              <span className="text-white font-semibold">Live Stats</span>
            </div>
            <div className="flex space-x-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-8 h-4 bg-[#3D3D3D] rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-3 bg-[#3D3D3D] rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-[#2D2D2D] border-[#3D3D3D] ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#4A90E2]" />
            <span className="text-white font-semibold">Live Stats</span>
          </div>
          <div className="flex space-x-6">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className={`p-1 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <span className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-[#B0B0B0] font-medium">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}