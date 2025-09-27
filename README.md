# 🎓 AlumniVerse

> **A comprehensive alumni networking platform built with Next.js and Supabase**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/geeky-vaiiib/AlumniVerse)

## 🌟 Overview

AlumniVerse is a modern, full-stack alumni networking platform designed specifically for educational institutions. It provides a secure, feature-rich environment for alumni to connect, share opportunities, and maintain lifelong professional relationships.

### ✨ Key Features

- 🔐 **Secure Authentication** - Institutional email validation with automatic profile creation
- 🎯 **Smart USN Parsing** - Automatic extraction of academic details from email addresses
- 👥 **Alumni Directory** - Comprehensive searchable directory with advanced filters
- 💼 **Job Board** - Exclusive job postings and internship opportunities
- 📅 **Events Management** - Alumni reunions, networking events, and workshops
- 🏆 **Recognition System** - Badges and achievements for active community members
- 📱 **Responsive Design** - Seamless experience across all devices
- 🛡️ **Enterprise Security** - Rate limiting, CORS protection, and data encryption

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **State Management**: React hooks and context
- **Authentication**: Supabase Auth integration

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom middleware
- **Security**: Helmet, CORS, rate limiting
- **File Storage**: Supabase Storage for avatars and resumes

### Database
- **Primary**: Supabase PostgreSQL
- **Security**: Row Level Security (RLS) policies
- **Real-time**: Supabase real-time subscriptions
- **Backup**: Automated daily backups

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/geeky-vaiiib/AlumniVerse.git
cd AlumniVerse
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### 3. Environment Setup

Run the automated setup script:

```bash
./setup-production.sh
```

Or manually create environment files:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=http://localhost:5001
```

**Backend (backend/.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:3000
PORT=5001
NODE_ENV=development
```

### 4. Database Setup

Execute the SQL files in your Supabase dashboard:

```bash
# 1. Run schema setup
backend/database/supabase_schema.sql

# 2. Apply RLS policies
backend/database/supabase_rls_policies.sql
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 📧 Email Format & USN Parsing

AlumniVerse automatically extracts academic information from institutional emails:

### Supported Format
```
Format: 1si[YY][branch][number]@sit.ac.in
Example: 1si23is117@sit.ac.in
```

### Automatic Extraction
- **USN**: `1SI23IS117`
- **Joining Year**: `2023` (from '23')
- **Passing Year**: `2027` (joining + 4)
- **Branch**: `Information Science` (from 'is' code)

### Supported Branch Codes

| Code | Branch Name |
|------|-------------|
| `cs` | Computer Science |
| `is` | Information Science |
| `ec` | Electronics and Communication |
| `ee` | Electrical Engineering |
| `me` | Mechanical Engineering |
| `cv` | Civil Engineering |
| `bt` | Biotechnology |
| `ch` | Chemical Engineering |
| `ae` | Aeronautical Engineering |
| `im` | Industrial Engineering and Management |
| `tc` | Telecommunication Engineering |

## 🧪 Testing

### Run All Tests

```bash
# Backend unit tests
cd backend && npm test

# USN parsing tests
node backend/test-usn-parsing.js

# Integration tests
node backend/test-signup-integration.js

# Production readiness tests
node test-production-ready.js

# Complete flow test
./test-complete-flow.sh
```

### Test Coverage

- ✅ **Authentication Flow** - Signup, signin, email verification
- ✅ **USN Parsing** - All branch codes and edge cases
- ✅ **API Endpoints** - All CRUD operations
- ✅ **Security** - Rate limiting, validation, CORS
- ✅ **Database** - RLS policies and data integrity
- ✅ **Frontend** - Component rendering and user flows

## 📁 Project Structure

```
AlumniVerse/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   ├── directory/           # Alumni directory
│   ├── events/              # Events management
│   ├── jobs/                # Job board
│   └── layout.jsx           # Root layout
├── backend/                  # Express.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── database/            # SQL schemas and policies
│   ├── middlewares/         # Custom middleware
│   ├── routes/              # API routes
│   └── utils/               # Utility functions
├── components/               # Reusable React components
│   ├── auth/                # Authentication components
│   ├── ui/                  # UI primitives
│   └── layout/              # Layout components
├── lib/                     # Utility libraries
│   ├── services/            # API services
│   ├── utils/               # Helper functions
│   └── supabase/            # Supabase client
├── public/                  # Static assets
├── styles/                  # Global styles
└── docs/                    # Documentation
```

## 🔧 API Documentation

### Authentication Endpoints

```http
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/verify-email
POST /api/auth/reset-password
```

### User Management

```http
GET    /api/users/me
PUT    /api/users/:id
GET    /api/users/:id
POST   /api/users/upload
DELETE /api/users/:id
```

### Alumni Directory

```http
GET    /api/directory
GET    /api/directory/search
GET    /api/directory/filters
POST   /api/directory/connect
```

### Job Board

```http
GET    /api/jobs
POST   /api/jobs
PUT    /api/jobs/:id
DELETE /api/jobs/:id
GET    /api/jobs/applications
```

### Events

```http
GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
POST   /api/events/:id/register
```

## 🛡️ Security Features

- **Rate Limiting**: 10 auth attempts per 15 minutes
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Authentication**: JWT tokens with secure httpOnly cookies
- **Authorization**: Role-based access control
- **Data Encryption**: Encrypted sensitive data at rest

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   ./setup-production.sh
   ```

2. **Build Applications**
   ```bash
   npm run build
   cd backend && npm run build
   ```

3. **Deploy to Vercel (Frontend)**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

4. **Deploy Backend**
   - Use Railway, Heroku, or DigitalOcean
   - Set environment variables
   - Configure domain and SSL

### Environment Variables

Refer to the deployment checklist for complete environment setup:
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Production Ready Report](PRODUCTION_READY_REPORT.md)

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Core Web Vitals**: All green
- **Bundle Size**: Optimized with tree shaking
- **Database Queries**: Optimized with proper indexing

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Vaibhav J P](https://github.com/geeky-vaiiib)
- **Project Type**: Full-Stack Alumni Networking Platform
- **Institution**: SIT (Siddaganga Institute of Technology)

## 🙏 Acknowledgments

- **Supabase** for the excellent backend-as-a-service platform
- **Next.js** team for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for accessible component primitives
- **Vercel** for seamless deployment platform

## 📞 Support

- **Documentation**: [Wiki](https://github.com/geeky-vaiiib/AlumniVerse/wiki)
- **Issues**: [GitHub Issues](https://github.com/geeky-vaiiib/AlumniVerse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/geeky-vaiiib/AlumniVerse/discussions)
- **Email**: [Contact Support](mailto:support@alumniverse.com)

## 🗺️ Roadmap

- [ ] **Mobile App** - React Native implementation
- [ ] **Advanced Analytics** - User engagement metrics
- [ ] **AI Recommendations** - Smart connection suggestions
- [ ] **Video Conferencing** - Integrated meeting platform
- [ ] **Mentorship Program** - Structured mentoring system
- [ ] **Alumni Marketplace** - Buy/sell platform for alumni
- [ ] **Multi-language Support** - Internationalization
- [ ] **Advanced Search** - Elasticsearch integration

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[🌐 Live Demo](https://alumniverse.vercel.app) • [📚 Documentation](https://github.com/geeky-vaiiib/AlumniVerse/wiki) • [🐛 Report Bug](https://github.com/geeky-vaiiib/AlumniVerse/issues)

Made with ❤️ for the alumni community

</div>
