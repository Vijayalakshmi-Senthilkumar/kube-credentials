#!/bin/bash

# Test runner script for all services
# Usage: ./scripts/run-tests.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Running tests for all services..."
echo ""

# Track overall success
OVERALL_SUCCESS=true

# Test Issuance Service
echo -e "${BLUE}Testing Issuance Service...${NC}"
cd backend/issuance-service
if npm test; then
  echo -e "${GREEN}✅ Issuance Service tests passed${NC}"
else
  echo -e "${RED}❌ Issuance Service tests failed${NC}"
  OVERALL_SUCCESS=false
fi
echo ""

# Test Verification Service
echo -e "${BLUE}Testing Verification Service...${NC}"
cd ../verification-service
if npm test; then
  echo -e "${GREEN}✅ Verification Service tests passed${NC}"
else
  echo -e "${RED}❌ Verification Service tests failed${NC}"
  OVERALL_SUCCESS=false
fi
echo ""

# Test Frontend
echo -e "${BLUE}Testing Frontend...${NC}"
cd ../../frontend
if CI=true npm test; then
  echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
  echo -e "${RED}❌ Frontend tests failed${NC}"
  OVERALL_SUCCESS=false
fi
echo ""

# Summary
if [ "$OVERALL_SUCCESS" = true ]; then
  echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
  exit 1
fi