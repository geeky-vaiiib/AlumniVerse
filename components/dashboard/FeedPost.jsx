"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { generateAvatar } from "../../lib/utils"
import Link from "next/link"
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react"

export default function FeedPost({ post, onLike }) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)

  const avatar = generateAvatar(post.author.name)

  const handleComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setNewComment("")
  }

  return (
    <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Link href={`/profile/${post.author.id || post.author_id}`} className="relative flex-shrink-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold ring-2 ring-white/10 transition-transform group-hover:scale-105"
              style={{ backgroundColor: avatar.backgroundColor }}
            >
              {post.author.avatar || avatar.initials}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Link href={`/profile/${post.author.id || post.author_id}`} className="hover:underline">
                <h3 className="font-semibold text-foreground">{post.author.name}</h3>
              </Link>
              <span className="badge-primary text-[10px]">Alumni</span>
            </div>
            <p className="text-sm text-foreground-muted line-clamp-1">
              {post.author.designation} at {post.author.company} • Class of {post.author.batch}
            </p>
            <p className="text-xs text-foreground-subtle mt-1">{post.timestamp}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-primary bg-primary/10' : 'text-foreground-muted hover:text-foreground hover:bg-surface'}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {/* Images */}
          {post.image && (
            <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-white/5">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}
          {post.images && post.images.length > 0 && (
            <div className={`mt-4 grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : ''}`}>
              {post.images.map((imageUrl, index) => (
                <div key={index} className="rounded-xl overflow-hidden ring-1 ring-white/5">
                  <img src={imageUrl} alt={`Post content ${index + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-foreground-muted mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-accent-pink flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-current" />
              </span>
              {post.likes}
            </span>
            <span>{Array.isArray(post.comments) ? post.comments.length : post.comments} comments</span>
          </div>
          <span>{post.shares} shares</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${post.isLiked
                ? "text-primary bg-primary/10"
                : "text-foreground-muted hover:text-primary hover:bg-primary/5"
              }`}
          >
            <Heart className={`w-5 h-5 transition-transform ${post.isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`} />
            <span className="text-sm font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-foreground-muted hover:text-accent-blue hover:bg-accent-blue/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-foreground-muted hover:text-accent-teal hover:bg-accent-teal/5 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border animate-fade-in">
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary to-accent-blue flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  JD
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            <div className="text-sm text-foreground-muted text-center py-4 bg-surface/50 rounded-xl">
              No comments yet. Be the first to comment!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
