"""Shared dependency injection for FastAPI."""
from functools import lru_cache
from ai.agents.monitoring_agent import MonitoringAgent
from ai.agents.diagnosis_agent import DiagnosisAgent
from ai.agents.remediation_agent import RemediationAgent


@lru_cache()
def get_monitoring_agent() -> MonitoringAgent:
    return MonitoringAgent()


@lru_cache()
def get_diagnosis_agent() -> DiagnosisAgent:
    return DiagnosisAgent()


@lru_cache()
def get_remediation_agent() -> RemediationAgent:
    return RemediationAgent(dry_run=True)
