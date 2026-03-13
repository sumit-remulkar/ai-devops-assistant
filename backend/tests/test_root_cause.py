"""Tests for root cause engine."""
import pytest
from backend.diagnosis.root_cause_engine import RootCauseEngine


def test_analyze_heuristic_cpu():
    engine = RootCauseEngine()
    metrics = {
        "nodes": {"node-1": {"cpu_usage": 92.0, "memory_usage": 50.0, "disk_usage": 30.0}},
        "services": {"api": {"requests_per_sec": 1500.0, "avg_latency_ms": 200.0, "error_rate": 1.0}},
        "containers": {},
        "cluster": {"failed_pods": 0, "total_pods": 10, "running_pods": 10},
    }
    alert = {"id": "t1", "title": "High CPU", "severity": "critical", "source": "node-1", "value": 92.0, "threshold": 90.0}
    rca = engine.analyze_heuristic(metrics, alert)
    assert rca is not None
    assert "traffic" in rca.root_cause.lower() or "cpu" in rca.root_cause.lower()
    assert rca.confidence > 0.5


def test_analyze_heuristic_disk():
    engine = RootCauseEngine()
    metrics = {
        "nodes": {"node-1": {"cpu_usage": 40.0, "memory_usage": 50.0, "disk_usage": 85.0}},
        "services": {},
        "containers": {},
        "cluster": {"failed_pods": 0, "total_pods": 5, "running_pods": 5},
    }
    alert = {"id": "t2", "title": "High disk", "severity": "high", "source": "node-1", "value": 85.0, "threshold": 80.0}
    rca = engine.analyze_heuristic(metrics, alert)
    assert rca is not None
    assert "disk" in rca.root_cause.lower()
