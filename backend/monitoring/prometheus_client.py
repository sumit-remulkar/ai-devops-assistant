"""
Prometheus HTTP client wrapper.
"""
import httpx
from typing import Optional, Dict, List


class PrometheusClient:
    def __init__(self, base_url: str = "http://localhost:9090"):
        self.base_url = base_url

    async def query(self, promql: str) -> Optional[List[Dict]]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/query",
                    params={"query": promql},
                )
                data = resp.json()
                if data.get("status") == "success":
                    return data["data"]["result"]
        except Exception:
            pass
        return None

    async def query_range(
        self, promql: str, start: str, end: str, step: str = "60s"
    ) -> Optional[List[Dict]]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/query_range",
                    params={"query": promql, "start": start, "end": end, "step": step},
                )
                data = resp.json()
                if data.get("status") == "success":
                    return data["data"]["result"]
        except Exception:
            pass
        return None

    COMMON_QUERIES = {
        "cpu_usage": '100 - (avg by(instance)(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
        "memory_usage": "(1 - node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes) * 100",
        "disk_usage": '100 - (node_filesystem_avail_bytes{mountpoint="/"}/node_filesystem_size_bytes{mountpoint="/"} * 100)',
        "http_requests": 'rate(http_requests_total[5m])',
        "http_errors": 'rate(http_requests_total{status=~"5.."}[5m])',
        "http_latency": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
    }
