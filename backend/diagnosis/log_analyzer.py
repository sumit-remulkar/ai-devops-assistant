"""
Log Analyzer - Parse and analyze application/system logs for patterns.
"""
import re
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class LogEntry:
    timestamp: str
    level: LogLevel
    service: str
    message: str
    raw: str


class LogAnalyzer:
    """Analyzes log patterns to help with root cause analysis."""

    ERROR_PATTERNS = {
        "oom_killed": re.compile(r"OOMKilled|out of memory|cannot allocate memory", re.I),
        "connection_refused": re.compile(r"connection refused|ECONNREFUSED", re.I),
        "timeout": re.compile(r"timeout|timed out|deadline exceeded", re.I),
        "disk_full": re.compile(r"no space left|disk full|ENOSPC", re.I),
        "cpu_throttle": re.compile(r"cpu throttl|cfs_throttled|cpu limit", re.I),
        "pod_crash": re.compile(r"CrashLoopBackOff|Back-off restarting", re.I),
        "memory_leak": re.compile(r"memory leak|heap size|GC overhead", re.I),
        "db_connection": re.compile(r"database.*connect|psql.*error|mongo.*timeout", re.I),
        "rate_limit": re.compile(r"rate limit|429|too many requests", re.I),
        "auth_failure": re.compile(r"unauthorized|401|403|auth.*fail", re.I),
    }

    SIMULATED_LOGS = {
        "api-service": [
            "[ERROR] Request timeout after 30s — /api/v1/users",
            "[WARNING] High response time detected: 2500ms",
            "[ERROR] Connection pool exhausted",
            "[INFO] Auto-scaling triggered: replicas 2 -> 4",
            "[ERROR] CPU throttling detected",
        ],
        "auth-service": [
            "[ERROR] Database connection timeout after 10s",
            "[WARNING] Memory usage at 87% of limit",
            "[ERROR] JWT signing failed: key rotation in progress",
            "[INFO] Rate limiting applied to 192.168.1.100",
        ],
        "payment-service": [
            "[ERROR] External payment gateway timeout",
            "[WARNING] Retry attempt 3/5 for transaction ID: abc123",
            "[ERROR] Redis connection refused",
        ],
        "notification-service": [
            "[INFO] Email queue depth: 12450 messages",
            "[WARNING] SMTP connection pool near limit",
            "[ERROR] Message delivery failed: queue overflow",
        ],
    }

    def parse_logs(self, raw_logs: str, service: str = "unknown") -> List[LogEntry]:
        entries = []
        for line in raw_logs.strip().splitlines():
            level = LogLevel.INFO
            for lvl in [LogLevel.CRITICAL, LogLevel.ERROR, LogLevel.WARNING, LogLevel.DEBUG]:
                if lvl.value in line.upper():
                    level = lvl
                    break
            entries.append(
                LogEntry(
                    timestamp=datetime.utcnow().isoformat(),
                    level=level,
                    service=service,
                    message=line,
                    raw=line,
                )
            )
        return entries

    def detect_patterns(self, logs: List[str]) -> Dict[str, List[str]]:
        """Detect error patterns in log lines."""
        found = {}
        for line in logs:
            for pattern_name, regex in self.ERROR_PATTERNS.items():
                if regex.search(line):
                    found.setdefault(pattern_name, []).append(line)
        return found

    def get_simulated_logs(self, service: str) -> List[str]:
        return self.SIMULATED_LOGS.get(service, ["[INFO] Service running normally"])

    def summarize(self, logs: List[str]) -> Dict:
        patterns = self.detect_patterns(logs)
        error_count = sum(1 for l in logs if "ERROR" in l.upper())
        warning_count = sum(1 for l in logs if "WARNING" in l.upper())
        return {
            "total_lines": len(logs),
            "error_count": error_count,
            "warning_count": warning_count,
            "patterns_detected": list(patterns.keys()),
            "pattern_details": patterns,
        }
