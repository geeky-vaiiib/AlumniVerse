# Database Setup Guide

This guide will help you set up PostgreSQL for AlumniVerse backend.

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed on your system

### Setup Steps

1. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d postgres
   ```

2. **Verify database is running**
   ```bash
   docker-compose ps
   ```

3. **The database will be automatically initialized with:**
   - Database name: `alumniverse`
   - Username: `postgres`
   - Password: `password`
   - Port: `5432`

4. **Test the backend connection**
   ```bash
   npm start
   ```

### Useful Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs postgres

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d alumniverse

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d postgres
```

## Option 2: Local PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb alumniverse

# Run setup script
npm run db:setup
```

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE alumniverse;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE alumniverse TO postgres;
\q

# Run setup script
npm run db:setup
```

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the postgres user
4. Update `.env` file with your password
5. Run `npm run db:setup`

## Environment Configuration

Update your `.env` file with the correct database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alumniverse
DB_USER=postgres
DB_PASS=password
```

## Database Scripts

```bash
# Setup database (create tables and seed data)
npm run db:setup

# Run migrations only
npm run db:migrate

# Seed data only
npm run db:seed

# Reset database (drop and recreate)
npm run db:reset
```

## Troubleshooting

### Connection Issues
1. Ensure PostgreSQL is running
2. Check if port 5432 is available
3. Verify credentials in `.env` file
4. Check firewall settings

### Docker Issues
```bash
# Check if Docker is running
docker --version

# Check container status
docker-compose ps

# View container logs
docker-compose logs postgres

# Restart containers
docker-compose restart
```

### Permission Issues
```bash
# Fix PostgreSQL permissions (Linux/macOS)
sudo chown -R postgres:postgres /var/lib/postgresql/
```

## Database Schema

The database includes the following tables:
- `users` - User profiles and authentication
- `jobs` - Job and internship postings
- `events` - Alumni events and reunions
- `event_attendees` - Event registration tracking
- `badges` - User recognition and achievements
- `otp_verifications` - Email verification OTPs
- `password_reset_tokens` - Password reset tokens
- `refresh_tokens` - JWT refresh token management

## Production Considerations

For production deployment:

1. **Use managed database services:**
   - AWS RDS PostgreSQL
   - Google Cloud SQL
   - Azure Database for PostgreSQL
   - Heroku Postgres

2. **Security:**
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access
   - Regular backups

3. **Performance:**
   - Configure connection pooling
   - Add database indexes
   - Monitor query performance
   - Set up read replicas if needed

4. **Environment Variables:**
   ```env
   DB_HOST=your-production-host
   DB_PORT=5432
   DB_NAME=alumniverse_prod
   DB_USER=your-prod-user
   DB_PASS=your-secure-password
   NODE_ENV=production
   ```
