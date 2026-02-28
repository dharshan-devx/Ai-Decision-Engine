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


async def run_analysis(dilemma: str, age: str, risk_profile: str, time_horizon: str, api_key: str = None) -> dict:
    settings = get_settings()
    client_key = api_key if api_key else settings.gemini_api_key
    client = genai.Client(api_key=client_key)

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=build_user_prompt(dilemma, age, risk_profile, time_horizon),
        config=genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
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

