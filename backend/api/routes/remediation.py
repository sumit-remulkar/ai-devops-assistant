"""Remediation API routes."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from ai.agents.remediation_agent import RemediationAgent

router = APIRouter()
remediation_agent = RemediationAgent(dry_run=True)


class RemediateRequest(BaseModel):
    rca: Dict
    auto_execute: Optional[bool] = False


class PlanRequest(BaseModel):
    rca: Dict


@router.post("/plan")
async def generate_plan(request: PlanRequest):
    """Generate a remediation plan from RCA without executing."""
    plan = await remediation_agent.plan(request.rca)
    return plan


@router.post("/execute")
async def execute_remediation(request: RemediateRequest):
    """Execute auto-remediation for given RCA."""
    if request.auto_execute:
        result = await remediation_agent.auto_remediate(request.rca)
    else:
        plan = await remediation_agent.plan(request.rca)
        result = await remediation_agent.execute(plan)
    return result


@router.get("/log")
async def get_execution_log():
    """Get history of executed remediation actions."""
    return {"log": remediation_agent.get_execution_log()}


@router.get("/demo")
async def demo_remediation():
    """Demo remediation with a simulated RCA."""
    demo_rca = {
        "root_cause": "Traffic spike causing CPU overload on production-node-1",
        "confidence": 0.88,
        "severity": "critical",
        "evidence": [
            "CPU at 95% on production-node-1",
            "Requests/sec at 1450",
            "API latency at 2500ms",
        ],
        "recommended_actions": ["Scale api-service to 5 replicas", "Enable rate limiting"],
        "auto_fix_available": True,
    }
    plan = await remediation_agent.plan(demo_rca)
    return plan
