from app.core.gemini import run_analysis
from app.models.schemas import AnalyzeRequest


async def analyze_decision(request: AnalyzeRequest) -> dict:
    """
    Business logic layer between the API route and the Gemini client.
    Add caching, rate limiting, or logging here in future.
    """
    result = await run_analysis(
        dilemma=request.dilemma,
        age=request.age or "",
        risk_profile=request.risk_profile or "moderate",
        time_horizon=request.time_horizon or "medium-term",
        api_key=request.api_key,
    )
    return result
