from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import uuid
from datetime import datetime

from ..database import get_db
from ..db_models import SiteVisit, SiteStats

router = APIRouter()


class VisitRequest(BaseModel):
    visitor_id: uuid.UUID


class StatsResponse(BaseModel):
    total_visits: int
    unique_users: int


def _increment_total(db: Session) -> int:
    """Atomically increment the global total_visits counter."""
    row = db.query(SiteStats).filter(SiteStats.id == 1).first()
    if not row:
        row = SiteStats(id=1, total_visits=1)
        db.add(row)
    else:
        row.total_visits += 1
    return row.total_visits


@router.post("/stats/visit", status_code=status.HTTP_200_OK)
def record_visit(request: VisitRequest, db: Session = Depends(get_db)):
    try:
        visitor = db.query(SiteVisit).filter(SiteVisit.visitor_id == request.visitor_id).first()
        if visitor:
            visitor.visit_count += 1
            visitor.last_seen = datetime.utcnow()
        else:
            visitor = SiteVisit(visitor_id=request.visitor_id)
            db.add(visitor)

        total = _increment_total(db)
        db.commit()

        unique = db.query(func.count(SiteVisit.visitor_id)).scalar()
        return {"total_visits": total, "unique_users": unique}
    except Exception as e:
        db.rollback()
        return {"total_visits": 0, "unique_users": 0}


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    row = db.query(SiteStats).filter(SiteStats.id == 1).first()
    total = row.total_visits if row else 0
    unique = db.query(func.count(SiteVisit.visitor_id)).scalar()
    return StatsResponse(total_visits=total, unique_users=unique)
