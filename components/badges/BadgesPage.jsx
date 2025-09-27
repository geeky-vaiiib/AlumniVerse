"use client"

import { useState, useEffect } from "react"
import BadgeCard from "./BadgeCard"
import LeaderboardCard from "./LeaderboardCard"
import ProgressCard from "./ProgressCard"

const BadgesPage = () => {
  const [userBadges, setUserBadges] = useState([])
  const [availableBadges, setAvailableBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userStats, setUserStats] = useState({})

  useEffect(() => {
    // Mock user badges
    const mockUserBadges = [
      {
        id: 1,
        name: "Super Connector",
        description: "Connected with 50+ alumni",
        icon: "🤝",
        earnedDate: "2024-01-15",
        rarity: "rare",
        progress: 100,
        maxProgress: 100,
      },
      {
        id: 2,
        name: "Event Enthusiast",
        description: "Attended 10+ events",
        icon: "🎉",
        earnedDate: "2024-01-20",
        rarity: "common",
        progress: 100,
        maxProgress: 100,
      },
      {
        id: 3,
        name: "Job Referrer",
        description: "Successfully referred 5+ candidates",
        icon: "💼",
        earnedDate: "2024-02-01",
        rarity: "epic",
        progress: 100,
        maxProgress: 100,
      },
    ]

    // Mock available badges
    const mockAvailableBadges = [
      {
        id: 4,
        name: "Mentor Master",
        description: "Mentor 20+ junior alumni",
        icon: "🎓",
        rarity: "legendary",
        progress: 12,
        maxProgress: 20,
        requirements: "Mentor 20 junior alumni to unlock this badge",
      },
      {
        id: 5,
        name: "Top Recruiter",
        description: "Post 15+ job opportunities",
        icon: "🏆",
        rarity: "epic",
        progress: 8,
        maxProgress: 15,
        requirements: "Post 15 job opportunities to unlock this badge",
      },
      {
        id: 6,
        name: "Alumni Champion",
        description: "Complete all platform activities",
        icon: "👑",
        rarity: "legendary",
        progress: 7,
        maxProgress: 10,
        requirements: "Complete all platform activities to unlock this badge",
      },
      {
        id: 7,
        name: "Content Creator",
        description: "Create 25+ posts",
        icon: "✍️",
        rarity: "rare",
        progress: 18,
        maxProgress: 25,
        requirements: "Create 25 posts to unlock this badge",
      },
    ]

    // Mock leaderboard
    const mockLeaderboard = [
      {
        id: 1,
        name: "Rahul Sharma",
        batch: "2019",
        avatar: "/rahul-sharma.jpg",
        badgeCount: 12,
        points: 2450,
        rank: 1,
      },
      {
        id: 2,
        name: "Priya Patel",
        batch: "2018",
        avatar: "/priya-patel.jpg",
        badgeCount: 10,
        points: 2180,
        rank: 2,
      },
      {
        id: 3,
        name: "Arjun Kumar",
        batch: "2020",
        avatar: "/arjun-kumar.jpg",
        badgeCount: 9,
        points: 1950,
        rank: 3,
      },
      {
        id: 4,
        name: "You",
        batch: "2021",
        avatar: "/current-user.jpg",
        badgeCount: 3,
        points: 850,
        rank: 15,
      },
    ]

    // Mock user stats
    const mockUserStats = {
      totalBadges: 3,
      totalPoints: 850,
      rank: 15,
      streak: 7,
      nextBadge: "Mentor Master",
      progressToNext: 60,
    }

    setUserBadges(mockUserBadges)
    setAvailableBadges(mockAvailableBadges)
    setLeaderboard(mockLeaderboard)
    setUserStats(mockUserStats)
  }, [])

  const getRarityColor = (rarity) => {
    const colors = {
      common: "border-gray-500 bg-gray-900",
      rare: "border-blue-500 bg-blue-900",
      epic: "border-purple-500 bg-purple-900",
      legendary: "border-yellow-500 bg-yellow-900",
    }
    return colors[rarity] || colors.common
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recognition & Badges</h1>
          <p className="text-gray-400">Track your achievements and compete with fellow alumni</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-400">{userStats.totalBadges}</div>
            <div className="text-gray-400">Badges Earned</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-green-400">{userStats.totalPoints}</div>
            <div className="text-gray-400">Total Points</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-400">#{userStats.rank}</div>
            <div className="text-gray-400">Global Rank</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-orange-400">{userStats.streak}</div>
            <div className="text-gray-400">Day Streak</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Card */}
            <ProgressCard userStats={userStats} />

            {/* Your Badges */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Your Badges ({userBadges.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} isEarned={true} />
                ))}
              </div>
            </div>

            {/* Available Badges */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Available Badges ({availableBadges.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} isEarned={false} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeaderboardCard leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BadgesPage
