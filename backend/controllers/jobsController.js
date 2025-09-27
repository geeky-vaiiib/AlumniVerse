const { body, query, validationResult } = require('express-validator');
const { supabase, supabaseAdmin, supabaseHelpers } = require('../config/supabase');
const { AppError, catchAsync } = require('../middlewares/errorMiddleware');

/**
 * Jobs Controller
 * Handles job and internship postings CRUD operations
 */

/**
 * Get all jobs with advanced filtering, search, and pagination
 */
const getJobs = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    type,
    location,
    company,
    skills,
    experienceLevel,
    search,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
    featured = false,
    active = true
  } = req.query;

  try {
    // Build Supabase query with filters using admin client to bypass RLS
    let query = supabaseAdmin
      .from('jobs')
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          company,
          current_position
        )
      `)
      .eq('is_active', active === 'true');

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (company) {
      query = query.ilike('company', `%${company}%`);
    }

    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    if (skills) {
      // Search in required_skills JSONB array
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query = query.overlaps('required_skills', skillsArray);
    }

    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        company.ilike.%${search}%,
        location.ilike.%${search}%
      `);
    }

    // Filter out expired jobs
    query = query.or('deadline.is.null,deadline.gt.now()');

    // Apply sorting
    const validSortFields = ['created_at', 'title', 'company', 'deadline', 'experience_level'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending: sortDirection });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Supabase jobs query error:', error);
      return next(new AppError('Failed to fetch jobs', 500));
    }

    // Get total count for pagination (separate query for accuracy)
    let countQuery = supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', active === 'true');

    // Apply same filters for count
    if (type) countQuery = countQuery.eq('type', type);
    if (location) countQuery = countQuery.ilike('location', `%${location}%`);
    if (company) countQuery = countQuery.ilike('company', `%${company}%`);
    if (experienceLevel) countQuery = countQuery.eq('experience_level', experienceLevel);
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      countQuery = countQuery.overlaps('required_skills', skillsArray);
    }
    if (search) {
      countQuery = countQuery.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        company.ilike.%${search}%,
        location.ilike.%${search}%
      `);
    }
    countQuery = countQuery.or('deadline.is.null,deadline.gt.now()');

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Format response
    const formattedJobs = jobs.map(job => ({
      ...job,
      postedBy: job.posted_by_user,
      posted_by_user: undefined, // Remove nested object
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
      daysUntilDeadline: job.deadline ?
        Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));

    res.status(200).json({
      success: true,
      data: {
        jobs: formattedJobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: totalCount || 0,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          type,
          location,
          company,
          skills,
          experienceLevel,
          search,
          active
        }
      }
    });

  } catch (error) {
    console.error('Jobs fetch error:', error);
    return next(new AppError('Failed to fetch jobs', 500));
  }
});

/**
 * Get single job by ID with detailed information
 */
const getJobById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Job ID is required', 400));
  }

  try {
    // Get job with poster information
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          company,
          current_position,
          email
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Job not found', 404));
      }
      console.error('Supabase job fetch error:', error);
      return next(new AppError('Failed to fetch job', 500));
    }

    // Check if job is expired
    const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
    const daysUntilDeadline = job.deadline ?
      Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    // Get application count if user is the poster or admin
    let applicationCount = 0;
    if (req.user && (req.user.id === job.posted_by || req.user.role === 'admin')) {
      const { count } = await supabaseAdmin
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', id);
      applicationCount = count || 0;
    }

    // Check if current user has applied (if authenticated)
    let hasApplied = false;
    if (req.user) {
      const { data: application } = await supabaseAdmin
        .from('job_applications')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', req.user.id)
        .single();
      hasApplied = !!application;
    }

    const jobResponse = {
      ...job,
      postedBy: job.posted_by_user,
      posted_by_user: undefined,
      isExpired,
      daysUntilDeadline,
      applicationCount,
      hasApplied,
      canEdit: req.user ? (req.user.id === job.posted_by || req.user.role === 'admin') : false
    };

    res.status(200).json({
      success: true,
      data: {
        job: jobResponse
      }
    });

  } catch (error) {
    console.error('Job fetch error:', error);
    return next(new AppError('Failed to fetch job', 500));
  }
});

/**
 * Create new job posting
 */
const createJob = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    title,
    description,
    company,
    location,
    type = 'job',
    experienceLevel,
    salaryRange,
    requiredSkills = [],
    applicationUrl,
    contactEmail,
    deadline,
    isRemote = false
  } = req.body;

  // Validate required fields
  if (!title || !description || !company || !location) {
    return next(new AppError('Title, description, company, and location are required', 400));
  }

  // Validate job type
  if (!['job', 'internship'].includes(type)) {
    return next(new AppError('Job type must be either "job" or "internship"', 400));
  }

  // Validate experience level
  if (experienceLevel && !['entry', 'mid', 'senior', 'executive'].includes(experienceLevel)) {
    return next(new AppError('Invalid experience level', 400));
  }

  // Validate deadline (must be in the future)
  if (deadline && new Date(deadline) <= new Date()) {
    return next(new AppError('Deadline must be in the future', 400));
  }

  try {
    // Prepare job data
    const jobData = {
      title: title.trim(),
      description: description.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      experience_level: experienceLevel,
      salary_range: salaryRange,
      required_skills: Array.isArray(requiredSkills) ? requiredSkills : [],
      application_url: applicationUrl,
      contact_email: contactEmail || req.user.email,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      posted_by: req.user.id,
      is_active: true
    };

    // Create job in Supabase
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert([jobData])
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          company,
          current_position
        )
      `)
      .single();

    if (error) {
      console.error('Supabase job creation error:', error);
      return next(new AppError('Failed to create job posting', 500));
    }

    // Format response
    const jobResponse = {
      ...job,
      postedBy: job.posted_by_user,
      posted_by_user: undefined,
      isExpired: false,
      daysUntilDeadline: job.deadline ?
        Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      canEdit: true
    };

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: {
        job: jobResponse
      }
    });

  } catch (error) {
    console.error('Job creation error:', error);
    return next(new AppError('Failed to create job posting', 500));
  }
});

/**
 * Update job posting (only by owner or admin)
 */
const updateJob = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { id } = req.params;
  const {
    title,
    description,
    company,
    location,
    type,
    experienceLevel,
    salaryRange,
    requiredSkills,
    applicationUrl,
    contactEmail,
    deadline,
    isActive
  } = req.body;

  if (!id) {
    return next(new AppError('Job ID is required', 400));
  }

  try {
    // First, check if job exists and user has permission
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return next(new AppError('Job not found', 404));
      }
      console.error('Job fetch error:', fetchError);
      return next(new AppError('Failed to fetch job', 500));
    }

    // Check ownership or admin permission
    if (existingJob.posted_by !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You can only update your own job postings', 403));
    }

    // Prepare update data (only include provided fields)
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (type !== undefined) {
      if (!['job', 'internship'].includes(type)) {
        return next(new AppError('Job type must be either "job" or "internship"', 400));
      }
      updateData.type = type;
    }
    if (experienceLevel !== undefined) {
      if (experienceLevel && !['entry', 'mid', 'senior', 'executive'].includes(experienceLevel)) {
        return next(new AppError('Invalid experience level', 400));
      }
      updateData.experience_level = experienceLevel;
    }
    if (salaryRange !== undefined) updateData.salary_range = salaryRange;
    if (requiredSkills !== undefined) updateData.required_skills = Array.isArray(requiredSkills) ? requiredSkills : [];
    if (applicationUrl !== undefined) updateData.application_url = applicationUrl;
    if (contactEmail !== undefined) updateData.contact_email = contactEmail;
    if (deadline !== undefined) {
      if (deadline && new Date(deadline) <= new Date()) {
        return next(new AppError('Deadline must be in the future', 400));
      }
      updateData.deadline = deadline ? new Date(deadline).toISOString() : null;
    }
    if (isActive !== undefined) updateData.is_active = isActive;

    // Update job in Supabase
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        posted_by_user:users!posted_by (
          id,
          first_name,
          last_name,
          company,
          current_position
        )
      `)
      .single();

    if (updateError) {
      console.error('Job update error:', updateError);
      return next(new AppError('Failed to update job posting', 500));
    }

    // Format response
    const jobResponse = {
      ...updatedJob,
      postedBy: updatedJob.posted_by_user,
      posted_by_user: undefined,
      isExpired: updatedJob.deadline ? new Date(updatedJob.deadline) < new Date() : false,
      daysUntilDeadline: updatedJob.deadline ?
        Math.ceil((new Date(updatedJob.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      canEdit: true
    };

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: {
        job: jobResponse
      }
    });

  } catch (error) {
    console.error('Job update error:', error);
    return next(new AppError('Failed to update job posting', 500));
  }
});

/**
 * Delete job posting (only by owner or admin)
 */
const deleteJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Job ID is required', 400));
  }

  try {
    // First, check if job exists and user has permission
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return next(new AppError('Job not found', 404));
      }
      console.error('Job fetch error:', fetchError);
      return next(new AppError('Failed to fetch job', 500));
    }

    // Check ownership or admin permission
    if (existingJob.posted_by !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You can only delete your own job postings', 403));
    }

    // Soft delete the job (set is_active to false)
    const { error: deleteError } = await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('id', id);

    if (deleteError) {
      console.error('Job deletion error:', deleteError);
      return next(new AppError('Failed to delete job posting', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully'
    });

  } catch (error) {
    console.error('Job deletion error:', error);
    return next(new AppError('Failed to delete job posting', 500));
  }
});

/**
 * Get jobs posted by current user
 */
const getMyJobs = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
    status = 'all' // all, active, inactive
  } = req.query;

  try {
    // Build query for user's jobs
    let query = supabase
      .from('jobs')
      .select(`
        *,
        applications:job_applications(count)
      `)
      .eq('posted_by', req.user.id);

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'title', 'company', 'deadline'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending: sortDirection });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: jobs, error } = await query;

    if (error) {
      console.error('User jobs fetch error:', error);
      return next(new AppError('Failed to fetch your jobs', 500));
    }

    // Get total count
    let countQuery = supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('posted_by', req.user.id);

    if (status === 'active') {
      countQuery = countQuery.eq('is_active', true);
    } else if (status === 'inactive') {
      countQuery = countQuery.eq('is_active', false);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    // Format jobs with additional info
    const formattedJobs = jobs.map(job => ({
      ...job,
      isExpired: job.deadline ? new Date(job.deadline) < new Date() : false,
      daysUntilDeadline: job.deadline ?
        Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      applicationCount: job.applications?.[0]?.count || 0,
      canEdit: true
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        jobs: formattedJobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: totalCount || 0,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          status
        }
      }
    });

  } catch (error) {
    console.error('User jobs fetch error:', error);
    return next(new AppError('Failed to fetch your jobs', 500));
  }
});

/**
 * Apply to a job
 */
const applyToJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { coverLetter, resumeUrl } = req.body;

  if (!id) {
    return next(new AppError('Job ID is required', 400));
  }

  try {
    // Check if job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return next(new AppError('Job not found or no longer active', 404));
      }
      console.error('Job fetch error:', jobError);
      return next(new AppError('Failed to fetch job', 500));
    }

    // Check if job is expired
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return next(new AppError('This job posting has expired', 400));
    }

    // Check if user has already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (existingApplication) {
      return next(new AppError('You have already applied to this job', 400));
    }

    // Create application
    const applicationData = {
      job_id: id,
      user_id: req.user.id,
      cover_letter: coverLetter,
      resume_url: resumeUrl,
      status: 'pending'
    };

    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert([applicationData])
      .select()
      .single();

    if (applicationError) {
      console.error('Application creation error:', applicationError);
      return next(new AppError('Failed to submit application', 500));
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application
      }
    });

  } catch (error) {
    console.error('Job application error:', error);
    return next(new AppError('Failed to submit application', 500));
  }
});
/**
 * Get job applications for a specific job (only for job owner or admin)
 */
const getJobApplications = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 20,
    status = 'all' // all, pending, accepted, rejected
  } = req.query;

  if (!id) {
    return next(new AppError('Job ID is required', 400));
  }

  try {
    // First, check if job exists and user has permission
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return next(new AppError('Job not found', 404));
      }
      console.error('Job fetch error:', jobError);
      return next(new AppError('Failed to fetch job', 500));
    }

    // Check if user owns this job or is admin
    if (job.posted_by !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You can only view applications for your own job postings', 403));
    }

    // Build query for applications
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        applicant:users!user_id (
          id,
          first_name,
          last_name,
          email,
          company,
          current_position,
          resume_path
        )
      `)
      .eq('job_id', id);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting (newest first)
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: applications, error } = await query;

    if (error) {
      console.error('Applications fetch error:', error);
      return next(new AppError('Failed to fetch applications', 500));
    }

    // Get total count
    let countQuery = supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', id);

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job.id,
          title: job.title,
          company: job.company
        },
        applications,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: totalCount || 0,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        filters: {
          status
        }
      }
    });

  } catch (error) {
    console.error('Job applications fetch error:', error);
    return next(new AppError('Failed to fetch job applications', 500));
  }
});

/**
 * Update application status (only for job owner or admin)
 */
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { jobId, applicationId } = req.params;
  const { status, notes } = req.body;

  if (!jobId || !applicationId) {
    return next(new AppError('Job ID and Application ID are required', 400));
  }

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return next(new AppError('Status must be pending, accepted, or rejected', 400));
  }

  try {
    // Check if job exists and user has permission
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return next(new AppError('Job not found', 404));
      }
      console.error('Job fetch error:', jobError);
      return next(new AppError('Failed to fetch job', 500));
    }

    // Check if user owns this job or is admin
    if (job.posted_by !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You can only update applications for your own job postings', 403));
    }

    // Update application status
    const { data: application, error: updateError } = await supabase
      .from('job_applications')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('job_id', jobId)
      .select(`
        *,
        applicant:users!user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return next(new AppError('Application not found', 404));
      }
      console.error('Application update error:', updateError);
      return next(new AppError('Failed to update application status', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application
      }
    });

  } catch (error) {
    console.error('Application status update error:', error);
    return next(new AppError('Failed to update application status', 500));
  }
});

// Validation rules for job creation and updates
const jobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('type')
    .optional()
    .isIn(['job', 'internship'])
    .withMessage('Type must be either job or internship'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('applicationUrl')
    .optional()
    .isURL()
    .withMessage('Application URL must be valid'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Contact email must be valid'),
  body('requiredSkills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  body('salaryRange')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Salary range must be less than 100 characters')
];

// Validation rules for job queries
const jobQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['job', 'internship'])
    .withMessage('Type must be either job or internship'),
  query('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  query('sortBy')
    .optional()
    .isIn(['title', 'company', 'created_at', 'deadline', 'experience_level'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters')
];

// Validation rules for application status updates
const applicationStatusValidation = [
  body('status')
    .isIn(['pending', 'accepted', 'rejected'])
    .withMessage('Status must be pending, accepted, or rejected'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  jobValidation,
  jobQueryValidation,
  applicationStatusValidation
};
