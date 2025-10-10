#!/bin/bash

# Build script for all services
# Usage: ./scripts/build-all.sh [docker-username]

set -e

DOCKER_USERNAME=${1:-"your-dockerhub-username"}

echo "🚀 Building Kube Credential Services..."
echo "Docker Username: $DOCKER_USERNAME"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build Issuance Service
echo -e "${BLUE}📦 Building Issuance Service...${NC}"
cd backend/issuance-service
docker build -t ${DOCKER_USERNAME}/kube-credential-issuance:latest .
echo -e "${GREEN}✅ Issuance Service built successfully${NC}"
echo ""

# Build Verification Service
echo -e "${BLUE}📦 Building Verification Service...${NC}"
cd ../verification-service
docker build -t ${DOCKER_USERNAME}/kube-credential-verification:latest .
echo -e "${GREEN}✅ Verification Service built successfully${NC}"
echo ""

# Build Frontend
echo -e "${BLUE}📦 Building Frontend...${NC}"
cd ../../frontend
docker build -t ${DOCKER_USERNAME}/kube-credential-frontend:latest .
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

echo -e "${GREEN}🎉 All services built successfully!${NC}"
echo ""
echo "To push to Docker Hub, run:"
echo "  docker push ${DOCKER_USERNAME}/kube-credential-issuance:latest"
echo "  docker push ${DOCKER_USERNAME}/kube-credential-verification:latest"
echo "  docker push ${DOCKER_USERNAME}/kube-credential-frontend:latest"