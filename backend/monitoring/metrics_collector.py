"""
Metrics Collector - Fetches infrastructure metrics from Prometheus or simulates them.
"""
import asyncio
import random
import time
from datetime import datetime
from typing import Dict, List, Optional
import httpx
import logging

logger = logging.getLogger(__name__)

# Simulated server nodes
NODES = ["production-node-1", "production-node-2", "staging-node-1"]
SERVICES = ["api-service", "auth-service", "payment-service", "notification-service"]
CONTAINERS = ["web-app", "redis", "postgres", "nginx", "celery-worker"]


class MetricsCollector:
    """Collects and stores infrastructure metrics."""

    def __init__(self, prometheus_url: str = "http://localhost:9090"):
        self.prometheus_url = prometheus_url
        self.metrics_store: Dict = {}
        self.history: List[Dict] = []
        self._running = False
        self._use_simulation = True  # Set False when Prometheus is available

    async def fetch_prometheus_metric(self, query: str) -> Optional[float]:
        """Fetch a metric from Prometheus."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{self.prometheus_url}/api/v1/query",
                    params={"query": query},
                )
                data = response.json()
                if data["status"] == "success" and data["data"]["result"]:
                    return float(data["data"]["result"][0]["value"][1])
        except Exception as e:
            logger.warning(f"Prometheus fetch failed: {e}. Using simulation.")
        return None

    def _simulate_metrics(self) -> Dict:
        """Generate realistic simulated metrics."""
        t = time.time()
        # Simulate occasional spikes
        cpu_spike = random.random() < 0.1
        mem_pressure = random.random() < 0.08
        traffic_spike = random.random() < 0.05

        nodes_metrics = {}
        for node in NODES:
            base_cpu = 45 + random.uniform(-10, 10)
            cpu = min(98, base_cpu + (50 if cpu_spike and node == NODES[0] else 0))
            nodes_metrics[node] = {
                "cpu_usage": round(cpu, 1),
                "memory_usage": round(
                    60 + random.uniform(-10, 15) + (25 if mem_pressure else 0), 1
                ),
                "disk_usage": round(55 + random.uniform(-5, 20), 1),
                "network_in": round(random.uniform(10, 200), 1),
                "network_out": round(random.uniform(5, 150), 1),
            }

        services_metrics = {}
        for svc in SERVICES:
            rps = random.uniform(100, 500) * (5 if traffic_spike else 1)
            services_metrics[svc] = {
                "requests_per_sec": round(rps, 1),
                "avg_latency_ms": round(
                    random.uniform(50, 200) + (500 if traffic_spike else 0), 1
                ),
                "error_rate": round(random.uniform(0, 2) + (8 if cpu_spike else 0), 2),
                "status": "running" if random.random() > 0.05 else "unhealthy",
                "replicas": random.choice([1, 2, 3]),
                "cpu_limit_pct": round(random.uniform(20, 90), 1),
                "memory_mb": round(random.uniform(256, 1024), 0),
            }

        containers_metrics = {}
        for c in CONTAINERS:
            containers_metrics[c] = {
                "status": "running" if random.random() > 0.08 else "exited",
                "cpu_pct": round(random.uniform(5, 70), 1),
                "memory_mb": round(random.uniform(64, 512), 0),
                "restarts": random.randint(0, 3),
            }

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "nodes": nodes_metrics,
            "services": services_metrics,
            "containers": containers_metrics,
            "cluster": {
                "total_pods": random.randint(12, 20),
                "running_pods": random.randint(10, 20),
                "failed_pods": random.randint(0, 3),
                "pending_pods": random.randint(0, 2),
                "nodes_ready": len(NODES),
                "nodes_total": len(NODES),
            },
        }

    async def collect(self) -> Dict:
        """Collect current metrics (real or simulated)."""
        if self._use_simulation:
            metrics = self._simulate_metrics()
        else:
            # Try Prometheus
            cpu = await self.fetch_prometheus_metric(
                '100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'
            )
            metrics = self._simulate_metrics()
            if cpu:
                for node in metrics["nodes"]:
                    metrics["nodes"][node]["cpu_usage"] = round(cpu, 1)

        self.metrics_store = metrics
        self.history.append(metrics)
        if len(self.history) > 100:
            self.history = self.history[-100:]
        return metrics

    def get_latest(self) -> Dict:
        return self.metrics_store or self._simulate_metrics()

    def get_history(self, limit: int = 20) -> List[Dict]:
        return self.history[-limit:]

    async def start_collection_loop(self, interval: int = 15):
        """Background loop to collect metrics every N seconds."""
        self._running = True
        logger.info(f"📊 Metrics collection started (interval={interval}s)")
        while self._running:
            await self.collect()
            await asyncio.sleep(interval)

    def stop(self):
        self._running = False
