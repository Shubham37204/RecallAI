<div align="center">

# 🧠 Bookmark Brain

**Save any URL. AI reads it. Search it in plain English.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![Qdrant](https://img.shields.io/badge/Qdrant-vector_db-red?style=flat)](https://qdrant.tech)
[![Celery](https://img.shields.io/badge/Celery-async_pipeline-37814A?style=flat)](https://docs.celeryq.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3-orange?style=flat)](https://groq.com)

</div>

---

## What it does

Paste a URL → AI scrapes, summarises, tags, and embeds it → search your entire collection semantically.

```
URL → Scrape → Clean → Summarise (Groq) → Tag (Groq) → Embed (MiniLM) → Qdrant
                                                                              ↓
                                                              Search in plain English
```

---

## Architecture

```
Next.js + Clerk
      │ JWT
  FastAPI
  ├── Postgres (Supabase)   — bookmark metadata + users
  ├── Redis (Upstash)       — Celery broker + rate limiting
  └── Celery Worker
        └── Pipeline
              ├── ScraperStep      trafilatura
              ├── CleanerStep      normalize, truncate 10k
              ├── SummarizerStep   Groq LLaMA-3
              ├── TaggerStep       Groq LLaMA-3
              └── EmbedderStep     all-MiniLM-L6-v2 → Qdrant
```

**Search:** query → embed → Qdrant (user-scoped filter, 0.35 threshold) → Postgres hydration → ranked results

**User isolation:** `user_id` stored in Qdrant payload at index time, filtered at query time. Cross-user leakage structurally impossible.

---

## Stack

| | Technology |
|---|---|
| **Frontend** | Next.js 16, Tailwind v4, shadcn/ui, Clerk |
| **API** | FastAPI, SQLAlchemy async, Alembic |
| **Queue** | Celery, Upstash Redis |
| **Database** | Supabase PostgreSQL |
| **Vector DB** | Qdrant (Docker) |
| **LLM** | Groq (LLaMA-3) |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 (384-dim) |
| **Observability** | structlog, Prometheus |

---

## Key Decisions

**Celery over FastAPI BackgroundTasks** — tasks survive server restarts. Pipeline runs 15–60s; must be decoupled from the HTTP request lifecycle.

**Qdrant over pgvector** — native payload filtering enforces user isolation at retrieval, not post-fetch. Score ordering preserved.

**No LangChain** — pipeline is a linear DAG with explicit step contracts. Direct Groq calls = 50 lines, full debuggability.

**Supabase session pooler (port 5432)** — asyncpg requires persistent connections. Transaction pooler resets state between transactions and breaks prepared statements.

---

## Setup

### Prerequisites
Docker · Python 3.12 · Node 18+ · Supabase · Upstash · Groq · Clerk accounts

### Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt

# Start Qdrant
docker run -d --name bookmark_qdrant -p 6333:6333 \
  -v qdrant_data:/qdrant/storage qdrant/qdrant:v1.14.1

# Migrate + run
alembic upgrade head
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Worker (separate terminal)
python -m celery -A workers.celery_app worker --pool=solo --loglevel=info
```

### Frontend

```bash
cd frontend && npm install && npm run dev
```

### Environment

**`backend/.env`**
```env
DATABASE_URL=postgresql+asyncpg://...        # Supabase session pooler
DATABASE_SYNC_URL=postgresql+psycopg2://...
REDIS_URL=rediss://...                       # Upstash TLS
GROQ_API_KEY=gsk_...
CLERK_JWKS_URL=https://[domain].clerk.accounts.dev/.well-known/jwks.json
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=bookmarks
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
CORS_ORIGINS=http://localhost:3000
APP_ENV=development
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Validation

```bash
cd backend && python -m tests.validate
# 270/270 checks
```

Covers: pipeline steps, search isolation, auth, rate limiting, Postgres/Qdrant consistency, architecture boundaries.

---

## Free Tier Limits

| Service | Limit | Error Code |
|---|---|---|
| Supabase | 15 connections | `SUPABASE_POOL_EXHAUSTED` |
| Upstash Redis | 10k req/day | `REDIS_QUOTA_EXCEEDED` |
| Groq | 30 RPM | `GROQ_RATE_LIMIT` |
| HuggingFace | Rate limited | Set `HF_TOKEN` in `.env` |

All surface as structured JSON with user-facing messages — not raw 500s.

---
