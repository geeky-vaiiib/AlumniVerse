const logger = require('../utils/logger');
const { body, query, validationResult } = require('express-validator');
const { supabase, supabaseAdmin, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Events Controller
 * Handles events and reunions CRUD operations
 */

/**
 * Get all events with filters
 */
const getEvents = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    category,
    location,
    upcoming,
    search,
    page = 1,
    limit = 20,
    sortBy = 'event_date',
    sortOrder = 'asc',
    active = true
  } = req.query;

  try {
    // Build Supabase query with filters
    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        organizer:users!organized_by (
          id,
          first_name,
          last_name,
          company,
          current_position
        ),
        attendees:event_attendees(count)
      `)
      .eq('is_active', active === 'true');

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (upcoming === 'true') {
      query = query.gt('event_date', new Date().toISOString());
    }

    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        location.ilike.%${search}%
      `);
    }

    // Apply sorting
    const validSortFields = ['event_date', 'title', 'created_at', 'category'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'event_date';
    const sortDirection = sortOrder.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending: sortDirection });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: events, error } = await query;

    if (error) {
      logger.error('Supabase events query error:', error);
      return next(new AppError('Failed to fetch events', 500));
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', active === 'true');

    // Apply same filters for count
    if (category) countQuery = countQuery.eq('category', category);
    if (location) countQuery = countQuery.ilike('location', `%${location}%`);
    if (upcoming === 'true') countQuery = countQuery.gt('event_date', new Date().toISOString());
    if (search) {
      countQuery = countQuery.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        location.ilike.%${search}%
      `);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      logger.error('Count query error:', countError);
    }

    // Format events with additional info
    const formattedEvents = events.map(event => ({
      ...event,
      organizer: event.organizer,
      attendeeCount: event.attendees?.[0]?.count || 0,
      isPast: new Date(event.event_date) < new Date(),
      daysUntilEvent: Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24)),
      canEdit: req.user ? (req.user.id === event.organized_by || req.user.role === 'admin') : false,
      isRegistered: false // Will be updated if user is authenticated
    }));

    // Check registration status for authenticated users
    if (req.user) {
      for (let event of formattedEvents) {
        const { data: registration } = await supabaseAdmin
          .from('event_attendees')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', req.user.id)
          .single();
        event.isRegistered = !!registration;
      }
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        events: formattedEvents,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: totalCount || 0,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          category,
          location,
          upcoming,
          search,
          active
        }
      }
    });

  } catch (error) {
    logger.error('Events fetch error:', error);
    return next(new AppError('Failed to fetch events', 500));
  }
});

// Helper function to get total events count
const getTotalEventsCount = async (filters) => {
  let query = 'SELECT COUNT(*) as total FROM events WHERE is_active = TRUE';
  const params = [];
  let paramCount = 1;

  if (filters.type) {
    query += ` AND type = $${paramCount}`;
    params.push(filters.type);
    paramCount++;
  }

  if (filters.location) {
    query += ` AND location ILIKE $${paramCount}`;
    params.push(`%${filters.location}%`);
    paramCount++;
  }

  if (filters.upcoming === 'true') {
    query += ` AND event_date > NOW()`;
  }

  if (filters.search) {
    query += ` AND (
      title ILIKE $${paramCount} OR
      description ILIKE $${paramCount} OR
      location ILIKE $${paramCount}
    )`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }

  const result = await dbHelpers.query(query, params);
  return parseInt(result.rows[0].total);
};

/**
 * Get single event by ID
 */
const getEventById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await dbHelpers.events.findById(id);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Add organizer information and attendees details
  const organizer = await dbHelpers.users.findById(event.organized_by);
  const attendeesDetails = await dbHelpers.events.getAttendees(id);
  const eventWithDetails = {
    ...event,
    organizer: organizer ? {
      id: organizer.id,
      firstName: organizer.first_name,
      lastName: organizer.last_name,
      company: organizer.company,
      currentPosition: organizer.current_position,
      email: organizer.email
    } : null,
    attendees: attendeesDetails,
    attendeeCount: attendeesDetails.length,
    isUserAttending
  };

  res.status(200).json({
    success: true,
    data: {
      event: eventWithDetails
    }
  });
});

/**
 * Create new event
 */
const createEvent = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    title,
    description,
    type,
    eventDate,
    location,
    maxAttendees,
    registrationDeadline,
    isVirtual,
    meetingLink,
    agenda,
    tags
  } = req.body;

  const eventData = {
    id: dbHelpers.generateId(),
    title,
    description,
    type: type || 'networking',
    eventDate: new Date(eventDate),
    location,
    maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
    isVirtual: isVirtual || false,
    meetingLink: isVirtual ? meetingLink : null,
    agenda: agenda || [],
    tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()) || [],
    organizedBy: req.user.id,
    attendees: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };

  inMemoryStorage.events.push(eventData);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: {
      event: eventData
    }
  });
});

/**
 * Update event
 */
const updateEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const eventIndex = inMemoryStorage.events.findIndex(event => event.id === id);
  if (eventIndex === -1) {
    return next(new AppError('Event not found', 404));
  }

  const event = inMemoryStorage.events[eventIndex];

  // Check if user owns this event or is admin
  if (event.organizedBy !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own events', 403));
  }

  const {
    title,
    description,
    type,
    eventDate,
    location,
    maxAttendees,
    registrationDeadline,
    isVirtual,
    meetingLink,
    agenda,
    tags,
    isActive
  } = req.body;

  // Update event data
  const updatedEvent = {
    ...event,
    ...(title && { title }),
    ...(description && { description }),
    ...(type && { type }),
    ...(eventDate && { eventDate: new Date(eventDate) }),
    ...(location && { location }),
    ...(maxAttendees && { maxAttendees: parseInt(maxAttendees) }),
    ...(registrationDeadline && { registrationDeadline: new Date(registrationDeadline) }),
    ...(isVirtual !== undefined && { isVirtual }),
    ...(meetingLink && { meetingLink }),
    ...(agenda && { agenda }),
    ...(tags && { 
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())
    }),
    ...(isActive !== undefined && { isActive }),
    updatedAt: new Date()
  };

  inMemoryStorage.events[eventIndex] = updatedEvent;

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    data: {
      event: updatedEvent
    }
  });
});

/**
 * Delete event
 */
const deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const eventIndex = inMemoryStorage.events.findIndex(event => event.id === id);
  if (eventIndex === -1) {
    return next(new AppError('Event not found', 404));
  }

  const event = inMemoryStorage.events[eventIndex];

  // Check if user owns this event or is admin
  if (event.organizedBy !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own events', 403));
  }

  inMemoryStorage.events.splice(eventIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully'
  });
});

/**
 * Register for event
 */
const registerForEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const eventIndex = inMemoryStorage.events.findIndex(event => event.id === id);
  if (eventIndex === -1) {
    return next(new AppError('Event not found', 404));
  }

  const event = inMemoryStorage.events[eventIndex];

  // Check if registration is still open
  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
    return next(new AppError('Registration deadline has passed', 400));
  }

  // Check if event is full
  if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
    return next(new AppError('Event is full', 400));
  }

  // Check if user is already registered
  if (event.attendees.includes(req.user.id)) {
    return next(new AppError('You are already registered for this event', 400));
  }

  // Add user to attendees
  event.attendees.push(req.user.id);
  event.updatedAt = new Date();

  inMemoryStorage.events[eventIndex] = event;

  res.status(200).json({
    success: true,
    message: 'Successfully registered for the event'
  });
});

/**
 * Unregister from event
 */
const unregisterFromEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const eventIndex = inMemoryStorage.events.findIndex(event => event.id === id);
  if (eventIndex === -1) {
    return next(new AppError('Event not found', 404));
  }

  const event = inMemoryStorage.events[eventIndex];

  // Check if user is registered
  const attendeeIndex = event.attendees.indexOf(req.user.id);
  if (attendeeIndex === -1) {
    return next(new AppError('You are not registered for this event', 400));
  }

  // Remove user from attendees
  event.attendees.splice(attendeeIndex, 1);
  event.updatedAt = new Date();

  inMemoryStorage.events[eventIndex] = event;

  res.status(200).json({
    success: true,
    message: 'Successfully unregistered from the event'
  });
});

/**
 * Get events organized by current user
 */
const getMyEvents = catchAsync(async (req, res, next) => {
  const userEvents = inMemoryStorage.events.filter(event => event.organizedBy === req.user.id);

  const eventsWithDetails = userEvents.map(event => ({
    ...event,
    attendeeCount: event.attendees ? event.attendees.length : 0
  }));

  res.status(200).json({
    success: true,
    data: {
      events: eventsWithDetails
    }
  });
});

// Validation rules
const eventValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('type').isIn(['reunion', 'networking', 'workshop', 'seminar', 'social', 'career']).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Event date must be a valid date'),
  body('location').trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be a positive integer'),
  body('registrationDeadline').optional().isISO8601().withMessage('Registration deadline must be a valid date'),
  body('isVirtual').optional().isBoolean().withMessage('isVirtual must be a boolean'),
  body('meetingLink').optional().isURL().withMessage('Meeting link must be a valid URL')
];

const eventQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['reunion', 'networking', 'workshop', 'seminar', 'social', 'career']).withMessage('Invalid event type'),
  query('upcoming').optional().isBoolean().withMessage('Upcoming must be a boolean'),
  query('sortBy').optional().isIn(['title', 'eventDate', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  eventValidation,
  eventQueryValidation
};
