import time
import logging
import asyncio
import sys

# MUST BE BEFORE FASTAPI IMPORTS on Windows for Playwright
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers.share import router as share_router
from app.routers.export import router as export_router
from app.core.config import get_settings
from app.api.routes import router as api_router
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

settings = get_settings()

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-5s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("decision-engine")

app = FastAPI(
    title="Decision Engine API",
    description="Backend for the AI-Powered Cognitive Load Monitor",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS — allow the Vercel frontend (and local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}ms)")
    return response


app.include_router(api_router, prefix="/api")
app.include_router(share_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/")
async def root():
    return RedirectResponse(url="/api/docs")

@app.get("/health")
async def health_root():
    return RedirectResponse(url="/api/health")

@app.get("/docs", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url="/api/docs")

@app.on_event("startup")
async def startup():
    print(f"✓ Decision Engine API running")
    print(f"✓ CORS origins: {settings.origins_list}")
