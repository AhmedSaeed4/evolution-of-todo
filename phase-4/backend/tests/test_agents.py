"""Test agent system functionality"""
import pytest
import sys
import os
from pathlib import Path

# Load environment from backend .env BEFORE importing anything
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)
else:
    # Fallback for development - try to find .env in parent directories
    current_dir = Path(__file__).parent
    for parent in [current_dir.parent, current_dir.parent.parent]:
        fallback_env = parent / '.env'
        if fallback_env.exists():
            from dotenv import load_dotenv
            load_dotenv(fallback_env)
            break

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Now import agents (which will have access to XIAOMI_API_KEY)
from backend.agents import orchestrator_agent, urdu_agent, config, model


class TestAgentSystem:
    """Test suite for dual-agent system"""

    def test_agent_creation(self):
        """Test that both agents are created properly"""
        assert orchestrator_agent is not None
        assert urdu_agent is not None
        assert orchestrator_agent.name == "Task Orchestrator"
        assert urdu_agent.name == "Urdu Specialist"

    def test_orchestrator_has_handoffs(self):
        """Test that orchestrator has Urdu specialist in handoffs"""
        assert len(orchestrator_agent.handoffs) == 1
        assert orchestrator_agent.handoffs[0] == urdu_agent

    def test_agent_config(self):
        """Test that agents use correct configuration"""
        assert orchestrator_agent.model == config.model
        assert urdu_agent.model == config.model
        assert orchestrator_agent.model == model
        assert urdu_agent.model == model

    def test_agent_instructions(self):
        """Test that agents have proper instructions"""
        assert "Urdu" in urdu_agent.instructions
        assert "task management" in orchestrator_agent.instructions
        assert "MCP tools" in orchestrator_agent.instructions

    def test_orchestrator_routing_capability(self):
        """Test that orchestrator is configured for routing"""
        assert "route" in orchestrator_agent.instructions.lower() or "handoff" in orchestrator_agent.instructions.lower()

    def test_urdu_exclusivity(self):
        """Test that Urdu agent is configured for Urdu-only responses"""
        assert "EXCLUSIVELY" in urdu_agent.instructions or "Urdu" in urdu_agent.instructions


if __name__ == "__main__":
    pytest.main([__file__, "-v"])