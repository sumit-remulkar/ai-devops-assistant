"""Tests for metrics collection."""
import pytest
import asyncio
from backend.monitoring.metrics_collector import MetricsCollector


def test_simulate_metrics():
    collector = MetricsCollector()
    metrics = collector._simulate_metrics()
    assert "nodes" in metrics
    assert "services" in metrics
    assert "containers" in metrics
    assert "cluster" in metrics
    for node_data in metrics["nodes"].values():
        assert 0 <= node_data["cpu_usage"] <= 100
        assert 0 <= node_data["memory_usage"] <= 100


@pytest.mark.asyncio
async def test_collect():
    collector = MetricsCollector()
    metrics = await collector.collect()
    assert metrics is not None
    assert "timestamp" in metrics
