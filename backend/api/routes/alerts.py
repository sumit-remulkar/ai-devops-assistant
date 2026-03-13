"""Alerts API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ai.agents.monitoring_agent import MonitoringAgent

router = APIRouter()
agent = MonitoringAgent()


class AlertAction(BaseModel):
    alert_id: str
    action: str  # acknowledge | resolve
    remediation: Optional[str] = None


@router.get("/active")
async def get_active_alerts():
    """Get all currently active alerts."""
    return {"alerts": agent.get_active_alerts()}


@router.get("/history")
async def get_alert_history():
    """Get historical alert list."""
    return {"alerts": agent.get_alert_history()}


@router.post("/action")
async def alert_action(body: AlertAction):
    """Acknowledge or resolve an alert."""
    if body.action == "acknowledge":
        ok = agent.acknowledge_alert(body.alert_id)
    elif body.action == "resolve":
        ok = agent.resolve_alert(body.alert_id, body.remediation)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    return {"success": ok, "alert_id": body.alert_id, "action": body.action}
