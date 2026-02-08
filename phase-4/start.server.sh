#!/bin/bash

# Chat Integration Test Script
# Starts both backend and frontend for testing JWT-based agent chat

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
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOGS_DIR="$PROJECT_DIR/logs"

# Create logs directory
mkdir -p "$LOGS_DIR"

# Generate unique session ID
SESSION_ID=$(date +%s | sha256sum | head -c 8)
echo "SESSION_ID=$SESSION_ID" > "$LOGS_DIR/session.env"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2
    if ss -tlnp 2>/dev/null | grep -q ":$port"; then
        echo -e "${RED}❌ Port $port is already in use!${NC}"
        echo -e "${YELLOW}   Service: $service${NC}"
        echo -e "${YELLOW}   Use: ss -tlnp | grep :$port to find the process${NC}"
        return 1
    fi
    return 0
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$name is ready"
            return 0
        fi
        print_warning "Attempt $attempt/$max_attempts: $name not ready yet, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$name failed to start within timeout"
    return 1
}

# Function to start backend
start_backend() {
    print_status "Starting Backend (FastAPI + JWT + MCP)..."

    cd "$BACKEND_DIR" || {
        print_error "Could not enter backend directory"
        return 1
    }

    # Check if uv is available
    if ! command_exists uv; then
        print_error "uv is not installed. Please install it first."
        print_info "curl -LsSf https://astral.sh/uv/install.sh | sh"
        return 1
    fi

    # Check if backend directory structure exists
    if [ ! -d "src/backend" ]; then
        print_error "Backend structure not found. Expected: src/backend/"
        return 1
    fi

    # Check for main.py
    if [ ! -f "src/backend/main.py" ]; then
        print_error "src/backend/main.py not found"
        return 1
    fi

    # Check for required files
    required_files=(
        "src/backend/agents.py"
        "src/backend/auth/jwt.py"
        "src/backend/task_serves_mcp_tools.py"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            return 1
        fi
    done

    print_success "Backend structure verified"

    # Start backend in background
    print_status "Starting uvicorn server on port 8000..."
    uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!

    # Save PID
    echo $BACKEND_PID > "$LOGS_DIR/backend.pid"

    # Wait a moment for server to start
    sleep 2

    # Check if process is still running
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        print_error "Backend failed to start. Check logs: $LOGS_DIR/backend.log"
        cat "$LOGS_DIR/backend.log"
        return 1
    fi

    print_success "Backend started (PID: $BACKEND_PID)"
    return 0
}

# Function to start frontend
start_frontend() {
    print_status "Starting Frontend (Next.js + Better Auth)..."

    cd "$FRONTEND_DIR" || {
        print_error "Could not enter frontend directory"
        return 1
    }

    # Check if node/npm is available
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install it first."
        return 1
    fi

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend directory"
        return 1
    fi

    # Check for required files
    required_files=(
        "src/app/chatbot/page.tsx"
        "src/lib/auth.ts"
        "src/contexts/AuthContext.tsx"
        "src/components/auth/ProtectedRoute.tsx"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            return 1
        fi
    done

    print_success "Frontend structure verified"

    # Check/create .env.local
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found, creating with bypass mode..."
        cat > .env.local << EOF
NEXT_PUBLIC_AUTH_BYPASS=true
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
EOF
        print_success "Created .env.local with bypass mode"
    else
        # Check if bypass mode is enabled
        if ! grep -q "NEXT_PUBLIC_AUTH_BYPASS=true" .env.local 2>/dev/null; then
            print_warning "Bypass mode not enabled in .env.local"
            print_info "Add: NEXT_PUBLIC_AUTH_BYPASS=true"
        fi
    fi

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, installing dependencies..."
        if ! npm install; then
            print_error "npm install failed"
            return 1
        fi
        print_success "Dependencies installed"
    fi

    # Start frontend in background
    print_status "Starting Next.js dev server on port 3000..."
    PORT=3000 npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!

    # Save PID
    echo $FRONTEND_PID > "$LOGS_DIR/frontend.pid"

    # Wait a moment for server to start
    sleep 3

    # Check if process is still running
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        print_error "Frontend failed to start. Check logs: $LOGS_DIR/frontend.log"
        cat "$LOGS_DIR/frontend.log"
        return 1
    fi

    print_success "Frontend started (PID: $FRONTEND_PID)"
    return 0
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."

    # Stop backend
    if [ -f "$LOGS_DIR/backend.pid" ]; then
        local backend_pid=$(cat "$LOGS_DIR/backend.pid")
        if ps -p $backend_pid > /dev/null 2>&1; then
            print_status "Stopping backend (PID: $backend_pid)..."
            kill $backend_pid 2>/dev/null
            sleep 1
            # Force kill if still running
            if ps -p $backend_pid > /dev/null 2>&1; then
                kill -9 $backend_pid 2>/dev/null
            fi
        fi
        rm -f "$LOGS_DIR/backend.pid"
    fi

    # Stop frontend
    if [ -f "$LOGS_DIR/frontend.pid" ]; then
        local frontend_pid=$(cat "$LOGS_DIR/frontend.pid")
        if ps -p $frontend_pid > /dev/null 2>&1; then
            print_status "Stopping frontend (PID: $frontend_pid)..."
            kill $frontend_pid 2>/dev/null
            sleep 1
            # Force kill if still running
            if ps -p $frontend_pid > /dev/null 2>&1; then
                kill -9 $frontend_pid 2>/dev/null
            fi
        fi
        rm -f "$LOGS_DIR/frontend.pid"
    fi

    print_success "Cleanup complete"
}

# Function to test backend health
test_backend_health() {
    print_status "Testing backend health..."

    if curl -s http://localhost:8000/api/agents/status >/dev/null 2>&1; then
        print_success "Backend health check passed"
        return 0
    else
        print_error "Backend health check failed"
        return 1
    fi
}

# Function to test frontend health
test_frontend_health() {
    print_status "Testing frontend health..."

    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend health check passed"
        return 0
    else
        print_error "Frontend health check failed"
        return 1
    fi
}

# Function to display summary
show_summary() {
    echo
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ CHAT INTEGRATION TEST READY!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    echo -e "${CYAN}Session ID:${NC} $SESSION_ID"
    echo -e "${CYAN}Backend:${NC} http://localhost:8000"
    echo -e "${CYAN}Frontend:${NC} http://localhost:3000"
    echo -e "${CYAN}Chat Page:${NC} http://localhost:3000/chatbot"
    echo
    echo -e "${YELLOW}Test Commands:${NC}"
    echo -e "  curl http://localhost:8000/api/agents/status"
    echo -e "  tail -f $LOGS_DIR/backend.log"
    echo -e "  tail -f $LOGS_DIR/frontend.log"
    echo
    echo -e "${YELLOW}Natural Language Examples:${NC}"
    echo -e "  • \"Create a task: Buy milk tomorrow\""
    echo -e "  • \"Show me all my tasks\""
    echo -e "  • \"How many tasks do I have?\""
    echo -e "  • \"Speak Urdu\" (switches to Urdu agent)"
    echo
    echo -e "${RED}Press Ctrl+C to stop all services${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
}

# Main execution
main() {
    echo -e "${CYAN}🚀 Chat Integration Test Script${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    echo -e "${CYAN}Session ID: $SESSION_ID${NC}"
    echo

    # Check prerequisites
    print_status "Checking prerequisites..."

    if ! command_exists curl; then
        print_error "curl is not installed"
        exit 1
    fi

    if ! command_exists ss; then
        print_error "ss is not installed"
        exit 1
    fi

    print_success "Prerequisites verified"

    # Check ports
    print_status "Checking ports..."
    if ! check_port 8000 "Backend"; then
        exit 1
    fi
    if ! check_port 3000 "Frontend"; then
        exit 1
    fi
    print_success "Ports available"

    # Set trap for cleanup
    trap cleanup EXIT INT TERM

    # Start services
    if ! start_backend; then
        print_error "Failed to start backend"
        exit 1
    fi

    if ! start_frontend; then
        print_error "Failed to start frontend"
        exit 1
    fi

    # Wait a bit for services to fully start
    sleep 5

    # Test health
    if ! test_backend_health; then
        print_warning "Backend health check failed, but continuing..."
    fi

    if ! test_frontend_health; then
        print_warning "Frontend health check failed, but continuing..."
    fi

    # Show summary
    show_summary

    # Keep script running and show logs
    echo -e "${YELLOW}Services are running. Logs:${NC}"
    echo -e "Backend: tail -f $LOGS_DIR/backend.log"
    echo -e "Frontend: tail -f $LOGS_DIR/frontend.log"
    echo
    echo -e "${CYAN}💡 Server is running. Press Ctrl+C to stop.${NC}"
    echo -e "${CYAN}   Or run ./stop.server.sh from another terminal.${NC}"
    echo -e "${CYAN}   Logs are available in: $LOGS_DIR/${NC}"

    # Wait for user interrupt
    wait
}

# Run main function
main