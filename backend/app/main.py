from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import get_settings

settings = get_settings()

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

app.include_router(router)


@app.on_event("startup")
async def startup():
    print(f"✓ Decision Engine API running")
    print(f"✓ CORS origins: {settings.origins_list}")
