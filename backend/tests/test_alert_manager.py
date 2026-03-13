"""Tests for alert manager."""
import pytest
from backend.monitoring.alert_manager import AlertManager, AlertSeverity


def test_evaluate_metrics_no_alerts():
    manager = AlertManager()
    metrics = {
        "nodes": {"node-1": {"cpu_usage": 40.0, "memory_usage": 50.0, "disk_usage": 30.0}},
        "services": {"api": {"avg_latency_ms": 100.0, "error_rate": 0.5, "status": "running"}},
        "containers": {"web": {"status": "running"}},
    }
    alerts = manager.evaluate_metrics(metrics)
    assert len(alerts) == 0


def test_evaluate_metrics_cpu_alert():
    manager = AlertManager()
    metrics = {
        "nodes": {"node-1": {"cpu_usage": 95.0, "memory_usage": 50.0, "disk_usage": 30.0}},
        "services": {},
        "containers": {},
    }
    alerts = manager.evaluate_metrics(metrics)
    assert len(alerts) == 1
    assert alerts[0].severity == AlertSeverity.CRITICAL


def test_acknowledge_alert():
    manager = AlertManager()
    metrics = {
        "nodes": {"node-1": {"cpu_usage": 95.0, "memory_usage": 50.0, "disk_usage": 30.0}},
        "services": {},
        "containers": {},
    }
    alerts = manager.evaluate_metrics(metrics)
    alert_id = alerts[0].id
    result = manager.acknowledge_alert(alert_id)
    assert result is True
