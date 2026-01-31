/**
 * Events Controller Unit Tests
 * Tests for event management operations
 */

const { supabase, supabaseAdmin } = require('../config/supabase');

describe('Events Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Event Data Validation', () => {
        const validateEventData = (data) => {
            const errors = [];

            if (!data.title || data.title.length < 5 || data.title.length > 100) {
                errors.push({ field: 'title', message: 'Title must be between 5 and 100 characters' });
            }
            if (!data.description || data.description.length < 20 || data.description.length > 2000) {
                errors.push({ field: 'description', message: 'Description must be between 20 and 2000 characters' });
            }
            if (!data.eventDate || isNaN(Date.parse(data.eventDate))) {
                errors.push({ field: 'eventDate', message: 'Valid event date is required' });
            }
            if (!data.location || data.location.length < 2) {
                errors.push({ field: 'location', message: 'Location is required' });
            }

            const validTypes = ['reunion', 'networking', 'workshop', 'seminar', 'social', 'career'];
            if (data.type && !validTypes.includes(data.type)) {
                errors.push({ field: 'type', message: 'Invalid event type' });
            }

            if (data.maxAttendees && (!Number.isInteger(data.maxAttendees) || data.maxAttendees < 1)) {
                errors.push({ field: 'maxAttendees', message: 'Max attendees must be a positive integer' });
            }

            return errors;
        };

        it('should validate complete event data', () => {
            const validEvent = {
                title: 'Alumni Reunion 2024',
                description: 'Join us for the annual alumni reunion event with networking and fun activities.',
                eventDate: '2024-12-15T18:00:00Z',
                location: 'SIT Campus, Tumkur',
                type: 'reunion'
            };

            expect(validateEventData(validEvent)).toHaveLength(0);
        });

        it('should reject event with short title', () => {
            const invalidEvent = {
                title: 'Hi',
                description: 'Join us for the annual alumni reunion event with networking.',
                eventDate: '2024-12-15T18:00:00Z',
                location: 'SIT Campus'
            };

            const errors = validateEventData(invalidEvent);
            expect(errors).toContainEqual({
                field: 'title',
                message: 'Title must be between 5 and 100 characters'
            });
        });

        it('should reject event with invalid date', () => {
            const invalidEvent = {
                title: 'Alumni Reunion 2024',
                description: 'Join us for the annual alumni reunion event with networking.',
                eventDate: 'invalid-date',
                location: 'SIT Campus'
            };

            const errors = validateEventData(invalidEvent);
            expect(errors).toContainEqual({
                field: 'eventDate',
                message: 'Valid event date is required'
            });
        });

        it('should reject invalid event type', () => {
            const invalidEvent = {
                title: 'Alumni Reunion 2024',
                description: 'Join us for the annual alumni reunion event with networking.',
                eventDate: '2024-12-15T18:00:00Z',
                location: 'SIT Campus',
                type: 'party'
            };

            const errors = validateEventData(invalidEvent);
            expect(errors).toContainEqual({
                field: 'type',
                message: 'Invalid event type'
            });
        });

        it('should reject negative max attendees', () => {
            const invalidEvent = {
                title: 'Alumni Reunion 2024',
                description: 'Join us for the annual alumni reunion event with networking.',
                eventDate: '2024-12-15T18:00:00Z',
                location: 'SIT Campus',
                maxAttendees: -5
            };

            const errors = validateEventData(invalidEvent);
            expect(errors).toContainEqual({
                field: 'maxAttendees',
                message: 'Max attendees must be a positive integer'
            });
        });
    });

    describe('Event Date Utilities', () => {
        const isUpcoming = (eventDate) => {
            return new Date(eventDate) > new Date();
        };

        const daysUntilEvent = (eventDate) => {
            const diff = new Date(eventDate) - new Date();
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        };

        const isPastEvent = (eventDate) => {
            return new Date(eventDate) < new Date();
        };

        it('should identify upcoming events', () => {
            const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            expect(isUpcoming(futureDate)).toBe(true);
        });

        it('should identify past events', () => {
            const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            expect(isPastEvent(pastDate)).toBe(true);
        });

        it('should calculate days until event', () => {
            const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const days = daysUntilEvent(futureDate);
            expect(days).toBeGreaterThanOrEqual(6);
            expect(days).toBeLessThanOrEqual(8);
        });
    });

    describe('Event Registration', () => {
        const canRegister = (event, user, existingAttendees) => {
            // Check if event exists
            if (!event) return { allowed: false, reason: 'Event not found' };

            // Check if user is authenticated
            if (!user) return { allowed: false, reason: 'Authentication required' };

            // Check registration deadline
            if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
                return { allowed: false, reason: 'Registration deadline passed' };
            }

            // Check if event is full
            if (event.maxAttendees && existingAttendees >= event.maxAttendees) {
                return { allowed: false, reason: 'Event is full' };
            }

            return { allowed: true };
        };

        const mockEvent = {
            id: 'event-1',
            title: 'Alumni Meetup',
            maxAttendees: 50,
            registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        const mockUser = { id: 'user-1', email: 'test@sit.ac.in' };

        it('should allow registration for valid event', () => {
            const result = canRegister(mockEvent, mockUser, 25);
            expect(result.allowed).toBe(true);
        });

        it('should deny registration when event is full', () => {
            const result = canRegister(mockEvent, mockUser, 50);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('Event is full');
        });

        it('should deny registration after deadline', () => {
            const pastDeadlineEvent = {
                ...mockEvent,
                registrationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            };
            const result = canRegister(pastDeadlineEvent, mockUser, 25);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('Registration deadline passed');
        });

        it('should deny unauthenticated users', () => {
            const result = canRegister(mockEvent, null, 25);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('Authentication required');
        });

        it('should handle event without max attendees', () => {
            const unlimitedEvent = { ...mockEvent, maxAttendees: null };
            const result = canRegister(unlimitedEvent, mockUser, 1000);
            expect(result.allowed).toBe(true);
        });
    });

    describe('Event Filtering', () => {
        const filterEvents = (events, filters) => {
            return events.filter(event => {
                if (filters.category && event.category !== filters.category) return false;
                if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
                if (filters.upcoming && new Date(event.event_date) < new Date()) return false;
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    const searchable = `${event.title} ${event.description} ${event.location}`.toLowerCase();
                    if (!searchable.includes(searchTerm)) return false;
                }
                return true;
            });
        };

        const mockEvents = [
            { id: '1', title: 'Tech Workshop', category: 'workshop', location: 'Bangalore', event_date: new Date(Date.now() + 86400000).toISOString(), description: 'Learn coding' },
            { id: '2', title: 'Alumni Reunion', category: 'reunion', location: 'Tumkur', event_date: new Date(Date.now() + 172800000).toISOString(), description: 'Meet alumni' },
            { id: '3', title: 'Past Seminar', category: 'seminar', location: 'Bangalore', event_date: new Date(Date.now() - 86400000).toISOString(), description: 'Past event' }
        ];

        it('should filter by category', () => {
            const result = filterEvents(mockEvents, { category: 'workshop' });
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Tech Workshop');
        });

        it('should filter by location', () => {
            const result = filterEvents(mockEvents, { location: 'bangalore' });
            expect(result).toHaveLength(2);
        });

        it('should filter upcoming events', () => {
            const result = filterEvents(mockEvents, { upcoming: true });
            expect(result).toHaveLength(2);
            expect(result.every(e => new Date(e.event_date) > new Date())).toBe(true);
        });

        it('should filter by search term', () => {
            const result = filterEvents(mockEvents, { search: 'coding' });
            expect(result).toHaveLength(1);
        });
    });

    describe('Event Authorization', () => {
        const canModifyEvent = (event, user) => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            return event.organized_by === user.id;
        };

        it('should allow organizer to modify event', () => {
            const event = { id: '1', organized_by: 'user-1' };
            const organizer = { id: 'user-1', role: 'user' };
            expect(canModifyEvent(event, organizer)).toBe(true);
        });

        it('should allow admin to modify any event', () => {
            const event = { id: '1', organized_by: 'user-1' };
            const admin = { id: 'admin-1', role: 'admin' };
            expect(canModifyEvent(event, admin)).toBe(true);
        });

        it('should deny non-organizer', () => {
            const event = { id: '1', organized_by: 'user-1' };
            const otherUser = { id: 'user-2', role: 'user' };
            expect(canModifyEvent(event, otherUser)).toBe(false);
        });
    });
});
