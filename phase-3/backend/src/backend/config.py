"""Configuration settings using pydantic-settings"""
import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, Field
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Database
    database_url: str

    # JWT Authentication
    better_auth_secret: str

    # CORS
    cors_origins: str = "http://localhost:3000"

    # API Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Development
    debug: bool = False

    # ChatKit Configuration
    openai_api_key: Optional[str] = Field(None, description="OpenAI API key for ChatKit session management")

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Global settings instance
settings = Settings()


def validate_chatkit_config():
    """Validate required environment variables for ChatKit"""
    openai_key = os.getenv("OPENAI_API_KEY") or settings.openai_api_key
    if not openai_key:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is required for ChatKit session management. "
                   "Even when using other AI providers (like Xiaomi), ChatKit "
                   "requires an OpenAI API key for authentication. "
                   "Get one at https://platform.openai.com/api-keys"
        )

    # Basic validation - check if key looks like OpenAI format
    if not openai_key.startswith("sk-"):
        print("⚠️  Warning: OPENAI_API_KEY doesn't match expected format (sk-...)")

    return True