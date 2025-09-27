const { query, validationResult } = require('express-validator');
const { supabase, supabaseAdmin, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');
const { getFileUrl } = require('../middlewares/uploadMiddleware');

/**
 * Directory Controller
 * Handles alumni directory operations with filtering and search
 */

/**
 * Get alumni directory with filters
 */
const getAlumniDirectory = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    branch,
    year,
    skills,
    location,
    company,
    search,
    page = 1,
    limit = 20,
    sortBy = 'first_name',
    sortOrder = 'asc'
  } = req.query;

  // Build filters for database query
  const filters = {};
  if (branch) filters.branch = branch;
  if (year) filters.graduationYear = parseInt(year);
  if (location) filters.location = location;
  if (company) filters.company = company;
  if (skills) filters.skills = skills;
  if (search) filters.search = search;

  try {
    // Build Supabase query with filters
    let query = supabaseAdmin
      .from('users')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_email_verified', true);

    // Apply filters
    if (branch) {
      query = query.eq('branch', branch);
    }

    if (year) {
      query = query.eq('passing_year', parseInt(year));
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (company) {
      query = query.ilike('company', `%${company}%`);
    }

    if (skills) {
      // Search in skills JSONB array
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query = query.overlaps('skills', skillsArray);
    }

    if (search) {
      query = query.or(`
        first_name.ilike.%${search}%,
        last_name.ilike.%${search}%,
        company.ilike.%${search}%,
        current_position.ilike.%${search}%,
        bio.ilike.%${search}%
      `);
    }

    // Apply sorting
    const validSortFields = ['first_name', 'last_name', 'company', 'passing_year', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'first_name';
    const sortDirection = sortOrder.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending: sortDirection });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: alumni, error } = await query;

    if (error) {
      console.error('Supabase alumni query error:', error);
      return next(new AppError('Failed to fetch alumni directory', 500));
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('is_email_verified', true);

    // Apply same filters for count
    if (branch) countQuery = countQuery.eq('branch', branch);
    if (year) countQuery = countQuery.eq('passing_year', parseInt(year));
    if (location) countQuery = countQuery.ilike('location', `%${location}%`);
    if (company) countQuery = countQuery.ilike('company', `%${company}%`);
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      countQuery = countQuery.overlaps('skills', skillsArray);
    }
    if (search) {
      countQuery = countQuery.or(`
        first_name.ilike.%${search}%,
        last_name.ilike.%${search}%,
        company.ilike.%${search}%,
        current_position.ilike.%${search}%,
        bio.ilike.%${search}%
      `);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    // Remove sensitive information and format response
    const sanitizedAlumni = alumni.map(user => {
      const { password_hash, auth_id, ...alumniData } = user;

      // Add file URLs if available
      if (alumniData.profile_picture) {
        alumniData.profilePictureUrl = getFileUrl(req, alumniData.profile_picture);
      }

      // Format additional fields
      return {
        ...alumniData,
        fullName: `${alumniData.first_name} ${alumniData.last_name}`,
        graduationYear: alumniData.passing_year,
        profileComplete: !!(alumniData.bio && alumniData.current_position && alumniData.company)
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        alumni: sanitizedAlumni,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: totalCount || 0,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          branch,
          year,
          skills,
          location,
          company,
          search
        }
      }
    });

  } catch (error) {
    console.error('Alumni directory fetch error:', error);
    return next(new AppError('Failed to fetch alumni directory', 500));
  }
});

/**
 * Get single alumni details by ID
 */
const getAlumniById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Alumni ID is required', 400));
  }

  try {
    // Get alumni details
    const { data: alumni, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .eq('is_email_verified', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Alumni not found', 404));
      }
      console.error('Supabase alumni fetch error:', error);
      return next(new AppError('Failed to fetch alumni details', 500));
    }

    // Remove sensitive information
    const { password_hash, auth_id, ...alumniData } = alumni;

    // Add file URLs if available
    if (alumniData.profile_picture) {
      alumniData.profilePictureUrl = getFileUrl(req, alumniData.profile_picture);
    }

    // Format response
    const formattedAlumni = {
      ...alumniData,
      fullName: `${alumniData.first_name} ${alumniData.last_name}`,
      graduationYear: alumniData.passing_year,
      profileComplete: !!(alumniData.bio && alumniData.current_position && alumniData.company),
      socialLinks: alumniData.social_links || {},
      skills: alumniData.skills || [],
      achievements: alumniData.achievements || []
    };

    res.status(200).json({
      success: true,
      data: {
        alumni: formattedAlumni
      }
    });

  } catch (error) {
    console.error('Alumni details fetch error:', error);
    return next(new AppError('Failed to fetch alumni details', 500));
  }
});

// Remove old helper function
const getTotalAlumniCount_OLD = async (filters) => {
  let query = 'SELECT COUNT(*) as total FROM users WHERE is_deleted = FALSE AND is_email_verified = TRUE';
  const params = [];
  let paramCount = 1;

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

  const result = await dbHelpers.query(query, params);
  return parseInt(result.rows[0].total);
};

/**
 * Get alumni statistics
 */
const getAlumniStats = catchAsync(async (req, res, next) => {
  // Get statistics using database queries for better performance
  const totalAlumniResult = await dbHelpers.query(
    'SELECT COUNT(*) as total FROM users WHERE is_deleted = FALSE AND is_email_verified = TRUE'
  );

  const byBranchResult = await dbHelpers.query(`
    SELECT branch, COUNT(*) as count
    FROM users
    WHERE is_deleted = FALSE AND is_email_verified = TRUE AND branch IS NOT NULL
    GROUP BY branch
    ORDER BY count DESC
  `);

  const byYearResult = await dbHelpers.query(`
    SELECT graduation_year, COUNT(*) as count
    FROM users
    WHERE is_deleted = FALSE AND is_email_verified = TRUE AND graduation_year IS NOT NULL
    GROUP BY graduation_year
    ORDER BY graduation_year DESC
  `);

  const byLocationResult = await dbHelpers.query(`
    SELECT location, COUNT(*) as count
    FROM users
    WHERE is_deleted = FALSE AND is_email_verified = TRUE AND location IS NOT NULL
    GROUP BY location
    ORDER BY count DESC
    LIMIT 20
  `);

  const byCompanyResult = await dbHelpers.query(`
    SELECT company, COUNT(*) as count
    FROM users
    WHERE is_deleted = FALSE AND is_email_verified = TRUE AND company IS NOT NULL
    GROUP BY company
    ORDER BY count DESC
    LIMIT 20
  `);

  const recentJoinersResult = await dbHelpers.query(`
    SELECT first_name, last_name, company, current_position, created_at
    FROM users
    WHERE is_deleted = FALSE AND is_email_verified = TRUE
    AND created_at > NOW() - INTERVAL '30 days'
    ORDER BY created_at DESC
    LIMIT 10
  `);

  // Calculate statistics
  const stats = {
    totalAlumni: parseInt(totalAlumniResult.rows[0].total),
    byBranch: byBranchResult.rows.reduce((acc, row) => {
      acc[row.branch] = parseInt(row.count);
      return acc;
    }, {}),
    byYear: byYearResult.rows.reduce((acc, row) => {
      acc[row.graduation_year] = parseInt(row.count);
      return acc;
    }, {}),
    byLocation: byLocationResult.rows.reduce((acc, row) => {
      acc[row.location] = parseInt(row.count);
      return acc;
    }, {}),
    byCompany: byCompanyResult.rows.reduce((acc, row) => {
      acc[row.company] = parseInt(row.count);
      return acc;
    }, {}),
    recentJoiners: recentJoinersResult.rows
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

/**
 * Get featured alumni
 */
const getFeaturedAlumni = catchAsync(async (req, res, next) => {
  const { limit = 6 } = req.query;

  // Get featured alumni using database query
  const featuredAlumniResult = await dbHelpers.query(`
    SELECT * FROM users
    WHERE is_deleted = FALSE AND is_email_verified = TRUE
    AND bio IS NOT NULL AND company IS NOT NULL
    AND array_length(skills, 1) > 0
    ORDER BY
      (CASE WHEN profile_picture IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN resume IS NOT NULL THEN 1 ELSE 0 END) +
      array_length(skills, 1) +
      array_length(experience, 1) DESC,
      created_at DESC
    LIMIT $1
  `, [parseInt(limit)]);

  const featuredAlumni = featuredAlumniResult.rows.map(user => {
    const { password_hash, ...userData } = user;
    if (userData.profile_picture) {
      userData.profilePictureUrl = getFileUrl(req, userData.profile_picture);
    }
    return userData;
  });

  res.status(200).json({
    success: true,
    data: {
      featuredAlumni
    }
  });
});

// Validation rules
const directoryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('year').optional().isInt({ min: 1950, max: new Date().getFullYear() + 10 }).withMessage('Invalid year'),
  query('sortBy').optional().isIn(['first_name', 'last_name', 'graduation_year', 'company', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

module.exports = {
  getAlumniDirectory,
  getAlumniById,
  getAlumniStats,
  getFeaturedAlumni,
  directoryValidation
};
