"""Diagnosis API routes."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from ai.agents.diagnosis_agent import DiagnosisAgent
from ai.agents.monitoring_agent import MonitoringAgent

router = APIRouter()
diagnosis_agent = DiagnosisAgent()
monitoring_agent = MonitoringAgent()


class DiagnoseRequest(BaseModel):
    alert: Dict


@router.post("/analyze")
async def analyze_alert(request: DiagnoseRequest):
    """Run AI diagnosis on an alert using current metrics."""
    metrics = monitoring_agent.get_current_metrics()
    result = await diagnosis_agent.diagnose(request.alert, metrics)
    return result


@router.get("/demo")
async def demo_diagnosis():
    """Demo diagnosis with a simulated critical alert."""
    demo_alert = {
        "id": "demo-001",
        "title": "High CPU usage on production-node-1",
        "severity": "critical",
        "source": "production-node-1",
        "metric": "cpu_usage",
        "value": 95.2,
        "threshold": 90.0,
    }
    metrics = monitoring_agent.get_current_metrics()
    result = await diagnosis_agent.diagnose(demo_alert, metrics)
    return result
