"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Progress } from "../ui/progress"
import { 
  Award, 
  Trophy, 
  Star, 
  Users, 
  MessageCircle, 
  Briefcase, 
  BookOpen, 
  Heart,
  Zap,
  Target,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  Calendar,
  Lock
} from "lucide-react"

// Mock badges data
const mockUserBadges = [
  {
    id: 1,
    name: "Early Adopter",
    description: "One of the first 100 members to join AlumniVerse",
    icon: "star",
    category: "Community",
    earnedDate: "2024-01-01",
    rarity: "rare",
    progress: 100,
    isEarned: true
  },
  {
    id: 2,
    name: "Super Connector",
    description: "Connected with 50+ alumni",
    icon: "users",
    category: "Networking",
    earnedDate: "2024-01-15",
    rarity: "common",
    progress: 100,
    isEarned: true
  },
  {
    id: 3,
    name: "Content Creator",
    description: "Posted 25+ helpful posts and updates",
    icon: "message-circle",
    category: "Engagement",
    earnedDate: null,
    rarity: "uncommon",
    progress: 68,
    isEarned: false,
    requirement: "25 posts",
    current: 17
  },
  {
    id: 4,
    name: "Job Referrer",
    description: "Successfully referred 5+ job opportunities",
    icon: "briefcase",
    category: "Career",
    earnedDate: null,
    rarity: "uncommon",
    progress: 40,
    isEarned: false,
    requirement: "5 referrals",
    current: 2
  }
]

const mockAvailableBadges = [
  {
    id: 5,
    name: "Mentor Master",
    description: "Mentored 10+ junior alumni",
    icon: "book-open",
    category: "Mentorship",
    rarity: "rare",
    requirement: "10 mentees",
    isLocked: false
  },
  {
    id: 6,
    name: "Event Organizer",
    description: "Organized 3+ successful events",
    icon: "calendar",
    category: "Leadership",
    rarity: "uncommon",
    requirement: "3 events",
    isLocked: false
  },
  {
    id: 7,
    name: "Alumni Champion",
    description: "Achieved top 1% engagement score",
    icon: "crown",
    category: "Elite",
    rarity: "legendary",
    requirement: "Top 1% engagement",
    isLocked: true
  },
  {
    id: 8,
    name: "Knowledge Sharer",
    description: "Shared 50+ valuable resources",
    icon: "heart",
    category: "Community",
    rarity: "common",
    requirement: "50 shared resources",
    isLocked: false
  }
]

const mockLeaderboard = [
  {
    rank: 1,
    name: "Priya Sharma",
    avatar: null,
    points: 2450,
    badgeCount: 12,
    isCurrentUser: false
  },
  {
    rank: 2,
    name: "Rahul Kumar",
    avatar: null,
    points: 2380,
    badgeCount: 11,
    isCurrentUser: false
  },
  {
    rank: 3,
    name: "You",
    avatar: null,
    points: 1890,
    badgeCount: 8,
    isCurrentUser: true
  },
  {
    rank: 4,
    name: "Anita Reddy",
    avatar: null,
    points: 1750,
    badgeCount: 9,
    isCurrentUser: false
  },
  {
    rank: 5,
    name: "Vikram Singh",
    avatar: null,
    points: 1680,
    badgeCount: 7,
    isCurrentUser: false
  }
]

export default function BadgesPage() {
  const [activeTab, setActiveTab] = useState('earned')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userStats, setUserStats] = useState({
    totalPoints: 1890,
    badgesEarned: 2,
    currentStreak: 7,
    rank: 3
  })

  const getIconComponent = (iconName) => {
    const icons = {
      'star': Star,
      'users': Users,
      'message-circle': MessageCircle,
      'briefcase': Briefcase,
      'book-open': BookOpen,
      'heart': Heart,
      'calendar': Calendar,
      'crown': Crown,
      'trophy': Trophy,
      'award': Award,
      'medal': Medal,
      'flame': Flame,
      'zap': Zap,
      'target': Target
    }
    return icons[iconName] || Award
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'uncommon': return 'from-green-400 to-green-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-500'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500'
      case 'uncommon': return 'border-green-500'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      default: return 'border-gray-500'
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const categories = ['all', 'Community', 'Networking', 'Engagement', 'Career', 'Mentorship', 'Leadership', 'Elite']

  const filteredBadges = (badges) => {
    if (selectedCategory === 'all') return badges
    return badges.filter(badge => badge.category === selectedCategory)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Badges & Recognition</h2>
          <p className="text-[#B0B0B0]">Track your achievements and community contributions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#4A90E2] to-[#357ABD] border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.totalPoints}</div>
            <div className="text-sm text-blue-100">Community Points</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.badgesEarned}</div>
            <div className="text-sm text-green-100">Badges Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.currentStreak}</div>
            <div className="text-sm text-orange-100">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">#{userStats.rank}</div>
            <div className="text-sm text-purple-100">Rank</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#2D2D2D] p-1 rounded-lg">
        {[
          { id: 'earned', label: 'Your Badges' },
          { id: 'available', label: 'Available Badges' },
          { id: 'leaderboard', label: 'Leaderboard' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id 
              ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white" 
              : "text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D]"
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Category Filter */}
      {(activeTab === 'earned' || activeTab === 'available') && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white" 
                : "bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
              }
              size="sm"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      )}

      {/* Your Badges Tab */}
      {activeTab === 'earned' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges(mockUserBadges).map((badge) => {
            const IconComponent = getIconComponent(badge.icon)
            return (
              <Card key={badge.id} className={`bg-[#2D2D2D] border-2 ${badge.isEarned ? getRarityBorder(badge.rarity) : 'border-[#3D3D3D]'} ${badge.isEarned ? '' : 'opacity-75'}`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center ${badge.isEarned ? '' : 'grayscale'}`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{badge.name}</h3>
                  <p className="text-sm text-[#B0B0B0] mb-4">{badge.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Badge 
                      variant="outline"
                      className={`border-current text-current ${getRarityBorder(badge.rarity).replace('border-', 'text-')}`}
                    >
                      {badge.category}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`border-current text-current ${getRarityBorder(badge.rarity).replace('border-', 'text-')}`}
                    >
                      {badge.rarity}
                    </Badge>
                  </div>

                  {badge.isEarned ? (
                    <div className="text-sm text-green-400">
                      ✓ Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-[#B0B0B0]">
                        Progress: {badge.current}/{badge.requirement.split(' ')[0]}
                      </div>
                      <Progress value={badge.progress} className="h-2 bg-[#3D3D3D]" />
                      <div className="text-xs text-[#4A90E2]">{badge.progress}% complete</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Available Badges Tab */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges(mockAvailableBadges).map((badge) => {
            const IconComponent = getIconComponent(badge.icon)
            return (
              <Card key={badge.id} className={`bg-[#2D2D2D] border-[#3D3D3D] ${badge.isLocked ? 'opacity-50' : 'hover:border-[#4A90E2]'} transition-colors`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center ${badge.isLocked ? 'grayscale' : ''}`}>
                    {badge.isLocked ? (
                      <Lock className="w-8 h-8 text-white" />
                    ) : (
                      <IconComponent className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{badge.name}</h3>
                  <p className="text-sm text-[#B0B0B0] mb-4">{badge.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Badge 
                      variant="outline"
                      className={`border-current text-current ${getRarityBorder(badge.rarity).replace('border-', 'text-')}`}
                    >
                      {badge.category}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`border-current text-current ${getRarityBorder(badge.rarity).replace('border-', 'text-')}`}
                    >
                      {badge.rarity}
                    </Badge>
                  </div>

                  <div className="text-sm text-[#B0B0B0]">
                    {badge.isLocked ? 'Unlock by earning other badges' : `Requirement: ${badge.requirement}`}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboard.map((user, index) => (
                  <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg ${user.isCurrentUser ? 'bg-[#4A90E2]/20 border border-[#4A90E2]' : 'bg-[#3D3D3D]'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? 'bg-yellow-500 text-black' :
                        user.rank === 2 ? 'bg-gray-400 text-black' :
                        user.rank === 3 ? 'bg-orange-500 text-black' :
                        'bg-[#4D4D4D] text-white'
                      }`}>
                        {user.rank}
                      </div>
                      
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-[#4A90E2] text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-semibold text-white flex items-center">
                          {user.name}
                          {user.isCurrentUser && (
                            <Badge variant="outline" className="ml-2 border-[#4A90E2] text-[#4A90E2]">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-[#B0B0B0]">{user.badgeCount} badges earned</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-[#4A90E2]">{user.points.toLocaleString()}</div>
                      <div className="text-sm text-[#B0B0B0]">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
