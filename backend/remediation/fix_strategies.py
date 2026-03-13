"""
Fix Strategies - Maps problems to executable remediation actions.
"""
from typing import Dict, List
from dataclasses import dataclass
from enum import Enum


class FixType(str, Enum):
    SCALE_UP = "scale_up"
    RESTART = "restart"
    CLEAR_LOGS = "clear_logs"
    ROLLBACK = "rollback"
    RATE_LIMIT = "rate_limit"
    CACHE_FLUSH = "cache_flush"
    MANUAL = "manual"
    NOTIFY = "notify"


@dataclass
class FixStrategy:
    fix_type: FixType
    command: str
    description: str
    risk_level: str   # low / medium / high
    estimated_duration: str
    rollback_command: str = ""


FIX_LIBRARY: Dict[str, List[FixStrategy]] = {
    "cpu_high": [
        FixStrategy(
            fix_type=FixType.SCALE_UP,
            command="kubectl scale deployment {service} --replicas={new_replicas}",
            description="Scale up deployment replicas to distribute CPU load",
            risk_level="low",
            estimated_duration="30s",
            rollback_command="kubectl scale deployment {service} --replicas={old_replicas}",
        ),
        FixStrategy(
            fix_type=FixType.RATE_LIMIT,
            command="kubectl apply -f rate-limit-policy.yaml",
            description="Apply rate limiting to reduce incoming traffic",
            risk_level="medium",
            estimated_duration="10s",
        ),
    ],
    "memory_high": [
        FixStrategy(
            fix_type=FixType.RESTART,
            command="kubectl rollout restart deployment/{service}",
            description="Restart service pods to clear memory leak",
            risk_level="medium",
            estimated_duration="60s",
            rollback_command="kubectl rollout undo deployment/{service}",
        ),
    ],
    "disk_full": [
        FixStrategy(
            fix_type=FixType.CLEAR_LOGS,
            command="find /var/log -name '*.log' -mtime +7 -delete && journalctl --vacuum-size=100M",
            description="Delete logs older than 7 days and vacuum systemd logs",
            risk_level="low",
            estimated_duration="15s",
        ),
    ],
    "container_crash": [
        FixStrategy(
            fix_type=FixType.RESTART,
            command="docker restart {container}",
            description="Restart crashed container",
            risk_level="low",
            estimated_duration="10s",
        ),
    ],
    "service_unhealthy": [
        FixStrategy(
            fix_type=FixType.RESTART,
            command="kubectl rollout restart deployment/{service}",
            description="Rolling restart of unhealthy service",
            risk_level="medium",
            estimated_duration="60s",
        ),
        FixStrategy(
            fix_type=FixType.ROLLBACK,
            command="kubectl rollout undo deployment/{service}",
            description="Rollback to previous stable version",
            risk_level="low",
            estimated_duration="45s",
        ),
    ],
    "high_latency": [
        FixStrategy(
            fix_type=FixType.SCALE_UP,
            command="kubectl scale deployment {service} --replicas={new_replicas}",
            description="Add more replicas to handle request load",
            risk_level="low",
            estimated_duration="30s",
        ),
        FixStrategy(
            fix_type=FixType.CACHE_FLUSH,
            command="redis-cli FLUSHDB",
            description="Flush Redis cache to resolve stale cache issues",
            risk_level="medium",
            estimated_duration="5s",
        ),
    ],
}


def get_fix_strategies(problem_type: str) -> List[FixStrategy]:
    return FIX_LIBRARY.get(problem_type, [
        FixStrategy(
            fix_type=FixType.MANUAL,
            command="",
            description="No automated fix available. Manual intervention required.",
            risk_level="high",
            estimated_duration="unknown",
        )
    ])
