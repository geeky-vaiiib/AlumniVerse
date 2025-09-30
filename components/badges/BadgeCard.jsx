"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Calendar, Trophy, Star } from "lucide-react"

export default function BadgeCard({ badge, isEarned = false }) {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500'
      case 'rare':
        return 'bg-blue-500'
      case 'epic':
        return 'bg-purple-500'
      case 'legendary':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return <Trophy className="w-4 h-4" />
      case 'epic':
        return <Star className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      isEarned 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
        : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-3xl p-2 rounded-full ${
              isEarned ? 'bg-white shadow-sm' : 'bg-gray-100'
            }`}>
              {badge.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{badge.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`${getRarityColor(badge.rarity)} text-white text-xs`}
                >
                  {getRarityIcon(badge.rarity)}
                  <span className="ml-1 capitalize">{badge.rarity}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm mb-3">
          {badge.description}
        </CardDescription>
        
        {/* Progress Bar */}
        {badge.progress !== undefined && badge.maxProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {badge.progress}/{badge.maxProgress}
              </span>
            </div>
            <Progress 
              value={(badge.progress / badge.maxProgress) * 100} 
              className="h-2"
            />
          </div>
        )}
        
        {/* Earned Date */}
        {isEarned && badge.earnedDate && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Earned on {new Date(badge.earnedDate).toLocaleDateString()}</span>
          </div>
        )}
        
        {/* Requirements */}
        {!isEarned && badge.requirements && (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
            <p className="text-sm text-gray-600">{badge.requirements}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
