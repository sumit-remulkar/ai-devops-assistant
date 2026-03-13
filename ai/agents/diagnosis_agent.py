"""
Diagnosis Agent - AI-powered root cause analysis.
"""
import json
import logging
from typing import Dict, Optional
from ai.llm.llm_client import LLMClient
from ai.prompts.diagnosis_prompt import DIAGNOSIS_SYSTEM_PROMPT, build_diagnosis_prompt
from backend.diagnosis.root_cause_engine import RootCauseEngine, RootCauseAnalysis
from backend.diagnosis.log_analyzer import LogAnalyzer

logger = logging.getLogger(__name__)


class DiagnosisAgent:
    """AI agent that analyzes incidents and finds root causes."""

    def __init__(self):
        self.llm = LLMClient()
        self.rule_engine = RootCauseEngine()
        self.log_analyzer = LogAnalyzer()

    async def diagnose(self, alert: Dict, metrics: Dict) -> Dict:
        """
        Full diagnosis pipeline:
        1. Get relevant logs
        2. Run heuristic rules
        3. Run AI analysis
        4. Merge and return best result
        """
        logger.info(f"🔍 Diagnosing alert: {alert.get('title')}")

        # Step 1: Gather logs
        source = alert.get("source", "api-service")
        logs = self.log_analyzer.get_simulated_logs(source)

        # Step 2: Heuristic rule-based analysis (fast, no LLM cost)
        heuristic_rca = self.rule_engine.analyze_heuristic(metrics, alert)

        # Step 3: AI-powered analysis
        try:
            prompt = build_diagnosis_prompt(metrics, alert, logs)
            ai_response = await self.llm.complete(DIAGNOSIS_SYSTEM_PROMPT, prompt)
            ai_rca = self._parse_ai_response(ai_response, alert)
        except Exception as e:
            logger.error(f"AI diagnosis error: {e}")
            ai_rca = None

        # Step 4: Merge results (prefer AI if confidence is higher)
        if ai_rca and ai_rca.get("confidence", 0) > (heuristic_rca.confidence if heuristic_rca else 0):
            result = ai_rca
            result["source"] = "ai"
        elif heuristic_rca:
            result = heuristic_rca.to_dict()
            result["source"] = "heuristic"
        else:
            result = {"root_cause": "Unable to determine root cause", "confidence": 0.0}

        result["logs_analyzed"] = logs
        result["alert"] = alert
        return result

    def _parse_ai_response(self, response: str, alert: Dict) -> Optional[Dict]:
        """Parse JSON from AI response."""
        try:
            # Strip markdown code fences if present
            clean = response.strip()
            if clean.startswith("```"):
                clean = clean.split("
", 1)[1]
            if clean.endswith("```"):
                clean = clean.rsplit("```", 1)[0]
            data = json.loads(clean.strip())
            data["alert_id"] = alert.get("id", "unknown")
            return data
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}
Response: {response[:200]}")
            return None
