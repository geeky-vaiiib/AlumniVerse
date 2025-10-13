"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { usePlatformStats } from "../../hooks/usePlatformStats"
import { TrendingUp, Users, Briefcase, Calendar } from "lucide-react"

export default function RightSidebar() {
  const platformStats = usePlatformStats()

  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4A90E2]" />
            Live Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {platformStats.loading ? (
            <div className="grid grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center p-3 bg-[#3D3D3D] rounded-lg">
                  <div className="h-6 bg-[#4D4D4D] rounded mb-2"></div>
                  <div className="h-3 bg-[#4D4D4D] rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-[#4A90E2] mr-1" />
                  <div className="text-2xl font-bold text-[#4A90E2]">{platformStats.totalAlumni}</div>
                </div>
                <div className="text-xs text-[#B0B0B0]">Alumni</div>
              </div>
              <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4 text-green-400 mr-1" />
                  <div className="text-2xl font-bold text-green-400">{platformStats.activeJobs}</div>
                </div>
                <div className="text-xs text-[#B0B0B0]">Open Jobs</div>
              </div>
              <div className="text-center p-3 bg-[#3D3D3D] rounded-lg col-span-2">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4 text-yellow-400 mr-1" />
                  <div className="text-2xl font-bold text-yellow-400">{platformStats.upcomingEvents}</div>
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
