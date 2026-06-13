import platform
import ssl

from celery import Celery

from config.settings import get_settings

settings = get_settings()

celery_app = Celery(
    "bookmark_brain",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["workers.tasks"],
)

_ssl_config = {
    "ssl_cert_reqs": ssl.CERT_NONE,
} if settings.celery_broker_url.startswith("rediss://") else None

celery_app.conf.update(
    task_serializer=settings.celery_task_serializer,
    result_serializer=settings.celery_result_serializer,
    accept_content=["json"],
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
    task_ignore_result=False,
    task_max_retries=settings.celery_task_max_retries,
    worker_concurrency=settings.celery_worker_concurrency,
    timezone="UTC",
    enable_utc=True,
    broker_use_ssl=_ssl_config,
    redis_backend_use_ssl=_ssl_config,
    worker_pool="solo" if platform.system() == "Windows" else "prefork",
)
