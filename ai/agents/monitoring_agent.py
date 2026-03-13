"""
Monitoring Agent - Orchestrates metric collection and alert generation.
"""
import asyncio
import logging
from typing import Dict, List, Optional
from backend.monitoring.metrics_collector import MetricsCollector
from backend.monitoring.alert_manager import AlertManager, Alert

logger = logging.getLogger(__name__)

_collector = MetricsCollector()
_alert_manager = AlertManager()


class MonitoringAgent:
    """AI agent responsible for infrastructure observability."""

    def __init__(self):
        self.collector = _collector
        self.alert_manager = _alert_manager
        self.is_running = False

    async def run_cycle(self) -> Dict:
        """Single monitoring cycle: collect → evaluate → alert."""
        metrics = await self.collector.collect()
        new_alerts = self.alert_manager.evaluate_metrics(metrics)

        if new_alerts:
            for alert in new_alerts:
                logger.warning(f"🚨 NEW ALERT: {alert.title} [{alert.severity}]")

        return {
            "metrics": metrics,
            "new_alerts": [a.to_dict() for a in new_alerts],
            "active_alerts": self.alert_manager.get_active_alerts(),
        }

    def get_current_metrics(self) -> Dict:
        return self.collector.get_latest()

    def get_metrics_history(self, limit: int = 20) -> List[Dict]:
        return self.collector.get_history(limit)

    def get_active_alerts(self) -> List[Dict]:
        return self.alert_manager.get_active_alerts()

    def get_alert_history(self) -> List[Dict]:
        return self.alert_manager.get_alert_history()

    def acknowledge_alert(self, alert_id: str) -> bool:
        return self.alert_manager.acknowledge_alert(alert_id)

    def resolve_alert(self, alert_id: str, remediation: str = None) -> bool:
        return self.alert_manager.resolve_alert(alert_id, remediation)

    async def start(self, interval: int = 15):
        """Start continuous monitoring."""
        self.is_running = True
        logger.info("👁 MonitoringAgent started")
        while self.is_running:
            await self.run_cycle()
            await asyncio.sleep(interval)

    def stop(self):
        self.is_running = False
        logger.info("👁 MonitoringAgent stopped")
