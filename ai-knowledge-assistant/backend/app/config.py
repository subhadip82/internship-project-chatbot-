from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Knowledge Assistant"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    CLERK_SECRET_KEY: str = ""
    CLERK_JWKS_URL: str = "https://frank-roughy-42.clerk.accounts.dev/.well-known/jwks.json"
    CLERK_FRONTEND_API_URL: str = "https://frank-roughy-42.clerk.accounts.dev"
    CLERK_API_VERSION: str = "2026-05-12"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma"
    DATABASE_URL: str = "sqlite:///./data/app.db"
    UPLOAD_DIRECTORY: str = "./data/uploads"
    MAX_UPLOAD_SIZE_MB: int = 20
    RAG_TOP_K: int = 10
    CHUNK_SIZE: int = 350
    CHUNK_OVERLAP: int = 80
    FRONTEND_URL: str = "http://localhost:3000"

    ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
