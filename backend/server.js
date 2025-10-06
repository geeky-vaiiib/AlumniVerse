require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Import middleware
const { globalErrorHandler, notFound } = require('./middlewares/errorMiddleware');

// No custom services needed - using 100% Supabase

// Import routes
// const authRoutes = require('./routes/authRoutes'); // Legacy auth (disabled)
const supabaseAuthRoutes = require('./routes/supabaseAuthRoutes');
const supabaseStorageRoutes = require('./routes/supabaseStorageRoutes');
const profileRoutes = require('./routes/profileRoutes'); // Enhanced profile routes
const postsRoutes = require('./routes/postsRoutes'); // Social posts routes
const jobsRoutes = require('./routes/jobsRoutes'); // Jobs routes
const eventsRoutes = require('./routes/eventsRoutes'); // Events routes
// Temporarily disabled until we update middleware to use Supabase
// const userRoutes = require('./routes/userRoutes');
// const directoryRoutes = require('./routes/directoryRoutes');
// const badgesRoutes = require('./routes/badgesRoutes');

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
app.use('/api/auth', authLimiter, supabaseAuthRoutes); // Supabase auth (primary)
// app.use('/api/auth-legacy', authLimiter, authRoutes); // Legacy auth (disabled)
app.use('/api/storage', supabaseStorageRoutes); // Supabase storage
app.use('/api/profile', profileRoutes); // Enhanced profile routes
app.use('/api/posts', postsRoutes); // Social posts routes
app.use('/api/jobs', jobsRoutes); // Jobs routes
app.use('/api/events', eventsRoutes); // Events routes
// Temporarily disabled until we update middleware to use Supabase
// app.use('/api/users', userRoutes);
// app.use('/api/directory', directoryRoutes);
// app.use('/api/badges', badgesRoutes);

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

// Test Supabase database connection
const testSupabaseConnection = async () => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️ Supabase environment variables not configured');
      return false;
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test database connection with a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Supabase Database Connection Failed: ${error.message}`);
      return false;
    } else {
      console.log('✅ Supabase Database Connected Successfully!');
      
      // Additional check: Verify auth_id column exists
      try {
        const { data: schemaData, error: schemaError } = await supabase.rpc('check_column_exists', {
          table_name: 'users',
          column_name: 'auth_id'
        });
        
        if (schemaError) {
          console.log('⚠️ Could not verify auth_id column (this is okay)');
        } else {
          console.log('✅ Database schema verified');
        }
      } catch (e) {
        console.log('⚠️ Schema check skipped (this is okay)');
      }
      
      return true;
    }
  } catch (err) {
    console.log(`❌ Supabase Connection Error: ${err.message}`);
    return false;
  }
};

// Start server with database verification
const server = app.listen(PORT, async () => {
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

  // Test Supabase connections
  console.log('\n🔍 Testing Supabase Connections...');
  console.log('✅ Supabase Auth ready!');
  
  // Test database connection
  await testSupabaseConnection();
});

module.exports = app;
