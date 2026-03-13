"""
Remediation Agent - Generates and executes fix plans.
"""
import json
import logging
import uuid
from typing import Dict, List, Optional
from ai.llm.llm_client import LLMClient
from ai.prompts.remediation_prompt import REMEDIATION_SYSTEM_PROMPT, build_remediation_prompt
from backend.remediation.fix_strategies import get_fix_strategies, FixType
from backend.remediation.action_executor import ActionExecutor, ExecutionStatus

logger = logging.getLogger(__name__)


class RemediationAgent:
    """AI agent that plans and executes infrastructure fixes."""

    def __init__(self, dry_run: bool = True):
        self.llm = LLMClient()
        self.executor = ActionExecutor(dry_run=dry_run)
        self.dry_run = dry_run

    async def plan(self, rca: Dict) -> Dict:
        """Generate a remediation plan from root cause analysis."""
        logger.info(f"📋 Planning remediation for: {rca.get('root_cause', 'unknown')}")

        # Try AI-generated plan
        try:
            prompt = build_remediation_prompt(rca)
            ai_response = await self.llm.complete(REMEDIATION_SYSTEM_PROMPT, prompt)
            plan = self._parse_plan(ai_response)
            if plan:
                plan["source"] = "ai"
                return plan
        except Exception as e:
            logger.error(f"AI remediation planning error: {e}")

        # Fallback to strategy library
        return self._fallback_plan(rca)

    async def execute(self, plan: Dict) -> Dict:
        """Execute a remediation plan."""
        if not plan.get("steps"):
            return {"status": "skipped", "reason": "No executable steps in plan"}

        results = []
        for step in plan["steps"]:
            command = step.get("command", "")
            if not command or step.get("risk") == "high":
                results.append({
                    "step": step.get("step"),
                    "status": "skipped",
                    "reason": "High risk — manual approval required",
                })
                continue

            result = await self.executor.execute(
                action_id=str(uuid.uuid4()),
                command=command,
            )
            results.append({
                "step": step.get("step"),
                "action": step.get("action"),
                "command": command,
                "status": result.status,
                "output": result.output,
                "duration_ms": result.duration_ms,
            })

        success_count = sum(
            1 for r in results
            if r["status"] in (ExecutionStatus.SUCCESS, ExecutionStatus.DRY_RUN)
        )

        return {
            "plan_title": plan.get("plan_title", "Remediation"),
            "total_steps": len(results),
            "successful_steps": success_count,
            "results": results,
            "dry_run": self.dry_run,
            "status": "completed" if success_count > 0 else "failed",
        }

    async def auto_remediate(self, rca: Dict) -> Dict:
        """Full pipeline: plan → execute."""
        if not rca.get("auto_fix_available"):
            return {
                "status": "manual_required",
                "message": "This issue requires manual intervention",
                "recommended_actions": rca.get("recommended_actions", []),
            }
        plan = await self.plan(rca)
        return await self.execute(plan)

    def _parse_plan(self, response: str) -> Optional[Dict]:
        try:
            clean = response.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            return json.loads(clean)
        except Exception:
            return None

    def _fallback_plan(self, rca: Dict) -> Dict:
        root_cause = rca.get("root_cause", "").lower()
        problem_type = "cpu_high"
        if "memory" in root_cause:
            problem_type = "memory_high"
        elif "disk" in root_cause:
            problem_type = "disk_full"
        elif "container" in root_cause or "crash" in root_cause:
            problem_type = "container_crash"
        elif "latency" in root_cause:
            problem_type = "high_latency"

        strategies = get_fix_strategies(problem_type)
        steps = [
            {
                "step": i + 1,
                "action": s.description,
                "command": s.command.format(
                    service="api-service",
                    container="web-app",
                    new_replicas=5,
                    old_replicas=2,
                ),
                "risk": s.risk_level,
                "expected_outcome": f"Resolves {problem_type}",
            }
            for i, s in enumerate(strategies)
        ]

        return {
            "plan_title": f"Auto-remediation for {problem_type}",
            "steps": steps,
            "estimated_resolution_time": strategies[0].estimated_duration if strategies else "unknown",
            "requires_human_approval": False,
            "rollback_plan": strategies[0].rollback_command if strategies else "",
            "source": "heuristic",
        }

    def get_execution_log(self) -> List[Dict]:
        return self.executor.get_log()
