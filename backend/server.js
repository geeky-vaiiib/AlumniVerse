require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import middleware
const { globalErrorHandler, notFound } = require('./middlewares/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const supabaseAuthRoutes = require('./routes/supabaseAuthRoutes');
const supabaseStorageRoutes = require('./routes/supabaseStorageRoutes');
const userRoutes = require('./routes/userRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const jobsRoutes = require('./routes/jobsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const badgesRoutes = require('./routes/badgesRoutes');

/**
 * AlumniVerse Backend Server
 * Production-ready Express.js server with security, performance, and scalability features
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for rate limiting and security headers)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AlumniVerse API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes); // Legacy auth (keep for backward compatibility)
app.use('/api/supabase-auth', authLimiter, supabaseAuthRoutes); // New Supabase auth
app.use('/api/storage', supabaseStorageRoutes); // Supabase storage
app.use('/api/users', userRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/badges', badgesRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AlumniVerse API',
    version: '1.0.0',
    documentation: {
      endpoints: {
        auth: '/api/auth - Authentication endpoints',
        users: '/api/users - User management endpoints',
        directory: '/api/directory - Alumni directory endpoints',
        jobs: '/api/jobs - Job and internship endpoints',
        events: '/api/events - Events and reunions endpoints',
        badges: '/api/badges - Recognition and badges endpoints'
      },
      features: [
        'JWT Authentication',
        'File Upload Support',
        'Rate Limiting',
        'CORS Enabled',
        'Security Headers',
        'Error Handling',
        'Request Validation',
        'Pagination Support',
        'Search and Filtering'
      ]
    }
  });
});

// Handle 404 errors
app.use(notFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 AlumniVerse Backend Server Started Successfully!

📊 Server Information:
   • Port: ${PORT}
   • Environment: ${process.env.NODE_ENV || 'development'}
   • API Base URL: http://localhost:${PORT}/api
   
🔗 Available Endpoints:
   • Health Check: http://localhost:${PORT}/health
   • API Documentation: http://localhost:${PORT}/api
   • Authentication: http://localhost:${PORT}/api/auth
   • Users: http://localhost:${PORT}/api/users
   • Directory: http://localhost:${PORT}/api/directory
   • Jobs: http://localhost:${PORT}/api/jobs
   • Events: http://localhost:${PORT}/api/events
   • Badges: http://localhost:${PORT}/api/badges

🛡️  Security Features:
   • CORS Enabled
   • Rate Limiting Active
   • Security Headers Applied
   • JWT Authentication Ready
   
📁 File Uploads:
   • Upload Directory: ./uploads
   • Max File Size: ${process.env.MAX_FILE_SIZE || '5MB'}
   • Allowed Types: ${process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx'}

Ready to serve the AlumniVerse frontend! 🎓
  `);
});

module.exports = app;
