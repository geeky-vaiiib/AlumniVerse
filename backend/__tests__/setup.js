/**
 * Jest Test Setup
 * Common setup for all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods during tests to keep output clean
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock Supabase client
jest.mock('../config/supabase', () => ({
    supabase: {
        auth: {
            signInWithOtp: jest.fn(),
            verifyOtp: jest.fn(),
            getUser: jest.fn(),
            getSession: jest.fn()
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn()
        }))
    },
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn()
        }))
    },
    supabaseHelpers: {
        users: {
            findByAuthId: jest.fn(),
            findById: jest.fn()
        }
    }
}));

// Mock logger
jest.mock('../utils/logger', () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    http: jest.fn()
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after tests
afterAll(() => {
    jest.clearAllMocks();
});
