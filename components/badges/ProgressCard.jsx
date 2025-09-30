"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Target, TrendingUp, Calendar, Users } from "lucide-react"

export default function ProgressCard({ userStats = {} }) {
  const defaultStats = {
    totalBadges: 0,
    badgesThisMonth: 0,
    nextBadgeProgress: 0,
    nextBadgeName: "First Connection",
    nextBadgeRequirement: "Connect with 5 alumni",
    streakDays: 0,
    level: 1,
    pointsToNextLevel: 100,
    currentPoints: 0,
    ...userStats
  }

  const stats = defaultStats

  const progressPercentage = stats.nextBadgeProgress || 0
  const levelProgress = stats.currentPoints ? (stats.currentPoints / (stats.currentPoints + stats.pointsToNextLevel)) * 100 : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Your Progress
        </CardTitle>
        <CardDescription>
          Track your achievements and goals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">Level {stats.level}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.currentPoints} pts
            </Badge>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-gray-600">
            {stats.pointsToNextLevel} points to Level {stats.level + 1}
          </p>
        </div>

        {/* Next Badge Progress */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Next Badge</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-sm">{stats.nextBadgeName}</p>
            <p className="text-xs text-gray-600 mb-2">{stats.nextBadgeRequirement}</p>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              {progressPercentage}% complete
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Badge className="bg-blue-500 text-white text-lg font-bold px-3 py-1">
                {stats.totalBadges}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">Total Badges</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Badge className="bg-green-500 text-white text-lg font-bold px-3 py-1">
                {stats.badgesThisMonth}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">This Month</p>
          </div>
        </div>

        {/* Activity Streak */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="font-medium">Activity Streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              🔥 {stats.streakDays} days
            </Badge>
            {stats.streakDays > 0 && (
              <span className="text-xs text-gray-600">
                Keep it up!
              </span>
            )}
          </div>
        </div>

        {/* Achievements Summary */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Recent Activity</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {stats.recentAchievements?.length > 0 ? (
              stats.recentAchievements.slice(0, 2).map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  <span>{achievement}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
