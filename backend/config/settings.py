from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central config object. Reads from .env file.
    All modules import get_settings() — never os.environ directly.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: Literal["development", "staging", "production"] = "development"
    app_debug: bool = False
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_version: str = "0.1.0"

    database_url: str = Field(...,
                              description="Async URL for SQLAlchemy runtime")
    database_sync_url: str = Field(...,
                                   description="Sync URL for Alembic migrations")

    redis_url: str = Field(default="redis://localhost:6379/0")
    redis_cache_url: str = Field(default="redis://localhost:6379/1")

    celery_broker_url: str = Field(default="redis://localhost:6379/0")
    celery_result_backend: str = Field(default="redis://localhost:6379/0")
    celery_task_serializer: str = "json"
    celery_result_serializer: str = "json"
    celery_task_max_retries: int = 3
    celery_task_retry_backoff: int = 60
    celery_worker_concurrency: int = 4

    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_url: str | None = None
    qdrant_api_key: str | None = None
    qdrant_collection_name: str = "bookmarks"

    groq_api_key: str = Field(..., description="Groq API key — required")
    groq_model: str = "llama3-8b-8192"
    groq_max_tokens: int = 1024
    groq_temperature: float = 0.2

    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    http_timeout_seconds: int = 30
    scraper_timeout_seconds: int = 20
    scraper_max_redirects: int = 5

    chunk_size: int = 500
    chunk_overlap: int = 50
    vector_top_k: int = 10
    similarity_threshold: float = 0.75

    max_content_length: int = 5_000_000

    clerk_publishable_key: str = Field(...,
                                       description="Clerk publishable key")
    clerk_secret_key: str = Field(..., description="Clerk secret key")
    clerk_jwks_url: str = Field(...,
                                description="Clerk JWKS endpoint for JWT verification")
    clerk_issuer: str | None = Field(default=None, description="Expected Clerk JWT issuer")
    clerk_audience: str | None = Field(default=None, description="Expected Clerk JWT audience")
    clerk_authorized_party: str | None = Field(
        default=None,
        description="Expected Clerk JWT azp claim",
    )

    rate_limit_per_minute: int = 60
    rate_limit_window_seconds: int = 60

    cors_origins: str = "http://localhost:3000"

    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_format: Literal["json", "console"] = "console"
    metrics_enabled: bool = True

    search_max_results: int = 50

    @model_validator(mode="after")
    def validate_runtime_config(self) -> "Settings":
        if self.qdrant_url and (self.qdrant_host != "localhost" or self.qdrant_port != 6333):
            raise ValueError("Use either QDRANT_URL or QDRANT_HOST/QDRANT_PORT, not both.")

        if self.is_production:
            missing = []
            if not self.clerk_issuer:
                missing.append("CLERK_ISSUER")
            if not self.clerk_audience:
                missing.append("CLERK_AUDIENCE")
            if missing:
                raise ValueError(
                    "Missing production JWT validation settings: " + ", ".join(missing)
                )

        return self

    @computed_field
    @property
    def cors_origins_list(self) -> list[str]:
        """Split comma-separated CORS string into list for FastAPI middleware."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @computed_field
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @computed_field
    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    """
    Returns cached Settings instance.

    lru_cache = Settings object created once at startup, reused everywhere.
    In tests, call get_settings.cache_clear() to reset between test cases.

    Usage:
        from config.settings import get_settings
        settings = get_settings()
    """
    return Settings()
