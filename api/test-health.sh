#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Testing CB5 Backend Health..."
echo ""

# Test if server is reachable
echo "Testing server connectivity..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Server is reachable${NC}"
else
    echo -e "${RED}✗ Server is not reachable${NC}"
    echo "Make sure the server is running: docker compose up"
    exit 1
fi

echo ""

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo ""
    echo "Response:"
    echo $HEALTH_RESPONSE | python3 -m json.tool 2>/dev/null || echo $HEALTH_RESPONSE
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo ""
    echo "Response:"
    echo $HEALTH_RESPONSE | python3 -m json.tool 2>/dev/null || echo $HEALTH_RESPONSE
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Available endpoints:"
echo "  - API Root:      http://localhost:3000/"
echo "  - Health Check:  http://localhost:3000/health"
echo "  - Swagger Docs:  http://localhost:3000/api-docs"
