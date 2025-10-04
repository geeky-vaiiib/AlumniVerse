#!/bin/bash

# AlumniVerse Fix Validation Script
# Validates that all critical fixes have been applied

set -e

echo "🔍 AlumniVerse Fix Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $1${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $1${NC}" ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "components" ]; then
    print_status "Please run this script from the AlumniVerse root directory" "error"
    exit 1
fi

print_status "Validating AlumniVerse fixes..." "info"
echo

# 1. Check if migration file exists
print_status "Checking migration file..." "info"
if [ -f "backend/database/fix_auth_id_migration.sql" ]; then
    print_status "Migration file exists" "success"
else
    print_status "Migration file missing" "error"
    exit 1
fi

# 2. Check if OTPVerification was updated
print_status "Checking OTPVerification updates..." "info"
if grep -q "auth_id: data.user.id" components/auth/OTPVerification.jsx; then
    print_status "OTPVerification updated with profile creation" "success"
else
    print_status "OTPVerification not updated" "error"
    exit 1
fi

# 3. Check if ProfileCreationFlow has auth_id handling
print_status "Checking ProfileCreationFlow..." "info"
if grep -q "auth_id: user.id" components/profile/ProfileCreationFlow.jsx; then
    print_status "ProfileCreationFlow has auth_id handling" "success"
else
    print_status "ProfileCreationFlow missing auth_id handling" "error"
    exit 1
fi

# 4. Check environment variables
print_status "Checking environment configuration..." "info"
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        print_status "Environment variables configured" "success"
    else
        print_status "Missing required environment variables" "warning"
        echo "  Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi
else
    print_status "No .env.local file found" "warning"
    echo "  Create .env.local with Supabase credentials"
fi

# 5. Check if test script exists
print_status "Checking test suite..." "info"
if [ -f "backend/test-auth-flow.js" ]; then
    print_status "Test suite available" "success"
else
    print_status "Test suite missing" "error"
fi

# 6. Check Node.js and npm
print_status "Checking Node.js environment..." "info"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION" "success"
else
    print_status "Node.js not installed" "error"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    print_status "npm available" "success"
elif command -v pnpm >/dev/null 2>&1; then
    print_status "pnpm available" "success"
elif command -v yarn >/dev/null 2>&1; then
    print_status "yarn available" "success"
else
    print_status "No package manager found" "error"
    exit 1
fi

# 7. Check if dependencies are installed
print_status "Checking dependencies..." "info"
if [ -d "node_modules" ]; then
    print_status "Dependencies installed" "success"
else
    print_status "Dependencies not installed" "warning"
    echo "  Run: npm install or pnpm install"
fi

# 8. Validate package.json scripts
print_status "Checking package.json scripts..." "info"
if grep -q '"dev"' package.json && grep -q '"build"' package.json; then
    print_status "Required scripts available" "success"
else
    print_status "Missing required scripts" "error"
fi

echo
print_status "Fix validation complete!" "info"
echo

# Summary and next steps
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. 🗄️  Apply database migration:"
echo "   → Open Supabase Dashboard → SQL Editor"
echo "   → Run: backend/database/fix_auth_id_migration.sql"
echo
echo "2. 🧪 Run test suite:"
echo "   → cd backend && node test-auth-flow.js"
echo
echo "3. 🚀 Start development server:"
echo "   → npm run dev (or pnpm dev)"
echo
echo "4. ✅ Test the flow:"
echo "   → Go to /signup"
echo "   → Use SIT email format"
echo "   → Verify OTP works"
echo "   → Check dashboard loads"
echo
echo "📖 For detailed instructions, see:"
echo "   → QUICK_START_FIX.md (5-minute guide)"
echo "   → FIXES_IMPLEMENTATION_GUIDE.md (complete guide)"
echo "   → FINAL_DEPLOYMENT_CHECKLIST.md (production deployment)"
echo

# Check if we can run the test suite
if [ -f "backend/test-auth-flow.js" ] && [ -f ".env.local" ]; then
    echo "🤖 Would you like to run the automated test suite now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo
        print_status "Running automated tests..." "info"
        cd backend
        if node test-auth-flow.js; then
            print_status "All tests passed! 🎉" "success"
        else
            print_status "Some tests failed. Check output above." "warning"
        fi
        cd ..
    fi
fi

echo
print_status "Validation script complete!" "success"
