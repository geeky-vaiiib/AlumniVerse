/**
 * Swagger/OpenAPI Configuration
 * API Documentation for AlumniVerse Backend
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AlumniVerse API',
            version: '1.0.0',
            description: 'API documentation for AlumniVerse - Alumni Network Platform for SIT',
            contact: {
                name: 'AlumniVerse Team',
                email: 'support@alumniverse.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5001/api',
                description: 'Development server'
            },
            {
                url: 'https://api.alumniverse.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Supabase JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        usn: { type: 'string' },
                        branch: { type: 'string' },
                        passing_year: { type: 'integer' },
                        bio: { type: 'string' },
                        current_position: { type: 'string' },
                        company: { type: 'string' },
                        location: { type: 'string' },
                        skills: { type: 'array', items: { type: 'string' } },
                        role: { type: 'string', enum: ['user', 'admin', 'moderator'] }
                    }
                },
                Job: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        company: { type: 'string' },
                        description: { type: 'string' },
                        location: { type: 'string' },
                        type: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship'] },
                        experience_level: { type: 'string' },
                        salary_range: { type: 'string' },
                        required_skills: { type: 'array', items: { type: 'string' } },
                        posted_by: { type: 'string', format: 'uuid' },
                        is_active: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Event: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string', enum: ['reunion', 'networking', 'workshop', 'seminar', 'social', 'career'] },
                        event_date: { type: 'string', format: 'date-time' },
                        location: { type: 'string' },
                        max_attendees: { type: 'integer' },
                        organized_by: { type: 'string', format: 'uuid' },
                        is_active: { type: 'boolean' }
                    }
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        author_id: { type: 'string', format: 'uuid' },
                        content: { type: 'string' },
                        post_type: { type: 'string', enum: ['general', 'achievement', 'question', 'announcement', 'job', 'event'] },
                        images: { type: 'array', items: { type: 'string' } },
                        tags: { type: 'array', items: { type: 'string' } },
                        likes_count: { type: 'integer' },
                        comments_count: { type: 'integer' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        totalCount: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' },
                        limit: { type: 'integer' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Profile', description: 'User profile management' },
            { name: 'Directory', description: 'Alumni directory' },
            { name: 'Jobs', description: 'Job postings and applications' },
            { name: 'Events', description: 'Events and reunions' },
            { name: 'Posts', description: 'Social posts and interactions' },
            { name: 'Storage', description: 'File upload and storage' }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
