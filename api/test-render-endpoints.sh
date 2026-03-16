#!/bin/bash

# Test script for CB5 API endpoints on Render
# Usage: ./test-render-endpoints.sh [BASE_URL]
# Example: ./test-render-endpoints.sh https://cb5-api.onrender.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL - default to staging, or use first argument
BASE_URL="${1:-https://cb5-api.onrender.com}"

# Remove trailing slash if present
BASE_URL="${BASE_URL%/}"

# Counters
PASSED=0
FAILED=0
TOTAL=0

# Test result tracking
declare -a FAILED_TESTS=()

# Function to print test header
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Testing: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to run a test
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    local query_params=$6
    
    TOTAL=$((TOTAL + 1))
    
    local url="${BASE_URL}${endpoint}"
    if [ -n "$query_params" ]; then
        url="${url}?${query_params}"
    fi
    
    echo -e "\n${YELLOW}→ ${method} ${endpoint}${NC}"
    if [ -n "$query_params" ]; then
        echo -e "  Query: ${query_params}"
    fi
    if [ -n "$data" ]; then
        echo -e "  Body: ${data}"
    fi
    
    local response
    local status_code
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" -H "Content-Type: application/json" 2>&1)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PATCH "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$url" \
            -H "Content-Type: application/json" 2>&1)
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract body (all but last line)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: ${status_code}"
        PASSED=$((PASSED + 1))
        # Show response preview (first 200 chars)
        if [ -n "$body" ]; then
            echo -e "  Response: $(echo "$body" | head -c 200)..."
        fi
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} - Expected: ${expected_status}, Got: ${status_code}"
        FAILED=$((FAILED + 1))
        FAILED_TESTS+=("${method} ${endpoint} - Expected ${expected_status}, got ${status_code}")
        if [ -n "$body" ]; then
            echo -e "  Response: $body"
        fi
        return 1
    fi
}

# Function to extract ID from JSON response
extract_id() {
    echo "$1" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2
}

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          CB5 API Endpoint Test Suite                          ║"
echo "║          Testing: ${BASE_URL}"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Store created IDs for cleanup tests
BUSINESS_ID=""
COMPLAINT_ID=""
EVENT_ID=""

# ============================================================================
# GENERAL ENDPOINTS
# ============================================================================
print_header "General Endpoints"

test_endpoint "GET" "/" "200" "Root endpoint"
test_endpoint "GET" "/health" "200" "Health check"
# Swagger docs - just check it's accessible (should return HTML)
curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api-docs" | grep -q "200" && \
    echo -e "\n${GREEN}✓ PASS${NC} - GET /api-docs (Swagger UI)" && PASSED=$((PASSED + 1)) || \
    (echo -e "\n${RED}✗ FAIL${NC} - GET /api-docs" && FAILED=$((FAILED + 1)) && TOTAL=$((TOTAL + 1)))

# ============================================================================
# BUSINESSES ENDPOINTS
# ============================================================================
print_header "Businesses Endpoints"

# GET all businesses
test_endpoint "GET" "/api/businesses" "200" "Get all businesses"

# GET businesses with category filter
test_endpoint "GET" "/api/businesses" "200" "Get businesses by category" "" "category=restaurant"

# GET businesses search
test_endpoint "GET" "/api/businesses/search" "200" "Search businesses" "" "q=test"

# POST create business
BUSINESS_DATA='{
  "name": "Test Restaurant",
  "category": "restaurant",
  "description": "A test restaurant for API testing",
  "address": "123 Test St, Test City",
  "phone": "555-0100",
  "email": "test@example.com",
  "rating": 4.5,
  "reviews": 10,
  "hours": "Mon-Fri: 9am-5pm"
}'
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/businesses" \
    -H "Content-Type: application/json" \
    -d "$BUSINESS_DATA")
BUSINESS_ID=$(extract_id "$RESPONSE")
if [ -n "$BUSINESS_ID" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - POST /api/businesses - Created business ID: $BUSINESS_ID"
    PASSED=$((PASSED + 1))
else
    echo -e "\n${RED}✗ FAIL${NC} - POST /api/businesses - Failed to create business"
    FAILED=$((FAILED + 1))
fi
TOTAL=$((TOTAL + 1))

# GET business by ID
if [ -n "$BUSINESS_ID" ]; then
    test_endpoint "GET" "/api/businesses/${BUSINESS_ID}" "200" "Get business by ID"
fi

# PUT update business
if [ -n "$BUSINESS_ID" ]; then
    UPDATE_DATA='{
      "name": "Updated Test Restaurant",
      "category": "restaurant",
      "description": "Updated description",
      "address": "456 Updated St",
      "phone": "555-0200",
      "email": "updated@example.com",
      "rating": 4.8,
      "reviews": 15
    }'
    test_endpoint "PUT" "/api/businesses/${BUSINESS_ID}" "200" "Update business" "$UPDATE_DATA"
fi

# DELETE business (will be tested, but we'll create another one first for other tests)
# We'll delete at the end

# ============================================================================
# COMPLAINTS ENDPOINTS
# ============================================================================
print_header "Complaints Endpoints"

# GET all complaints
test_endpoint "GET" "/api/complaints" "200" "Get all complaints"

# GET complaints with status filter
test_endpoint "GET" "/api/complaints" "200" "Get complaints by status" "" "status=pending"

# POST create complaint
COMPLAINT_DATA='{
  "title": "Test Complaint",
  "description": "This is a test complaint for API testing",
  "category": "infrastructure",
  "location": "123 Test Street",
  "submittedBy": "Test User",
  "status": "pending",
  "priority": "medium"
}'
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/complaints" \
    -H "Content-Type: application/json" \
    -d "$COMPLAINT_DATA")
COMPLAINT_ID=$(extract_id "$RESPONSE")
if [ -n "$COMPLAINT_ID" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - POST /api/complaints - Created complaint ID: $COMPLAINT_ID"
    PASSED=$((PASSED + 1))
else
    echo -e "\n${RED}✗ FAIL${NC} - POST /api/complaints - Failed to create complaint"
    FAILED=$((FAILED + 1))
fi
TOTAL=$((TOTAL + 1))

# GET complaint by ID
if [ -n "$COMPLAINT_ID" ]; then
    test_endpoint "GET" "/api/complaints/${COMPLAINT_ID}" "200" "Get complaint by ID"
fi

# PATCH update complaint status
if [ -n "$COMPLAINT_ID" ]; then
    STATUS_DATA='{"status": "in-progress"}'
    test_endpoint "PATCH" "/api/complaints/${COMPLAINT_ID}/status" "200" "Update complaint status" "$STATUS_DATA"
fi

# POST add response to complaint
if [ -n "$COMPLAINT_ID" ]; then
    RESPONSE_DATA='{"response": "We are looking into this issue."}'
    test_endpoint "POST" "/api/complaints/${COMPLAINT_ID}/response" "200" "Add response to complaint" "$RESPONSE_DATA"
fi

# ============================================================================
# EVENTS ENDPOINTS
# ============================================================================
print_header "Events Endpoints"

# GET all events
test_endpoint "GET" "/api/events" "200" "Get all events"

# GET events with category filter
test_endpoint "GET" "/api/events" "200" "Get events by category" "" "category=community"

# GET upcoming events
test_endpoint "GET" "/api/events/upcoming" "200" "Get upcoming events"

# POST create event
# Calculate a future date (30 days from now)
FUTURE_DATE=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d 2>/dev/null || echo "2026-02-27")
EVENT_DATA="{
  \"title\": \"Test Community Event\",
  \"category\": \"community\",
  \"description\": \"A test event for API testing\",
  \"date\": \"${FUTURE_DATE}\",
  \"time\": \"18:00\",
  \"location\": \"Test Community Center\",
  \"organizer\": \"Test Organizer\",
  \"maxAttendees\": 50,
  \"attendees\": 0
}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/events" \
    -H "Content-Type: application/json" \
    -d "$EVENT_DATA")
EVENT_ID=$(extract_id "$RESPONSE")
if [ -n "$EVENT_ID" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - POST /api/events - Created event ID: $EVENT_ID"
    PASSED=$((PASSED + 1))
else
    echo -e "\n${RED}✗ FAIL${NC} - POST /api/events - Failed to create event"
    FAILED=$((FAILED + 1))
fi
TOTAL=$((TOTAL + 1))

# GET event by ID
if [ -n "$EVENT_ID" ]; then
    test_endpoint "GET" "/api/events/${EVENT_ID}" "200" "Get event by ID"
fi

# POST register attendance
if [ -n "$EVENT_ID" ]; then
    ATTEND_DATA='{"userId": "test-user-123"}'
    test_endpoint "POST" "/api/events/${EVENT_ID}/attend" "200" "Register attendance" "$ATTEND_DATA"
fi

# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================
print_header "Error Handling Tests"

# GET non-existent business
test_endpoint "GET" "/api/businesses/99999" "404" "Get non-existent business"

# GET non-existent complaint
test_endpoint "GET" "/api/complaints/99999" "404" "Get non-existent complaint"

# GET non-existent event
test_endpoint "GET" "/api/events/99999" "404" "Get non-existent event"

# POST invalid business (missing required fields)
test_endpoint "POST" "/api/businesses" "400" "Create business with missing fields" '{"name": "Test"}'

# POST invalid complaint (missing required fields)
test_endpoint "POST" "/api/complaints" "400" "Create complaint with missing fields" '{"title": "Test"}'

# POST invalid event (missing required fields)
test_endpoint "POST" "/api/events" "400" "Create event with missing fields" '{"title": "Test"}'

# ============================================================================
# CLEANUP - Delete created resources
# ============================================================================
print_header "Cleanup - Deleting Test Resources"

if [ -n "$BUSINESS_ID" ]; then
    test_endpoint "DELETE" "/api/businesses/${BUSINESS_ID}" "200" "Delete test business"
fi

# Note: Complaints and Events don't have DELETE endpoints, so we'll leave them

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                            TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"

if [ ${FAILED} -gt 0 ]; then
    echo -e "\n${RED}Failed Tests:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗${NC} $test"
    done
fi

# Calculate success rate
if [ ${TOTAL} -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", (${PASSED}/${TOTAL})*100}")
    echo -e "\nSuccess Rate: ${SUCCESS_RATE}%"
    
    if [ ${FAILED} -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}\n"
        exit 0
    else
        echo -e "\n${YELLOW}⚠️  Some tests failed.${NC}\n"
        exit 1
    fi
else
    echo -e "\n${RED}No tests were run!${NC}\n"
    exit 1
fi
