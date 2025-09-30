"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Trophy, Medal, Award, Crown } from "lucide-react"

export default function LeaderboardCard({ leaderboard = [] }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Award className="w-4 h-4 text-gray-500" />
    }
  }

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badge Leaderboard
        </CardTitle>
        <CardDescription>
          Top alumni by badge count this month
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No leaderboard data available</p>
          </div>
        ) : (
          leaderboard.map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                {index < 3 ? (
                  getRankIcon(index + 1)
                ) : (
                  <span className="text-sm font-medium text-gray-500">
                    #{index + 1}
                  </span>
                )}
              </div>
              
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  {index < 3 && (
                    <Badge className={`text-xs ${getRankBadgeColor(index + 1)}`}>
                      #{index + 1}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {user.title || 'Alumni'}
                </p>
              </div>
              
              {/* Badge Count */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-blue-600">
                    {user.badgeCount}
                  </span>
                </div>
                <p className="text-xs text-gray-500">badges</p>
              </div>
            </div>
          ))
        )}
        
        {/* View All Link */}
        {leaderboard.length > 0 && (
          <div className="pt-3 border-t">
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Full Leaderboard →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
