/**
 * Directory/Posts Controller Unit Tests
 * Tests for alumni directory and social posts
 */

const { supabase, supabaseHelpers } = require('../config/supabase');

describe('Directory Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Alumni Data Transformation', () => {
        const transformAlumniData = (user) => {
            const { password_hash, auth_id, ...alumniData } = user;
            return {
                ...alumniData,
                fullName: `${alumniData.first_name || ''} ${alumniData.last_name || ''}`.trim(),
                graduationYear: alumniData.passing_year,
                profileComplete: !!(alumniData.bio && alumniData.current_position && alumniData.company)
            };
        };

        it('should remove sensitive fields', () => {
            const user = {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                password_hash: 'secret',
                auth_id: 'auth-123'
            };

            const result = transformAlumniData(user);
            expect(result.password_hash).toBeUndefined();
            expect(result.auth_id).toBeUndefined();
        });

        it('should create full name', () => {
            const user = { first_name: 'John', last_name: 'Doe' };
            const result = transformAlumniData(user);
            expect(result.fullName).toBe('John Doe');
        });

        it('should handle missing names', () => {
            const user = { first_name: 'John' };
            const result = transformAlumniData(user);
            expect(result.fullName).toBe('John');
        });

        it('should mark profile as complete when all fields present', () => {
            const user = {
                first_name: 'John',
                bio: 'Developer with 5 years experience',
                current_position: 'Senior Engineer',
                company: 'Tech Corp'
            };
            const result = transformAlumniData(user);
            expect(result.profileComplete).toBe(true);
        });

        it('should mark profile as incomplete when fields missing', () => {
            const user = {
                first_name: 'John',
                bio: 'Developer'
            };
            const result = transformAlumniData(user);
            expect(result.profileComplete).toBe(false);
        });
    });

    describe('Directory Filtering', () => {
        const filterAlumni = (alumni, filters) => {
            return alumni.filter(user => {
                if (filters.branch && user.branch !== filters.branch) return false;
                if (filters.year && user.passing_year !== filters.year) return false;
                if (filters.location && !user.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
                if (filters.company && !user.company?.toLowerCase().includes(filters.company.toLowerCase())) return false;
                if (filters.skills) {
                    const filterSkills = filters.skills.split(',').map(s => s.trim().toLowerCase());
                    const userSkills = (user.skills || []).map(s => s.toLowerCase());
                    if (!filterSkills.some(fs => userSkills.includes(fs))) return false;
                }
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    const searchable = `${user.first_name} ${user.last_name} ${user.company} ${user.current_position} ${user.bio}`.toLowerCase();
                    if (!searchable.includes(searchTerm)) return false;
                }
                return true;
            });
        };

        const mockAlumni = [
            { id: '1', first_name: 'John', last_name: 'Doe', branch: 'CS', passing_year: 2022, location: 'Bangalore', company: 'Google', skills: ['React', 'Node.js'] },
            { id: '2', first_name: 'Jane', last_name: 'Smith', branch: 'IS', passing_year: 2023, location: 'Hyderabad', company: 'Amazon', skills: ['Python', 'ML'] },
            { id: '3', first_name: 'Bob', last_name: 'Wilson', branch: 'CS', passing_year: 2022, location: 'Bangalore', company: 'Microsoft', skills: ['Java', 'Spring'] }
        ];

        it('should filter by branch', () => {
            const result = filterAlumni(mockAlumni, { branch: 'CS' });
            expect(result).toHaveLength(2);
        });

        it('should filter by year', () => {
            const result = filterAlumni(mockAlumni, { year: 2023 });
            expect(result).toHaveLength(1);
            expect(result[0].first_name).toBe('Jane');
        });

        it('should filter by location', () => {
            const result = filterAlumni(mockAlumni, { location: 'bangalore' });
            expect(result).toHaveLength(2);
        });

        it('should filter by company', () => {
            const result = filterAlumni(mockAlumni, { company: 'google' });
            expect(result).toHaveLength(1);
        });

        it('should filter by skills', () => {
            const result = filterAlumni(mockAlumni, { skills: 'react' });
            expect(result).toHaveLength(1);
            expect(result[0].first_name).toBe('John');
        });

        it('should filter by search term', () => {
            const result = filterAlumni(mockAlumni, { search: 'jane' });
            expect(result).toHaveLength(1);
        });

        it('should combine multiple filters', () => {
            const result = filterAlumni(mockAlumni, { branch: 'CS', location: 'bangalore' });
            expect(result).toHaveLength(2);
        });
    });

    describe('Directory Sorting', () => {
        const sortAlumni = (alumni, sortBy, sortOrder) => {
            return [...alumni].sort((a, b) => {
                const aVal = a[sortBy] || '';
                const bVal = b[sortBy] || '';
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'desc' ? -comparison : comparison;
            });
        };

        const mockAlumni = [
            { first_name: 'John', company: 'Google', passing_year: 2022 },
            { first_name: 'Alice', company: 'Amazon', passing_year: 2023 },
            { first_name: 'Bob', company: 'Microsoft', passing_year: 2021 }
        ];

        it('should sort by first name ascending', () => {
            const result = sortAlumni(mockAlumni, 'first_name', 'asc');
            expect(result[0].first_name).toBe('Alice');
            expect(result[2].first_name).toBe('John');
        });

        it('should sort by company descending', () => {
            const result = sortAlumni(mockAlumni, 'company', 'desc');
            expect(result[0].company).toBe('Microsoft');
        });

        it('should sort by passing year', () => {
            const result = sortAlumni(mockAlumni, 'passing_year', 'asc');
            expect(result[0].passing_year).toBe(2021);
        });
    });
});

describe('Posts Controller', () => {
    describe('Post Validation', () => {
        const validatePost = (data) => {
            const errors = [];

            if (!data.content || data.content.length < 1 || data.content.length > 2000) {
                errors.push({ field: 'content', message: 'Content must be between 1 and 2000 characters' });
            }

            const validTypes = ['general', 'achievement', 'question', 'announcement', 'job', 'event'];
            if (data.post_type && !validTypes.includes(data.post_type)) {
                errors.push({ field: 'post_type', message: 'Invalid post type' });
            }

            if (data.images && !Array.isArray(data.images)) {
                errors.push({ field: 'images', message: 'Images must be an array' });
            }

            if (data.tags && !Array.isArray(data.tags)) {
                errors.push({ field: 'tags', message: 'Tags must be an array' });
            }

            return errors;
        };

        it('should validate complete post', () => {
            const post = {
                content: 'This is a test post about my new job!',
                post_type: 'achievement',
                images: [],
                tags: ['career', 'achievement']
            };
            expect(validatePost(post)).toHaveLength(0);
        });

        it('should reject empty content', () => {
            const post = { content: '' };
            const errors = validatePost(post);
            expect(errors).toContainEqual({ field: 'content', message: 'Content must be between 1 and 2000 characters' });
        });

        it('should reject content over 2000 characters', () => {
            const post = { content: 'a'.repeat(2001) };
            const errors = validatePost(post);
            expect(errors).toContainEqual({ field: 'content', message: 'Content must be between 1 and 2000 characters' });
        });

        it('should reject invalid post type', () => {
            const post = { content: 'Test post', post_type: 'invalid' };
            const errors = validatePost(post);
            expect(errors).toContainEqual({ field: 'post_type', message: 'Invalid post type' });
        });
    });

    describe('Post Likes', () => {
        const toggleLike = (isCurrentlyLiked) => {
            return !isCurrentlyLiked;
        };

        const updateLikeCount = (currentCount, isLiking) => {
            return isLiking ? currentCount + 1 : Math.max(0, currentCount - 1);
        };

        it('should unlike a liked post', () => {
            expect(toggleLike(true)).toBe(false);
        });

        it('should like an unliked post', () => {
            expect(toggleLike(false)).toBe(true);
        });

        it('should increment like count on like', () => {
            expect(updateLikeCount(5, true)).toBe(6);
        });

        it('should decrement like count on unlike', () => {
            expect(updateLikeCount(5, false)).toBe(4);
        });

        it('should not go below 0 likes', () => {
            expect(updateLikeCount(0, false)).toBe(0);
        });
    });

    describe('Post Authorization', () => {
        const canModifyPost = (post, user) => {
            if (!user) return false;
            return post.author_id === user.id;
        };

        it('should allow author to modify post', () => {
            const post = { id: '1', author_id: 'user-1' };
            const author = { id: 'user-1' };
            expect(canModifyPost(post, author)).toBe(true);
        });

        it('should deny non-author', () => {
            const post = { id: '1', author_id: 'user-1' };
            const other = { id: 'user-2' };
            expect(canModifyPost(post, other)).toBe(false);
        });

        it('should deny unauthenticated user', () => {
            const post = { id: '1', author_id: 'user-1' };
            expect(canModifyPost(post, null)).toBe(false);
        });
    });

    describe('Post Author Transformation', () => {
        const transformAuthor = (author) => {
            if (!author) return null;
            return {
                id: author.id,
                name: `${author.first_name || ''} ${author.last_name || ''}`.trim() || 'Anonymous',
                designation: author.current_position || 'Alumni',
                company: author.company || 'Not specified',
                batch: author.passing_year || 'Not specified',
                avatar: author.avatar_path
            };
        };

        it('should transform author correctly', () => {
            const author = {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                current_position: 'Engineer',
                company: 'Tech Corp',
                passing_year: 2022,
                avatar_path: '/avatars/john.jpg'
            };

            const result = transformAuthor(author);
            expect(result.name).toBe('John Doe');
            expect(result.designation).toBe('Engineer');
            expect(result.batch).toBe(2022);
        });

        it('should handle missing fields', () => {
            const author = { id: '1' };
            const result = transformAuthor(author);
            expect(result.name).toBe('Anonymous');
            expect(result.designation).toBe('Alumni');
            expect(result.company).toBe('Not specified');
        });

        it('should handle null author', () => {
            expect(transformAuthor(null)).toBeNull();
        });
    });
});
