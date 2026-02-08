#!/bin/bash
# Cleanup Script for Minikube Deployment
# This script removes all deployed resources from Minikube

set -e

echo "=========================================="
echo "  Phase-4 Minikube Deployment Cleanup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirm before proceeding
echo -e "${YELLOW}This will remove all deployed resources:${NC}"
echo "  - Helm releases (frontend, backend)"
echo "  - Kubernetes secrets"
echo "  - Stop minikube tunnel (if running)"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo "Proceeding with cleanup..."
echo ""

# 1. Stop tunnel if running
echo "1. Stopping Minikube Tunnel (if running)..."
TUNNEL_PID=$(pgrep -f "minikube tunnel" || echo "")
if [ -n "$TUNNEL_PID" ]; then
    kill $TUNNEL_PID 2>/dev/null || true
    echo -e "   Tunnel stopped (PID: $TUNNEL_PID)"
else
    echo "   No tunnel running"
fi
echo ""

# 2. Uninstall Helm releases
echo "2. Uninstalling Helm Releases..."
helm uninstall frontend 2>/dev/null && echo -e "   ${GREEN}✓${NC} Frontend uninstalled" || echo "   Frontend not deployed"
helm uninstall backend 2>/dev/null && echo -e "   ${GREEN}✓${NC} Backend uninstalled" || echo "   Backend not deployed"
echo ""

# 3. Delete Kubernetes secrets
echo "3. Deleting Kubernetes Secrets..."
kubectl delete secret phase4-secrets 2>/dev/null && echo -e "   ${GREEN}✓${NC} Secret 'phase4-secrets' deleted" || echo "   Secret not found"
echo ""

# 4. Verify cleanup
echo "4. Verifying Cleanup..."
REMAINING_PODS=$(kubectl get pods -l app.kubernetes.io/name=frontend,app.kubernetes.io/name=backend --no-headers 2>/dev/null | wc -l)
if [ "$REMAINING_PODS" -eq 0 ]; then
    echo -e "   ${GREEN}✓${NC} All pods removed"
else
    echo -e "   ${YELLOW}⚠${NC} $REMAINING_PODS pod(s) still running"
    kubectl get pods -l app.kubernetes.io/name=frontend,app.kubernetes.io/name=backend
fi
echo ""

# 5. Optional: Stop Minikube
echo "5. Minikube Status"
read -p "Do you want to stop Minikube cluster? (yes/no): " -r
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    minikube stop
    echo -e "   ${GREEN}✓${NC} Minikube stopped"
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  Cleanup Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "To resume later, run:"
    echo "  minikube start"
    echo "  eval \$(minikube docker-env)"
    echo "  minikube tunnel"
else
    echo "   Minikube left running"
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  Helm Releases Cleaned!"
    echo "==========================================${NC}"
    echo ""
    echo "Minikube cluster is still running."
    echo "To redeploy, follow the Quick Start guide."
fi
echo ""
