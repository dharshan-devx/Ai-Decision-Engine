import json
from google import genai
from app.core.config import get_settings

SYSTEM_PROMPT = """You are a world-class strategic advisor — part McKinsey consultant, part Nassim Taleb, part YC partner.
You transform life and career dilemmas into rigorous strategic frameworks with probabilistic reasoning.
You never give motivational fluff. You reason from first principles, quantify uncertainty, and surface hidden assumptions.
You must respond ONLY with valid JSON matching the exact schema provided. No prose. No markdown. Pure JSON."""

JSON_SCHEMA = """
{
  "problemFraming": {
    "coreDecision": "string",
    "hiddenAssumptions": ["string"],
    "decisionHorizon": "string",
    "decisionType": "reversible|irreversible|partially-reversible"
  },
  "constraints": {
    "financial": "string",
    "geographic": "string",
    "skillBased": "string",
    "psychological": "string",
    "time": "string"
  },
  "riskAnalysis": [
    { "name": "string", "score": 0, "level": "low|medium|high", "description": "string" }
  ],
  "opportunityCost": {
    "lostSalary": "string",
    "lostExperience": "string",
    "lostOptionality": "string",
    "socialCapital": "string"
  },
  "skillDelta": {
    "requiredSkills": ["string"],
    "currentSkills": ["string"],
    "gapScore": 0,
    "learningTimeline": "string",
    "criticalGaps": ["string"]
  },
  "strategicPaths": [
    {
      "name": "string",
      "description": "string",
      "timeline": "string",
      "resourceRequirement": "string",
      "successProbability": 0,
      "bestCase": "string",
      "worstCase": "string",
      "reversibilityScore": 0,
      "riskAdjustedValue": "string",
      "recommended": false
    }
  ],
  "probabilisticModel": {
    "shortTerm": { "probability": 0, "horizon": "6-18 months", "description": "string" },
    "midTerm":   { "probability": 0, "horizon": "3 years",     "description": "string" },
    "longTerm":  { "probability": 0, "horizon": "10 years",    "description": "string" }
  },
  "recommendations": {
    "mostRational":    { "choice": "string", "reasoning": "string" },
    "mostAggressive":  { "choice": "string", "reasoning": "string" },
    "mostConservative":{ "choice": "string", "reasoning": "string" },
    "olderSelfView":   { "choice": "string", "reasoning": "string" },
    "highAgencyView":  { "choice": "string", "reasoning": "string" }
  },
  "biasDetection": [
    { "biasName": "string", "description": "string", "mitigation": "string" }
  ],
  "antifragilityScore": {
    "overall": 0,
    "dimensions": {
      "optionality": 0,
      "upSideAsymmetry": 0,
      "stressResilience": 0,
      "learningFromVolatility": 0
    },
    "interpretation": "string"
  },
  "regretMinimization": {
    "at80Analysis": "string",
    "primaryRegretRisk": "string",
    "recommendation": "string"
  },
  "decisionTree": {
    "nodes": [
      { "id": "string", "label": "string", "type": "decision|chance|endpoint", "description": "string" }
    ],
    "edges": [
      { "source": "string", "target": "string", "label": "string" }
    ]
  },
  "confidenceScore": 0,
  "confidenceNote": "string"
}"""

AGENT_A_PROMPT = """You are the 'Optimist/Visionary' agent.
Your goal is to fiercely argue for the highest upside path of the user's dilemma.
Ignore constraints for a moment. What is the absolute best-case scenario? How could this decision lead to massive exponential returns, growth, or wild success?
Be persuasive, bold, and visionary. Keep it under 200 words."""

AGENT_B_PROMPT = """You are the 'Risk Manager / Skeptic' agent.
Your goal is to poke holes in the user's dilemma and find dangerous edge-cases.
What are the hidden traps? What happens if they fail catastrophically? What are the irreversible consequences?
Be ruthless, cynical, and highly analytical. Keep it under 200 words."""

SYNTHESIZER_PROMPT = """You are the 'Synthesizer' agent — a world-class strategic advisor.
You transform life and career dilemmas into rigorous strategic frameworks.
You will be provided the user's dilemma, along with two differing perspectives: an Optimist's view, and a Risk Manager's view.
Use both perspectives to generate a balanced, probabilistic, and highly structured final decision framework.
You must respond ONLY with valid JSON matching the exact schema provided. No prose. No markdown. Pure JSON.
Pay special attention to constructing the `decisionTree` field with logical branching paths (at least 4-5 nodes)."""


def build_agent_prompt(dilemma: str, age: str, risk_profile: str, time_horizon: str, context: str = "") -> str:
    prompt = f"DILEMMA: {dilemma}\nUSER AGE: {age or 'unknown'}\nRISK PROFILE: {risk_profile or 'moderate'}\nTIME HORIZON: {time_horizon or 'medium-term'}\n"
    if context: prompt += f"ADDITIONAL CONTEXT:\n{context}\n\n"
    return prompt

def build_synthesizer_prompt(base_prompt: str, optimist_text: str, risk_manager_text: str) -> str:
    return f"""{base_prompt}
---
OPTIMIST PERSPECTIVE:
{optimist_text}
---
RISK MANAGER PERSPECTIVE:
{risk_manager_text}
---
Be concise in all string values. Return ONLY the following JSON structure:
{JSON_SCHEMA}"""


def repair_json(raw: str) -> dict:
    """Multi-strategy JSON repair for truncated responses."""
    text = raw.strip()

    # Strip markdown fences
    text = text.replace("```json", "").replace("```", "").strip()

    # Strategy 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: extract from first {
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found in response")
    text = text[start:]

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 3: auto-close open structures
    def close_json(s: str) -> str:
        s = s.rstrip().rstrip(",")
        quote_count = s.count('"') - s.count('\\"')
        if quote_count % 2 != 0:
            s += '"'
        braces = brackets = 0
        in_str = False
        for i, c in enumerate(s):
            if c == '"' and (i == 0 or s[i - 1] != "\\"):
                in_str = not in_str
            if not in_str:
                if c == "{":
                    braces += 1
                elif c == "}":
                    braces -= 1
                elif c == "[":
                    brackets += 1
                elif c == "]":
                    brackets -= 1
        while brackets > 0:
            s += "]"
            brackets -= 1
        while braces > 0:
            s += "}"
            braces -= 1
        return s

    try:
        return json.loads(close_json(text))
    except json.JSONDecodeError:
        pass

    raise ValueError("Could not parse or repair AI response JSON")


import asyncio

async def run_analysis(dilemma: str, age: str, risk_profile: str, time_horizon: str, context: str = "", api_key: str = None) -> dict:
    settings = get_settings()
    client_key = api_key if api_key else settings.gemini_api_key
    client = genai.Client(api_key=client_key)

    base_prompt = build_agent_prompt(dilemma, age, risk_profile, time_horizon, context)

    # Run Agent A and Agent B concurrently
    async def run_agent(sys_instruction: str) -> str:
        res = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=base_prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=sys_instruction,
                max_output_tokens=1000,
                temperature=0.8,
            )
        )
        return res.text

    optimist_text, risk_text = await asyncio.gather(
        run_agent(AGENT_A_PROMPT),
        run_agent(AGENT_B_PROMPT)
    )

    # Run Agent C (Synthesizer)
    synth_prompt = build_synthesizer_prompt(base_prompt, optimist_text, risk_text)
    
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=synth_prompt,
        config=genai.types.GenerateContentConfig(
            system_instruction=SYNTHESIZER_PROMPT,
            max_output_tokens=8000,
            temperature=0.7,
        ),
    )

    raw = response.text
    return repair_json(raw)


FOLLOWUP_SYSTEM_PROMPT = """You are a world-class strategic advisor.
You previously provided a rigorous strategic framework for the user's dilemma.
Now, answer their follow-up question strictly based on the provided analysis summary.
Respond in clear, analytical prose (no JSON, no fluff)."""

async def run_followup(dilemma: str, context_summary: str, question: str, api_key: str = None) -> str:
    """Handle follow-up questions using existing analysis context."""
    settings = get_settings()
    client_key = api_key if api_key else settings.gemini_api_key
    client = genai.Client(api_key=client_key)

    followup_prompt = f"""You previously analyzed this decision:

DILEMMA: {dilemma}

Here is a summary of your analysis:
{context_summary}

The user now asks a follow-up question:
"{question}"

Provide a concise, strategic answer (2-4 paragraphs). Stay rigorous and analytical.
Do NOT return JSON — respond in clear prose."""

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=followup_prompt,
        config=genai.types.GenerateContentConfig(
            system_instruction=FOLLOWUP_SYSTEM_PROMPT,
            max_output_tokens=2000,
            temperature=0.7,
        ),
    )

    return response.text.strip()

import time

_last_health_status = True
_last_health_check_time = 0

async def check_api_health(api_key: str = None) -> bool:
    """Check if the Gemini API is reachable and has credits, caching the result for 60 seconds."""
    global _last_health_status, _last_health_check_time
    
    current_time = time.time()
    if current_time - _last_health_check_time < 60:
        return _last_health_status

    settings = get_settings()
    client_key = api_key if api_key else settings.gemini_api_key
    
    # If no key is set at all, we consider it offline
    if not client_key or client_key.strip() == "":
        _last_health_status = False
        _last_health_check_time = current_time
        return False

    client = genai.Client(api_key=client_key)
    try:
        # Minimal request to test quota/connectivity
        await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents="test",
            config=genai.types.GenerateContentConfig(max_output_tokens=5)
        )
        _last_health_status = True
    except Exception:
        # Any exception (quota, auth failure, network) means it's effectively offline for users
        _last_health_status = False
        
    _last_health_check_time = current_time
    return _last_health_status
