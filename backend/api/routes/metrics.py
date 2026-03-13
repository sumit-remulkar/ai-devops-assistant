"""Metrics API routes."""
from fastapi import APIRouter, Query
from ai.agents.monitoring_agent import MonitoringAgent

router = APIRouter()
agent = MonitoringAgent()


@router.get("/current")
async def get_current_metrics():
    """Get latest infrastructure metrics snapshot."""
    return agent.get_current_metrics()


@router.get("/history")
async def get_metrics_history(limit: int = Query(default=20, le=100)):
    """Get historical metrics (up to 100 snapshots)."""
    return {"history": agent.get_metrics_history(limit)}


@router.post("/collect")
async def trigger_collection():
    """Manually trigger a metrics collection cycle."""
    result = await agent.run_cycle()
    return {"status": "collected", "new_alerts": len(result["new_alerts"]), "data": result}
