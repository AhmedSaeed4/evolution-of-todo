"""ChatKit server implementation using OpenAI ChatKit SDK"""
from fastapi import APIRouter, HTTPException, Depends, Header, status, Request, Response
from fastapi.responses import StreamingResponse
from typing import Dict, Optional, AsyncIterator
import os
import json
from datetime import datetime, timedelta, timezone

# Pakistan Standard Time (UTC+5) - matches WSL clock in development
PKT = timezone(timedelta(hours=5))

# Timezone offset for loading timestamps from DB
# In WSL/development: local time is stored as UTC, need to subtract 5 hours
# In production: servers use correct UTC, no offset needed
IS_DEVELOPMENT = os.getenv("ENVIRONMENT", "production") == "development"
TIMESTAMP_OFFSET = timedelta(hours=5) if IS_DEVELOPMENT else timedelta(hours=0)

from openai import OpenAI
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import ThreadMetadata, UserMessageItem, ThreadStreamEvent, ThreadItem
from chatkit.store import Store, Page
from backend.config import validate_chatkit_config
from backend.auth.jwt import verify_token, get_user_id_from_token

# Database imports (User model imported lazily to avoid circular import)
from sqlmodel import Session, select
from backend.database import engine

router = APIRouter(prefix="/api/chatkit", tags=["chatkit"])

# Initialize OpenAI client with validation
try:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"Failed to initialize OpenAI client: {str(e)}. "
               "Please verify your OPENAI_API_KEY is valid."
    )


def get_dev_user_id() -> str:
    """Get first user from database for development mode (uses raw SQL to avoid circular dependencies)"""
    from sqlalchemy import text
    
    with Session(engine) as session:
        # Use raw SQL to avoid importing User model which causes table redefinition
        result = session.execute(text("SELECT id FROM \"user\" LIMIT 1"))
        row = result.first()
        if row:
            user_id = row[0]
            print(f"🔍 Using real user from DB: {user_id}")
            return user_id
        else:
            print("⚠️ No users in database!")
            return "no-user-found"


# Database-backed store for threads (persists to NeonDB)
class DatabaseStore(Store[dict]):
    def __init__(self):
        from sqlalchemy import text
        # In-memory cache for thread items (ChatKit items are complex objects that are hard to serialize)
        # We only cache items for the current session, threads are saved to DB
        self._thread_items: dict[str, list[ThreadItem]] = {}
        # Map ChatKit thread IDs (e.g., "thr_abc123") to database UUIDs
        self._thread_id_to_uuid: dict[str, str] = {}
        self._uuid_to_thread_id: dict[str, str] = {}
        
    def _get_user_id_from_context(self, context: dict) -> str | None:
        return context.get("user_id")
    
    def _get_or_create_uuid(self, thread_id: str) -> str:
        """Generate a deterministic UUID for a ChatKit thread ID"""
        from uuid import uuid5, NAMESPACE_DNS
        if thread_id in self._thread_id_to_uuid:
            return self._thread_id_to_uuid[thread_id]
        # Generate deterministic UUID from thread ID
        db_uuid = str(uuid5(NAMESPACE_DNS, f"chatkit-{thread_id}"))
        self._thread_id_to_uuid[thread_id] = db_uuid
        self._uuid_to_thread_id[db_uuid] = thread_id
        return db_uuid

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        from sqlalchemy import text
        import json
        
        user_id = self._get_user_id_from_context(context)
        if not user_id:
            print(f"⚠️ No user_id in context, cannot save thread")
            return
            
        thread_id = thread.id
        db_uuid = self._get_or_create_uuid(thread_id)
        
        with Session(engine) as session:
            # Check if thread exists
            result = session.execute(
                text("SELECT session_id FROM chat_sessions WHERE session_id = :tid"),
                {"tid": db_uuid}
            )
            existing = result.first()
            
            if not existing:
                # Store original thread ID in metadata
                meta = {"chatkit_thread_id": thread_id}
                if thread.metadata:
                    meta.update(thread.metadata)
                
                # Insert new thread with UUID
                session.execute(
                    text("""
                        INSERT INTO chat_sessions (session_id, user_id, title, created_at, updated_at, metadata)
                        VALUES (:sid, :uid, :title, :created, :updated, :meta)
                    """),
                    {
                        "sid": db_uuid,
                        "uid": user_id,
                        "title": meta.get("title", "New Chat"),
                        "created": getattr(thread, "created_at", datetime.now(PKT)),
                        "updated": datetime.now(PKT),
                        "meta": json.dumps(meta)
                    }
                )
                session.commit()
                print(f"🔒 Thread {thread_id} (UUID: {db_uuid[:8]}...) saved to DB for user {user_id}")
            
        # Initialize thread items cache
        if thread_id not in self._thread_items:
            self._thread_items[thread_id] = []

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata | None:
        from sqlalchemy import text
        from chatkit.types import ThreadMetadata
        import json
            
        print(f"🔍 Loading thread from DB: {thread_id}")
        
        user_id = self._get_user_id_from_context(context)
        db_uuid = self._get_or_create_uuid(thread_id)
        
        with Session(engine) as session:
            result = session.execute(
                text("SELECT session_id, user_id, title, created_at, metadata FROM chat_sessions WHERE session_id = :tid"),
                {"tid": db_uuid}
            )
            row = result.first()
            
            if row:
                owner_id = row[1]
                # Check ownership
                if user_id and owner_id != user_id:
                    print(f"⚠️ User {user_id} tried to access thread owned by {owner_id}")
                    return None
                
                # Parse metadata to get original thread ID (JSONB returns dict directly)
                meta = row[4] if isinstance(row[4], dict) else (json.loads(row[4]) if row[4] else {})
                original_id = meta.get("chatkit_thread_id", thread_id)
                    
                return ThreadMetadata(
                    id=original_id,  # Return original ChatKit thread ID
                    # Adjust for timezone offset (development only)
                    created_at=row[3] - TIMESTAMP_OFFSET if row[3] else row[3],
                    metadata={"title": row[2]}
                )
            else:
                # Create new thread if it doesn't exist
                print(f"🔍 Thread {thread_id} not found in DB, creating new one")
                new_thread = ThreadMetadata(
                    id=thread_id,
                    created_at=datetime.now(PKT),
                    metadata={}
                )
                await self.save_thread(new_thread, context)
                return new_thread

    async def load_threads(
        self, after: str | None, limit: int, order: str, context: dict
    ) -> Page[ThreadMetadata]:
        from sqlalchemy import text
        from chatkit.types import ThreadMetadata
        import json
        
        user_id = self._get_user_id_from_context(context)
        
        if not user_id:
            print(f"⚠️ No user_id in context, returning empty threads")
            return Page(data=[], has_more=False, after=None)
        
        with Session(engine) as session:
            order_dir = "DESC" if order == "desc" else "ASC"
            result = session.execute(
                text(f"""
                    SELECT session_id, title, created_at, metadata 
                    FROM chat_sessions 
                    WHERE user_id = :uid 
                    ORDER BY created_at {order_dir}
                    LIMIT :lim
                """),
                {"uid": user_id, "lim": limit + 1}
            )
            rows = result.fetchall()
            
            threads = []
            for row in rows[:limit]:
                # Parse metadata to get original ChatKit thread ID (JSONB returns dict directly)
                meta = row[3] if isinstance(row[3], dict) else (json.loads(row[3]) if row[3] else {})
                original_id = meta.get("chatkit_thread_id", str(row[0]))
                
                # Cache the UUID mapping
                self._thread_id_to_uuid[original_id] = str(row[0])
                self._uuid_to_thread_id[str(row[0])] = original_id
                
                threads.append(ThreadMetadata(
                    id=original_id,  # Return original ChatKit thread ID
                    # Adjust for timezone offset (development only)
                    created_at=row[2] - TIMESTAMP_OFFSET if row[2] else row[2],
                    metadata={"title": row[1]}
                ))
            
            has_more = len(rows) > limit
            print(f"🔒 User {user_id} has {len(threads)} threads in DB")
            for t in threads[:3]:  # Log first 3 threads
                print(f"   📅 Thread {t.id}: created_at={t.created_at}")
            
            return Page(
                data=threads,
                has_more=has_more,
                after=threads[-1].id if has_more and threads else None
            )

    async def delete_thread(self, thread_id: str, context: dict) -> None:
        from sqlalchemy import text
        
        db_uuid = self._get_or_create_uuid(thread_id)
        
        with Session(engine) as session:
            # Delete messages first (foreign key constraint)
            session.execute(
                text("DELETE FROM chat_messages WHERE session_id = :tid"),
                {"tid": db_uuid}
            )
            # Delete thread
            session.execute(
                text("DELETE FROM chat_sessions WHERE session_id = :tid"),
                {"tid": db_uuid}
            )
            session.commit()
            print(f"🗑️ Thread {thread_id} (UUID: {db_uuid[:8]}...) deleted from DB")
        
        # Clean up caches
        self._thread_items.pop(thread_id, None)
        self._thread_id_to_uuid.pop(thread_id, None)
        self._uuid_to_thread_id.pop(db_uuid, None)

    async def load_thread_items(
        self, thread_id: str, after: str | None, limit: int, order: str, context: dict
    ) -> Page[ThreadItem]:
        from sqlalchemy import text
        from chatkit.types import UserMessageItem, AssistantMessageItem, AssistantMessageContent
        import json
        
        db_uuid = self._get_or_create_uuid(thread_id)
        user_id = self._get_user_id_from_context(context)
        
        with Session(engine) as session:
            # Always order by timestamp ASC (oldest first) for proper chat display
            # ChatKit handles the visual presentation order
            result = session.execute(
                text("""
                    SELECT message_id, content, sender_type, timestamp, metadata 
                    FROM chat_messages 
                    WHERE session_id = :sid 
                    ORDER BY timestamp ASC
                    LIMIT :lim
                """),
                {"sid": db_uuid, "lim": limit + 1}
            )
            rows = result.fetchall()
            
            items = []
            for row in rows[:limit]:
                msg_id = str(row[0])
                content = row[1]
                sender_type = row[2]
                timestamp = row[3]
                meta = row[4] if isinstance(row[4], dict) else (json.loads(row[4]) if row[4] else {})
                original_msg_id = meta.get("chatkit_message_id", msg_id)
                
                try:
                    if sender_type == "user":
                        # For user messages, use input_text type and add inference_options
                        items.append(UserMessageItem(
                            thread_id=thread_id,
                            id=original_msg_id,
                            created_at=timestamp,
                            content=[{"type": "input_text", "text": content}],
                            inference_options={}
                        ))
                    else:  # assistant or tool
                        items.append(AssistantMessageItem(
                            thread_id=thread_id,
                            id=original_msg_id,
                            created_at=timestamp,
                            content=[AssistantMessageContent(text=content)]
                        ))
                except Exception as e:
                    print(f"⚠️ Error creating message item: {e}")
                    continue
            
            has_more = len(rows) > limit
            
            # Debug: log the order of messages
            for i, item in enumerate(items):
                item_type = "user" if hasattr(item, 'inference_options') else "assistant"
                print(f"  [{i}] {item_type}: {getattr(item, 'created_at', 'no-time')}")
            print(f"📨 Loaded {len(items)} messages for thread {thread_id}")
            
            return Page(
                data=items,
                has_more=has_more,
                after=items[-1].id if has_more and items else None
            )

    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        # Add to in-memory cache for current session
        if thread_id not in self._thread_items:
            self._thread_items[thread_id] = []
        self._thread_items[thread_id].append(item)

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        from sqlalchemy import text
        from uuid import uuid4
        import json
        
        print(f"📝 save_item called for thread {thread_id}, item type: {type(item).__name__}")
        
        # Add to in-memory cache
        await self.add_thread_item(thread_id, item, context)
        
        # Persist to database
        db_uuid = self._get_or_create_uuid(thread_id)
        user_id = self._get_user_id_from_context(context)
        
        if not user_id:
            print(f"⚠️ No user_id in context, cannot save message")
            return
        
        # Extract message content and type
        content = ""
        sender_type = "user"
        
        if hasattr(item, 'content'):
            for c in item.content:
                if hasattr(c, 'text'):
                    content = c.text
                    break
        
        # Determine sender type from item class name
        item_type = type(item).__name__.lower()
        if 'assistant' in item_type:
            sender_type = 'assistant'
        elif 'tool' in item_type:
            sender_type = 'tool'
        else:
            sender_type = 'user'
        
        # Generate UUID for database, store original ID in metadata
        msg_uuid = str(uuid4())
        meta = {"chatkit_message_id": item.id}
        
        try:
            with Session(engine) as session:
                session.execute(
                    text("""
                        INSERT INTO chat_messages (message_id, session_id, user_id, content, sender_type, timestamp, metadata)
                        VALUES (:mid, :sid, :uid, :content, :stype, :ts, :meta)
                    """),
                    {
                        "mid": msg_uuid,
                        "sid": db_uuid,
                        "uid": user_id,
                        "content": content,
                        "stype": sender_type,
                        "ts": datetime.utcnow(),  # Always use current UTC time for proper ordering
                        "meta": json.dumps(meta)
                    }
                )
                session.commit()
                print(f"💾 Saved {sender_type} message to DB for thread {thread_id}")
        except Exception as e:
            print(f"⚠️ Failed to save message to DB: {e}")

    async def load_item(self, thread_id: str, item_id: str, context: dict) -> ThreadItem | None:
        # First check in-memory cache
        items = self._thread_items.get(thread_id, [])
        for item in items:
            if item.id == item_id:
                return item
        return None

    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
        if thread_id in self._thread_items:
            self._thread_items[thread_id] = [
                item for item in self._thread_items[thread_id] if item.id != item_id
            ]

    async def save_attachment(self, attachment_id: str, data: bytes, context: dict) -> None:
        # TODO: Implement attachment storage
        pass

    async def load_attachment(self, attachment_id: str, context: dict) -> bytes | None:
        # TODO: Implement attachment loading
        return None

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        # TODO: Implement attachment deletion
        pass


# Backwards compatibility alias
SimpleMemoryStore = DatabaseStore


# Custom ChatKit Server implementation
class MyChatKitServer(ChatKitServer[dict]):
    def __init__(self, store: SimpleMemoryStore):
        super().__init__(store=store)
        self.store = store

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: dict,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Handle ChatKit requests and stream responses using the agent system"""
        from pathlib import Path
        from agents import Runner
        from agents.mcp import MCPServerStdio
        from backend.agents import orchestrator_agent, urdu_agent, config
        from chatkit.types import AssistantMessageItem, AssistantMessageContent, ThreadItemDoneEvent
        
        print(f"🔍 ChatKit server processing thread: {thread.id}")

        # If this is a thread load request, save it (database will handle duplicates)
        if thread.id:
            await self.store.save_thread(thread, context)

        # If we have a user message, process it with the agent
        if input_user_message:
            # Explicitly save user message to database - ChatKit doesn't call save_item automatically
            if thread.id not in self.store._thread_items:
                self.store._thread_items[thread.id] = []
            await self.store.save_item(thread.id, input_user_message, context)
            print(f"🔍 Processing user message for thread {thread.id}")

            # Use ThreadItemConverter to properly extract all content including quoted/selected text
            from chatkit.agents import ThreadItemConverter
            
            converter = ThreadItemConverter()
            
            # Get all items in this thread for proper context
            all_items = self.store._thread_items.get(thread.id, [])
            
            # Convert thread items to agent input format (preserves quoted text)
            try:
                agent_input = await converter.to_agent_input(all_items)
                print(f"🔍 Converted agent input: {str(agent_input)[:200]}...")
            except Exception as conv_err:
                print(f"⚠️ ThreadItemConverter failed, falling back to manual extraction: {conv_err}")
                # Fallback to manual extraction if converter fails
                agent_input = None
            
            # Extract simple text for logging and fallback
            user_text = ""
            if hasattr(input_user_message, 'content'):
                for content_item in input_user_message.content:
                    if hasattr(content_item, 'text'):
                        user_text = content_item.text
                        break
            
            print(f"🔍 User message text: {user_text}")
            
            if user_text or agent_input:
                try:
                    # Create dynamic MCP server for this request
                    backend_dir = Path(__file__).parent.parent
                    project_root = backend_dir.parent.parent
                    mcp_wrapper_path = backend_dir / "mcp_wrapper.py"

                    server = MCPServerStdio(
                        params={
                            "command": "uv",
                            "args": ["run", "python", str(mcp_wrapper_path)],
                            "cwd": str(project_root)
                        },
                        client_session_timeout_seconds=60
                    )

                    # Connect to MCP server and run agent
                    await server.connect()
                    orchestrator_agent.mcp_servers = [server]
                    urdu_agent.mcp_servers = [server]

                    # Get user ID from context, or query first real user from database
                    user_id = context.get("user_id")
                    if not user_id:
                        user_id = get_dev_user_id()
                    
                    # Use agent_input from converter if available, otherwise build manually
                    if agent_input:
                        # Agent input from converter includes all context including quotes
                        enhanced_input = f"[User: {user_id}]\n{agent_input}"
                        print(f"🔍 Running agent with converted input (includes quotes)")
                    else:
                        # Fallback: Build conversation history manually
                        conversation_history = []
                        if thread.id in self.store._thread_items:
                            for item in self.store._thread_items[thread.id][:-1]:  # Exclude current message
                                if hasattr(item, 'content'):
                                    item_text = ""
                                    for content_item in item.content:
                                        if hasattr(content_item, 'text'):
                                            item_text = content_item.text
                                            break
                                    
                                    if hasattr(item, '__class__'):
                                        class_name = item.__class__.__name__
                                        if 'User' in class_name:
                                            conversation_history.append(f"User: {item_text}")
                                        elif 'Assistant' in class_name:
                                            conversation_history.append(f"Assistant: {item_text}")
                        
                        if conversation_history:
                            history_context = "\n".join(conversation_history)
                            enhanced_input = f"[User: {user_id}]\nConversation History:\n{history_context}\n\nCurrent Message: {user_text}"
                            print(f"🔍 Running agent with {len(conversation_history)} historical messages")
                        else:
                            enhanced_input = f"[User: {user_id}] {user_text}"

                    # Run the agent with MCP tools
                    print(f"🔍 Running agent with input: {enhanced_input[:150]}...")
                    result = await Runner.run(orchestrator_agent, enhanced_input, run_config=config)
                    response_text = result.final_output
                    print(f"✅ Agent response: {response_text[:100]}...")

                    # Cleanup
                    await server.cleanup()
                    orchestrator_agent.mcp_servers = []
                    urdu_agent.mcp_servers = []

                except Exception as e:
                    print(f"❌ Agent error: {str(e)}")
                    # Cleanup on error
                    try:
                        await server.cleanup()
                        orchestrator_agent.mcp_servers = []
                        urdu_agent.mcp_servers = []
                    except:
                        pass
                    response_text = f"I encountered an error processing your request: {str(e)}"
            else:
                response_text = "I didn't receive a message. How can I help you?"
        else:
            # No user message - this might be a thread load request
            response_text = "Hello! I'm your AI Task Assistant. How can I help you manage your tasks today?"

        # Create assistant response
        assistant_item = AssistantMessageItem(
            thread_id=thread.id,
            id=f"msg_{datetime.utcnow().timestamp()}",
            created_at=datetime.utcnow(),
            content=[AssistantMessageContent(text=response_text)],
        )

        # Explicitly save assistant response to database
        await self.store.save_item(thread.id, assistant_item, context)
        
        # Stream the response to ChatKit
        yield ThreadItemDoneEvent(item=assistant_item)


# Initialize the ChatKit server
chatkit_store = SimpleMemoryStore()
chatkit_server = MyChatKitServer(store=chatkit_store)


@router.post("/session")
async def create_chatkit_session(request: Request):
    """Create a ChatKit session using OpenAI ChatKit Sessions API - required for ChatKit to work"""
    print("🔍 Creating ChatKit session via OpenAI ChatKit Sessions API")

    try:
        # Get user context (development bypass)
        user_id = "test-user-123"  # Development bypass
        print(f"🔍 Using user_id: {user_id}")

        # Get OpenAI API key
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            print("❌ OPENAI_API_KEY not found in environment")
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is not configured in backend environment"
            )

        print(f"✅ OPENAI_API_KEY found: {openai_api_key[:15]}...")

        # Use OpenAI ChatKit Sessions API to create a session
        # This returns a proper client_secret token for ChatKit authentication
        session = openai_client.chatkit.sessions.create()

        print(f"✅ ChatKit session created successfully")

        # Return the client_secret in the format ChatKit expects
        return {
            "client_secret": session.client_secret,
        }

    except AttributeError as e:
        # Fallback if chatkit.sessions is not available in this SDK version
        print(f"⚠️ ChatKit sessions API not available: {e}")
        print("⚠️ Falling back to API key passthrough (not recommended for production)")
        
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is not configured"
            )
        
        return {
            "client_secret": openai_api_key,
        }

    except Exception as e:
        print(f"❌ Error creating ChatKit session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create ChatKit session: {str(e)}"
        )


@router.post("/refresh")
async def refresh_chatkit_session(request: Request):
    """Refresh an existing ChatKit session using OpenAI ChatKit Sessions API"""
    print("🔍 Refreshing ChatKit session via OpenAI ChatKit Sessions API")

    try:
        # Get user context (development bypass)
        user_id = "test-user-123"  # Development bypass
        print(f"🔍 Using user_id for refresh: {user_id}")

        # Get OpenAI API key
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            print("❌ OPENAI_API_KEY not found in environment")
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is not configured in backend environment"
            )

        print(f"✅ OPENAI_API_KEY found: {openai_api_key[:15]}...")

        # Use OpenAI ChatKit Sessions API to create a new session (refresh)
        session = openai_client.chatkit.sessions.create()

        print(f"✅ ChatKit session refreshed successfully")

        return {
            "client_secret": session.client_secret,
        }

    except AttributeError as e:
        # Fallback if chatkit.sessions is not available in this SDK version
        print(f"⚠️ ChatKit sessions API not available: {e}")
        
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is not configured"
            )
        
        return {
            "client_secret": openai_api_key,
        }

    except Exception as e:
        print(f"❌ Error refreshing session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh ChatKit session: {str(e)}"
        )


@router.post("")
async def chatkit_endpoint(request: Request):
    """Main ChatKit endpoint - handles all ChatKit operations"""
    print("🔍 Main ChatKit endpoint called")

    try:
        # Try to get user ID from JWT token in Authorization header
        user_id = None
        auth_header = request.headers.get("authorization")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
            try:
                # Verify token and extract user ID
                payload = await verify_token(token)
                user_id = get_user_id_from_token(payload)
                print(f"🔍 Authenticated user from JWT: {user_id}")
            except Exception as e:
                print(f"⚠️ Token validation failed: {str(e)}, falling back to dev user")
        
        # Fallback to first user from database if no valid token
        if not user_id:
            user_id = get_dev_user_id()

        # Create request context
        context = {"user_id": user_id, "request": request}

        # Process the request through ChatKit server
        result = await chatkit_server.process(await request.body(), context)

        if isinstance(result, StreamingResult):
            # Return streaming response
            return StreamingResponse(
                result,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        else:
            # Return JSON response
            return Response(
                content=result.json,
                media_type="application/json"
            )

    except Exception as e:
        print(f"❌ ChatKit endpoint error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"ChatKit processing error: {str(e)}"
        )


@router.get("/health")
async def chatkit_health_check() -> Dict:
    """Check ChatKit configuration status and endpoint availability"""
    openai_key_configured = bool(os.getenv("OPENAI_API_KEY"))

    # Check if store is implemented
    store_implemented = False
    try:
        from backend.store.chatkit_store import ChatKitStore
        # Check if all required methods are implemented
        required_methods = [
            'generate_thread_id', 'generate_item_id', 'load_thread', 'save_thread',
            'load_threads', 'delete_thread', 'load_thread_items', 'add_thread_item',
            'save_item', 'load_item', 'delete_thread_item', 'save_attachment',
            'load_attachment', 'delete_attachment'
        ]
        store_implemented = all(hasattr(ChatKitStore, method) for method in required_methods)
    except ImportError:
        store_implemented = False

    # Check if OpenAI client can be initialized
    session_endpoint_available = False
    try:
        if openai_key_configured:
            from openai import OpenAI
            OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            session_endpoint_available = True
    except Exception:
        session_endpoint_available = False

    status_code = 200 if openai_key_configured and session_endpoint_available and store_implemented else 500

    return {
        "openai_key_configured": openai_key_configured,
        "session_endpoint_available": session_endpoint_available,
        "store_implemented": store_implemented,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


async def get_current_user(authorization: Optional[str] = Header(None, convert_underscores=False)) -> dict:
    """Extract and validate user from Authorization header"""
    if not authorization:
        # In development mode, allow requests without auth
        if os.getenv('ENVIRONMENT') == 'development':
            print("⚠️  No authorization header, using development bypass")
            return {
                "sub": "dev-user-123",
                "id": "dev-user-123",
                "email": "dev@example.com",
                "exp": 9999999999
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )

    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use 'Bearer <token>'"
        )

    token = parts[1]
    return await verify_token(token)