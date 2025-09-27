"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { generateAvatar } from "../../lib/utils"

export default function FeedPost({ post, onLike }) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")

  const avatar = generateAvatar(post.author.name)

  const handleComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    // Handle comment submission
    setNewComment("")
  }

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Career Milestone":
        return "bg-success/20 text-success"
      case "Achievement":
        return "bg-warning/20 text-warning"
      case "Job Opportunity":
        return "bg-primary/20 text-primary"
      default:
        return "bg-muted text-foreground-muted"
    }
  }

  return (
    <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {post.author.avatar || avatar.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-foreground">{post.author.name}</h3>
              {post.badge && (
                <span className={`px-2 py-1 text-xs rounded-full ${getBadgeColor(post.badge)}`}>{post.badge}</span>
              )}
            </div>
            <p className="text-sm text-foreground-muted">
              {post.author.designation} at {post.author.company} • Class of {post.author.batch}
            </p>
            <p className="text-xs text-foreground-muted mt-1">{post.timestamp}</p>
          </div>

          <button className="text-foreground-muted hover:text-foreground p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed">{post.content}</p>
          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-foreground-muted mb-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center space-x-4">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
            <span>{post.shares} shares</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              post.isLiked
                ? "text-primary bg-primary/10"
                : "text-foreground-muted hover:text-primary hover:bg-primary/5"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={post.isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-foreground-muted hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-foreground-muted hover:text-primary hover:bg-primary/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  JD
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 bg-input border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </form>

            <div className="text-sm text-foreground-muted text-center py-2">Comments will be displayed here</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
