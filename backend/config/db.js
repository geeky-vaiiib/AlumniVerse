/**
 * PostgreSQL Database Configuration
 * Production-ready database connection with connection pooling
 */

const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'alumniverse',

  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established

  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Initialize connection test
testConnection();

/**
 * Database Helper Functions
 * PostgreSQL query helpers for all database operations
 */

const dbHelpers = {
  // Execute query with error handling
  query: async (text, params = []) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Transaction helper
  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // User operations
  users: {
    findByEmail: async (email) => {
      const result = await dbHelpers.query(
        'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
        [email]
      );
      return result.rows[0];
    },

    findById: async (id) => {
      const result = await dbHelpers.query(
        'SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE',
        [id]
      );
      return result.rows[0];
    },

    create: async (userData) => {
      const {
        firstName, lastName, email, passwordHash, branch, graduationYear,
        currentPosition, company, location, phone, bio, skills, experience,
        education, socialLinks, careerPreferences, profilePicture, resume
      } = userData;

      const result = await dbHelpers.query(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, branch, graduation_year,
          current_position, company, location, phone, bio, skills, experience,
          education, social_links, career_preferences, profile_picture, resume
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        firstName, lastName, email, passwordHash, branch, graduationYear,
        currentPosition, company, location, phone, bio,
        JSON.stringify(skills || []),
        JSON.stringify(experience || []),
        JSON.stringify(education || []),
        JSON.stringify(socialLinks || {}),
        JSON.stringify(careerPreferences || {}),
        profilePicture, resume
      ]);
      return result.rows[0];
    },

    update: async (id, updateData) => {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          // Convert camelCase to snake_case for database columns
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

          // Handle JSONB fields
          if (['skills', 'experience', 'education', 'social_links', 'career_preferences'].includes(dbKey)) {
            fields.push(`${dbKey} = $${paramCount}`);
            values.push(JSON.stringify(updateData[key]));
          } else {
            fields.push(`${dbKey} = $${paramCount}`);
            values.push(updateData[key]);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) return null;

      values.push(id);
      const result = await dbHelpers.query(`
        UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_deleted = FALSE
        RETURNING *
      `, values);

      return result.rows[0];
    },

    getAll: async (filters = {}, pagination = {}) => {
      let query = `
        SELECT * FROM users
        WHERE is_deleted = FALSE AND is_email_verified = TRUE
      `;
      const params = [];
      let paramCount = 1;

      // Apply filters
      if (filters.branch) {
        query += ` AND branch ILIKE $${paramCount}`;
        params.push(`%${filters.branch}%`);
        paramCount++;
      }

      if (filters.year) {
        query += ` AND graduation_year = $${paramCount}`;
        params.push(filters.year);
        paramCount++;
      }

      if (filters.location) {
        query += ` AND location ILIKE $${paramCount}`;
        params.push(`%${filters.location}%`);
        paramCount++;
      }

      if (filters.company) {
        query += ` AND company ILIKE $${paramCount}`;
        params.push(`%${filters.company}%`);
        paramCount++;
      }

      if (filters.skills) {
        query += ` AND skills @> $${paramCount}`;
        params.push(JSON.stringify([filters.skills]));
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (
          first_name ILIKE $${paramCount} OR
          last_name ILIKE $${paramCount} OR
          bio ILIKE $${paramCount} OR
          company ILIKE $${paramCount} OR
          current_position ILIKE $${paramCount}
        )`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      // Add sorting
      const sortBy = pagination.sortBy || 'created_at';
      const sortOrder = pagination.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (pagination.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(pagination.limit);
        paramCount++;
      }

      if (pagination.offset) {
        query += ` OFFSET $${paramCount}`;
        params.push(pagination.offset);
        paramCount++;
      }

      const result = await dbHelpers.query(query, params);
      return result.rows;
    },

    delete: async (id) => {
      const result = await dbHelpers.query(
        'UPDATE users SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    },

    getAll: async (filters = {}, pagination = {}) => {
      let query = 'SELECT * FROM users WHERE is_deleted = FALSE AND is_email_verified = TRUE';
      const params = [];
      let paramCount = 1;

      // Apply filters
      if (filters.branch) {
        query += ` AND branch = $${paramCount}`;
        params.push(filters.branch);
        paramCount++;
      }

      if (filters.graduationYear) {
        query += ` AND graduation_year = $${paramCount}`;
        params.push(filters.graduationYear);
        paramCount++;
      }

      if (filters.location) {
        query += ` AND location ILIKE $${paramCount}`;
        params.push(`%${filters.location}%`);
        paramCount++;
      }

      if (filters.company) {
        query += ` AND company ILIKE $${paramCount}`;
        params.push(`%${filters.company}%`);
        paramCount++;
      }

      if (filters.skills) {
        query += ` AND skills @> $${paramCount}`;
        params.push(JSON.stringify([filters.skills]));
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (
          first_name ILIKE $${paramCount} OR
          last_name ILIKE $${paramCount} OR
          company ILIKE $${paramCount} OR
          current_position ILIKE $${paramCount} OR
          bio ILIKE $${paramCount}
        )`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      // Add sorting
      const sortBy = pagination.sortBy || 'first_name';
      const sortOrder = pagination.sortOrder || 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (pagination.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(pagination.limit);
        paramCount++;
      }

      if (pagination.offset) {
        query += ` OFFSET $${paramCount}`;
        params.push(pagination.offset);
        paramCount++;
      }

      const result = await dbHelpers.query(query, params);
      return result.rows;
    }
  },

  // Jobs operations
  jobs: {
    findById: async (id) => {
      const result = await dbHelpers.query(
        'SELECT * FROM jobs WHERE id = $1 AND is_active = TRUE',
        [id]
      );
      return result.rows[0];
    },

    create: async (jobData) => {
      const {
        title, description, company, location, type, experienceLevel,
        salaryRange, requiredSkills, applicationUrl, contactEmail,
        deadline, postedBy
      } = jobData;

      const result = await dbHelpers.query(`
        INSERT INTO jobs (
          title, description, company, location, type, experience_level,
          salary_range, required_skills, application_url, contact_email,
          deadline, posted_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        title, description, company, location, type, experienceLevel,
        salaryRange, JSON.stringify(requiredSkills || []),
        applicationUrl, contactEmail, deadline, postedBy
      ]);
      return result.rows[0];
    },

    update: async (id, updateData) => {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

          if (dbKey === 'required_skills') {
            fields.push(`${dbKey} = $${paramCount}`);
            values.push(JSON.stringify(updateData[key]));
          } else {
            fields.push(`${dbKey} = $${paramCount}`);
            values.push(updateData[key]);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) return null;

      values.push(id);
      const result = await dbHelpers.query(`
        UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_active = TRUE
        RETURNING *
      `, values);

      return result.rows[0];
    },

    getAll: async (filters = {}, pagination = {}) => {
      let query = 'SELECT * FROM jobs WHERE is_active = TRUE';
      const params = [];
      let paramCount = 1;

      // Apply filters
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

      if (filters.company) {
        query += ` AND company ILIKE $${paramCount}`;
        params.push(`%${filters.company}%`);
        paramCount++;
      }

      if (filters.experienceLevel) {
        query += ` AND experience_level = $${paramCount}`;
        params.push(filters.experienceLevel);
        paramCount++;
      }

      if (filters.skills) {
        query += ` AND required_skills @> $${paramCount}`;
        params.push(JSON.stringify([filters.skills]));
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (
          title ILIKE $${paramCount} OR
          description ILIKE $${paramCount} OR
          company ILIKE $${paramCount}
        )`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      // Filter out expired jobs
      query += ' AND (deadline IS NULL OR deadline > NOW())';

      // Add sorting
      const sortBy = pagination.sortBy || 'created_at';
      const sortOrder = pagination.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (pagination.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(pagination.limit);
        paramCount++;
      }

      if (pagination.offset) {
        query += ` OFFSET $${paramCount}`;
        params.push(pagination.offset);
        paramCount++;
      }

      const result = await dbHelpers.query(query, params);
      return result.rows;
    },

    delete: async (id) => {
      const result = await dbHelpers.query(
        'UPDATE jobs SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    },

    getByUserId: async (userId) => {
      const result = await dbHelpers.query(
        'SELECT * FROM jobs WHERE posted_by = $1 AND is_active = TRUE ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    }
  },

  // Events operations
  events: {
    findById: async (id) => {
      const result = await dbHelpers.query(
        'SELECT * FROM events WHERE id = $1 AND is_active = TRUE',
        [id]
      );
      return result.rows[0];
    },

    create: async (eventData) => {
      const {
        title, description, type, eventDate, location, maxAttendees,
        registrationDeadline, isVirtual, meetingLink, agenda, tags, organizedBy
      } = eventData;

      const result = await dbHelpers.query(`
        INSERT INTO events (
          title, description, type, event_date, location, max_attendees,
          registration_deadline, is_virtual, meeting_link, agenda, tags, organized_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        title, description, type, eventDate, location, maxAttendees,
        registrationDeadline, isVirtual, meetingLink,
        JSON.stringify(agenda || []), JSON.stringify(tags || []), organizedBy
      ]);
      return result.rows[0];
    },

    update: async (id, updateData) => {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

          if (['agenda', 'tags'].includes(dbKey)) {
            fields.push(`${dbKey} = $${paramCount}`);
            values.push(JSON.stringify(updateData[key]));
          } else {
            fields.push(`${dbKey} = $${paramCount}`);
            values.push(updateData[key]);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) return null;

      values.push(id);
      const result = await dbHelpers.query(`
        UPDATE events SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_active = TRUE
        RETURNING *
      `, values);

      return result.rows[0];
    },

    getAll: async (filters = {}, pagination = {}) => {
      let query = 'SELECT * FROM events WHERE is_active = TRUE';
      const params = [];
      let paramCount = 1;

      // Apply filters
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

      // Add sorting
      const sortBy = pagination.sortBy || 'event_date';
      const sortOrder = pagination.sortOrder || 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (pagination.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(pagination.limit);
        paramCount++;
      }

      if (pagination.offset) {
        query += ` OFFSET $${paramCount}`;
        params.push(pagination.offset);
        paramCount++;
      }

      const result = await dbHelpers.query(query, params);
      return result.rows;
    },

    delete: async (id) => {
      const result = await dbHelpers.query(
        'UPDATE events SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    },

    getByUserId: async (userId) => {
      const result = await dbHelpers.query(
        'SELECT * FROM events WHERE organized_by = $1 AND is_active = TRUE ORDER BY event_date ASC',
        [userId]
      );
      return result.rows;
    },

    // Event attendees operations
    addAttendee: async (eventId, userId) => {
      const result = await dbHelpers.query(`
        INSERT INTO event_attendees (event_id, user_id, attendance_status)
        VALUES ($1, $2, 'registered')
        ON CONFLICT (event_id, user_id) DO NOTHING
        RETURNING *
      `, [eventId, userId]);
      return result.rows[0];
    },

    removeAttendee: async (eventId, userId) => {
      const result = await dbHelpers.query(
        'DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2 RETURNING *',
        [eventId, userId]
      );
      return result.rows[0];
    },

    getAttendees: async (eventId) => {
      const result = await dbHelpers.query(`
        SELECT u.id, u.first_name, u.last_name, u.company, u.current_position, ea.attendance_status, ea.registered_at
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.id
        WHERE ea.event_id = $1 AND u.is_deleted = FALSE
        ORDER BY ea.registered_at ASC
      `, [eventId]);
      return result.rows;
    },

    isUserAttending: async (eventId, userId) => {
      const result = await dbHelpers.query(
        'SELECT 1 FROM event_attendees WHERE event_id = $1 AND user_id = $2',
        [eventId, userId]
      );
      return result.rows.length > 0;
    }
  },

  // Badges operations
  badges: {
    findById: async (id) => {
      const result = await dbHelpers.query(
        'SELECT * FROM badges WHERE id = $1 AND is_active = TRUE',
        [id]
      );
      return result.rows[0];
    },

    create: async (badgeData) => {
      const {
        userId, badgeType, category, title, description, points, metadata, awardedBy
      } = badgeData;

      const result = await dbHelpers.query(`
        INSERT INTO badges (
          user_id, badge_type, category, title, description, points, metadata, awarded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        userId, badgeType, category, title, description, points || 0,
        JSON.stringify(metadata || {}), awardedBy
      ]);
      return result.rows[0];
    },

    getByUserId: async (userId) => {
      const result = await dbHelpers.query(
        'SELECT * FROM badges WHERE user_id = $1 AND is_active = TRUE ORDER BY awarded_at DESC',
        [userId]
      );
      return result.rows;
    },

    getAll: async (filters = {}) => {
      let query = 'SELECT * FROM badges WHERE is_active = TRUE';
      const params = [];
      let paramCount = 1;

      if (filters.category) {
        query += ` AND category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }

      if (filters.badgeType) {
        query += ` AND badge_type = $${paramCount}`;
        params.push(filters.badgeType);
        paramCount++;
      }

      if (filters.timeframe && filters.timeframe !== 'all') {
        let startDate;
        const now = new Date();

        switch (filters.timeframe) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        }

        if (startDate) {
          query += ` AND awarded_at >= $${paramCount}`;
          params.push(startDate);
          paramCount++;
        }
      }

      query += ' ORDER BY awarded_at DESC';

      const result = await dbHelpers.query(query, params);
      return result.rows;
    },

    getLeaderboard: async (filters = {}, limit = 50) => {
      let query = `
        SELECT
          u.id, u.first_name, u.last_name, u.company, u.current_position,
          u.graduation_year, u.branch,
          COUNT(b.id) as total_badges,
          COALESCE(SUM(b.points), 0) as total_points
        FROM users u
        LEFT JOIN badges b ON u.id = b.user_id AND b.is_active = TRUE
        WHERE u.is_deleted = FALSE AND u.is_email_verified = TRUE
      `;
      const params = [];
      let paramCount = 1;

      if (filters.category) {
        query += ` AND (b.category = $${paramCount} OR b.category IS NULL)`;
        params.push(filters.category);
        paramCount++;
      }

      if (filters.timeframe && filters.timeframe !== 'all') {
        let startDate;
        const now = new Date();

        switch (filters.timeframe) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        }

        if (startDate) {
          query += ` AND (b.awarded_at >= $${paramCount} OR b.awarded_at IS NULL)`;
          params.push(startDate);
          paramCount++;
        }
      }

      query += `
        GROUP BY u.id, u.first_name, u.last_name, u.company, u.current_position,
                 u.graduation_year, u.branch
        ORDER BY total_points DESC, total_badges DESC
        LIMIT $${paramCount}
      `;
      params.push(limit);

      const result = await dbHelpers.query(query, params);
      return result.rows;
    },

    getStats: async () => {
      const totalBadges = await dbHelpers.query(
        'SELECT COUNT(*) as count FROM badges WHERE is_active = TRUE'
      );

      const badgesByCategory = await dbHelpers.query(`
        SELECT category, COUNT(*) as count
        FROM badges
        WHERE is_active = TRUE
        GROUP BY category
        ORDER BY count DESC
      `);

      const badgesByType = await dbHelpers.query(`
        SELECT badge_type, COUNT(*) as count
        FROM badges
        WHERE is_active = TRUE
        GROUP BY badge_type
        ORDER BY count DESC
      `);

      const recentBadges = await dbHelpers.query(`
        SELECT b.*, u.first_name, u.last_name
        FROM badges b
        JOIN users u ON b.user_id = u.id
        WHERE b.is_active = TRUE AND b.awarded_at > NOW() - INTERVAL '30 days'
        ORDER BY b.awarded_at DESC
        LIMIT 20
      `);

      return {
        totalBadgesAwarded: parseInt(totalBadges.rows[0].count),
        badgesByCategory: badgesByCategory.rows.reduce((acc, row) => {
          acc[row.category] = parseInt(row.count);
          return acc;
        }, {}),
        badgesByType: badgesByType.rows.reduce((acc, row) => {
          acc[row.badge_type] = parseInt(row.count);
          return acc;
        }, {}),
        recentBadges: recentBadges.rows
      };
    },

    delete: async (id) => {
      const result = await dbHelpers.query(
        'UPDATE badges SET is_active = FALSE WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    },

    checkDuplicate: async (userId, badgeType) => {
      const result = await dbHelpers.query(
        'SELECT 1 FROM badges WHERE user_id = $1 AND badge_type = $2 AND is_active = TRUE',
        [userId, badgeType]
      );
      return result.rows.length > 0;
    }
  }
};

// For backward compatibility during migration
const inMemoryStorage = {
  users: [],
  jobs: [],
  events: [],
  badges: [],
  otpStore: new Map(),
  resetTokens: new Map()
};

module.exports = {
  pool,
  dbHelpers,
  inMemoryStorage // Keep for gradual migration
};
