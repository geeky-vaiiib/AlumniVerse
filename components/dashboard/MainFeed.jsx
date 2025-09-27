"use client"

import { useState } from "react"
import PostCreator from "./PostCreator"
import FeedPost from "./FeedPost"
import { Card, CardContent } from "../ui/card"

// Mock posts data
const mockPosts = [
  {
    id: 1,
    author: {
      name: "Priya Sharma",
      avatar: "PS",
      batch: "2020",
      company: "Google",
      designation: "Software Engineer",
    },
    content:
      "Excited to share that I've been promoted to Senior Software Engineer at Google! 🎉 Grateful for all the support from my alumni network. Looking forward to mentoring junior developers.",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    badge: "Career Milestone",
    image: null,
  },
  {
    id: 2,
    author: {
      name: "Rahul Kumar",
      avatar: "RK",
      batch: "2018",
      company: "Microsoft",
      designation: "Product Manager",
    },
    content:
      "Just launched a new feature that will impact millions of users! The journey from idea to production was incredible. Special thanks to the amazing engineering team. #ProductManagement #Microsoft",
    timestamp: "5 hours ago",
    likes: 18,
    comments: 12,
    shares: 5,
    isLiked: true,
    badge: "Achievement",
    image: null,
  },
  {
    id: 3,
    author: {
      name: "Anita Patel",
      avatar: "AP",
      batch: "2019",
      company: "TechStart Inc.",
      designation: "Founder & CEO",
    },
    content:
      "We're hiring! Looking for passionate developers to join our startup. Great opportunity for recent graduates. DM me for details. #Hiring #Startup #Opportunities",
    timestamp: "1 day ago",
    likes: 31,
    comments: 15,
    shares: 8,
    isLiked: false,
    badge: "Job Opportunity",
    image: null,
  },
]

const trendingTopics = [
  { tag: "#TechCareers", posts: 156 },
  { tag: "#Placements2024", posts: 89 },
  { tag: "#StartupLife", posts: 67 },
  { tag: "#AlumniMeet", posts: 45 },
  { tag: "#Mentorship", posts: 34 },
]

export default function MainFeed({ activeTab }) {
  const [posts, setPosts] = useState(mockPosts)

  const handleNewPost = (newPost) => {
    const post = {
      id: Date.now(),
      author: {
        name: "John Doe",
        avatar: "JD",
        batch: "2020",
        company: "Tech Corp",
        designation: "Software Engineer",
      },
      content: newPost.content,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      badge: newPost.type === "job" ? "Job Opportunity" : newPost.type === "achievement" ? "Achievement" : null,
      image: newPost.image,
    }
    setPosts([post, ...posts])
  }

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  if (activeTab !== "feed") {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-foreground-muted">This section is under development.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Post Creator */}
      <PostCreator onPost={handleNewPost} />

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <button
                key={topic.tag}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {topic.tag} ({topic.posts})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} onLike={handleLike} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <button className="px-6 py-2 text-primary hover:text-primary-hover font-medium transition-colors">
          Load More Posts
        </button>
      </div>
    </div>
  )
}
