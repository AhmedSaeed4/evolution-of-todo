#!/bin/bash

# Chat Integration Status Script
# Checks the status of backend and frontend services

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$PROJECT_DIR/logs"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}💡 $1${NC}"
}

check_process_status() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $service_name is running (PID: $PID)"
            return 0
        else
            echo -e "${RED}✗${NC} $service_name is not running (stale PID file)"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $service_name is not running (no PID file)"
        return 1
    fi
}

check_port_status() {
    local port=$1
    local service_name=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $service_name port ($port) is in use"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name port ($port) is not in use"
        return 1
    fi
}

check_health_endpoint() {
    local url=$1
    local service_name=$2

    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $service_name health endpoint is responding"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name health endpoint is not responding"
        return 1
    fi
}

show_service_info() {
    local service_name=$1
    local pid_file=$2
    local port=$3
    local health_url=$4

    echo ""
    echo "=== $service_name ==="

    # Process status
    check_process_status "$pid_file" "$service_name"

    # Port status
    check_port_status "$port" "$service_name"

    # Health check
    if [ -n "$health_url" ]; then
        check_health_endpoint "$health_url" "$service_name"
    fi

    # Show logs if available
    if [ "$service_name" == "Backend" ] && [ -f "$LOGS_DIR/backend.log" ]; then
        echo ""
        echo "Recent backend logs:"
        tail -5 "$LOGS_DIR/backend.log" | sed 's/^/  /'
    fi

    if [ "$service_name" == "Frontend" ] && [ -f "$LOGS_DIR/frontend.log" ]; then
        echo ""
        echo "Recent frontend logs:"
        tail -5 "$LOGS_DIR/frontend.log" | sed 's/^/  /'
    fi
}

find_running_processes() {
    print_status "Looking for running processes..."

    # Check for backend processes
    BACKEND_PIDS=$(ps aux | grep "uvicorn" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
    if [ -n "$BACKEND_PIDS" ]; then
        echo -e "${GREEN}✅ Found backend process(es): $BACKEND_PIDS${NC}"
    else
        echo -e "${RED}❌ No backend processes found${NC}"
    fi

    # Check for frontend processes
    FRONTEND_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
    if [ -n "$FRONTEND_PIDS" ]; then
        echo -e "${GREEN}✅ Found frontend process(es): $FRONTEND_PIDS${NC}"
    else
        echo -e "${RED}❌ No frontend processes found${NC}"
    fi
}

show_quick_commands() {
    echo
    echo -e "${CYAN}=== Quick Commands ===${NC}"
    echo
    echo "Test Backend:"
    echo "  curl http://localhost:8000/api/agents/status"
    echo
    echo "Test Frontend:"
    echo "  curl -s http://localhost:3000 | head -20"
    echo
    echo "View Backend Logs:"
    echo "  tail -f $LOGS_DIR/backend.log"
    echo
    echo "View Frontend Logs:"
    echo "  tail -f $LOGS_DIR/frontend.log"
    echo
    echo "Restart Services:"
    echo "  ./stop.server.sh && ./start.server.sh"
    echo
    echo "Stop Services:"
    echo "  ./stop.server.sh"
    echo
}

show_port_usage() {
    echo
    echo -e "${CYAN}=== Port Usage ===${NC}"
    echo

    # Check what's using our ports
    for port in 8000 3000; do
        if ss -tlnp 2>/dev/null | grep -q ":$port"; then
            PROCESS_INFO=$(ss -tlnp 2>/dev/null | grep ":$port")
            echo "Port $port:"
            echo "$PROCESS_INFO" | sed 's/^/  /'
        else
            echo "Port $port: ${RED}Not in use${NC}"
        fi
    done
}

main() {
    echo -e "${CYAN}📊 Chat Integration Status Check${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo

    # Check if we're in the right directory
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the phase-3 directory"
        exit 1
    fi

    # Check for session ID
    if [ -f "$LOGS_DIR/session.env" ]; then
        source "$LOGS_DIR/session.env"
        echo -e "${CYAN}Session ID: $SESSION_ID${NC}"
        echo
    fi

    # Service status checks
    show_service_info "Backend" "$LOGS_DIR/backend.pid" 8000 "http://localhost:8000/api/agents/status"
    show_service_info "Frontend" "$LOGS_DIR/frontend.pid" 3000 "http://localhost:3000"

    # Find any running processes (even without PID files)
    find_running_processes

    # Port usage
    show_port_usage

    # Quick commands
    show_quick_commands

    # Overall status
    echo
    echo -e "${CYAN}=== Overall Status ===${NC}"

    BACKEND_HEALTH=$(curl -s --max-time 3 http://localhost:8000/api/agents/status > /dev/null 2>&1 && echo "healthy" || echo "unhealthy")
    FRONTEND_HEALTH=$(curl -s --max-time 3 http://localhost:3000 > /dev/null 2>&1 && echo "healthy" || echo "unhealthy")

    if [ "$BACKEND_HEALTH" == "healthy" ] && [ "$FRONTEND_HEALTH" == "healthy" ]; then
        echo -e "${GREEN}✅ All services are healthy${NC}"
        echo
        echo -e "${CYAN}Chat integration is ready for testing!${NC}"
        echo -e "${CYAN}Visit: http://localhost:3000/chatbot${NC}"
    else
        if [ "$BACKEND_HEALTH" != "healthy" ]; then
            echo -e "${RED}❌ Backend is unhealthy${NC}"
        fi
        if [ "$FRONTEND_HEALTH" != "healthy" ]; then
            echo -e "${RED}❌ Frontend is unhealthy${NC}"
        fi
        echo
        echo -e "${YELLOW}Run ./test-chat.sh to start services${NC}"
    fi

    echo
}

main