#!/bin/bash
# Deployment Verification Script for Minikube
# This script verifies that the Phase-4 application is properly deployed

set -e

echo "=========================================="
echo "  Phase-4 Minikube Deployment Verification"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for results
PASSED=0
FAILED=0

# Function to check and report
check() {
    local name="$1"
    local command="$2"

    echo -n "Checking $name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# 1. Check Minikube status
echo "1. Minikube Status"
check "Minikube running" "minikube status"
echo ""

# 2. Check Docker daemon configured
echo "2. Docker Configuration"
eval $(minikube docker-env) > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "Docker daemon configured... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "Docker daemon configured... ${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# 3. Check Kubernetes resources
echo "3. Kubernetes Resources"

# Check pods
POD_STATUS=$(kubectl get pods -o jsonpath='{.items[*].status.phase}' 2>/dev/null)
if echo "$POD_STATUS" | grep -q "Running" && ! echo "$POD_STATUS" | grep -q "Error"; then
    echo -e "Pods running... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    kubectl get pods
else
    echo -e "Pods running... ${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# Check services
SERVICE_COUNT=$(kubectl get svc -o jsonpath='{.items}' 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
if [ "$SERVICE_COUNT" -ge 2 ]; then
    echo -e "Services deployed... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    kubectl get services
else
    echo -e "Services deployed... ${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# 4. Check Helm releases
echo "4. Helm Releases"
HELM_COUNT=$(helm list -q 2>/dev/null | wc -l)
if [ "$HELM_COUNT" -eq 2 ]; then
    echo -e "Helm releases deployed... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    helm list
else
    echo -e "Helm releases deployed... ${RED}✗ FAIL${NC} (Expected 2, found $HELM_COUNT)"
    ((FAILED++))
fi
echo ""

# 5. Check Kubernetes Secret
echo "5. Kubernetes Secrets"
if kubectl get secret phase4-secrets > /dev/null 2>&1; then
    echo -e "Secret 'phase4-secrets' exists... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "Secret 'phase4-secrets' exists... ${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# 6. Check Tunnel Status
echo "6. Minikube Tunnel Status"
if pgrep -f "minikube tunnel" > /dev/null; then
    echo -e "Tunnel running... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    TUNNEL_PID=$(pgrep -f "minikube tunnel")
    echo "   Tunnel PID: $TUNNEL_PID"
else
    echo -e "Tunnel running... ${YELLOW}⚠ WARNING${NC} (Tunnel not running, services may not be accessible)"
    ((PASSED++)) # Don't fail, just warn
fi
echo ""

# 7. Check External IPs
echo "7. External IP Assignment"
FRONTEND_IP=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$FRONTEND_IP" ]; then
    echo -e "Frontend EXTERNAL-IP assigned... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    echo "   Frontend URL: http://$FRONTEND_IP:3000"
else
    echo -e "Frontend EXTERNAL-IP assigned... ${RED}✗ FAIL${NC} (Tunnel may not be running)"
    ((FAILED++))
fi
echo ""

# 8. Health Check
echo "8. Health Endpoints"
FRONTEND_HEALTH=$(curl -s http://127.0.0.1:3000/api/health 2>/dev/null || echo "")
if echo "$FRONTEND_HEALTH" | grep -q "ok"; then
    echo -e "Frontend health... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    echo "   Response: $FRONTEND_HEALTH"
else
    echo -e "Frontend health... ${RED}✗ FAIL${NC} (Cannot reach http://127.0.0.1:3000/api/health)"
    ((FAILED++))
fi
echo ""

# 9. Check for hardcoded secrets
echo "9. Security Checks"
if ! grep -r "sk-" phase-4/helm-charts/ > /dev/null 2>&1; then
    echo -e "No hardcoded secrets... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "No hardcoded secrets... ${RED}✗ FAIL${NC} (Found API keys in helm charts!)"
    ((FAILED++))
fi
echo ""

# 10. Image verification
echo "10. Docker Images"
if DOCKER_HOST="tcp://127.0.0.1:52573" DOCKER_TLS_VERIFY="1" DOCKER_CERT_PATH="/home/adev/.minikube/certs" docker images | grep -q "phase4-frontend"; then
    echo -e "Frontend image exists... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "Frontend image exists... ${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

if DOCKER_HOST="tcp://127.0.0.1:52573" DOCKER_TLS_VERIFY="1" DOCKER_CERT_PATH="/home/adev/.minikube/certs" docker images | grep -q "phase4-backend"; then
    echo -e "Backend image exists... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "Backend image exists... ${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# Summary
echo "=========================================="
echo "  Verification Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Deployment is healthy.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
    exit 1
fi
