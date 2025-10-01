"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { generateAvatar } from "../../lib/utils"
import { useUser } from "../../contexts/UserContext"
import { useAuth } from "../providers/AuthProvider"
import apiService from "../../lib/api"

export default function PostCreator({ onPost }) {
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState("general")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const { getFullName } = useUser()
  const { session } = useAuth()

  const currentUser = {
    name: getFullName(),
    avatar: generateAvatar(getFullName()).initials,
  }

  const avatar = generateAvatar(currentUser.name)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsPosting(true)

    try {
      // Get auth token
      const token = session?.access_token

      // Create post via API
      const response = await apiService.posts.create({
        content: content.trim(),
        post_type: postType,
        images: [],
        tags: []
      }, token)

      if (response.success) {
        // Call parent onPost callback with the new post
        onPost(response.data.post)
        
        // Reset form
        setContent("")
        setPostType("general")
        setIsExpanded(false)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      // For now, still create a mock post if API fails
      onPost({
        id: Date.now().toString(),
        content: content.trim(),
        post_type: postType,
        author: {
          name: currentUser.name,
          designation: 'Alumni',
          company: 'Not specified',
          batch: 'Not specified',
          avatar: currentUser.avatar
        },
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false
      })
      
      setContent("")
      setPostType("general")
      setIsExpanded(false)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {currentUser.avatar || avatar.initials}
          </div>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="What's on your mind? Share with your alumni network..."
                className="w-full p-3 bg-input border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                rows={isExpanded ? 4 : 2}
              />

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Post Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Post Type</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "general", label: "General", icon: "💬" },
                        { id: "job", label: "Job Opportunity", icon: "💼" },
                        { id: "achievement", label: "Achievement", icon: "🏆" },
                        { id: "mentorship", label: "Mentorship", icon: "🤝" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setPostType(type.id)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            postType === type.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-transparent text-foreground-muted border-border hover:border-primary hover:text-primary"
                          }`}
                        >
                          <span className="mr-1">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-foreground-muted">
                      <button
                        type="button"
                        className="flex items-center space-x-1 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">Photo</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center space-x-1 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <span className="text-sm">Link</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsExpanded(false)
                          setContent("")
                          setPostType("general")
                        }}
                        className="bg-transparent"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={!content.trim() || isPosting} className="hover-glow">
                        {isPosting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
