from prometheus_client import (
    CollectorRegistry,
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

registry = CollectorRegistry()


http_requests_total = Counter(
    name="http_requests_total",
    documentation="Total HTTP requests by method, endpoint, status code",
    labelnames=["method", "endpoint", "status"],
    registry=registry,
)

http_request_duration_seconds = Histogram(
    name="http_request_duration_seconds",
    documentation="HTTP request duration in seconds",
    labelnames=["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
    registry=registry,
)


bookmark_jobs_total = Counter(
    name="bookmark_jobs_total",
    documentation="Total bookmark processing jobs by status (queued/completed/failed)",
    labelnames=["status"],
    registry=registry,
)

bookmark_pipeline_duration_seconds = Histogram(
    name="bookmark_pipeline_duration_seconds",
    documentation="Time taken to process a bookmark through full pipeline",
    buckets=[1.0, 2.5, 5.0, 10.0, 30.0, 60.0],
    registry=registry,
)


db_query_duration_seconds = Histogram(
    name="db_query_duration_seconds",
    documentation="Database query duration in seconds",
    labelnames=["operation"],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
    registry=registry,
)

active_celery_tasks = Gauge(
    name="active_celery_tasks",
    documentation="Number of currently active Celery tasks",
    registry=registry,
)


def get_metrics_response() -> tuple[bytes, str]:
    """
    Returns (metrics_bytes, content_type) for /metrics endpoint.
    FastAPI route calls this directly.
    """
    return generate_latest(registry), CONTENT_TYPE_LATEST
