#!/bin/bash

# Test script to reproduce the infinite redirect loop issue
# This simulates the authentication flow and checks for redirect loops

echo "🧪 Testing Authentication Redirect Loop Issue"
echo "============================================="
echo ""

# Check if server is running
echo "📍 Step 1: Checking if development server is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server not running on http://localhost:3000"
    echo "   Please run: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test 1: Access protected route without auth (should redirect to auth)
echo "📍 Step 2: Testing protected route access without authentication..."
response=$(curl -s -I http://localhost:3000/dashboard)
if echo "$response" | grep -q "Location.*auth"; then
    echo "✅ Protected route correctly redirects to auth page"
else
    echo "❌ Expected redirect to auth page not found"
    echo "Response headers:"
    echo "$response"
fi
echo ""

# Test 2: Access auth page with redirectTo parameter
echo "📍 Step 3: Testing auth page with redirectTo parameter..."
auth_response=$(curl -s -I "http://localhost:3000/auth?redirectTo=%2Fdashboard")
if echo "$auth_response" | grep -q "200 OK"; then
    echo "✅ Auth page loads successfully"
else
    echo "❌ Auth page failed to load"
    echo "Response:"
    echo "$auth_response"
fi
echo ""

# Test 3: Test with dummy auth cookie (simulate post-OTP state)
echo "📍 Step 4: Testing with dummy auth cookie (simulating authenticated state)..."

# Create a temporary file to store cookies
cookie_jar=$(mktemp)

# Set dummy auth cookie
echo "localhost	FALSE	/	FALSE	0	dummy-auth-verified	true" > "$cookie_jar"

# Test dashboard access with cookie
echo "   Testing dashboard access with auth cookie..."
dashboard_response=$(curl -s -I -b "$cookie_jar" http://localhost:3000/dashboard)

if echo "$dashboard_response" | grep -q "200 OK"; then
    echo "✅ Dashboard accessible with auth cookie"
elif echo "$dashboard_response" | grep -q "Location"; then
    redirect_location=$(echo "$dashboard_response" | grep "Location:" | cut -d' ' -f2 | tr -d '\r\n')
    echo "⚠️  Dashboard redirects to: $redirect_location"
    
    # Follow the redirect to check for loops
    echo "   Following redirect..."
    redirect_response=$(curl -s -I -b "$cookie_jar" "http://localhost:3000$redirect_location")
    
    if echo "$redirect_response" | grep -q "Location"; then
        second_redirect=$(echo "$redirect_response" | grep "Location:" | cut -d' ' -f2 | tr -d '\r\n')
        echo "⚠️  Second redirect to: $second_redirect"
        
        # Check if we're in a redirect loop
        if [[ "$redirect_location" == "$second_redirect" ]]; then
            echo "❌ REDIRECT LOOP DETECTED!"
            echo "   First redirect: $redirect_location"
            echo "   Second redirect: $second_redirect"
        else
            echo "   No immediate loop detected"
        fi
    else
        echo "✅ Redirect chain ended successfully"
    fi
else
    echo "❌ Unexpected response from dashboard"
    echo "$dashboard_response"
fi
echo ""

# Test 4: Test auth page with cookie (should redirect to dashboard)
echo "📍 Step 5: Testing auth page behavior with authentication cookie..."
auth_with_cookie_response=$(curl -s -I -b "$cookie_jar" "http://localhost:3000/auth?redirectTo=%2Fdashboard")

if echo "$auth_with_cookie_response" | grep -q "Location.*dashboard"; then
    echo "✅ Auth page correctly redirects authenticated user to dashboard"
elif echo "$auth_with_cookie_response" | grep -q "200 OK"; then
    echo "⚠️  Auth page returns 200 OK for authenticated user (might be showing auth form)"
    echo "   This could indicate the client-side logic hasn't processed the auth state yet"
else
    echo "❌ Unexpected auth page response"
    echo "$auth_with_cookie_response"
fi
echo ""

# Test 5: Multiple rapid requests to detect loops
echo "📍 Step 6: Testing for rapid redirect loops..."
echo "   Making 5 rapid requests to auth page with redirectTo..."

for i in {1..5}; do
    echo "   Request $i:"
    rapid_response=$(curl -s -I -b "$cookie_jar" "http://localhost:3000/auth?redirectTo=%2Fdashboard" 2>/dev/null)
    
    if echo "$rapid_response" | grep -q "Location"; then
        location=$(echo "$rapid_response" | grep "Location:" | cut -d' ' -f2 | tr -d '\r\n')
        echo "     → Redirects to: $location"
    elif echo "$rapid_response" | grep -q "200 OK"; then
        echo "     → Returns 200 OK (auth page)"
    else
        echo "     → Unexpected response"
    fi
    
    sleep 0.5
done

# Cleanup
rm -f "$cookie_jar"

echo ""
echo "📊 Test Complete!"
echo ""
echo "🔍 HOW TO MANUALLY TEST:"
echo "1. Open browser to http://localhost:3000/auth?redirectTo=%2Fdashboard"
echo "2. Open dev tools and run: document.cookie = 'dummy-auth-verified=true; path=/'"
echo "3. Refresh the page and watch the network tab for redirects"
echo "4. Check console for [MIDDLEWARE] and [AUTH_FLOW] logs"
echo ""
echo "🚨 SIGNS OF REDIRECT LOOP:"
echo "- Multiple rapid redirects between /auth and /dashboard"
echo "- Console logs showing repeated middleware requests"
echo "- Browser address bar flickering between URLs"
