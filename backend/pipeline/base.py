from __future__ import annotations

from abc import ABC, abstractmethod
from observability.logger import get_logger
from pipeline.state import PipelineState


class BaseStep(ABC):
    """
    Abstract base for all pipeline steps.

    Usage:
        class MyStep(BaseStep):
            name = "my_step"

            async def run(self, state: PipelineState) -> PipelineState:
                # do work, mutate state
                return state
    """

    name: str = "unnamed_step"

    def __init__(self) -> None:
        self.logger = get_logger(f"pipeline.{self.name}")

    @abstractmethod
    async def run(self, state: PipelineState) -> PipelineState:
        """
        Execute this step.

        Args:
            state: shared pipeline state (read inputs, write outputs)

        Returns:
            same state object (mutated in place)

        Rules:
            - Never raise exceptions — catch and call state.mark_failed()
            - Check state.has_error at start — skip if already failed
            - Log start and completion at INFO level
        """
    def _skip_if_failed(self, state: PipelineState) -> bool:
        """
        Helper: returns True if pipeline already failed upstream.
        Steps call this at start to short-circuit cleanly.

        Usage:
            if self._skip_if_failed(state):
                return state
        """
        if state.has_error:
            self.logger.info(
                "step.skipped",
                step=self.name,
                bookmark_id=str(state.bookmark_id),
                reason="upstream_failure",
                failed_step=state.failed_step,
            )
            return True
        return False