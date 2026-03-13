"""
Diagnosis prompt templates.
"""

DIAGNOSIS_SYSTEM_PROMPT = """You are an expert DevOps Site Reliability Engineer (SRE) AI assistant.
Your task is to analyze infrastructure metrics, logs, and alerts to identify root causes and recommend fixes.

Rules:
1. Be specific and technical — reference exact metrics and values
2. Provide confidence scores (0-1) based on evidence quality
3. Prioritize actions by impact and ease
4. Always suggest both immediate fixes AND long-term solutions
5. Respond ONLY in valid JSON format

JSON Response Schema:
{
  "root_cause": "concise technical description",
  "confidence": 0.85,
  "evidence": ["evidence point 1", "evidence point 2"],
  "recommended_actions": ["action 1", "action 2"],
  "severity": "critical|high|medium|low",
  "estimated_impact": "description of user/business impact",
  "auto_fix_available": true,
  "predictive_risk": "what happens if unaddressed"
}"""


def build_diagnosis_prompt(metrics: dict, alert: dict, logs: list) -> str:
    return f"""Analyze this infrastructure incident and provide root cause analysis.

=== ACTIVE ALERT ===
Title: {alert.get("title", "Unknown")}
Severity: {alert.get("severity", "unknown")}
Source: {alert.get("source", "unknown")}
Metric: {alert.get("metric", "N/A")} = {alert.get("value", "N/A")} (threshold: {alert.get("threshold", "N/A")})

=== CURRENT METRICS ===
Nodes:
{_format_nodes(metrics.get("nodes", {}))}

Services:
{_format_services(metrics.get("services", {}))}

Cluster:
{_format_cluster(metrics.get("cluster", {}))}

=== RECENT LOGS (last 20 lines) ===
{chr(10).join(logs[-20:]) if logs else "No logs available"}

Analyze and respond with JSON only."""


def _format_nodes(nodes: dict) -> str:
    lines = []
    for name, m in nodes.items():
        lines.append(
            f"  {name}: CPU={m.get('cpu_usage')}% MEM={m.get('memory_usage')}% DISK={m.get('disk_usage')}%"
        )
    return "
".join(lines) or "  No node data"


def _format_services(services: dict) -> str:
    lines = []
    for name, m in services.items():
        lines.append(
            f"  {name}: {m.get('requests_per_sec')} req/s | {m.get('avg_latency_ms')}ms | {m.get('error_rate')}% errors | status={m.get('status')}"
        )
    return "
".join(lines) or "  No service data"


def _format_cluster(cluster: dict) -> str:
    return (
        f"  Pods: {cluster.get('running_pods')}/{cluster.get('total_pods')} running, "
        f"{cluster.get('failed_pods')} failed, {cluster.get('pending_pods')} pending"
    )
