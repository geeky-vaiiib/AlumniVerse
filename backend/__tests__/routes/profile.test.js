const request = require('supertest')
const express = require('express')
const path = require('path')
const fs = require('fs')
const profileRoutes = require('../../routes/profileRoutes')

// Create test app
const app = express()
app.use(express.json())
app.use('/api/profile', profileRoutes)

// Mock services
const { supabaseAdmin } = require('../../config/supabase')

// Mock authentication middleware
jest.mock('../../middlewares/supabaseAuthMiddleware', () => {
  return (req, res, next) => {
    req.user = {
      authId: 'test-auth-id',
      email: 'test@example.com'
    }
    next()
  }
})

describe('Profile Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/profile/me', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 1,
        auth_id: 'test-auth-id',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        branch: 'Computer Science',
        year_of_passing: 2024,
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        resume_url: '/uploads/resumes/resume.pdf'
      }

      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      })

      const response = await request(app)
        .get('/api/profile/me')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toEqual(mockUser)
    })

    it('should handle user not found', async () => {
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' }
            })
          })
        })
      })

      const response = await request(app)
        .get('/api/profile/me')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('not found')
    })
  })

  describe('PUT /api/profile/update', () => {
    const validProfileData = {
      firstName: 'John',
      lastName: 'Doe',
      branch: 'Computer Science',
      yearOfPassing: 2024,
      currentCompany: 'Tech Corp',
      designation: 'Software Engineer',
      location: 'Bangalore, India',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      githubUrl: 'https://github.com/johndoe',
      leetcodeUrl: 'https://leetcode.com/johndoe'
    }

    it('should update profile successfully', async () => {
      const updatedUser = {
        id: 1,
        ...validProfileData,
        auth_id: 'test-auth-id'
      }

      supabaseAdmin.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedUser,
                error: null
              })
            })
          })
        })
      })

      const response = await request(app)
        .put('/api/profile/update')
        .send(validProfileData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toEqual(updatedUser)
    })

    it('should validate required fields', async () => {
      const incompleteData = {
        firstName: 'John'
        // Missing required fields
      }

      const response = await request(app)
        .put('/api/profile/update')
        .send(incompleteData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('required')
    })

    it('should validate URL formats', async () => {
      const invalidUrlData = {
        ...validProfileData,
        linkedinUrl: 'invalid-url'
      }

      const response = await request(app)
        .put('/api/profile/update')
        .send(invalidUrlData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('LinkedIn')
    })

    it('should validate year range', async () => {
      const invalidYearData = {
        ...validProfileData,
        yearOfPassing: 2005
      }

      const response = await request(app)
        .put('/api/profile/update')
        .send(invalidYearData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('year')
    })

    it('should handle database errors', async () => {
      supabaseAdmin.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            })
          })
        })
      })

      const response = await request(app)
        .put('/api/profile/update')
        .send(validProfileData)

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/profile/upload-resume', () => {
    it('should upload PDF file successfully', async () => {
      // Create a test PDF file
      const testPdfPath = path.join(__dirname, 'test.pdf')
      fs.writeFileSync(testPdfPath, 'fake pdf content')

      const response = await request(app)
        .post('/api/profile/upload-resume')
        .attach('resume', testPdfPath)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.resumeUrl).toBeDefined()
      expect(response.body.data.filename).toContain('.pdf')

      // Cleanup
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath)
      }
    })

    it('should reject non-PDF/DOCX files', async () => {
      // Create a test text file
      const testTxtPath = path.join(__dirname, 'test.txt')
      fs.writeFileSync(testTxtPath, 'fake text content')

      const response = await request(app)
        .post('/api/profile/upload-resume')
        .attach('resume', testTxtPath)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('PDF or DOCX')

      // Cleanup
      if (fs.existsSync(testTxtPath)) {
        fs.unlinkSync(testTxtPath)
      }
    })

    it('should reject files larger than 5MB', async () => {
      // Create a large test file (simulate 6MB)
      const largePath = path.join(__dirname, 'large.pdf')
      const largeContent = Buffer.alloc(6 * 1024 * 1024, 'a') // 6MB
      fs.writeFileSync(largePath, largeContent)

      const response = await request(app)
        .post('/api/profile/upload-resume')
        .attach('resume', largePath)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('5MB')

      // Cleanup
      if (fs.existsSync(largePath)) {
        fs.unlinkSync(largePath)
      }
    })

    it('should handle missing file', async () => {
      const response = await request(app)
        .post('/api/profile/upload-resume')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('file')
    })
  })
})
