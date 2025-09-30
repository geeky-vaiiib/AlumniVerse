// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.JWT_SECRET = 'test-jwt-secret'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock Supabase client
jest.mock('./config/supabase.js', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}))

// Mock email service
jest.mock('./services/emailService.js', () => ({
  sendOTPEmail: jest.fn(() => Promise.resolve({ success: true })),
  verifyEmailConnection: jest.fn(() => Promise.resolve(true))
}))

// Mock OTP service
jest.mock('./services/otpService.js', () => ({
  generateOTP: jest.fn(() => '123456'),
  storeOTP: jest.fn(() => Promise.resolve({ success: true })),
  verifyOTP: jest.fn(() => Promise.resolve({ success: true, isValid: true })),
  cleanupExpiredOTPs: jest.fn(() => Promise.resolve())
}))
