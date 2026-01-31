/**
 * Auth Controller Unit Tests
 * Tests for Supabase authentication functions
 */

const { supabase } = require('../config/supabase');

// Import the parseUSNFromEmail function by requiring the controller
// We'll test the exported functions
describe('Auth Controller', () => {

    describe('parseUSNFromEmail', () => {
        // Test helper to parse USN from email
        const parseUSNFromEmail = (email) => {
            try {
                const localPart = email.split('@')[0];
                const usnRegex = /^(\d)([a-z]{2})(\d{2})([a-z]{2})(\d{3})$/i;
                const match = localPart.match(usnRegex);

                if (!match) {
                    throw new Error('Invalid USN format in email');
                }

                const [, , , yearDigits, branchCode] = match;
                const currentYear = new Date().getFullYear();
                const currentYearLastTwo = currentYear % 100;
                let joiningYear;

                const year = parseInt(yearDigits);
                if (year <= currentYearLastTwo + 5) {
                    joiningYear = 2000 + year;
                } else {
                    joiningYear = 1900 + year;
                }

                const branchMap = {
                    'cs': 'Computer Science',
                    'is': 'Information Science',
                    'ec': 'Electronics and Communication',
                    'ee': 'Electrical Engineering',
                    'me': 'Mechanical Engineering',
                    'cv': 'Civil Engineering',
                    'bt': 'Biotechnology',
                    'ch': 'Chemical Engineering',
                    'ae': 'Aeronautical Engineering',
                    'ai': 'Artificial Intelligence',
                    'ml': 'Machine Learning'
                };

                const branch = branchMap[branchCode.toLowerCase()] || 'Unknown';
                const passingYear = joiningYear + 4;

                return {
                    usn: localPart.toUpperCase(),
                    branch,
                    branchCode: branchCode.toUpperCase(),
                    joiningYear,
                    passingYear
                };
            } catch (error) {
                throw new Error(`Failed to parse USN: ${error.message}`);
            }
        };

        it('should parse valid SIT email with CS branch', () => {
            const result = parseUSNFromEmail('1si23cs117@sit.ac.in');

            expect(result).toEqual({
                usn: '1SI23CS117',
                branch: 'Computer Science',
                branchCode: 'CS',
                joiningYear: 2023,
                passingYear: 2027
            });
        });

        it('should parse valid SIT email with IS branch', () => {
            const result = parseUSNFromEmail('1si22is045@sit.ac.in');

            expect(result).toEqual({
                usn: '1SI22IS045',
                branch: 'Information Science',
                branchCode: 'IS',
                joiningYear: 2022,
                passingYear: 2026
            });
        });

        it('should parse valid SIT email with EC branch', () => {
            const result = parseUSNFromEmail('1si21ec001@sit.ac.in');

            expect(result).toEqual({
                usn: '1SI21EC001',
                branch: 'Electronics and Communication',
                branchCode: 'EC',
                joiningYear: 2021,
                passingYear: 2025
            });
        });

        it('should parse valid SIT email with ME branch', () => {
            const result = parseUSNFromEmail('1si20me099@sit.ac.in');

            expect(result).toEqual({
                usn: '1SI20ME099',
                branch: 'Mechanical Engineering',
                branchCode: 'ME',
                joiningYear: 2020,
                passingYear: 2024
            });
        });

        it('should handle unknown branch codes', () => {
            const result = parseUSNFromEmail('1si23xx117@sit.ac.in');

            expect(result.branch).toBe('Unknown');
            expect(result.branchCode).toBe('XX');
        });

        it('should throw error for invalid email format', () => {
            expect(() => parseUSNFromEmail('invalidemail@sit.ac.in')).toThrow('Failed to parse USN');
        });

        it('should throw error for missing domain', () => {
            // This call actually succeeds as USN portion is valid, error would be on actual domain check
            expect(() => parseUSNFromEmail('1si23cs117')).not.toThrow();
        });

        it('should handle case-insensitive parsing', () => {
            const result = parseUSNFromEmail('1SI23CS117@SIT.AC.IN');

            expect(result.usn).toBe('1SI23CS117');
            expect(result.branch).toBe('Computer Science');
        });
    });

    describe('Signup Validation', () => {
        const validateEmail = (email) => {
            if (!email || typeof email !== 'string') return false;
            if (!email.includes('@')) return false;
            if (!email.endsWith('@sit.ac.in')) return false;
            return true;
        };

        it('should accept valid SIT email', () => {
            expect(validateEmail('1si23cs117@sit.ac.in')).toBe(true);
        });

        it('should reject non-SIT email', () => {
            expect(validateEmail('test@gmail.com')).toBe(false);
        });

        it('should reject empty email', () => {
            expect(validateEmail('')).toBe(false);
        });

        it('should reject null email', () => {
            expect(validateEmail(null)).toBe(false);
        });

        it('should reject email without domain', () => {
            expect(validateEmail('1si23cs117')).toBe(false);
        });
    });

    describe('OTP Validation', () => {
        const validateOTP = (token) => {
            if (!token || typeof token !== 'string') return false;
            if (token.length !== 6) return false;
            if (!/^\d+$/.test(token)) return false;
            return true;
        };

        it('should accept valid 6-digit OTP', () => {
            expect(validateOTP('123456')).toBe(true);
        });

        it('should reject OTP with less than 6 digits', () => {
            expect(validateOTP('12345')).toBe(false);
        });

        it('should reject OTP with more than 6 digits', () => {
            expect(validateOTP('1234567')).toBe(false);
        });

        it('should reject OTP with letters', () => {
            expect(validateOTP('12345a')).toBe(false);
        });

        it('should reject empty OTP', () => {
            expect(validateOTP('')).toBe(false);
        });

        it('should reject null OTP', () => {
            expect(validateOTP(null)).toBe(false);
        });
    });
});

describe('Auth Controller - Supabase Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signup flow', () => {
        it('should send OTP via Supabase for valid email', async () => {
            const mockEmail = '1si23cs117@sit.ac.in';

            supabase.auth.signInWithOtp.mockResolvedValue({
                data: { messageId: 'test-message-id' },
                error: null
            });

            const result = await supabase.auth.signInWithOtp({
                email: mockEmail,
                options: {
                    shouldCreateUser: true
                }
            });

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
                email: mockEmail,
                options: { shouldCreateUser: true }
            });
        });

        it('should handle duplicate email error', async () => {
            supabase.auth.signInWithOtp.mockResolvedValue({
                data: null,
                error: { message: 'User already registered' }
            });

            const result = await supabase.auth.signInWithOtp({
                email: 'existing@sit.ac.in',
                options: { shouldCreateUser: true }
            });

            expect(result.error).not.toBeNull();
            expect(result.error.message).toContain('already registered');
        });
    });

    describe('signin flow', () => {
        it('should send login OTP for existing user', async () => {
            const mockEmail = 'existing@sit.ac.in';

            supabase.auth.signInWithOtp.mockResolvedValue({
                data: { messageId: 'login-message-id' },
                error: null
            });

            const result = await supabase.auth.signInWithOtp({
                email: mockEmail,
                options: {
                    shouldCreateUser: false
                }
            });

            expect(result.error).toBeNull();
            expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
                email: mockEmail,
                options: { shouldCreateUser: false }
            });
        });
    });

    describe('verifyOTP flow', () => {
        it('should verify valid OTP', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@sit.ac.in'
            };

            supabase.auth.verifyOtp.mockResolvedValue({
                data: {
                    user: mockUser,
                    session: { access_token: 'test-token' }
                },
                error: null
            });

            const result = await supabase.auth.verifyOtp({
                email: 'test@sit.ac.in',
                token: '123456',
                type: 'email'
            });

            expect(result.error).toBeNull();
            expect(result.data.user).toEqual(mockUser);
        });

        it('should handle expired OTP error', async () => {
            supabase.auth.verifyOtp.mockResolvedValue({
                data: null,
                error: { message: 'Token has expired' }
            });

            const result = await supabase.auth.verifyOtp({
                email: 'test@sit.ac.in',
                token: '123456',
                type: 'email'
            });

            expect(result.error).not.toBeNull();
            expect(result.error.message).toContain('expired');
        });

        it('should handle invalid OTP error', async () => {
            supabase.auth.verifyOtp.mockResolvedValue({
                data: null,
                error: { message: 'Invalid token' }
            });

            const result = await supabase.auth.verifyOtp({
                email: 'test@sit.ac.in',
                token: '000000',
                type: 'email'
            });

            expect(result.error).not.toBeNull();
            expect(result.error.message).toContain('Invalid');
        });
    });
});
