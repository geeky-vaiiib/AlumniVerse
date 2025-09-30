#!/bin/bash

# API Endpoint Validation Script for AlumniVerse
# This script validates that all frontend API calls point to correct backend endpoints

echo "🔍 ALUMNIVERSE API ENDPOINT VALIDATION"
echo "======================================"

# Set API base URL
API_BASE="http://localhost:5002/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -e "\n${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}$method${NC} $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer test-token")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all but last line)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $status_code"
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        echo -e "${RED}Response:${NC} $body"
    fi
}

# Function to check if backend is running
check_backend() {
    echo -e "\n${BLUE}Checking if backend is running...${NC}"
    
    response=$(curl -s -w "%{http_code}" http://localhost:5002/api 2>/dev/null || echo "000")
    status_code=$(echo "$response" | tail -c 4)

    if [ "$status_code" = "200" ] || [ "$status_code" = "404" ]; then
        echo -e "${GREEN}✅ Backend is running on port 5002${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is not running on port 5002${NC}"
        echo -e "${YELLOW}Please start the backend with: cd backend && PORT=5002 npm run dev${NC}"
        return 1
    fi
}

# Function to analyze frontend API calls
analyze_frontend_calls() {
    echo -e "\n${BLUE}Analyzing frontend API calls...${NC}"
    
    # Search for API calls in frontend code
    echo -e "\n${YELLOW}Found API calls in frontend:${NC}"
    
    # Search for fetch calls
    grep -r "fetch.*api" components/ app/ lib/ 2>/dev/null | head -10 | while read line; do
        echo "  $line"
    done
    
    # Search for axios calls
    grep -r "axios.*api" components/ app/ lib/ 2>/dev/null | head -10 | while read line; do
        echo "  $line"
    done
    
    # Search for API_BASE or similar
    grep -r "API_BASE\|API_URL\|NEXT_PUBLIC_API" . 2>/dev/null | head -5 | while read line; do
        echo "  $line"
    done
}

# Function to validate environment variables
check_env_vars() {
    echo -e "\n${BLUE}Checking environment variables...${NC}"
    
    # Check for .env files
    if [ -f ".env.local" ]; then
        echo -e "${GREEN}✅ Found .env.local${NC}"
        grep -E "API|SUPABASE|JWT" .env.local | head -5
    else
        echo -e "${YELLOW}⚠️  No .env.local found${NC}"
    fi
    
    if [ -f "backend/.env" ]; then
        echo -e "${GREEN}✅ Found backend/.env${NC}"
        grep -E "PORT|SUPABASE|JWT" backend/.env | head -5
    else
        echo -e "${YELLOW}⚠️  No backend/.env found${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting API validation...${NC}"
    
    # Check environment variables
    check_env_vars
    
    # Analyze frontend API calls
    analyze_frontend_calls
    
    # Check if backend is running
    if ! check_backend; then
        echo -e "\n${RED}Cannot proceed with API tests - backend not running${NC}"
        exit 1
    fi
    
    echo -e "\n${BLUE}Testing API endpoints...${NC}"
    
    # Test auth endpoints
    test_endpoint "POST" "/auth/signup" '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"TestPass123!"}' "400" "User signup with test data"
    
    test_endpoint "POST" "/auth/login" '{"email":"test@example.com","password":"TestPass123!"}' "400" "User login attempt"
    
    test_endpoint "POST" "/auth/otp" '{"email":"test@example.com","otp":"123456"}' "400" "OTP verification"
    
    # Test profile endpoints (these will fail without auth, but we can check if routes exist)
    test_endpoint "GET" "/profile/me" "" "401" "Get user profile (should require auth)"
    
    test_endpoint "PUT" "/profile/update" '{"firstName":"Updated"}' "401" "Update profile (should require auth)"
    
    # Test other endpoints
    test_endpoint "GET" "/directory" "" "200" "Get alumni directory"
    
    test_endpoint "GET" "/jobs" "" "200" "Get job listings"
    
    test_endpoint "GET" "/events" "" "200" "Get events"
    
    test_endpoint "GET" "/badges" "" "200" "Get badges"
    
    echo -e "\n${BLUE}API Validation Complete!${NC}"
    echo -e "\n${YELLOW}Summary:${NC}"
    echo "- Check the results above for any failing endpoints"
    echo "- 401/403 errors for protected routes are expected without authentication"
    echo "- 404 errors indicate missing routes that need to be implemented"
    echo "- 400 errors for invalid data are expected and show validation is working"
}

# Run the main function
main
