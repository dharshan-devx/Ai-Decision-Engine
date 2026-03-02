from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict
from pydantic import BaseModel
import uuid
from ..database import get_db
from ..db_models import Analysis

router = APIRouter()

class ShareRequest(BaseModel):
    dilemma: str | None = None
    data: Dict[str, Any]

class ShareResponse(BaseModel):
    id: uuid.UUID

@router.post("/share", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
def create_share(request: ShareRequest, db: Session = Depends(get_db)):
    try:
        new_analysis = Analysis(
            dilemma=request.dilemma,
            data=request.data
        )
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        return ShareResponse(id=new_analysis.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save analysis: {str(e)}"
        )

@router.get("/share/{share_id}")
def get_share(share_id: uuid.UUID, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == share_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared analysis not found."
        )
    return {
        "id": str(analysis.id),
        "dilemma": analysis.dilemma,
        "data": analysis.data,
        "created_at": analysis.created_at
    }
