"""
Root Cause Engine - Combines metrics, logs, and AI to determine root cause.
"""
from typing import Dict, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class RootCauseAnalysis:
    alert_id: str
    root_cause: str
    confidence: float  # 0-1
    evidence: List[str]
    recommended_actions: List[str]
    severity_assessment: str
    estimated_impact: str
    auto_fix_available: bool

    def to_dict(self) -> Dict:
        return {
            "alert_id": self.alert_id,
            "root_cause": self.root_cause,
            "confidence": self.confidence,
            "evidence": self.evidence,
            "recommended_actions": self.recommended_actions,
            "severity_assessment": self.severity_assessment,
            "estimated_impact": self.estimated_impact,
            "auto_fix_available": self.auto_fix_available,
        }


class RootCauseEngine:
    """Heuristic + AI-based root cause analysis."""

    HEURISTIC_RULES = [
        {
            "name": "traffic_spike_cpu",
            "condition": lambda m: (
                any(n.get("cpu_usage", 0) > 85 for n in m.get("nodes", {}).values())
                and any(
                    s.get("requests_per_sec", 0) > 1000
                    for s in m.get("services", {}).values()
                )
            ),
            "cause": "Traffic spike causing CPU overload",
            "confidence": 0.88,
            "actions": ["Enable auto-scaling", "Add more replicas", "Enable rate limiting"],
            "auto_fix": True,
        },
        {
            "name": "memory_leak",
            "condition": lambda m: any(
                n.get("memory_usage", 0) > 85 for n in m.get("nodes", {}).values()
            ),
            "cause": "Memory leak or insufficient memory allocation",
            "confidence": 0.75,
            "actions": ["Restart affected service", "Increase memory limits", "Analyze heap dumps"],
            "auto_fix": True,
        },
        {
            "name": "disk_saturation",
            "condition": lambda m: any(
                n.get("disk_usage", 0) > 80 for n in m.get("nodes", {}).values()
            ),
            "cause": "Disk space exhaustion — log files or data accumulation",
            "confidence": 0.92,
            "actions": ["Clear old logs", "Archive old data", "Expand disk or add volume"],
            "auto_fix": True,
        },
        {
            "name": "high_latency_db",
            "condition": lambda m: any(
                s.get("avg_latency_ms", 0) > 500 for s in m.get("services", {}).values()
            ),
            "cause": "Database bottleneck or slow queries causing high API latency",
            "confidence": 0.70,
            "actions": ["Scale database replicas", "Optimize slow queries", "Enable query cache"],
            "auto_fix": False,
        },
        {
            "name": "container_crash",
            "condition": lambda m: any(
                c.get("status") == "exited" for c in m.get("containers", {}).values()
            ),
            "cause": "Container crash due to OOM kill, unhandled exception, or health check failure",
            "confidence": 0.85,
            "actions": ["Restart container", "Check crash logs", "Review resource limits"],
            "auto_fix": True,
        },
    ]

    def analyze_heuristic(self, metrics: Dict, alert: Dict) -> Optional[RootCauseAnalysis]:
        """Apply rule-based root cause detection."""
        for rule in self.HEURISTIC_RULES:
            try:
                if rule["condition"](metrics):
                    evidence = self._build_evidence(metrics, alert)
                    return RootCauseAnalysis(
                        alert_id=alert.get("id", "unknown"),
                        root_cause=rule["cause"],
                        confidence=rule["confidence"],
                        evidence=evidence,
                        recommended_actions=rule["actions"],
                        severity_assessment=self._assess_severity(alert),
                        estimated_impact=self._estimate_impact(metrics),
                        auto_fix_available=rule["auto_fix"],
                    )
            except Exception as e:
                logger.debug(f"Rule {rule['name']} evaluation error: {e}")

        # Fallback generic analysis
        return RootCauseAnalysis(
            alert_id=alert.get("id", "unknown"),
            root_cause=f"Anomalous behavior detected on {alert.get('source', 'unknown resource')}",
            confidence=0.55,
            evidence=self._build_evidence(metrics, alert),
            recommended_actions=["Investigate manually", "Check recent deployments", "Review system events"],
            severity_assessment=alert.get("severity", "medium"),
            estimated_impact="Partial service degradation",
            auto_fix_available=False,
        )

    def _build_evidence(self, metrics: Dict, alert: Dict) -> List[str]:
        evidence = [
            f"Alert: {alert.get('title', 'N/A')} — value {alert.get('value', 'N/A')} (threshold: {alert.get('threshold', 'N/A')})",
        ]
        # Add metric evidence
        for node, nm in list(metrics.get("nodes", {}).items())[:2]:
            evidence.append(
                f"Node {node}: CPU={nm.get('cpu_usage')}% MEM={nm.get('memory_usage')}% DISK={nm.get('disk_usage')}%"
            )
        for svc, sm in list(metrics.get("services", {}).items())[:2]:
            evidence.append(
                f"Service {svc}: {sm.get('requests_per_sec')} req/s, {sm.get('avg_latency_ms')}ms latency, {sm.get('error_rate')}% errors"
            )
        return evidence

    def _assess_severity(self, alert: Dict) -> str:
        severity_map = {
            "critical": "Production impact — immediate action required",
            "high": "Significant degradation — action required within 15 min",
            "medium": "Performance degraded — action required within 1 hour",
            "low": "Minor issue — monitor and address in next cycle",
        }
        return severity_map.get(alert.get("severity", "medium"), "Unknown severity")

    def _estimate_impact(self, metrics: Dict) -> str:
        failed_pods = metrics.get("cluster", {}).get("failed_pods", 0)
        unhealthy_svcs = sum(
            1 for s in metrics.get("services", {}).values() if s.get("status") == "unhealthy"
        )
        if failed_pods > 2 or unhealthy_svcs > 1:
            return "High — multiple services affected"
        elif failed_pods > 0 or unhealthy_svcs > 0:
            return "Medium — single service degraded"
        return "Low — performance degradation only"
