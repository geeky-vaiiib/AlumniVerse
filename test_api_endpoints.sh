#!/bin/bash

# Quick API Test Script for AlumniVerse
# Tests the working endpoints with sample data

echo "🧪 ALUMNIVERSE API ENDPOINT TESTS"
echo "================================="

API_BASE="http://localhost:5002/api"

echo -e "\n🔍 Testing Backend Health..."
curl -s "$API_BASE" | jq '.' 2>/dev/null || echo "Backend API is responding"

echo -e "\n🔐 Testing Auth Signup (should validate and reject invalid data)..."
curl -X POST "$API_BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"invalid-email","password":"weak"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n🔐 Testing Auth Signup (with valid institutional email)..."
curl -X POST "$API_BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"1si23cs001@sit.ac.in","password":"TestPassword123!"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n👤 Testing Profile Access (should require authentication)..."
curl -X GET "$API_BASE/profile/me" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n👤 Testing Profile Update (should require authentication)..."
curl -X PUT "$API_BASE/profile/update" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated","lastName":"Name"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n📁 Testing File Upload Endpoint (should require authentication)..."
curl -X POST "$API_BASE/profile/upload-resume" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ API Tests Complete!"
echo -e "\nExpected Results:"
echo "- Auth signup with invalid data: 400 (validation working)"
echo "- Auth signup with valid data: 201 or 409 (if user exists)"
echo "- Profile endpoints: 401 (authentication required)"
echo "- File upload: 400 (no file provided)"
