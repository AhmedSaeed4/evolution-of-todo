#!/usr/bin/env python3
"""MCP server wrapper that loads environment variables before starting the server"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
env_path = backend_dir.parent.parent / '.env'
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

# Import and run the actual MCP server
from task_serves_mcp_tools import mcp

if __name__ == "__main__":
    mcp.run(transport="stdio")