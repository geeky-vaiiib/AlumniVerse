"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { generateAvatar } from "../../lib/utils"
import { useAuth } from "../providers/AuthProvider"
import { useUser } from "../../contexts/UserContext"
import ProfileEditModal from "../profile/ProfileEditModal"
import { Edit3 } from "lucide-react"

const quickActions = [
  { id: "post", label: "Create Post", icon: "✏️", color: "from-primary to-chart-2" },
  { id: "job", label: "Post Job", icon: "💼", color: "from-chart-2 to-success" },
  { id: "achievement", label: "Share Achievement", icon: "🏆", color: "from-success to-warning" },
  { id: "mentorship", label: "Offer Mentorship", icon: "🤝", color: "from-warning to-primary" },
]

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground p-1 rounded-full hover:bg-surface-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// File Upload Component
function FileUpload({ onFileSelect, accept, label, multiple = false }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)
    onFileSelect(files)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    onFileSelect(files)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="text-2xl">📁</div>
          <div className="text-sm text-foreground-muted">
            Drop files here or{' '}
            <label className="text-primary cursor-pointer hover:underline">
              browse
              <input
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
              />
            </label>
          </div>
          {selectedFiles.length > 0 && (
            <div className="text-xs text-foreground-muted mt-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="truncate">📄 {file.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardSidebar({ activeTab, onTabChange, onAddPost }) {
  const { user } = useAuth()
  const { userProfile, getFullName } = useUser()
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)

  // Get user data from UserContext
  const currentUser = {
    name: getFullName(),
    email: userProfile?.email || user?.email || "",
    batch: userProfile?.passingYear || "N/A",
    branch: userProfile?.branch || "N/A",
    company: userProfile?.currentCompany || "Not specified",
    designation: userProfile?.designation || "Not specified",
    location: userProfile?.location || "Not specified",
    connections: userProfile?.connections || 0,
    profileCompletion: userProfile?.profileCompletion || 50,
    linkedinUrl: userProfile?.linkedinUrl || "",
    githubUrl: userProfile?.githubUrl || "",
    leetcodeUrl: userProfile?.leetcodeUrl || "",
    resumeUrl: userProfile?.resumeUrl || "",
  }
  
  const avatar = generateAvatar(currentUser.name)
  const [activeModal, setActiveModal] = useState(null)
  const [formData, setFormData] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleQuickAction = (actionId) => {
    setActiveModal(actionId)
    setFormData({})
    setUploadedFiles([])
  }

  const closeModal = () => {
    setActiveModal(null)
    setFormData({})
    setUploadedFiles([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Create new post/content based on modal type
    if (activeModal === 'post' && onAddPost) {
      const newPost = {
        id: Date.now(),
        author: {
          name: currentUser.name,
          avatar: generateAvatar(currentUser.name).initials,
          title: currentUser.designation,
          company: currentUser.company,
          batch: currentUser.batch
        },
        content: formData.content || '',
        type: formData.type || 'general',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        shares: 0,
        images: uploadedFiles.map(file => URL.createObjectURL(file))
      }
      onAddPost(newPost)
    }
    
    // Show success message
    alert(`${activeModal === 'post' ? 'Post' : activeModal === 'job' ? 'Job' : activeModal === 'achievement' ? 'Achievement' : 'Mentorship offer'} submitted successfully!`)
    
    closeModal()
  }

  return (
    <div className="space-y-6">
      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isProfileEditOpen} 
        onClose={() => setIsProfileEditOpen(false)} 
      />

      {/* User Profile Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5">
        <CardContent className="p-6">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
              style={{ backgroundColor: avatar.backgroundColor }}
            >
              {avatar.initials}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{currentUser.name}</h3>
            <p className="text-foreground-muted text-sm mb-2">
              {currentUser.designation} at {currentUser.company}
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{currentUser.branch}</span>
              <span className="text-xs text-foreground-muted">Class of {currentUser.batch}</span>
            </div>

            {/* Profile completion */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground-muted">Profile Completion</span>
                <span className="text-primary font-medium">{currentUser.profileCompletion}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-chart-2 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentUser.profileCompletion}%` }}
                ></div>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex justify-center space-x-4 mb-4">
              {currentUser.resumeUrl && (
                <a
                  href={currentUser.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-primary transition-colors"
                  title="Resume"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              )}

              {currentUser.linkedinUrl && (
                <a
                  href={currentUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-blue-500 transition-colors"
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}

              {currentUser.githubUrl && (
                <a
                  href={currentUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  title="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 10.956.69-.069-.5-.25-.5-.556v-2.237c-3.338.724-4.042-1.61-4.042-1.61C2.65 17.4 1.73 16.85 1.73 16.85c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.997.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.841 1.23 1.911 1.23 3.221 0 4.609-2.807 5.624-5.479 5.921.42.36.81 1.096.81 2.22v3.293c0 .319-.192.694-.801.576C20.565 21.795 24 17.3 24 11.987 24 5.367 18.624.001 12.017.001z"/>
                  </svg>
                </a>
              )}

              {currentUser.leetcodeUrl && (
                <a
                  href={currentUser.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-orange-500 transition-colors"
                  title="LeetCode"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                  </svg>
                </a>
              )}
            </div>

            <div className="text-sm text-foreground-muted mb-4">
              <span className="font-medium text-primary">{currentUser.connections}</span> connections
            </div>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileEditOpen(true)}
              className="w-full bg-transparent border-border text-foreground hover:bg-surface-hover"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {[
              { id: "feed", label: "News Feed", icon: "🏠" },
              { id: "jobs", label: "Job Board", icon: "💼" },
              { id: "events", label: "Events", icon: "📅" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="p-3 rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-105 group"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-sm">{action.icon}</span>
                </div>
                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full bg-transparent">
            <a href="/">Logout</a>
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      {/* Create Post Modal */}
      <Modal
        isOpen={activeModal === 'post'}
        onClose={closeModal}
        title="✏️ Create New Post"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Post Content</label>
            <textarea
              className="w-full p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="What's on your mind? Share with your alumni network..."
              value={formData.content || ''}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Post Type</label>
            <select
              className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background"
              value={formData.type || 'general'}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="general" className="text-foreground bg-background">💬 General</option>
              <option value="achievement" className="text-foreground bg-background">🏆 Achievement</option>
              <option value="job" className="text-foreground bg-background">💼 Job Related</option>
              <option value="mentorship" className="text-foreground bg-background">🤝 Mentorship</option>
            </select>
          </div>

          <FileUpload
            label="Attach Images (Optional)"
            accept="image/*"
            multiple={true}
            onFileSelect={setUploadedFiles}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 hover-glow">
              Share Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        isOpen={activeModal === 'job'}
        onClose={closeModal}
        title="💼 Post Job Opportunity"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
              <Input
                placeholder="e.g., Senior Software Engineer"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company</label>
              <Input
                placeholder="e.g., Google, Microsoft"
                value={formData.company || ''}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <Input
                  placeholder="e.g., Bangalore"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Experience</label>
                <Input
                  placeholder="e.g., 2-4 years"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Job Description</label>
              <textarea
                className="w-full p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Brief description of the role and requirements..."
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Apply Link/Email</label>
              <Input
                placeholder="e.g., careers@company.com or application URL"
                value={formData.applyLink || ''}
                onChange={(e) => setFormData({...formData, applyLink: e.target.value})}
              />
            </div>
          </div>

          <FileUpload
            label="Job Description File (Optional)"
            accept=".pdf,.doc,.docx"
            onFileSelect={setUploadedFiles}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 hover-glow">
              Post Job
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share Achievement Modal */}
      <Modal
        isOpen={activeModal === 'achievement'}
        onClose={closeModal}
        title="🏆 Share Your Achievement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Achievement Title</label>
            <Input
              placeholder="e.g., Promoted to Senior Engineer, Won Hackathon"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Achievement Type</label>
            <select
              className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background"
              value={formData.type || 'career'}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="career" className="text-foreground bg-background">🚀 Career Milestone</option>
              <option value="education" className="text-foreground bg-background">🎓 Educational Achievement</option>
              <option value="award" className="text-foreground bg-background">🏅 Award/Recognition</option>
              <option value="project" className="text-foreground bg-background">💡 Project Success</option>
              <option value="personal" className="text-foreground bg-background">⭐ Personal Achievement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tell us about it!</label>
            <textarea
              className="w-full p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Share the details of your achievement and inspire others..."
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date of Achievement</label>
            <Input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <FileUpload
            label="Upload Certificate/Photos"
            accept="image/*,.pdf"
            multiple={true}
            onFileSelect={setUploadedFiles}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 hover-glow">
              Share Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Offer Mentorship Modal */}
      <Modal
        isOpen={activeModal === 'mentorship'}
        onClose={closeModal}
        title="🤝 Offer Mentorship"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Areas of Expertise</label>
            <Input
              placeholder="e.g., Software Development, Product Management, Data Science"
              value={formData.expertise || ''}
              onChange={(e) => setFormData({...formData, expertise: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mentorship Type</label>
            <select
              className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background"
              value={formData.type || 'career'}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="career" className="text-foreground bg-background">💼 Career Guidance</option>
              <option value="technical" className="text-foreground bg-background">💻 Technical Skills</option>
              <option value="interview" className="text-foreground bg-background">🎯 Interview Preparation</option>
              <option value="entrepreneur" className="text-foreground bg-background">🚀 Entrepreneurship</option>
              <option value="general" className="text-foreground bg-background">💬 General Life Advice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
            <select
              className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.availability || 'flexible'}
              onChange={(e) => setFormData({...formData, availability: e.target.value})}
            >
              <option value="flexible">⏰ Flexible Schedule</option>
              <option value="weekends">📅 Weekends Only</option>
              <option value="evenings">🌅 Evenings (6-9 PM)</option>
              <option value="limited">⚡ Limited Availability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">About Your Mentorship</label>
            <textarea
              className="w-full p-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="What can you help juniors with? What's your approach to mentoring?"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contact Method</label>
            <select
              className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.contact || 'platform'}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
            >
              <option value="platform">💬 Through Platform Messages</option>
              <option value="email">📧 Email Communication</option>
              <option value="video">📹 Video Calls</option>
              <option value="phone">📞 Phone Calls</option>
            </select>
          </div>

          <FileUpload
            label="Upload Resume/Portfolio (Optional)"
            accept=".pdf,.doc,.docx"
            onFileSelect={setUploadedFiles}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 hover-glow">
              Offer Mentorship
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
