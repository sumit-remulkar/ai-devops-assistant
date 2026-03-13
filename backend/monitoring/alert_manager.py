"""
Alert Manager - Detects threshold breaches and manages alert lifecycle.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum
import uuid
import logging

logger = logging.getLogger(__name__)


class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


@dataclass
class Alert:
    id: str
    title: str
    description: str
    severity: AlertSeverity
    source: str          # node/service name
    metric: str
    value: float
    threshold: float
    status: AlertStatus = AlertStatus.ACTIVE
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    resolved_at: Optional[str] = None
    root_cause: Optional[str] = None
    remediation_applied: Optional[str] = None

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "source": self.source,
            "metric": self.metric,
            "value": self.value,
            "threshold": self.threshold,
            "status": self.status,
            "created_at": self.created_at,
            "resolved_at": self.resolved_at,
            "root_cause": self.root_cause,
            "remediation_applied": self.remediation_applied,
        }


# Thresholds configuration
THRESHOLDS = {
    "cpu_usage": {"high": 80.0, "critical": 90.0},
    "memory_usage": {"high": 75.0, "critical": 88.0},
    "disk_usage": {"high": 70.0, "critical": 85.0},
    "avg_latency_ms": {"high": 500.0, "critical": 1000.0},
    "error_rate": {"high": 3.0, "critical": 7.0},
}


class AlertManager:
    def __init__(self):
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []

    def evaluate_metrics(self, metrics: Dict) -> List[Alert]:
        """Check metrics against thresholds and generate alerts."""
        new_alerts = []

        # Check node metrics
        for node, node_metrics in metrics.get("nodes", {}).items():
            for metric, value in node_metrics.items():
                if metric in THRESHOLDS:
                    alert = self._check_threshold(node, metric, value, "node")
                    if alert:
                        new_alerts.append(alert)

        # Check service metrics
        for svc, svc_metrics in metrics.get("services", {}).items():
            # Check latency
            if "avg_latency_ms" in svc_metrics:
                alert = self._check_threshold(
                    svc, "avg_latency_ms", svc_metrics["avg_latency_ms"], "service"
                )
                if alert:
                    new_alerts.append(alert)
            # Check error rate
            if "error_rate" in svc_metrics:
                alert = self._check_threshold(
                    svc, "error_rate", svc_metrics["error_rate"], "service"
                )
                if alert:
                    new_alerts.append(alert)
            # Check unhealthy status
            if svc_metrics.get("status") == "unhealthy":
                key = f"{svc}_unhealthy"
                if key not in self.active_alerts:
                    alert = Alert(
                        id=str(uuid.uuid4()),
                        title=f"Service {svc} is UNHEALTHY",
                        description=f"Service {svc} health check is failing",
                        severity=AlertSeverity.CRITICAL,
                        source=svc,
                        metric="service_health",
                        value=0,
                        threshold=1,
                    )
                    self.active_alerts[key] = alert
                    new_alerts.append(alert)

        # Check containers
        for container, c_metrics in metrics.get("containers", {}).items():
            if c_metrics.get("status") == "exited":
                key = f"{container}_exited"
                if key not in self.active_alerts:
                    alert = Alert(
                        id=str(uuid.uuid4()),
                        title=f"Container {container} has STOPPED",
                        description=f"Container {container} is in exited state",
                        severity=AlertSeverity.HIGH,
                        source=container,
                        metric="container_status",
                        value=0,
                        threshold=1,
                    )
                    self.active_alerts[key] = alert
                    new_alerts.append(alert)

        return new_alerts

    def _check_threshold(
        self, source: str, metric: str, value: float, resource_type: str
    ) -> Optional[Alert]:
        thresholds = THRESHOLDS.get(metric, {})
        severity = None
        threshold = None

        if value >= thresholds.get("critical", float("inf")):
            severity = AlertSeverity.CRITICAL
            threshold = thresholds["critical"]
        elif value >= thresholds.get("high", float("inf")):
            severity = AlertSeverity.HIGH
            threshold = thresholds["high"]

        if not severity:
            return None

        key = f"{source}_{metric}"
        if key in self.active_alerts:
            return None  # Already active

        alert = Alert(
            id=str(uuid.uuid4()),
            title=f"High {metric.replace('_', ' ').title()} on {source}",
            description=f"{resource_type.capitalize()} {source}: {metric} is {value:.1f}% (threshold: {threshold}%)",
            severity=severity,
            source=source,
            metric=metric,
            value=value,
            threshold=threshold,
        )
        self.active_alerts[key] = alert
        self.alert_history.append(alert)
        logger.warning(f"🚨 ALERT [{severity}]: {alert.title} — {value}")
        return alert

    def acknowledge_alert(self, alert_id: str) -> bool:
        for alert in self.active_alerts.values():
            if alert.id == alert_id:
                alert.status = AlertStatus.ACKNOWLEDGED
                return True
        return False

    def resolve_alert(self, alert_id: str, remediation: str = None) -> bool:
        keys_to_remove = []
        for key, alert in self.active_alerts.items():
            if alert.id == alert_id:
                alert.status = AlertStatus.RESOLVED
                alert.resolved_at = datetime.utcnow().isoformat()
                alert.remediation_applied = remediation
                keys_to_remove.append(key)

        for key in keys_to_remove:
            del self.active_alerts[key]
        return len(keys_to_remove) > 0

    def get_active_alerts(self) -> List[Dict]:
        return [a.to_dict() for a in self.active_alerts.values()]

    def get_alert_history(self, limit: int = 50) -> List[Dict]:
        return [a.to_dict() for a in self.alert_history[-limit:]]
