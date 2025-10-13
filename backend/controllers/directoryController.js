const { query, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

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
    let dbQuery = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false)
      .eq('is_email_verified', true);

    // Apply filters
    if (branch) {
      dbQuery = dbQuery.eq('branch', branch);
    }

    if (year) {
      dbQuery = dbQuery.eq('passing_year', parseInt(year));
    }

    if (location) {
      dbQuery = dbQuery.ilike('location', `%${location}%`);
    }

    if (company) {
      dbQuery = dbQuery.ilike('company', `%${company}%`);
    }

    if (skills) {
      // Search in skills JSONB array
      const skillsArray = skills.split(',').map(skill => skill.trim());
      dbQuery = dbQuery.overlaps('skills', skillsArray);
    }

    if (search) {
      dbQuery = dbQuery.or(`
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

    dbQuery = dbQuery.order(sortField, { ascending: sortDirection });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    dbQuery = dbQuery.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: alumni, error, count: totalCount } = await dbQuery;

    if (error) {
      console.error('Supabase alumni query error:', error);
      return next(new AppError('Failed to fetch alumni directory', 500));
    }

    // Remove sensitive information and format response
    const sanitizedAlumni = alumni.map(user => {
      const { password_hash, auth_id, ...alumniData } = user;

      // Format additional fields
      return {
        ...alumniData,
        fullName: `${alumniData.first_name || ''} ${alumniData.last_name || ''}`.trim(),
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
    const { data: alumni, error } = await supabase
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

    // Format response
    const formattedAlumni = {
      ...alumniData,
      fullName: `${alumniData.first_name || ''} ${alumniData.last_name || ''}`.trim(),
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
  try {
    // Get total alumni count
    const { count: totalAlumni, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('is_email_verified', true);

    if (totalError) {
      console.error('Total alumni count error:', totalError);
    }

    // Get stats by branch
    const { data: branchData, error: branchError } = await supabase
      .from('users')
      .select('branch')
      .eq('is_deleted', false)
      .eq('is_email_verified', true)
      .not('branch', 'is', null);

    const byBranch = branchData?.reduce((acc, row) => {
      acc[row.branch] = (acc[row.branch] || 0) + 1;
      return acc;
    }, {}) || {};

    // Calculate statistics
    const stats = {
      totalAlumni: totalAlumni || 0,
      byBranch,
      byYear: {},
      byLocation: {},
      byCompany: {},
      recentJoiners: []
    };

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Alumni stats fetch error:', error);
    return next(new AppError('Failed to fetch alumni statistics', 500));
  }
});

/**
 * Get featured alumni
 */
const getFeaturedAlumni = catchAsync(async (req, res, next) => {
  const { limit = 6 } = req.query;

  try {
    // Get featured alumni from Supabase
    const { data: featuredAlumniData, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_email_verified', true)
      .not('bio', 'is', null)
      .not('company', 'is', null)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Featured alumni fetch error:', error);
      return next(new AppError('Failed to fetch featured alumni', 500));
    }

    const featuredAlumni = featuredAlumniData.map(user => {
      const { password_hash, auth_id, ...userData } = user;
      return userData;
    });

    res.status(200).json({
      success: true,
      data: {
        featuredAlumni
      }
    });
  } catch (error) {
    console.error('Featured alumni fetch error:', error);
    return next(new AppError('Failed to fetch featured alumni', 500));
  }
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
