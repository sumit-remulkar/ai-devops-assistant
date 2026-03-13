"""Incident chatbot API route."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from ai.llm.llm_client import LLMClient
from ai.agents.monitoring_agent import MonitoringAgent

router = APIRouter()
llm = LLMClient()
monitoring_agent = MonitoringAgent()

CHATBOT_SYSTEM = """You are an expert DevOps AI assistant integrated into an infrastructure monitoring system.
You have access to real-time metrics and incident data. Be concise, technical, and actionable.
When asked about issues, reference specific metrics if available. Format responses clearly."""


@router.post("/message")
async def chat_message(body: dict):
    """Send a message to the DevOps AI chatbot."""
    user_message = body.get("message", "")
    history = body.get("history", [])

    # Attach current metrics context
    metrics = monitoring_agent.get_current_metrics()
    alerts = monitoring_agent.get_active_alerts()

    context = f"""
Current Infrastructure Context:
- Active Alerts: {len(alerts)}
- Nodes: {list(metrics.get("nodes", {}).keys())}
- Cluster: {metrics.get("cluster", {})}

User question: {user_message}
"""
    response = await llm.complete(CHATBOT_SYSTEM, context)
    return {"response": response, "alerts_count": len(alerts)}
