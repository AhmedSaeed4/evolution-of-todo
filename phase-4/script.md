# Chat Integration Test Scripts

## Quick Start

```bash
# Start both backend and frontend
./start.server.sh

# Check status and logs
./status.server.sh

# Stop all services
./stop.server.sh
```

## What These Scripts Do

### start.server.sh
- **Environment Setup** - Creates necessary config files and logs directory
- **Session ID Generation** - Creates unique session ID for tracking
- **Dependency Verification** - Checks all required tools (curl, ss, uv, node)
- **Port Management** - Checks and manages ports 8000/3000
- **Backend Startup** - Starts FastAPI with JWT + MCP on port 8000
- **Frontend Startup** - Starts Next.js with auth on port 3000
- **Health Checks** - Validates services are ready
- **Auto-cleanup** - Stops services on Ctrl+C
- **No Prompts** - Runs immediately without confirmation

### status.server.sh
- **Session ID Display** - Shows current session ID from logs/session.env
- **Service Status** - Shows if backend/frontend are running
- **Port Check** - Verifies ports 8000/3000 usage
- **Health Endpoints** - Tests API connectivity
- **Log Preview** - Shows recent entries from logs/backend.log and logs/frontend.log
- **Process Discovery** - Finds running processes even without PID files
- **Quick Commands** - Lists useful commands for testing

### stop.server.sh
- **Graceful Shutdown** - Stops services cleanly
- **PID Management** - Uses PID files from logs/ directory
- **Port Cleanup** - Kills processes by port
- **Aggressive Cleanup** - Final fallback patterns for stubborn processes
- **No Prompts** - Runs immediately without confirmation

## Manual Test Steps

### Step 1: Start Backend
```bash
cd backend
uv run main.py
```

### Step 2: Start Frontend
```bash
cd frontend
# Ensure .env.local has: NEXT_PUBLIC_AUTH_BYPASS=true
npm run dev
```

### Step 3: Test Chat
1. Visit `http://localhost:3000`
2. Click "Chat" or "Get Started"
3. Send: `"Create a task: Buy milk tomorrow"`
4. Verify agent response

## Test Commands

### Backend Status
```bash
curl http://localhost:8000/api/agents/status
```

### Direct Agent Test
```bash
# Generate bypass token
python3 -c "
import base64, json
header = base64.b64encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode()).decode().rstrip('=')
payload = base64.b64encode(json.dumps({'sub': 'pvXpHDR7jHQHlUsqesGTok9wiOsGPZHq', 'exp': 9999999999}).encode()).decode().rstrip('=')
print(f'{header}.{payload}.bypass-signature')
"

# Test endpoint
curl -X POST http://localhost:8000/api/agents/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all tasks"}'
```

## File Structure

```
phase-3/
├── start.server.sh                    # Start both backend & frontend
├── status.server.sh                   # Check status & logs
├── stop.server.sh                     # Stop all services
├── logs/                              # Log files directory
│   ├── backend.log                    # Backend server logs
│   ├── frontend.log                   # Frontend server logs
│   ├── backend.pid                    # Backend process ID
│   ├── frontend.pid                   # Frontend process ID
│   └── session.env                    # Session ID (e.g., SESSION_ID=1e88735a)
├── backend/
│   ├── src/backend/agents.py          # JWT-protected agent endpoint
│   ├── src/backend/auth/jwt.py        # JWT validation
│   └── src/backend/task_serves_mcp_tools.py  # MCP server with 7 tools
├── frontend/
│   ├── src/app/chatbot/page.tsx       # Chat UI
│   ├── src/app/page.tsx               # Updated with Chat link
│   ├── src/lib/auth.ts                # JWT extraction
│   └── src/components/auth/           # Protected routes
└── script.md                          # This file
```

## Configuration

### Backend (.env)
```bash
XIAOMI_API_KEY=your_key_here
DATABASE_URL=your_neon_url
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_AUTH_BYPASS=true
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
```

## Natural Language Examples

Try these in the chat interface:
- `"Create a task: Buy milk tomorrow with high priority"`
- `"Show me all my tasks"`
- `"How many tasks do I have?"`
- `"Complete task 123"`
- `"Update task 123: Buy 2 liters of milk"`
- `"Speak Urdu"` → Switches to Urdu specialist agent

## Expected Results

### ✅ Success Indicators
- Chat page loads with smooth animations
- JWT token automatically extracted from auth session
- Backend responds with agent output
- Messages display with proper formatting
- Loading states work correctly
- Error handling shows clear messages

### ❌ Common Issues
- **Backend not running** → Start server first
- **Auth bypass not enabled** → Set `NEXT_PUBLIC_AUTH_BYPASS=true`
- **Port conflicts** → Check ports 3000/8000 are free
- **MCP errors** → Verify `uv` is installed

## Integration Flow

```
User → Frontend Chat → JWT Extraction → Backend API → Agent → MCP Tools → Database
     ↓              ↓                ↓            ↓        ↓        ↓          ↓
  Types msg    getAuthToken()   Auto token   /api/agents/chat  7 tools  User data
```

## Troubleshooting

### Quick Fixes
```bash
# Restart everything
./stop.server.sh && ./start.server.sh

# Check what's running
./status.server.sh

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Backend Issues
```bash
cd backend
uv sync          # Install dependencies
uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000  # Start server manually
```

### Frontend Issues
```bash
cd frontend
npm install      # Install dependencies
npm run dev      # Start dev server manually
```

### JWT Issues
- Ensure `NEXT_PUBLIC_AUTH_BYPASS=true` in `.env.local`
- Check backend JWT validation in `src/backend/auth/jwt.py`
- Verify token generation in `src/lib/auth.ts`

### MCP Server Issues
```bash
# Test MCP server directly
cd backend
uv run task_mcp_server.py
```

## Session ID & Logs

### Session ID
Each time you run `./start.server.sh`, a unique session ID is generated:
- **Location**: `logs/session.env`
- **Format**: `SESSION_ID=1e88735a` (8-character hex)
- **Usage**: Track which session created which logs
- **View**: `cat logs/session.env`

### Log Files
All logs are stored in the `logs/` directory:
- **Backend**: `logs/backend.log` - FastAPI server logs
- **Frontend**: `logs/frontend.log` - Next.js dev server logs
- **PIDs**: `logs/backend.pid`, `logs/frontend.pid` - Process IDs
- **Session**: `logs/session.env` - Current session ID

### Viewing Logs
```bash
# Real-time logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Last 50 lines
tail -50 logs/backend.log

# Search for errors
grep -i error logs/backend.log
```

## Success Checklist

- [ ] Backend server starts without errors
- [ ] Frontend dev server starts
- [ ] Session ID is generated and displayed
- [ ] Chat page loads at `http://localhost:3000/chatbot`
- [ ] User can send messages immediately
- [ ] JWT token appears in network requests
- [ ] Agent responds with task management
- [ ] Urdu language switching works
- [ ] Error handling displays correctly

## Next Steps After Testing

1. **Remove bypass mode** for production
2. **Set up real Better Auth** providers (Google, GitHub)
3. **Add rate limiting** to backend
4. **Monitor usage** and optimize performance
5. **Deploy** to production environment

---

## New Features (Updated)

### ✅ Session ID Generation
- Unique 8-character ID created automatically
- Saved to `logs/session.env` for tracking
- Displayed in all scripts for easy reference

### ✅ No Confirmation Prompts
- Scripts run immediately without asking "y/N"
- Faster startup and shutdown
- Better for automated workflows

### ✅ Enhanced Logging
- All logs centralized in `logs/` directory
- PID files for precise process management
- Session tracking for debugging

### ✅ Modern UI
- Emoji-based status indicators
- Color-coded output (green=success, yellow=warning, red=error)
- Timestamps for all operations

### ✅ Robust Error Handling
- Comprehensive dependency checking
- Port conflict detection
- Graceful fallbacks for missing files

**Ready to test?** Run `./start.server.sh` and start chatting with your AI agent! 🚀