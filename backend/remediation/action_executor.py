"""
Action Executor - Executes remediation actions (safely with dry-run support).
"""
import asyncio
import subprocess
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"
    DRY_RUN = "dry_run"


@dataclass
class ExecutionResult:
    action_id: str
    command: str
    status: ExecutionStatus
    output: str
    error: str
    duration_ms: float
    executed_at: str
    dry_run: bool

    def to_dict(self) -> Dict:
        return {
            "action_id": self.action_id,
            "command": self.command,
            "status": self.status,
            "output": self.output,
            "error": self.error,
            "duration_ms": self.duration_ms,
            "executed_at": self.executed_at,
            "dry_run": self.dry_run,
        }


class ActionExecutor:
    """Executes infrastructure remediation commands."""

    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.execution_log: List[ExecutionResult] = []

    async def execute(
        self,
        action_id: str,
        command: str,
        timeout: int = 60,
    ) -> ExecutionResult:
        start = datetime.utcnow()
        logger.info(f"▶ Executing action {action_id}: {command} (dry_run={self.dry_run})")

        if self.dry_run:
            await asyncio.sleep(0.5)  # Simulate execution time
            result = ExecutionResult(
                action_id=action_id,
                command=command,
                status=ExecutionStatus.DRY_RUN,
                output=f"[DRY RUN] Would execute: {command}",
                error="",
                duration_ms=500,
                executed_at=start.isoformat(),
                dry_run=True,
            )
            self.execution_log.append(result)
            return result

        # Real execution
        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=timeout
            )
            duration = (datetime.utcnow() - start).total_seconds() * 1000

            status = ExecutionStatus.SUCCESS if proc.returncode == 0 else ExecutionStatus.FAILED
            result = ExecutionResult(
                action_id=action_id,
                command=command,
                status=status,
                output=stdout.decode(),
                error=stderr.decode(),
                duration_ms=duration,
                executed_at=start.isoformat(),
                dry_run=False,
            )
        except asyncio.TimeoutError:
            result = ExecutionResult(
                action_id=action_id,
                command=command,
                status=ExecutionStatus.FAILED,
                output="",
                error=f"Command timed out after {timeout}s",
                duration_ms=timeout * 1000,
                executed_at=start.isoformat(),
                dry_run=False,
            )

        self.execution_log.append(result)
        return result

    def get_log(self, limit: int = 50) -> List[Dict]:
        return [r.to_dict() for r in self.execution_log[-limit:]]
