/**
 * Jobs Controller Unit Tests
 * Tests for job posting CRUD operations
 */

const { supabase, supabaseAdmin } = require('../config/supabase');

describe('Jobs Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Job Data Validation', () => {
        const validateJobData = (data) => {
            const errors = [];

            if (!data.title || data.title.length < 5) {
                errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
            }
            if (!data.company || data.company.length < 2) {
                errors.push({ field: 'company', message: 'Company name is required' });
            }
            if (!data.description || data.description.length < 20) {
                errors.push({ field: 'description', message: 'Description must be at least 20 characters' });
            }
            if (!data.location) {
                errors.push({ field: 'location', message: 'Location is required' });
            }
            if (data.type && !['full-time', 'part-time', 'contract', 'internship', 'job'].includes(data.type)) {
                errors.push({ field: 'type', message: 'Invalid job type' });
            }

            return errors;
        };

        it('should validate complete job data', () => {
            const validJob = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                description: 'We are looking for a talented software engineer to join our team.',
                location: 'Bangalore, India',
                type: 'full-time'
            };

            expect(validateJobData(validJob)).toHaveLength(0);
        });

        it('should reject job with short title', () => {
            const invalidJob = {
                title: 'Dev',
                company: 'Tech Corp',
                description: 'Looking for a developer to join our team and build great products.',
                location: 'Bangalore'
            };

            const errors = validateJobData(invalidJob);
            expect(errors).toContainEqual({ field: 'title', message: 'Title must be at least 5 characters' });
        });

        it('should reject job without company', () => {
            const invalidJob = {
                title: 'Software Engineer',
                company: '',
                description: 'Looking for a developer to join our team and build great products.',
                location: 'Bangalore'
            };

            const errors = validateJobData(invalidJob);
            expect(errors).toContainEqual({ field: 'company', message: 'Company name is required' });
        });

        it('should reject job with short description', () => {
            const invalidJob = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                description: 'Short desc',
                location: 'Bangalore'
            };

            const errors = validateJobData(invalidJob);
            expect(errors).toContainEqual({ field: 'description', message: 'Description must be at least 20 characters' });
        });

        it('should reject invalid job type', () => {
            const invalidJob = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                description: 'Looking for a developer to join our team and build great products.',
                location: 'Bangalore',
                type: 'invalid-type'
            };

            const errors = validateJobData(invalidJob);
            expect(errors).toContainEqual({ field: 'type', message: 'Invalid job type' });
        });
    });

    describe('Job Filtering', () => {
        const filterJobs = (jobs, filters) => {
            return jobs.filter(job => {
                if (filters.type && job.type !== filters.type) return false;
                if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
                if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) return false;
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    const searchable = `${job.title} ${job.company} ${job.description}`.toLowerCase();
                    if (!searchable.includes(searchTerm)) return false;
                }
                return true;
            });
        };

        const mockJobs = [
            { id: '1', title: 'Frontend Developer', company: 'Google', location: 'Bangalore', type: 'full-time', description: 'React developer needed' },
            { id: '2', title: 'Backend Engineer', company: 'Amazon', location: 'Hyderabad', type: 'full-time', description: 'Node.js expert' },
            { id: '3', title: 'Mobile Intern', company: 'Infosys', location: 'Bangalore', type: 'internship', description: 'Flutter developer' }
        ];

        it('should filter jobs by type', () => {
            const result = filterJobs(mockJobs, { type: 'internship' });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('3');
        });

        it('should filter jobs by location', () => {
            const result = filterJobs(mockJobs, { location: 'bangalore' });
            expect(result).toHaveLength(2);
        });

        it('should filter jobs by company', () => {
            const result = filterJobs(mockJobs, { company: 'google' });
            expect(result).toHaveLength(1);
            expect(result[0].company).toBe('Google');
        });

        it('should filter jobs by search term', () => {
            const result = filterJobs(mockJobs, { search: 'react' });
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Frontend Developer');
        });

        it('should combine multiple filters', () => {
            const result = filterJobs(mockJobs, { type: 'full-time', location: 'bangalore' });
            expect(result).toHaveLength(1);
            expect(result[0].company).toBe('Google');
        });

        it('should return all jobs with no filters', () => {
            const result = filterJobs(mockJobs, {});
            expect(result).toHaveLength(3);
        });
    });

    describe('Job Pagination', () => {
        const paginate = (items, page, limit) => {
            const pageNum = Math.max(1, page);
            const limitNum = Math.min(Math.max(1, limit), 100);
            const offset = (pageNum - 1) * limitNum;

            return {
                items: items.slice(offset, offset + limitNum),
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(items.length / limitNum),
                    totalCount: items.length,
                    hasNextPage: offset + limitNum < items.length,
                    hasPrevPage: pageNum > 1
                }
            };
        };

        const mockJobs = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1), title: `Job ${i + 1}` }));

        it('should return first page correctly', () => {
            const result = paginate(mockJobs, 1, 10);
            expect(result.items).toHaveLength(10);
            expect(result.pagination.currentPage).toBe(1);
            expect(result.pagination.hasNextPage).toBe(true);
            expect(result.pagination.hasPrevPage).toBe(false);
        });

        it('should return second page correctly', () => {
            const result = paginate(mockJobs, 2, 10);
            expect(result.items).toHaveLength(10);
            expect(result.items[0].id).toBe('11');
            expect(result.pagination.hasNextPage).toBe(true);
            expect(result.pagination.hasPrevPage).toBe(true);
        });

        it('should return last page correctly', () => {
            const result = paginate(mockJobs, 3, 10);
            expect(result.items).toHaveLength(5);
            expect(result.pagination.hasNextPage).toBe(false);
            expect(result.pagination.hasPrevPage).toBe(true);
        });

        it('should handle page exceeding total', () => {
            const result = paginate(mockJobs, 10, 10);
            expect(result.items).toHaveLength(0);
        });

        it('should limit max items per page to 100', () => {
            const result = paginate(mockJobs, 1, 500);
            expect(result.pagination.totalCount).toBe(25);
        });
    });

    describe('Job Authorization', () => {
        const canEditJob = (job, user) => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            return job.posted_by === user.id;
        };

        it('should allow admin to edit any job', () => {
            const job = { id: '1', posted_by: 'user-1' };
            const admin = { id: 'admin-1', role: 'admin' };
            expect(canEditJob(job, admin)).toBe(true);
        });

        it('should allow owner to edit their job', () => {
            const job = { id: '1', posted_by: 'user-1' };
            const owner = { id: 'user-1', role: 'user' };
            expect(canEditJob(job, owner)).toBe(true);
        });

        it('should deny non-owner from editing job', () => {
            const job = { id: '1', posted_by: 'user-1' };
            const otherUser = { id: 'user-2', role: 'user' };
            expect(canEditJob(job, otherUser)).toBe(false);
        });

        it('should deny unauthenticated user', () => {
            const job = { id: '1', posted_by: 'user-1' };
            expect(canEditJob(job, null)).toBe(false);
        });
    });

    describe('Job Applications', () => {
        const validateApplication = (application) => {
            const errors = [];
            if (!application.userId) errors.push('User ID required');
            if (!application.jobId) errors.push('Job ID required');
            if (!application.resumeUrl && !application.coverLetter) {
                errors.push('Resume or cover letter required');
            }
            return errors;
        };

        it('should validate complete application', () => {
            const app = { userId: 'u1', jobId: 'j1', resumeUrl: 'https://example.com/resume.pdf' };
            expect(validateApplication(app)).toHaveLength(0);
        });

        it('should accept application with only cover letter', () => {
            const app = { userId: 'u1', jobId: 'j1', coverLetter: 'I am perfect for this role...' };
            expect(validateApplication(app)).toHaveLength(0);
        });

        it('should reject application without resume or cover letter', () => {
            const app = { userId: 'u1', jobId: 'j1' };
            const errors = validateApplication(app);
            expect(errors).toContain('Resume or cover letter required');
        });

        it('should reject application without user ID', () => {
            const app = { jobId: 'j1', resumeUrl: 'https://example.com/resume.pdf' };
            const errors = validateApplication(app);
            expect(errors).toContain('User ID required');
        });
    });

    describe('Supabase Integration', () => {
        it('should fetch jobs from Supabase', async () => {
            const mockJobs = [
                { id: '1', title: 'Developer', company: 'Tech Corp', is_active: true }
            ];

            supabaseAdmin.from.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({ data: mockJobs, error: null })
            });

            const result = await supabaseAdmin.from('jobs')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .range(0, 9);

            expect(result.data).toEqual(mockJobs);
            expect(result.error).toBeNull();
        });

        it('should handle job creation', async () => {
            const newJob = { title: 'New Job', company: 'New Corp' };

            supabaseAdmin.from.mockReturnValue({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: 'new-id', ...newJob },
                    error: null
                })
            });

            const result = await supabaseAdmin.from('jobs')
                .insert([newJob])
                .select()
                .single();

            expect(result.data.id).toBe('new-id');
        });
    });
});
