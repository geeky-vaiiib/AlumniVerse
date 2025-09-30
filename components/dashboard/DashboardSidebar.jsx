"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { generateAvatar } from "../../lib/utils"

// Mock user data
const currentUser = {
  name: "John Doe",
  batch: "2020",
  branch: "Computer Science",
  company: "Tech Corp",
  designation: "Software Engineer",
  location: "Bangalore, India",
  connections: 156,
  profileCompletion: 85,
  linkedinUrl: "https://linkedin.com/in/johndoe",
  githubUrl: "https://github.com/johndoe",
  resumeUrl: "/resume.pdf",
}

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
          avatar: generateAvatar(currentUser.name),
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
              <a
                href={currentUser.resumeUrl}
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
              <a
                href={currentUser.linkedinUrl}
                className="text-foreground-muted hover:text-primary transition-colors"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={currentUser.githubUrl}
                className="text-foreground-muted hover:text-primary transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div className="text-sm text-foreground-muted">
              <span className="font-medium text-primary">{currentUser.connections}</span> connections
            </div>
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
              { id: "badges", label: "Badges", icon: "🏆" },
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
