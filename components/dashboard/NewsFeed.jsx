"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { usePosts } from "../../hooks/useRealTime"
import { useUser } from "../../contexts/UserContext"
import { getInitials, formatTimestamp, extractHashtags, safeMap, ensureArray } from "../../lib/utils"
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Send,
  MoreHorizontal,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  Plus,
  X,
  Upload
} from "lucide-react"

export default function NewsFeed() {
  const { posts, postsLoading, createPost, likePost, addComment } = usePosts()
  const { userProfile, getFullName, getInitials: getUserInitials } = useUser()
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    images: [],
    links: []
  })
  const [commentInputs, setCommentInputs] = useState({})
  const [showComments, setShowComments] = useState({})
  const fileInputRef = useRef(null)

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return

    try {
      await createPost({
        author: {
          id: userProfile?.id || 'current-user',
          name: getFullName(),
          avatar: userProfile?.avatarUrl || null,
          designation: userProfile?.designation || 'Alumni Member',
          company: userProfile?.currentCompany || '',
          batch: userProfile?.passingYear || '',
          isVerified: userProfile?.profileCompleted || false
        },
        content: newPost.content,
        images: newPost.images,
        links: newPost.links,
        tags: extractHashtags(newPost.content)
      })

      setNewPost({ content: '', images: [], links: [] })
      setIsCreatingPost(false)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const handleLikePost = async (postId) => {
    await likePost(postId)
  }

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId]
    if (!content?.trim()) return

    await addComment(postId, {
      author: {
        id: userProfile?.id || 'current-user',
        name: getFullName(),
        avatar: userProfile?.avatarUrl || null
      },
      content
    })

    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setNewPost(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }))
  }

  const removeImage = (index) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }



  const quickActions = [
    { icon: Briefcase, label: 'Post Job', color: 'text-blue-400' },
    { icon: Award, label: 'Share Achievement', color: 'text-yellow-400' },
    { icon: Users, label: 'Mentorship Offer', color: 'text-green-400' }
  ]

  const trendingTopics = [
    '#TechCareers', '#AlumniNetwork', '#JobOpportunities', 
    '#Mentorship', '#Innovation', '#StartupLife'
  ]

  const connectSuggestions = [
    { name: 'Alex Johnson', company: 'Meta', mutual: 5 },
    { name: 'Sarah Chen', company: 'Netflix', mutual: 3 },
    { name: 'David Kumar', company: 'Spotify', mutual: 8 }
  ]

  if (postsLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#3D3D3D] rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#3D3D3D] rounded w-32"></div>
                    <div className="h-3 bg-[#3D3D3D] rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#3D3D3D] rounded"></div>
                  <div className="h-4 bg-[#3D3D3D] rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-3 space-y-6">
        {/* Post Creation */}
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardContent className="p-4">
            {!isCreatingPost ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-[#4A90E2] text-white">
                    You
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingPost(true)}
                  className="flex-1 justify-start bg-[#3D3D3D] border-[#4D4D4D] text-[#B0B0B0] hover:bg-[#4D4D4D]"
                >
                  What's on your mind?
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-[#4A90E2] text-white">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share your thoughts, achievements, or opportunities..."
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-[#3D3D3D] border-[#4D4D4D] text-white placeholder-[#B0B0B0] resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {newPost.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newPost.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D]"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#B0B0B0] hover:text-white hover:bg-[#3D3D3D]"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Link
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingPost(false)}
                      className="bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.content.trim()}
                      className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {postsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#2D2D2D] border-[#3D3D3D]">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-32"></div>
                        <div className="h-3 bg-gray-600 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !Array.isArray(posts) || posts.length === 0 ? (
          <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p>Be the first to share something with the community!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          safeMap(posts, (post) => (
          <Card key={post.id} className="bg-[#2D2D2D] border-[#3D3D3D] hover:border-[#4A90E2]/50 transition-colors">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback className="bg-[#4A90E2] text-white">
                      {getInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white">{post.author.name}</h4>
                      {post.author.isVerified && (
                        <div className="w-4 h-4 bg-[#4A90E2] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#B0B0B0]">{post.author.designation}</p>
                    <p className="text-xs text-[#B0B0B0]">{formatTimestamp(post.timestamp)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#B0B0B0] hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-white whitespace-pre-wrap">{post.content}</p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="border-[#4A90E2] text-[#4A90E2] text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className="flex items-center justify-between text-sm text-[#B0B0B0] mb-4">
                <span>{post.likes} likes</span>
                <div className="flex items-center space-x-4">
                  <span>{post.commentCount} comments</span>
                  <span>{post.shares} shares</span>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between border-t border-[#3D3D3D] pt-4">
                <Button
                  variant="ghost"
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 ${
                    post.isLiked ? 'text-red-400' : 'text-[#B0B0B0]'
                  } hover:text-red-400`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>Like</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center space-x-2 text-[#B0B0B0] hover:text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Comment</span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-[#B0B0B0] hover:text-white"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 space-y-3 border-t border-[#3D3D3D] pt-4">
                  {/* Add Comment */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#4A90E2] text-white text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center space-x-2">
                      <Input
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="bg-[#3D3D3D] border-[#4D4D4D] text-white placeholder-[#B0B0B0]"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Existing Comments */}
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback className="bg-[#4A90E2] text-white text-xs">
                          {getInitials(comment.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-[#3D3D3D] rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white text-sm">{comment.author.name}</span>
                            <span className="text-xs text-[#B0B0B0]">{formatTimestamp(comment.timestamp)}</span>
                          </div>
                          <p className="text-sm text-[#B0B0B0]">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )))}
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start bg-transparent border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
              >
                <action.icon className={`w-4 h-4 mr-3 ${action.color}`} />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trending
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-[#4A90E2] text-[#4A90E2] cursor-pointer hover:bg-[#4A90E2] hover:text-white transition-colors"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connect Suggestions */}
        <Card className="bg-[#2D2D2D] border-[#3D3D3D]">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              People You May Know
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectSuggestions.map((person, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#4A90E2] text-white text-xs">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{person.name}</p>
                    <p className="text-xs text-[#B0B0B0]">{person.company}</p>
                    <p className="text-xs text-[#B0B0B0]">{person.mutual} mutual connections</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
