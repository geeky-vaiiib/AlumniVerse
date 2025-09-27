const { body, query, validationResult } = require('express-validator');
const { supabase, supabaseAdmin, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Badges Controller
 * Handles user recognition, badges, and leaderboard
 */

/**
 * Get user badges and achievements
 */
const getUserBadges = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // If no userId provided, use current user
  const targetUserId = userId || req.user.id;

  if (!targetUserId) {
    return next(new AppError('User ID is required', 400));
  }

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, total_points, current_streak')
      .eq('id', targetUserId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return next(new AppError('User not found', 404));
      }
      console.error('User fetch error:', userError);
      return next(new AppError('Failed to fetch user', 500));
    }

    // Get user badges
    const { data: userBadges, error: badgesError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Badges fetch error:', badgesError);
      return next(new AppError('Failed to fetch badges', 500));
    }

    // Calculate user stats
    const badgesByCategory = userBadges.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {});

    const userStats = {
      totalBadges: userBadges.length,
      badgesByCategory,
      totalPoints: user.total_points || 0,
      currentStreak: user.current_streak || 0,
      achievements: userBadges
    };

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company,
          currentPosition: user.current_position
        },
        badges: userBadges,
        stats: userStats
      }
    });

  } catch (error) {
    console.error('User badges fetch error:', error);
    return next(new AppError('Failed to fetch user badges', 500));
  }
});

/**
 * Get leaderboard
 */
const getLeaderboard = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    category,
    timeframe = 'all',
    limit = 50
  } = req.query;

  // Get all users with their badge stats
  const users = dbHelpers.getUsers().filter(user => !user.isDeleted && user.isEmailVerified);
  
  const leaderboard = users.map(user => {
    let userBadges = inMemoryStorage.badges.filter(badge => badge.userId === user.id);

    // Filter by category if specified
    if (category) {
      userBadges = userBadges.filter(badge => badge.category === category);
    }

    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      userBadges = userBadges.filter(badge => new Date(badge.awardedAt) >= startDate);
    }

    const totalPoints = userBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
    const totalBadges = userBadges.length;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        currentPosition: user.currentPosition,
        graduationYear: user.graduationYear,
        branch: user.branch
      },
      stats: {
        totalPoints,
        totalBadges,
        recentBadges: userBadges
          .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
          .slice(0, 3)
      }
    };
  });

  // Sort by total points (descending)
  leaderboard.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);

  // Add rank
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Limit results
  const limitedLeaderboard = leaderboard.slice(0, parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      leaderboard: limitedLeaderboard,
      filters: {
        category,
        timeframe,
        limit: parseInt(limit)
      },
      totalParticipants: leaderboard.length
    }
  });
});

/**
 * Award badge to user
 */
const awardBadge = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    userId,
    badgeType,
    category,
    title,
    description,
    points,
    metadata
  } = req.body;

  // Check if target user exists
  const targetUser = dbHelpers.findUserById(userId);
  if (!targetUser) {
    return next(new AppError('Target user not found', 404));
  }

  // Check if badge already exists for this user and type
  const existingBadge = inMemoryStorage.badges.find(
    badge => badge.userId === userId && badge.badgeType === badgeType
  );

  if (existingBadge) {
    return next(new AppError('User already has this badge', 400));
  }

  const badgeData = {
    id: dbHelpers.generateId(),
    userId,
    badgeType,
    category: category || 'general',
    title,
    description,
    points: points || 0,
    metadata: metadata || {},
    awardedBy: req.user.id,
    awardedAt: new Date(),
    isActive: true
  };

  inMemoryStorage.badges.push(badgeData);

  res.status(201).json({
    success: true,
    message: 'Badge awarded successfully',
    data: {
      badge: badgeData
    }
  });
});

/**
 * Get available badge types
 */
const getBadgeTypes = catchAsync(async (req, res, next) => {
  const badgeTypes = [
    {
      type: 'early_adopter',
      category: 'engagement',
      title: 'Early Adopter',
      description: 'One of the first users to join the platform',
      points: 50,
      icon: '🌟'
    },
    {
      type: 'profile_complete',
      category: 'profile',
      title: 'Profile Master',
      description: 'Completed all profile sections',
      points: 25,
      icon: '✅'
    },
    {
      type: 'job_poster',
      category: 'contribution',
      title: 'Job Creator',
      description: 'Posted first job opportunity',
      points: 30,
      icon: '💼'
    },
    {
      type: 'event_organizer',
      category: 'contribution',
      title: 'Event Organizer',
      description: 'Organized first alumni event',
      points: 40,
      icon: '🎉'
    },
    {
      type: 'networking_star',
      category: 'engagement',
      title: 'Networking Star',
      description: 'Connected with 50+ alumni',
      points: 75,
      icon: '🤝'
    },
    {
      type: 'mentor',
      category: 'contribution',
      title: 'Mentor',
      description: 'Actively mentoring junior alumni',
      points: 100,
      icon: '👨‍🏫'
    },
    {
      type: 'top_contributor',
      category: 'achievement',
      title: 'Top Contributor',
      description: 'Among top 10 contributors this month',
      points: 150,
      icon: '🏆'
    },
    {
      type: 'anniversary',
      category: 'milestone',
      title: 'Anniversary',
      description: 'Celebrating graduation anniversary',
      points: 20,
      icon: '🎂'
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      badgeTypes
    }
  });
});

/**
 * Get badge statistics
 */
const getBadgeStats = catchAsync(async (req, res, next) => {
  const badges = inMemoryStorage.badges;

  const stats = {
    totalBadgesAwarded: badges.length,
    badgesByCategory: {},
    badgesByType: {},
    topBadgeEarners: [],
    recentBadges: []
  };

  // Count by category and type
  badges.forEach(badge => {
    stats.badgesByCategory[badge.category] = (stats.badgesByCategory[badge.category] || 0) + 1;
    stats.badgesByType[badge.badgeType] = (stats.badgesByType[badge.badgeType] || 0) + 1;
  });

  // Get recent badges (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  stats.recentBadges = badges
    .filter(badge => new Date(badge.awardedAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
    .slice(0, 20)
    .map(badge => {
      const user = dbHelpers.findUserById(badge.userId);
      return {
        ...badge,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        } : null
      };
    });

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

/**
 * Remove badge from user
 */
const removeBadge = catchAsync(async (req, res, next) => {
  const { badgeId } = req.params;

  const badgeIndex = inMemoryStorage.badges.findIndex(badge => badge.id === badgeId);
  if (badgeIndex === -1) {
    return next(new AppError('Badge not found', 404));
  }

  const badge = inMemoryStorage.badges[badgeIndex];

  // Check if user can remove this badge (admin or badge awarder)
  if (req.user.role !== 'admin' && badge.awardedBy !== req.user.id) {
    return next(new AppError('You can only remove badges you awarded', 403));
  }

  inMemoryStorage.badges.splice(badgeIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Badge removed successfully'
  });
});

// Validation rules
const awardBadgeValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('badgeType').notEmpty().withMessage('Badge type is required'),
  body('title').trim().isLength({ min: 3, max: 50 }).withMessage('Title must be between 3 and 50 characters'),
  body('description').trim().isLength({ min: 10, max: 200 }).withMessage('Description must be between 10 and 200 characters'),
  body('category').optional().isIn(['engagement', 'profile', 'contribution', 'achievement', 'milestone', 'general']).withMessage('Invalid category'),
  body('points').optional().isInt({ min: 0, max: 1000 }).withMessage('Points must be between 0 and 1000')
];

const leaderboardValidation = [
  query('category').optional().isIn(['engagement', 'profile', 'contribution', 'achievement', 'milestone', 'general']).withMessage('Invalid category'),
  query('timeframe').optional().isIn(['all', 'week', 'month', 'year']).withMessage('Invalid timeframe'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  getUserBadges,
  getLeaderboard,
  awardBadge,
  getBadgeTypes,
  getBadgeStats,
  removeBadge,
  awardBadgeValidation,
  leaderboardValidation
};
