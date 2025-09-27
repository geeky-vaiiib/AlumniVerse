#!/bin/bash

# Production Setup Script for AlumniVerse
# Sets up environment variables and verifies production readiness

echo "🚀 Setting up AlumniVerse for Production"
echo "======================================="

# Create backend .env file
echo "📝 Creating backend environment configuration..."
cat > backend/.env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://flcgwqlabywhoulqalaz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNzcwNiwiZXhwIjoyMDc0NDgzNzA2fQ.E_G78W8QdMl7wya1XJ-2RY_aMeWbFM6Vkl89eG5-GL0

# Server Configuration
FRONTEND_URL=http://localhost:3000
PORT=5001
NODE_ENV=development
EOF

# Create frontend .env.local file (if it doesn't exist)
if [ ! -f .env.local ]; then
    echo "📝 Creating frontend environment configuration..."
    cat > .env.local << 'EOF'
# Supabase Configuration (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://flcgwqlabywhoulqalaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2d3cWxhYnl3aG91bHFhbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MDYsImV4cCI6MjA3NDQ4MzcwNn0.uWhtQvDUig4RTdxHZ_cdA3ajFbNUaEQ3oz8WYrV_R1g

# Backend API URL
BACKEND_URL=http://localhost:5001
EOF
else
    echo "✅ Frontend .env.local already exists"
fi

echo "✅ Environment configuration complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Run tests: ./test-complete-flow.sh"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5001"
