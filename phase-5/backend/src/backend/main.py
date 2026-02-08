"""FastAPI main application"""
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import logging
import os

from .config import settings
from .routers import tasks_router
from .routers.notifications import router as notifications_router
from .routers.audit import router as audit_router
from .auth.jwt import verify_token, get_user_id_from_token
from .database import get_session, Session
from .agents import orchestrator_agent, urdu_agent, config
from agents import Runner
from agents.mcp import MCPServerStdio
from .services.reminder_service import ReminderService
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="FastAPI Todo Backend",
    description="RESTful API for managing user tasks with JWT authentication",
    version="1.0.0"
)

# CORS Configuration
origins = [origin.strip() for origin in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ========================================
# NOTE: WebSocket and SSE are handled by websocket-service microservice
# See: backend/src/backend/microservices/websocket_service.py
# ========================================


# ========================================
# Include routers
# ========================================
app.include_router(tasks_router)
app.include_router(notifications_router)
app.include_router(audit_router)

# Import and include ChatKit router
from .api import chatkit
app.include_router(chatkit.router)

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "FastAPI Todo Backend",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": "ok"
    }


# Chat endpoint models
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    agent: str
    timestamp: str


async def get_token_from_header(authorization: str | None = Header(None)) -> str:
    """Extract Bearer token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format"
        )

    return authorization[7:]  # Remove "Bearer " prefix


async def validate_and_get_user(token: str = Depends(get_token_from_header)) -> dict:
    """Validate token and return user payload"""
    return await verify_token(token)


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    user_payload: dict = Depends(validate_and_get_user),
):
    """Handle chat messages with agent system using dynamic MCP integration"""
    user_id = get_user_id_from_token(user_payload)

    try:
        # Create dynamic MCP server for this request
        import os
        from pathlib import Path
        backend_dir = Path(__file__).parent
        project_root = backend_dir.parent.parent
        mcp_wrapper_path = backend_dir / "mcp_wrapper.py"

        server = MCPServerStdio(
            params={
                "command": "uv",
                "args": ["run", "python", str(mcp_wrapper_path)],
                "cwd": str(project_root),
                "env": os.environ.copy()
            },
            client_session_timeout_seconds=60
        )

        # Connect to MCP server and run agent
        await server.connect()
        orchestrator_agent.mcp_servers = [server]
        urdu_agent.mcp_servers = [server]

        # Enhanced input with user context
        enhanced_input = f"[User: {user_id}] {request.message}"

        # Run the agent with MCP tools
        logger.info(f"Running agent with input: {enhanced_input}")
        result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config, max_turns=30)
        logger.info(f"Agent result: {result.final_output}, agent: {getattr(result, 'agent', result.last_agent.name)}")

        # Cleanup
        await server.cleanup()
        orchestrator_agent.mcp_servers = []
        urdu_agent.mcp_servers = []

        # Determine which agent actually handled the request
        agent_name = getattr(result, 'last_agent', orchestrator_agent.name)
        if hasattr(agent_name, 'name'):
            agent_name = agent_name.name

        return ChatResponse(
            response=result.final_output,
            agent=agent_name,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        # Ensure cleanup even on error
        try:
            await server.cleanup()
            orchestrator_agent.mcp_servers = []
            urdu_agent.mcp_servers = []
        except:
            pass

        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    """Application startup events"""
    logger.info("Starting FastAPI Todo Backend")
    logger.info(f"CORS origins: {origins}")
    logger.info(f"API running on {settings.api_host}:{settings.api_port}")

    # NOTE: WebSocket/SSE managers removed - handled by websocket-service
    logger.info("✅ Real-time updates handled by websocket-service microservice")

    # Validate ChatKit configuration
    try:
        from .config import validate_chatkit_config
        validate_chatkit_config()
        logger.info("✅ ChatKit configuration validated")
    except Exception as e:
        logger.warning(f"❌ ChatKit validation failed: {e}. ChatKit endpoints may not work correctly.")
        # Don't block startup, but log clearly

    # Start reminder service
    # DISABLED: Now using notification-service microservice with Dapr cron binding
    # try:
    #     reminder_service = ReminderService(interval_seconds=60)
    #     await reminder_service.start()
    #     # Store in app state for shutdown
    #     app.state.reminder_service = reminder_service
    #     logger.info("✅ Reminder service started")
    # except Exception as e:
    #     logger.error(f"❌ Failed to start reminder service: {e}")
    #     # Don't block startup, but log clearly
    logger.info("✅ Reminder service disabled - using notification-service microservice")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown events"""
    logger.info("Shutting down FastAPI Todo Backend")

    # Stop reminder service
    # DISABLED: Now using notification-service microservice with Dapr cron binding
    # if hasattr(app.state, 'reminder_service'):
    #     try:
    #         await app.state.reminder_service.stop()
    #         logger.info("✅ Reminder service stopped")
    #     except Exception as e:
    #         logger.error(f"❌ Error stopping reminder service: {e}")
