import { supabase } from '../supabaseClient'

/**
 * Fetch all events with organizer information
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of events to fetch
 * @param {number} options.offset - Offset for pagination
 * @param {boolean} options.upcomingOnly - Fetch only upcoming events
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchEvents({ limit = 50, offset = 0, upcomingOnly = true } = {}) {
  try {
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:users!organized_by (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        ),
        attendees:event_attendees(count)
      `)
      .eq('is_active', true)
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (upcomingOnly) {
      const now = new Date().toISOString()
      query = query.gte('event_date', now)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data to match frontend format
    const transformedData = (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.event_date,
      location: event.location,
      isVirtual: event.is_virtual,
      meetingLink: event.meeting_link,
      maxAttendees: event.max_attendees,
      registrationDeadline: event.registration_deadline,
      agenda: event.agenda || [],
      tags: event.tags || [],
      organizer: {
        id: event.organizer?.id,
        name: `${event.organizer?.first_name || ''} ${event.organizer?.last_name || ''}`.trim(),
        avatar: event.organizer?.avatar_path || null,
        position: event.organizer?.current_position || '',
        company: event.organizer?.company || ''
      },
      attendeesCount: event.attendees?.[0]?.count || 0,
      isRegistered: false, // Will be updated by checking user's registrations
      createdAt: event.created_at
    }))

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error fetching events:', error)
    return { data: [], error }
  }
}

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        event_date: eventData.date,
        location: eventData.location,
        is_virtual: eventData.isVirtual || false,
        meeting_link: eventData.meetingLink,
        max_attendees: eventData.maxAttendees,
        registration_deadline: eventData.registrationDeadline,
        agenda: eventData.agenda || [],
        tags: eventData.tags || [],
        organized_by: eventData.organizedBy
      }])
      .select(`
        *,
        organizer:users!organized_by (
          id,
          first_name,
          last_name,
          avatar_path,
          current_position,
          company
        )
      `)
      .single()

    if (error) throw error

    // Transform to frontend format
    const transformedEvent = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.event_date,
      location: data.location,
      isVirtual: data.is_virtual,
      meetingLink: data.meeting_link,
      maxAttendees: data.max_attendees,
      registrationDeadline: data.registration_deadline,
      agenda: data.agenda || [],
      tags: data.tags || [],
      organizer: {
        id: data.organizer?.id,
        name: `${data.organizer?.first_name || ''} ${data.organizer?.last_name || ''}`.trim(),
        avatar: data.organizer?.avatar_path || null,
        position: data.organizer?.current_position || '',
        company: data.organizer?.company || ''
      },
      attendeesCount: 0,
      isRegistered: false,
      createdAt: data.created_at
    }

    return { data: transformedEvent, error: null }
  } catch (error) {
    console.error('Error creating event:', error)
    return { data: null, error }
  }
}

/**
 * Register for an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null, isRegistered: boolean}>}
 */
export async function toggleEventRegistration(eventId, userId) {
  try {
    // Check if already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('event_attendees')
      .select('id, attendance_status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingRegistration) {
      if (existingRegistration.attendance_status === 'cancelled') {
        // Re-register
        const { error: updateError } = await supabase
          .from('event_attendees')
          .update({ attendance_status: 'registered' })
          .eq('event_id', eventId)
          .eq('user_id', userId)

        if (updateError) throw updateError
        return { data: { eventId, userId }, error: null, isRegistered: true }
      } else {
        // Cancel registration
        const { error: updateError } = await supabase
          .from('event_attendees')
          .update({ attendance_status: 'cancelled' })
          .eq('event_id', eventId)
          .eq('user_id', userId)

        if (updateError) throw updateError
        return { data: { eventId, userId }, error: null, isRegistered: false }
      }
    } else {
      // Register
      const { error: insertError } = await supabase
        .from('event_attendees')
        .insert([{ 
          event_id: eventId, 
          user_id: userId,
          attendance_status: 'registered'
        }])

      if (insertError) throw insertError
      return { data: { eventId, userId }, error: null, isRegistered: true }
    }
  } catch (error) {
    console.error('Error toggling event registration:', error)
    return { data: null, error, isRegistered: false }
  }
}

/**
 * Fetch user's registered events
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchUserEvents(userId) {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        event_id,
        attendance_status,
        events (
          *,
          organizer:users!organized_by (
            id,
            first_name,
            last_name,
            avatar_path,
            current_position,
            company
          ),
          attendees:event_attendees(count)
        )
      `)
      .eq('user_id', userId)
      .eq('attendance_status', 'registered')

    if (error) throw error

    // Transform data
    const transformedData = (data || []).map(registration => {
      const event = registration.events
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.event_date,
        location: event.location,
        isVirtual: event.is_virtual,
        meetingLink: event.meeting_link,
        maxAttendees: event.max_attendees,
        registrationDeadline: event.registration_deadline,
        agenda: event.agenda || [],
        tags: event.tags || [],
        organizer: {
          id: event.organizer?.id,
          name: `${event.organizer?.first_name || ''} ${event.organizer?.last_name || ''}`.trim(),
          avatar: event.organizer?.avatar_path || null,
          position: event.organizer?.current_position || '',
          company: event.organizer?.company || ''
        },
        attendeesCount: event.attendees?.[0]?.count || 0,
        isRegistered: true,
        createdAt: event.created_at
      }
    })

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error fetching user events:', error)
    return { data: [], error }
  }
}

/**
 * Check if user has registered for specific events
 * @param {Array<string>} eventIds - Array of event IDs
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export async function checkUserRegistrations(eventIds, userId) {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('event_id, attendance_status')
      .in('event_id', eventIds)
      .eq('user_id', userId)

    if (error) throw error

    // Create a map of registered events
    const registeredEvents = {}
    ;(data || []).forEach(registration => {
      registeredEvents[registration.event_id] = registration.attendance_status === 'registered'
    })

    return { data: registeredEvents, error: null }
  } catch (error) {
    console.error('Error checking user registrations:', error)
    return { data: {}, error }
  }
}

/**
 * Update an event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateEvent(eventId, updates, userId) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .eq('organized_by', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating event:', error)
    return { data: null, error }
  }
}

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteEvent(eventId, userId) {
  try {
    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('events')
      .update({ is_active: false })
      .eq('id', eventId)
      .eq('organized_by', userId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting event:', error)
    return { success: false, error }
  }
}

