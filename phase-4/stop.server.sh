#!/bin/bash

# Chat Integration Stop Script
# Gracefully stops backend and frontend services

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

stop_service_by_pid_file() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            print_status "Stopping $service_name (PID: $PID)"
            kill $PID 2>/dev/null

            # Wait for process to terminate
            for i in {1..10}; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    print_success "$service_name stopped successfully"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 0.5
            done

            # Force kill if still running
            if ps -p $PID > /dev/null 2>&1; then
                print_warning "$service_name not responding, forcing termination"
                kill -9 $PID 2>/dev/null
                rm -f "$pid_file"
                print_success "$service_name forcefully stopped"
            fi
        else
            print_warning "$service_name is not running (stale PID file)"
            rm -f "$pid_file"
        fi
    else
        print_warning "No PID file found for $service_name"
        return 1
    fi
}

stop_service_by_pattern() {
    local pattern=$1
    local service_name=$2

    print_status "Looking for $service_name processes matching: $pattern"

    # Find PIDs matching the pattern
    PIDS=$(ps aux | grep "$pattern" | grep -v grep | awk '{print $2}' | tr '\n' ' ')

    if [ -n "$PIDS" ]; then
        print_status "Found $service_name process(es): $PIDS"

        for PID in $PIDS; do
            print_status "Stopping $service_name (PID: $PID)"
            kill $PID 2>/dev/null

            # Wait briefly
            sleep 1

            # Force kill if still running
            if ps -p $PID > /dev/null 2>&1; then
                print_warning "Force killing $service_name (PID: $PID)"
                kill -9 $PID 2>/dev/null
            fi
        done

        print_success "All $service_name processes stopped"
        return 0
    else
        print_warning "No $service_name processes found matching pattern"
        return 1
    fi
}

cleanup_pid_files() {
    print_status "Cleaning up PID files..."

    if [ -f "$LOGS_DIR/backend.pid" ]; then
        rm -f "$LOGS_DIR/backend.pid"
        print_success "Removed backend PID file"
    fi

    if [ -f "$LOGS_DIR/frontend.pid" ]; then
        rm -f "$LOGS_DIR/frontend.pid"
        print_success "Removed frontend PID file"
    fi
}

check_port_cleanup() {
    local port=$1
    local service_name=$2

    if ss -tlnp 2>/dev/null | grep -q ":$port"; then
        print_warning "$service_name port ($port) is still in use"

        # Find and stop the process using the port
        PORT_PID=$(ss -tlnp 2>/dev/null | grep ":$port" | head -1 | sed -n 's/.*pid=\([0-9]*\).*/\1/p')
        if [ -n "$PORT_PID" ]; then
            print_status "Stopping process using port $port (PID: $PORT_PID)"
            kill $PORT_PID 2>/dev/null
            sleep 1

            if ps -p $PORT_PID > /dev/null 2>&1; then
                print_warning "Force killing process using port $port"
                kill -9 $PORT_PID 2>/dev/null
            fi

            print_success "Port $port cleared"
        fi
    else
        print_success "Port $port is clear"
    fi
}

aggressive_cleanup() {
    print_status "Running aggressive cleanup..."

    # Kill all Python processes running main.py
    stop_service_by_pattern "uv run main.py" "Backend"

    # Kill all Next.js dev processes
    stop_service_by_pattern "next dev" "Frontend"

    # Additional cleanup for any remaining processes
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true

    print_success "Aggressive cleanup complete"
}

show_current_status() {
    echo ""
    echo "=== Current Status ==="

    # Check for any remaining processes
    BACKEND_PROCESSES=$(ps aux | grep "uv run main.py" | grep -v grep | wc -l)
    FRONTEND_PROCESSES=$(ps aux | grep "next dev" | grep -v grep | wc -l)

    if [ "$BACKEND_PROCESSES" -eq 0 ] && [ "$FRONTEND_PROCESSES" -eq 0 ]; then
        echo -e "${GREEN}✓ No chat processes running${NC}"
    else
        if [ "$BACKEND_PROCESSES" -gt 0 ]; then
            echo -e "${RED}✗ Backend processes still running: $BACKEND_PROCESSES${NC}"
        fi
        if [ "$FRONTEND_PROCESSES" -gt 0 ]; then
            echo -e "${RED}✗ Frontend processes still running: $FRONTEND_PROCESSES${NC}"
        fi
    fi

    # Check ports
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}✗ Port 8000 (backend) is still in use${NC}"
    else
        echo -e "${GREEN}✓ Port 8000 (backend) is clear${NC}"
    fi

    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}✗ Port 3000 (frontend) is still in use${NC}"
    else
        echo -e "${GREEN}✓ Port 3000 (frontend) is clear${NC}"
    fi
}

main() {
    echo -e "${CYAN}🛑 Chat Integration Stop Script${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo

    # Check if we're in the right directory
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the phase-3 directory"
        exit 1
    fi

    print_status "Stopping all chat integration services..."

    echo

    # Graceful shutdown using PID files
    print_status "Attempting graceful shutdown..."
    stop_service_by_pid_file "$LOGS_DIR/backend.pid" "Backend"
    stop_service_by_pid_file "$LOGS_DIR/frontend.pid" "Frontend"

    echo

    # Check and clear ports
    print_status "Checking port usage..."
    check_port_cleanup 8000 "Backend"
    check_port_cleanup 3000 "Frontend"

    echo

    # Aggressive cleanup for any remaining processes
    print_status "Running comprehensive cleanup..."
    aggressive_cleanup

    echo

    # Cleanup PID files
    cleanup_pid_files

    echo

    print_success "Chat integration services have been stopped"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  - Run ./start.server.sh to restart services"
    echo -e "  - Run ./status.server.sh to check status"
    echo
}

main "$1"