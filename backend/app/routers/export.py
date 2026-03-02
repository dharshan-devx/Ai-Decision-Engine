from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from playwright.sync_api import sync_playwright
import os
import uuid
import time
import asyncio
import logging
from ..database import get_db
from ..db_models import Analysis

router = APIRouter()
logger = logging.getLogger("decision-engine")

FRONTEND_URL = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")[0]

# Basic safety mechanisms
export_lock = asyncio.Lock()
ip_rate_limits = {}
RATE_LIMIT_SECONDS = 10

def generate_pdf_sync(target_url: str) -> bytes:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, 
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        try:
            page = browser.new_page()
            page.goto(target_url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(2000)
            pdf_bytes = page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "20px", "right": "20px", "bottom": "20px", "left": "20px"}
            )
            return pdf_bytes
        finally:
            browser.close()

@router.get("/export/{share_id}")
async def export_pdf(share_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    # 1. IP Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    last_request = ip_rate_limits.get(client_ip, 0)
    
    if now - last_request < RATE_LIMIT_SECONDS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a few seconds.")
    
    ip_rate_limits[client_ip] = now

    # 2. Database Fetch (UUID already validated by FastAPI type hint)
    analysis = db.query(Analysis).filter(Analysis.id == share_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    target_url = f"{FRONTEND_URL}/?id={str(share_id)}&print_mode=true"

    # 3. Prevent multiple simultaneous chromium launches
    if export_lock.locked():
        logger.warning(f"Export requested by {client_ip} but renderer is busy.")
        
    async with export_lock:
        try:
            # Run sync playwright in a completely separate thread
            # This completely avoids the Windows asyncio pipe bug!
            pdf_bytes = await asyncio.to_thread(generate_pdf_sync, target_url)
            
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="decision_analysis_{share_id}.pdf"'}
            )
                
        except Exception as e:
            logger.error(f"Internal PDF Generation Error for {share_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate PDF due to a server rendering error.")
