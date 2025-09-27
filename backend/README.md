# AlumniVerse Backend API

A production-ready backend API for AlumniVerse - A centralized alumni engagement platform built with Node.js and Express.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with access and refresh tokens
- **File Upload Support** - Profile pictures and resume uploads with Multer
- **Rate Limiting** - Protection against abuse and DDoS attacks
- **CORS Enabled** - Cross-origin resource sharing for frontend integration
- **Security Headers** - Helmet.js for enhanced security
- **Error Handling** - Centralized error handling with detailed responses
- **Request Validation** - Input validation using express-validator
- **Pagination Support** - Efficient data pagination for large datasets
- **Search and Filtering** - Advanced search and filtering capabilities
- **In-Memory Storage** - Ready for database integration (MySQL, PostgreSQL, MongoDB)

## 📁 Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── config/
│   └── db.js                 # Database configuration (placeholder)
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── directoryController.js # Alumni directory
│   ├── jobsController.js     # Jobs & internships
│   ├── eventsController.js   # Events & reunions
│   └── badgesController.js   # Recognition & badges
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── userRoutes.js         # User routes
│   ├── directoryRoutes.js    # Directory routes
│   ├── jobsRoutes.js         # Jobs routes
│   ├── eventsRoutes.js       # Events routes
│   └── badgesRoutes.js       # Badges routes
├── middlewares/
│   ├── authMiddleware.js     # JWT authentication
│   ├── errorMiddleware.js    # Error handling
│   └── uploadMiddleware.js   # File upload handling
├── utils/
│   └── token.js              # JWT utilities
└── uploads/                  # File storage directory
    ├── profiles/             # Profile pictures
    ├── resumes/              # Resume files
    └── documents/            # Other documents
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AlumniVerse/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12
```

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user (requires @sit.ac.in email)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@sit.ac.in",
  "password": "SecurePassword123!"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john.doe@sit.ac.in",
  "password": "SecurePassword123!"
}
```

#### POST /api/auth/otp
Verify OTP for email verification
```json
{
  "email": "john.doe@sit.ac.in",
  "otp": "123456"
}
```

### User Management Endpoints

#### GET /api/users/me
Get current user profile (requires authentication)

#### PUT /api/users/:id
Update user profile (requires authentication)

#### POST /api/users/upload
Upload profile picture or resume (requires authentication)

### Alumni Directory Endpoints

#### GET /api/directory
Get alumni directory with filters
- Query parameters: `branch`, `year`, `skills`, `location`, `search`, `page`, `limit`

#### GET /api/directory/stats
Get alumni statistics

#### GET /api/directory/featured
Get featured alumni

### Jobs & Internships Endpoints

#### GET /api/jobs
Get all jobs with filters
- Query parameters: `type`, `location`, `company`, `skills`, `experience`, `search`

#### POST /api/jobs
Create new job posting (requires authentication)

#### PUT /api/jobs/:id
Update job posting (requires authentication)

#### DELETE /api/jobs/:id
Delete job posting (requires authentication)

### Events & Reunions Endpoints

#### GET /api/events
Get all events with filters
- Query parameters: `type`, `location`, `upcoming`, `search`

#### POST /api/events
Create new event (requires authentication)

#### POST /api/events/:id/register
Register for event (requires authentication)

### Recognition & Badges Endpoints

#### GET /api/badges/leaderboard
Get leaderboard with rankings

#### GET /api/badges/types
Get available badge types

#### POST /api/badges
Award badge to user (requires admin role)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📤 File Uploads

Supported file types: JPG, JPEG, PNG, PDF, DOC, DOCX
Maximum file size: 5MB

Upload endpoints:
- Profile pictures: `/api/users/upload` (field: `profilePicture`)
- Resumes: `/api/users/upload` (field: `resume`)

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevents abuse
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Request validation
- **Password Hashing** - bcrypt with salt rounds
- **JWT Security** - Secure token implementation

## 🚀 Deployment

1. **Set environment to production**
   ```bash
   NODE_ENV=production
   ```

2. **Configure production database**
   - Update `config/db.js` with your database connection
   - Replace in-memory storage with actual database queries

3. **Set up file storage**
   - Configure cloud storage (AWS S3, Google Cloud Storage)
   - Update upload middleware accordingly

4. **Configure email service**
   - Set up SMTP or email service provider
   - Update email configuration in `.env`

## 🔄 Database Integration

The current implementation uses in-memory storage for demonstration. To integrate with a real database:

1. **Install database driver**
   ```bash
   # For MySQL
   npm install mysql2

   # For PostgreSQL
   npm install pg

   # For MongoDB
   npm install mongoose
   ```

2. **Update `config/db.js`**
   - Replace in-memory storage with database connection
   - Implement actual database queries

3. **Update controllers**
   - Replace `dbHelpers` calls with actual database operations
   - Add proper error handling for database operations

## 📝 Testing

```bash
# Test health endpoint
curl http://localhost:5001/health

# Test API documentation
curl http://localhost:5001/api

# Test user registration
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@sit.ac.in","password":"TestPass123!"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
