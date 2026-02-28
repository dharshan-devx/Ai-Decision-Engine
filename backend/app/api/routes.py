from fastapi import APIRouter, HTTPException, Request
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, FollowUpRequest, FollowUpResponse
from app.services.analyzer import analyze_decision
from app.core.gemini import run_followup
from app.core.rate_limit import limiter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, req: Request):
    try:
        if not request.api_key:
            limiter.check(req)
        result = await analyze_decision(request)
        return AnalyzeResponse(success=True, data=result)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        err_str = str(e)
        if "429 RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
            raise HTTPException(status_code=429, detail="Gemini API free tier quota exceeded. Please try again later (or enter a paid API key if supported).")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {err_str}")


@router.post("/followup", response_model=FollowUpResponse)
async def followup(request: FollowUpRequest, req: Request):
    try:
        if not request.api_key:
            limiter.check(req)
        answer = await run_followup(
            dilemma=request.dilemma,
            context_summary=request.context_summary,
            question=request.question,
            api_key=request.api_key,
        )
        return FollowUpResponse(success=True, answer=answer)
    except HTTPException:
        raise
    except Exception as e:
        err_str = str(e)
        if "429 RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
            raise HTTPException(status_code=429, detail="Gemini API free tier quota exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail=f"Follow-up failed: {err_str}")


@router.get("/usage")
async def usage(req: Request):
    return limiter.remaining(req)
