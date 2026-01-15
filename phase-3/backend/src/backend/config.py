"""Configuration settings using pydantic-settings"""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


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

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Global settings instance
settings = Settings()