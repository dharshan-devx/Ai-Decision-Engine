import json
import asyncio
from google import genai
from app.core.config import get_settings
from app.core.ai_status import ai_status

SYSTEM_PROMPT = """You are a world-class strategic mentor — part visionary founder, part empathetic coach, and part analytical genius.
You transform life and career dilemmas into empowering strategic frameworks.
Your goal is to provide realistic positivity and high-agency guidance. While you must remain rigorous, prioritize finding the 'victory path' over cynicism.
You must respond ONLY with valid JSON matching the exact schema provided. Pure JSON, no prose."""

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
  "voiceBriefing": "string",
  "confidenceScore": 0,
  "confidenceNote": "string"
}"""

AGENT_A_PROMPT = """You are the 'Visionary Optimist'.
Find the path to exponential growth and fulfillment. Argue for the path that maximizes human potential and high agency.
Avoid negativity; instead, focus on how obstacles can be overcome with strategy and grit. Under 200 words."""

AGENT_B_PROMPT = """You are the 'Constructive Realist'.
Identity legitimate hurdles and risks, but don't just point them out—suggest how they can be mitigated or bypassed.
Ensure the user understands the weight of the decision without feeling discouraged. Under 200 words."""

SYNTHESIZER_PROMPT = """You are a World-Class Strategic Mentor.
Your task is to synthesize disparate views into a cohesive, heart-touching, and analytically accurate JSON framework.

**Scoring Realism & Scaling Rules (CRITICAL):**
1. **Full Scale (1-100)**: USE THE FULL 1-100 SPECTRUM. 
   - A 'High' risk MUST be scored 70-100. Never score a 'High' risk as 7 or 8.
   - A 'Low' risk is 1-30.
2. **Avoid Repetition**: Do not use generic numbers like 85 or 95 repeatedly. Use precise, varied numbers (e.g., 72, 88, 64) based on the specific context.
3. **Sentiment Support**: Prioritize constructive, heart-touching language that supports the user's passion while maintaining strategic rigor.

**voiceBriefing Requirements:**
1. Generate an inspiring, heart-felt strategic oration (250-300 words).
2. persona: Empathetic Mentor.
3. Language: {language}.
4. Do NOT read JSON line-by-line. Create a soul-stirring narrative journey through all 11 outcomes.

Return ONLY valid JSON."""


LANGUAGE_MAP = {
    "english": "English",
    "hindi": "Hindi (हिन्दी)",
    "telugu": "Telugu (తెలుగు)",
}

def build_agent_prompt(dilemma: str, age: str, risk_profile: str, time_horizon: str, context: str = "", language: str = "english") -> str:
    prompt = f"DILEMMA: {dilemma}\nUSER AGE: {age or 'unknown'}\nRISK PROFILE: {risk_profile or 'moderate'}\nTIME HORIZON: {time_horizon or 'medium-term'}\n"
    if context: prompt += f"ADDITIONAL CONTEXT:\n{context}\n\n"
    if language and language != "english":
        lang_name = LANGUAGE_MAP.get(language, language)
        prompt += f"\nIMPORTANT: Respond entirely in {lang_name}. All text must be in {lang_name}.\n"
    return prompt

def build_synthesizer_prompt(base_prompt: str, optimist_text: str, risk_manager_text: str, language: str = "english") -> str:
    lang_instruction = ""
    if language and language != "english":
        lang_name = LANGUAGE_MAP.get(language, language)
        lang_instruction = f"\nCRITICAL: ALL string values in the JSON must be written in {lang_name}. Keep JSON keys in English but write ALL values, descriptions, names, and reasoning in {lang_name}.\n"
    return f"""{base_prompt}
---
OPTIMIST PERSPECTIVE:
{optimist_text}
---
RISK MANAGER PERSPECTIVE:
{risk_manager_text}
---
{lang_instruction}Be concise in all string values. Return ONLY the following JSON structure:
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

    # Strategy 3: auto-close open structures using a stack
    def close_json(s: str) -> str:
        s = s.strip()
        import re
        s = re.sub(r',+$', '', s)
        
        quote_count = s.count('"') - s.count('\\"')
        if quote_count % 2 != 0:
            s += '"'
            
        stack = []
        in_str = False
        for i, c in enumerate(s):
            if c == '"' and (i == 0 or s[i - 1] != "\\"):
                in_str = not in_str
            if not in_str:
                if c == "{":
                    stack.append("}")
                elif c == "[":
                    stack.append("]")
                elif c == "}" and stack and stack[-1] == "}":
                    stack.pop()
                elif c == "]" and stack and stack[-1] == "]":
                    stack.pop()
                    
        s = re.sub(r'"[^"]+"\s*:\s*$', 'null', s)
        
        while stack:
            s += stack.pop()
            
        return s

    try:
        return json.loads(close_json(text))
    except json.JSONDecodeError:
        pass

    import os
    with open("debug_gemini.txt", "w", encoding="utf-8") as f:
        f.write(f"--- FAILED TO PARSE AI RESPONSE ---\nLength: {len(raw)}\nContent:\n{raw}\n-----------------------------------")
    
    print(f"--- FAILED TO PARSE AI RESPONSE ---\nLength: {len(raw)}\nContent:\n{raw}\n-----------------------------------")
    raise ValueError("The Strategic Engine encountered a structural synchronization error while processing your complex dilemma. This is usually transient ~ please attempt the analysis again.")


async def run_analysis(dilemma: str, age: str, risk_profile: str, time_horizon: str, context: str = "", api_key: str = None, language: str = "english") -> dict:
    if not api_key and not ai_status.can_attempt_request():
        r = ai_status.get_retry_remaining_seconds()
        raise Exception(f"429 RESOURCE_EXHAUSTED: AI quota exceeded. Try again in {r // 3600}h {(r % 3600) // 60}m.")

    settings = get_settings()
    client_key = api_key if api_key else settings.gemini_api_key
    client = genai.Client(api_key=client_key)

    base_prompt = build_agent_prompt(dilemma, age, risk_profile, time_horizon, context, language)

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

    try:
        optimist_text, risk_text = await asyncio.gather(
            run_agent(AGENT_A_PROMPT),
            run_agent(AGENT_B_PROMPT)
        )

        # Run Agent C (Synthesizer)
        synth_prompt = build_synthesizer_prompt(base_prompt, optimist_text, risk_text, language)
        
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=synth_prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYNTHESIZER_PROMPT,
                max_output_tokens=8000,
                temperature=0.7,
                response_mime_type="application/json",
            ),
        )

        raw = response.text
        result = repair_json(raw)

        # Only report success for server-key requests (not custom keys)
        if not api_key:
            ai_status.report_success()

        return result

    except Exception as e:
        # Only report errors for server-key requests
        if not api_key:
            retry_delay = None
            err_str = str(e).lower()
            if "retrydelay" in err_str or "retry_delay" in err_str or "retry-after" in err_str:
                import re
                match = re.search(r'(?:retrydelay|retry_delay|retry-after).*?([0-9.]+)', err_str)
                if match:
                    try:
                        retry_delay = int(float(match.group(1)))
                    except Exception:
                        pass
            ai_status.report_error(e, retry_delay_seconds=retry_delay)
        raise


FOLLOWUP_SYSTEM_PROMPT = """You are a world-class strategic advisor.
You previously provided a rigorous strategic framework for the user's dilemma.
Now, answer their follow-up question strictly based on the provided analysis summary.
Respond in clear, analytical prose (no JSON, no fluff)."""

async def run_followup(dilemma: str, context_summary: str, question: str, api_key: str = None) -> str:
    """Handle follow-up questions using existing analysis context."""
    if not api_key and not ai_status.can_attempt_request():
        r = ai_status.get_retry_remaining_seconds()
        raise Exception(f"429 RESOURCE_EXHAUSTED: AI quota exceeded. Try again in {r // 3600}h {(r % 3600) // 60}m.")

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

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=followup_prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=FOLLOWUP_SYSTEM_PROMPT,
                max_output_tokens=2000,
                temperature=0.7,
            ),
        )

        # Only report success for server-key requests
        if not api_key:
            ai_status.report_success()

        return response.text.strip()

    except Exception as e:
        if not api_key:
            retry_delay = None
            err_str = str(e).lower()
            if "retrydelay" in err_str or "retry_delay" in err_str or "retry-after" in err_str:
                import re
                match = re.search(r'(?:retrydelay|retry_delay|retry-after).*?([0-9.]+)', err_str)
                if match:
                    try:
                        retry_delay = int(float(match.group(1)))
                    except Exception:
                        pass
            ai_status.report_error(e, retry_delay_seconds=retry_delay)
        raise

