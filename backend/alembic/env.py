import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# ── Path Setup ────────────────────────────────────────────────────────────────
# Add backend/ to sys.path so alembic can import from config + stores
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# ── Import Settings + Models ──────────────────────────────────────────────────
# Settings must be imported BEFORE Base — Base import triggers model registration
from config.settings import get_settings                 # noqa: E402
from stores.postgres.client import Base                # noqa: E402
import stores.postgres.models  # noqa: F401, E402        # registers all models with Base.metadata

settings = get_settings()

# ── Alembic Config ────────────────────────────────────────────────────────────
config = context.config

# Inject real DB URL from settings — overrides placeholder in alembic.ini
# Uses DATABASE_SYNC_URL (psycopg2) — Alembic needs sync driver, not asyncpg
config.set_main_option("sqlalchemy.url", settings.database_sync_url)

# Setup logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate — Alembic diffs this against live DB
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations without DB connection.
    Generates SQL script to stdout instead of executing.
    Used for: reviewing changes, applying manually in prod.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations with live DB connection.
    Standard mode — used for local dev and CI/CD.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,    # NullPool = no connection reuse in migration context
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
    