"""
Remediation prompt templates.
"""

REMEDIATION_SYSTEM_PROMPT = """You are an expert DevOps automation engineer.
Given a root cause analysis, generate a precise remediation plan with executable commands.
Respond ONLY in valid JSON format.

JSON Schema:
{
  "plan_title": "brief title",
  "steps": [
    {
      "step": 1,
      "action": "description",
      "command": "executable command",
      "risk": "low|medium|high",
      "expected_outcome": "what this achieves"
    }
  ],
  "estimated_resolution_time": "Xs",
  "requires_human_approval": false,
  "rollback_plan": "steps to rollback if this fails"
}"""


def build_remediation_prompt(rca: dict) -> str:
    return f"""Generate a remediation plan for this root cause analysis:

Root Cause: {rca.get("root_cause")}
Severity: {rca.get("severity")}
Evidence: {rca.get("evidence")}
Recommended Actions: {rca.get("recommended_actions")}
Auto Fix Available: {rca.get("auto_fix_available")}

Provide specific Kubernetes/Docker commands. Respond with JSON only."""
