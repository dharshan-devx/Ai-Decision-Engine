import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import get_settings

settings = get_settings()

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-5s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("decision-engine")

app = FastAPI(
    title="AI Decision Engine",
    description="Structured strategic thinking system powered by Gemini AI",
    version="1.0.0",
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


from app.api.routes import router

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup():
    print(f"✓ Decision Engine API running")
    print(f"✓ CORS origins: {settings.origins_list}")
