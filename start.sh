#!/bin/bash

# AlumniVerse Quick Start Script
# This script helps you start both frontend and backend servers

echo "🚀 AlumniVerse Quick Start"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if ports are already in use
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use (Frontend)${NC}"
    read -p "Kill the process and restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed process on port 3000${NC}"
    fi
fi

if check_port 5001; then
    echo -e "${YELLOW}⚠️  Port 5001 is already in use (Backend)${NC}"
    read -p "Kill the process and restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:5001 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Killed process on port 5001${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📦 Checking dependencies...${NC}"

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend Server (Port 5001)...${NC}"
    cd backend
    node server.js 2>&1 | sed 's/^/[BACKEND] /' &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend Server (Port 3000)...${NC}"
    npm run dev 2>&1 | sed 's/^/[FRONTEND] /' &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    # Kill any remaining processes on our ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    echo -e "${BLUE}👋 Goodbye!${NC}"
    exit 0
}

# Trap Ctrl+C and other signals
trap cleanup SIGINT SIGTERM

# Start servers
echo ""
echo -e "${BLUE}🚀 Starting servers...${NC}"
echo ""

start_backend
sleep 3  # Give backend time to start

start_frontend
sleep 3  # Give frontend time to start

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ AlumniVerse is now running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📍 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}📍 Backend:${NC}  http://localhost:5001"
echo ""
echo -e "${YELLOW}📖 Quick Start Guide:${NC}"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Click 'Sign Up' to create a new account"
echo "   3. Enter your SIT email (e.g., 1si23is999@sit.ac.in)"
echo "   4. Check your email for the OTP code"
echo "   5. Verify and complete your profile"
echo "   6. Start using AlumniVerse!"
echo ""
echo -e "${YELLOW}🧪 Test Existing Users:${NC}"
echo "   • 1si23is117@sit.ac.in"
echo "   • 1si23is114@sit.ac.in"
echo ""
echo -e "${YELLOW}📋 Diagnostic Tool:${NC}"
echo "   Run: node diagnose-auth-issue.js"
echo ""
echo -e "${RED}⚠️  Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running and show logs
wait
