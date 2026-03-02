from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, FollowUpRequest, FollowUpResponse
from app.services.analyzer import analyze_decision
from app.core.gemini import run_followup
from app.core.ai_status import ai_status
from app.core.rate_limit import limiter
from app.services.document_parser import extract_text_from_file

router = APIRouter()


@router.post("/upload-context")
async def upload_context(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = await extract_text_from_file(content, file.filename)
        return {"success": True, "text": text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/health")
async def health():
    """
    Returns stored AI status. Does NOT make any external API calls.
    Status is updated event-driven from real /analyze and /followup requests.
    """
    return ai_status.to_dict()


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
            raise HTTPException(status_code=429, detail="Gemini API free tier quota exceeded. Please try again later (or enter a paid API key).")
        if "API key not valid" in err_str or "400 INVALID_ARGUMENT" in err_str:
            raise HTTPException(status_code=400, detail="API Key not found or invalid. Please provide a valid Gemini API Key.")
        raise HTTPException(status_code=400, detail=f"Analysis failed: {err_str}")


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
        if "API key not valid" in err_str or "400 INVALID_ARGUMENT" in err_str:
            raise HTTPException(status_code=400, detail="API Key not found or invalid. Please provide a valid Gemini API Key.")
        raise HTTPException(status_code=400, detail=f"Follow-up failed: {err_str}")


@router.post("/health/reset")
async def reset_health():
    """Manual reset of AI status (e.g., after updating API key)."""
    ai_status.reset()
    return {"status": "ok", "message": "AI status reset to unknown", "ai_layer": ai_status.status}


@router.get("/usage")
async def usage(req: Request):
    return limiter.remaining(req)
