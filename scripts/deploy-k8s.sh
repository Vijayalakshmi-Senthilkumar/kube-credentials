#!/bin/bash

# Kubernetes deployment script
# Usage: ./scripts/deploy-k8s.sh [namespace]

set -e

NAMESPACE=${1:-"default"}

echo "☸️  Deploying Kube Credential to Kubernetes..."
echo "Namespace: $NAMESPACE"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create namespace if it doesn't exist
echo -e "${BLUE}📁 Creating namespace...${NC}"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap
echo -e "${BLUE}⚙️  Applying ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml -n $NAMESPACE

# Deploy Issuance Service
echo -e "${BLUE}🚀 Deploying Issuance Service...${NC}"
kubectl apply -f k8s/issuance-deployment.yaml -n $NAMESPACE
echo -e "${GREEN}✅ Issuance Service deployed${NC}"

# Deploy Verification Service
echo -e "${BLUE}🚀 Deploying Verification Service...${NC}"
kubectl apply -f k8s/verification-deployment.yaml -n $NAMESPACE
echo -e "${GREEN}✅ Verification Service deployed${NC}"

# Deploy Frontend
echo -e "${BLUE}🚀 Deploying Frontend...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml -n $NAMESPACE
echo -e "${GREEN}✅ Frontend deployed${NC}"

# Apply HPA
echo -e "${BLUE}📊 Applying Horizontal Pod Autoscalers...${NC}"
kubectl apply -f k8s/hpa.yaml -n $NAMESPACE
echo -e "${GREEN}✅ HPA configured${NC}"

# Apply Ingress (optional)
if [ -f "k8s/ingress.yaml" ]; then
  echo -e "${BLUE}🌐 Applying Ingress...${NC}"
  kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
  echo -e "${GREEN}✅ Ingress configured${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Checking deployment status...${NC}"
echo ""

# Wait for deployments to be ready
kubectl wait --for=condition=available --timeout=300s \
  deployment/issuance-service \
  deployment/verification-service \
  deployment/frontend \
  -n $NAMESPACE

echo ""
echo -e "${GREEN}✅ All deployments are ready!${NC}"
echo ""

# Show pod status
echo -e "${BLUE}Pod Status:${NC}"
kubectl get pods -n $NAMESPACE

echo ""
echo -e "${BLUE}Service Status:${NC}"
kubectl get services -n $NAMESPACE

echo ""
echo -e "${YELLOW}To access the application:${NC}"
echo "  kubectl port-forward service/frontend 8080:80 -n $NAMESPACE"
echo "  Then visit: http://localhost:8080"