import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dilemma = Column(String, nullable=True)
    data = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SiteVisit(Base):
    __tablename__ = "site_visits"

    visitor_id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    visit_count = Column(Integer, default=1, nullable=False)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SiteStats(Base):
    __tablename__ = "site_stats"

    id = Column(Integer, primary_key=True, default=1)
    total_visits = Column(Integer, default=0, nullable=False)
