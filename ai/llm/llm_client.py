"""
LLM Client - Handles communication with Ollama / OpenAI / Anthropic.
"""
import httpx
import os
import json
import logging
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # ollama | openai | anthropic
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")


class LLMClient:
    async def complete(self, system_prompt: str, user_message: str) -> str:
        provider = LLM_PROVIDER.lower()
        if provider == "ollama":
            return await self._ollama(system_prompt, user_message)
        elif provider == "openai":
            return await self._openai(system_prompt, user_message)
        elif provider == "anthropic":
            return await self._anthropic(system_prompt, user_message)
        else:
            return self._mock_response(user_message)

    async def _ollama(self, system_prompt: str, user_message: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{OLLAMA_URL}/api/chat",
                    json={
                        "model": OLLAMA_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "stream": False,
                    },
                )
                data = resp.json()
                return data["message"]["content"]
        except Exception as e:
            logger.warning(f"Ollama error: {e}. Using mock response.")
            return self._mock_response(user_message)

    async def _openai(self, system_prompt: str, user_message: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "temperature": 0.3,
                    },
                )
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"OpenAI error: {e}")
            return self._mock_response(user_message)

    async def _anthropic(self, system_prompt: str, user_message: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                    },
                    json={
                        "model": "claude-3-5-sonnet-20241022",
                        "max_tokens": 1024,
                        "system": system_prompt,
                        "messages": [{"role": "user", "content": user_message}],
                    },
                )
                data = resp.json()
                return data["content"][0]["text"]
        except Exception as e:
            logger.warning(f"Anthropic error: {e}")
            return self._mock_response(user_message)

    def _mock_response(self, user_message: str) -> str:
        """Deterministic mock when LLM is unavailable."""
        return json.dumps({
            "root_cause": "High CPU utilization due to traffic spike causing request queuing",
            "confidence": 0.85,
            "evidence": [
                "CPU usage at 95% on production-node-1",
                "Requests/sec elevated to 1450 (normal: 300)",
                "API latency increased to 2500ms",
            ],
            "recommended_actions": [
                "Immediately scale api-service to 5 replicas",
                "Enable rate limiting at 500 req/s per IP",
                "Review auto-scaling policies",
                "Check if recent deployment caused regression",
            ],
            "severity": "critical",
            "estimated_impact": "30% of API requests failing or timing out",
            "auto_fix_available": True,
            "predictive_risk": "If unaddressed, full service outage within 10-15 minutes",
        })
