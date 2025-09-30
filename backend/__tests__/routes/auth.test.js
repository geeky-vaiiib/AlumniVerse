const request = require('supertest')
const express = require('express')
const authRoutes = require('../../routes/authRoutes')

// Create test app
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

// Mock services
const emailService = require('../../services/emailService')
const otpService = require('../../services/otpService')
const { supabaseAdmin } = require('../../config/supabase')

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    const validSignupData = {
      firstName: 'John',
      lastName: 'Doe',
      email: '1si23cs001@sit.ac.in',
      password: 'TestPassword123!'
    }

    it('should create user and send OTP for valid data', async () => {
      // Mock successful user creation
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        }),
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 1, email: validSignupData.email }],
          error: null
        })
      })

      otpService.generateOTP.mockReturnValue('123456')
      otpService.storeOTP.mockResolvedValue({ success: true })
      emailService.sendOTPEmail.mockResolvedValue({ success: true })

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validSignupData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('OTP sent')
      expect(emailService.sendOTPEmail).toHaveBeenCalledWith(
        validSignupData.email,
        '123456',
        validSignupData.firstName
      )
    })

    it('should reject invalid email format', async () => {
      const invalidData = {
        ...validSignupData,
        email: 'invalid-email'
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('email')
    })

    it('should reject weak password', async () => {
      const weakPasswordData = {
        ...validSignupData,
        password: '123'
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(weakPasswordData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('password')
    })

    it('should reject duplicate email', async () => {
      // Mock existing user
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 1, email: validSignupData.email },
              error: null
            })
          })
        })
      })

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validSignupData)

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('already exists')
    })

    it('should handle missing required fields', async () => {
      const incompleteData = {
        firstName: 'John',
        email: '1si23cs001@sit.ac.in'
        // Missing lastName and password
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(incompleteData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/verify-otp', () => {
    const validOTPData = {
      email: '1si23cs001@sit.ac.in',
      otp: '123456'
    }

    it('should verify valid OTP successfully', async () => {
      otpService.verifyOTP.mockResolvedValue({
        success: true,
        isValid: true,
        user: { id: 1, email: validOTPData.email }
      })

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(validOTPData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('verified')
      expect(otpService.verifyOTP).toHaveBeenCalledWith(
        validOTPData.email,
        validOTPData.otp
      )
    })

    it('should reject invalid OTP', async () => {
      otpService.verifyOTP.mockResolvedValue({
        success: false,
        isValid: false,
        message: 'Invalid OTP'
      })

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(validOTPData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid')
    })

    it('should handle missing OTP', async () => {
      const incompleteData = {
        email: '1si23cs001@sit.ac.in'
        // Missing otp
      }

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(incompleteData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should handle expired OTP', async () => {
      otpService.verifyOTP.mockResolvedValue({
        success: false,
        isValid: false,
        message: 'OTP has expired'
      })

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(validOTPData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('expired')
    })
  })

  describe('POST /api/auth/resend-otp', () => {
    const resendData = {
      email: '1si23cs001@sit.ac.in'
    }

    it('should resend OTP successfully', async () => {
      // Mock user exists
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 1, email: resendData.email, first_name: 'John' },
              error: null
            })
          })
        })
      })

      otpService.generateOTP.mockReturnValue('654321')
      otpService.storeOTP.mockResolvedValue({ success: true })
      emailService.sendOTPEmail.mockResolvedValue({ success: true })

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send(resendData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('resent')
      expect(emailService.sendOTPEmail).toHaveBeenCalledWith(
        resendData.email,
        '654321',
        'John'
      )
    })

    it('should reject resend for non-existent user', async () => {
      // Mock user not found
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
        .post('/api/auth/resend-otp')
        .send(resendData)

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('not found')
    })

    it('should handle email service failure', async () => {
      // Mock user exists
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 1, email: resendData.email, first_name: 'John' },
              error: null
            })
          })
        })
      })

      otpService.generateOTP.mockReturnValue('654321')
      otpService.storeOTP.mockResolvedValue({ success: true })
      emailService.sendOTPEmail.mockResolvedValue({ success: false, error: 'SMTP error' })

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send(resendData)

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('email')
    })
  })
})
