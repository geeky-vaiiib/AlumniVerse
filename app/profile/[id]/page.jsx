"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { 
  MapPin, 
  Building, 
  Calendar, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  ExternalLink,
  GraduationCap,
  Briefcase,
  Users,
  MessageCircle
} from "lucide-react"
import { generateAvatar } from "../../lib/utils"
import { supabase } from "../../lib/supabaseClient"
import Link from "next/link"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userPosts, setUserPosts] = useState([])

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      
      // Fetch user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw profileError
      }

      setProfile(userProfile)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      // Fetch user's posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!author_id (
            id,
            first_name,
            last_name,
            current_position,
            company,
            passing_year
          )
        `)
        .eq('author_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (postsError) {
        throw postsError
      }

      setUserPosts(posts || [])
    } catch (err) {
      console.error('Error fetching user posts:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-foreground-muted mb-4">{error}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
            <p className="text-foreground-muted mb-4">The user profile you're looking for doesn't exist.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const avatar = generateAvatar(`${profile.first_name} ${profile.last_name}`)
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: avatar.backgroundColor }}
            >
              {profile.avatar_path ? (
                <img 
                  src={profile.avatar_path} 
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                avatar.initials
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{fullName}</h1>
              <p className="text-lg text-foreground-muted mb-2">
                {profile.current_position || 'Alumni'} 
                {profile.company && ` at ${profile.company}`}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {profile.branch || 'Unknown Branch'} • Class of {profile.passing_year || 'Unknown'}
                </div>
              </div>

              {profile.bio && (
                <p className="text-foreground mb-4">{profile.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Connect
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - About & Contact */}
        <div className="space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.usn && (
                <div>
                  <h4 className="font-semibold mb-1">USN</h4>
                  <p className="text-foreground-muted">{profile.usn}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-1">Education</h4>
                <p className="text-foreground-muted">
                  {profile.branch || 'Unknown Branch'}<br/>
                  Siddaganga Institute of Technology<br/>
                  {profile.admission_year && `${profile.admission_year} - `}{profile.passing_year || 'Present'}
                </p>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Links */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-foreground-muted" />
                <span className="text-sm">{profile.email}</span>
              </div>

              {profile.linkedin_url && (
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {profile.github_url && (
                <a 
                  href={profile.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHub Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {profile.leetcode_url && (
                <a 
                  href={profile.leetcode_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  LeetCode Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {profile.resume_url && (
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Resume
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                          style={{ backgroundColor: avatar.backgroundColor }}
                        >
                          {avatar.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{fullName}</span>
                            <span className="text-xs text-foreground-muted">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground-muted mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-foreground-muted">
                            <span>{post.likes_count || 0} likes</span>
                            <span>{post.comments_count || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-foreground-muted">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
