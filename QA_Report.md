# Quality Assurance Review & Testing Report
**Project Name:** Bookmark Brain (RecallAI)  
**Date of Assessment:** June 12, 2026  
**QA Lead:** Senior QA Engineer (Antigravity AI)  
**Status:** **NOT READY FOR PRODUCTION** (Failed Quality Gates)

---

## 1. Executive Summary & Production-Readiness Verdict

A comprehensive quality assurance review was performed on the Bookmark Brain application, covering backend API robustness, frontend compilation, database migrations, celery tasks, and vector search semantics.

### Production-Readiness Verdict: ❌ **REJECTED**
The codebase contains **1 Critical** issue and **3 High** issues that prevent the application from compiling, starting reliably, or functioning correctly in a multi-user environment. The system **MUST NOT** be deployed to production in its current state.

- **Frontend Compilation:** Broken. The frontend application does not compile due to a missing hook file (`useCreateBookmark.ts`).
- **Semantic Search:** Degraded / Broken. A hardcoded bypass of the user filter in the Qdrant retrieval step causes search results to be empty or return cross-user matches that get filtered out, resulting in empty search results for valid queries.
- **System Stability:** Degraded. The API server will crash on startup if the vector database (Qdrant) is temporarily unreachable.
- **Search Quality:** Degraded. The similarity score threshold is set too high (`0.75`), filtering out valid search results.

---

## 2. Issues Summary Matrix

| ID | Component | Title | Severity | Impact | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QA-01** | Frontend | Frontend Compilation Failure due to Missing `useCreateBookmark.ts` | **Critical** | Prevents application build & deployment | Open |
| **QA-02** | Backend (Search) | Broken Semantic Search User Isolation (App-level vs Retrieval-level Filtering) | **High** | Search returns 0 or incorrect results in multi-user setups | Open |
| **QA-03** | Backend (API) | Unhandled Startup lifespan Exception when Qdrant is Unreachable | **High** | Entire API server crashes on startup if Qdrant is down | Open |
| **QA-04** | Backend (Config) | Overly Restrictive Search Similarity Threshold (`0.75`) | **High** | Valid semantic searches return 0 results (Recall test fails) | Open |
| **QA-05** | Backend (Metrics)| Dead Observability Code — Prometheus Metrics Never Incremented | **Medium** | Metrics endpoint returns empty counters in production | Open |
| **QA-06** | Backend (Schema) | Stale/Incorrect API Documentation in Search Schema | **Medium** | Documentation lists GET request instead of POST request body | Open |
| **QA-07** | Backend (Scraper) | Hardcoded Bot User-Agent Blocks Scraper on Protected Websites | **Low** | Scraper fails with HTTP 403 on websites with basic anti-bot checks | Open |

---

## 3. Detailed Bug Reports

### QA-01: Frontend Compilation Failure due to Missing `useCreateBookmark.ts`
* **Impacted Component:** `frontend/app/page.tsx`, Frontend Web Application.
* **Severity:** **Critical**
* **Description:** The main page component `frontend/app/page.tsx` attempts to import a hook called `useCreateBookmark` from `@/hooks/useCreateBookmark` on line 13. However, this file does not exist in the `frontend/hooks/` directory. This causes a compilation failure, preventing the application from building or running in development mode.
* **Reproducible Steps:**
  1. Open a terminal in the `frontend/` directory.
  2. Run `npm run build` or `npm run dev`.
  3. Observe the build/compilation error: `Module not found: Can't resolve '@/hooks/useCreateBookmark'`.
* **Expected Result:** The imported hook file `useCreateBookmark.ts` exists in the `frontend/hooks/` directory, allowing successful builds.
* **Actual Result:** Build fails immediately because the hook is missing.

---

### QA-02: Broken Semantic Search User Isolation (App-level vs Retrieval-level Filtering)
* **Impacted Component:** `backend/services/search_service.py` (`search_bookmarks` function)
* **Severity:** **High**
* **Description:** In `backend/services/search_service.py` (lines 121-128), the query filter to restrict Qdrant results by `user_id` is disabled via `if False else None`. As a result, Qdrant searches across the *entire* global database collection. If other users have bookmarks with higher similarity scores for the searched terms, those bookmarks occupy all the top-k slots. While Postgres filters out other users' data later, the current user receives `0` or incomplete search results instead of their own matching bookmarks.
* **Reproducible Steps:**
  1. Populate Qdrant with bookmarks from User A (containing the term "Machine Learning") and User B (containing "Deep Learning").
  2. Perform a semantic search as User B for "learning".
  3. Since User A's bookmarks have higher similarity scores, Qdrant returns User A's IDs.
  4. The service fetches the details from Postgres but filters them by User B's ID, matching nothing.
  5. User B receives `0` search results.
* **Expected Result:** Qdrant search should include the `user_id` filter inside the vector search query (`query_filter=Filter(...)`) to return the top-k results *only* for the requesting user.
* **Actual Result:** The filter is disabled, returning global top-k scores and resulting in zero-recall for valid searches.

---

### QA-03: Unhandled Startup lifespan Exception when Qdrant is Unreachable
* **Impacted Component:** `backend/api/main.py` (`lifespan` startup event)
* **Severity:** **High**
* **Description:** During backend server boot, the FastAPI lifespan startup hook calls `await ensure_collection()` without an enclosing `try/except` block. If Qdrant is down, restarting, or experiencing network latency, this database call fails and throws an exception, causing the entire FastAPI server process to crash on startup.
* **Reproducible Steps:**
  1. Stop the local Qdrant service or set an invalid port in `backend/.env` (e.g., `QDRANT_PORT=9999`).
  2. Start the backend application using `uvicorn api.main:app` or run python commands.
  3. Observe that the startup fails and the API process exits immediately.
* **Expected Result:** The API server starts successfully, logging the Qdrant connection failure. The `/health` endpoint should report Qdrant as `error` (503 status code), but standard non-vector endpoints (like `/health/ping`) should remain functional.
* **Actual Result:** Unhandled startup exception crashes the entire backend service process.

---

### QA-04: Overly Restrictive Search Similarity Threshold (`0.75`)
* **Impacted Component:** `backend/config/settings.py` (line 70), `backend/.env` (line 41)
* **Severity:** **High**
* **Description:** The system has configured `SIMILARITY_THRESHOLD=0.75` in the `.env` configuration file. For the lightweight `all-MiniLM-L6-v2` embedding model, relevant cosine similarity scores typically fall between `0.4` and `0.7`. Under the current configuration, relevant results are discarded, causing semantic searches to fail.
* **Reproducible Steps:**
  1. Seed a bookmark with the content from `https://lilianweng.github.io/posts/2023-06-23-agent/` and wait for processing to complete.
  2. Search for "language model agents memory planning tools".
  3. Observe that search returns `0` results.
  4. Check the validation script results: `❌ FAIL Recall: agent query finds results (0 results — embedding/Qdrant threshold issue)`.
* **Expected Result:** A reasonable threshold (e.g. `0.3` to `0.45` as suggested in code comments) should be set to yield semantically matching results.
* **Actual Result:** A high threshold of `0.75` completely filters out correct hits.

---

### QA-05: Dead Observability Code — Prometheus Metrics Never Incremented
* **Impacted Component:** `backend/observability/metrics.py`, `backend/api/main.py`
* **Severity:** **Medium**
* **Description:** The project defines Prometheus metrics (such as `http_requests_total`, `http_request_duration_seconds`, etc.) inside `backend/observability/metrics.py` and exposes a `/metrics` scrape route in `api/main.py`. However, these metrics are never updated by any middleware or route logic. They are dead code, resulting in empty metrics telemetry in production.
* **Reproducible Steps:**
  1. Make multiple API calls to the server (e.g., GET `/health/ping`).
  2. Retrieve the metrics endpoint: `GET /metrics`.
  3. Notice that `http_requests_total` does not show any recorded request data.
* **Expected Result:** Request and task metrics are recorded automatically on every endpoint invocation.
* **Actual Result:** Telemetry remains empty because the metrics are never incremented.

---

### QA-06: Stale/Incorrect API Documentation in Search Schema
* **Impacted Component:** `backend/schemas/search.py` (line 21)
* **Severity:** **Medium**
* **Description:** The `SearchRequest` schema docstring describes it as "GET /search query parameters" and states that "route uses FastAPI Query() directly". However, search was implemented as a `POST /search` endpoint using a JSON body.
* **Reproducible Steps:**
  1. Statically review `backend/schemas/search.py` (lines 21–25).
  2. Compare with `backend/api/routers/search.py` (line 39) showing `@router.post("")`.
* **Expected Result:** Documentation and comments should match the actual HTTP verb and format.
* **Actual Result:** Stale comments misinform developers about the HTTP protocol structure.

---

### QA-07: Hardcoded Bot User-Agent Blocks Scraper on Protected Websites
* **Impacted Component:** `backend/pipeline/scraper.py` (line 122)
* **Severity:** **Low**
* **Description:** The HTTP client in the scraper uses a hardcoded User-Agent `Mozilla/5.0 (compatible; BookmarkBrain/1.0)`. Many web hosting servers and CDNs (e.g., Cloudflare) automatically block non-standard user agents, leading to high scraping failure rates.
* **Reproducible Steps:**
  1. Scrape a website that enforces basic bot protection.
  2. Observe that the pipeline fails in the `scraper` step with an HTTP 403 Forbidden status code.
* **Expected Result:** The scraper should use a modern web browser User-Agent (or rotate user agents) to maximize indexing rate.
* **Actual Result:** The default bot header triggers security blocks.

---

## 4. Recommendations and Action Plan

1. **Fix Frontend Compilation immediately:** Create `frontend/hooks/useCreateBookmark.ts` to implement the bookmark saving flow using Clerk auth tokens, or remove/rewrite the import if the hook was refactored.
2. **Enable Qdrant User Filter:** Update `backend/services/search_service.py` to filter Qdrant vectors by `user_id` inside the Qdrant query itself rather than applying it post-fetch:
   ```python
   query_filter=Filter(
       must=[
           FieldCondition(
               key="user_id",
               match=MatchValue(value=user_id),
           )
       ]
   )
   ```
3. **Handle lifespan exceptions gracefully:** Enclose `await ensure_collection()` inside a `try/except` block in `backend/api/main.py` to allow the FastAPI server to start even if Qdrant is temporarily offline.
4. **Lower Search Similarity Threshold:** Adjust `SIMILARITY_THRESHOLD` in `.env` to a reasonable default value (e.g., `0.35` or `0.4`) to balance precision and recall.
5. **Register Observability Middleware:** Integrate standard Prometheus instrumentation middleware in FastAPI to record metrics for request count and latency.
6. **Update Scraper User-Agent:** Replace the bot User-Agent string with a standard Chrome/Firefox User-Agent.
