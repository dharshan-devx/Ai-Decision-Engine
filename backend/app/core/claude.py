import json
import anthropic
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
  "confidenceScore": 0,
  "confidenceNote": "string"
}"""


def build_user_prompt(dilemma: str, age: str, risk_profile: str, time_horizon: str) -> str:
    return f"""Analyze this decision with maximum rigor and intellectual honesty:

DILEMMA: {dilemma}
USER AGE: {age or 'unknown'}
RISK PROFILE: {risk_profile or 'moderate'}
TIME HORIZON: {time_horizon or 'medium-term'}

Be concise in all string values (1-2 sentences max per field).
Return ONLY the following JSON structure (no other text):
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


async def run_analysis(dilemma: str, age: str, risk_profile: str, time_horizon: str) -> dict:
    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": build_user_prompt(dilemma, age, risk_profile, time_horizon),
            }
        ],
    )

    raw = "".join(block.text for block in message.content if hasattr(block, "text"))
    return repair_json(raw)
