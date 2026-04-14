"""
TeamTrack Pro - Python FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .core.database import connect_to_database, close_database_connection
from .routes import ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    try:
        await connect_to_database()
    except Exception as e:
        print(f"⚠️  MongoDB not available (running in standalone mode): {e}")
    print("🧠 AI/ML Engines initialized:")
    print("   ├── SkillExtractor (NLP)")
    print("   ├── TaskAnalyzer (Complexity Scoring)")
    print("   ├── RiskPredictor (Monte Carlo)")
    print("   ├── CareerPredictor (Growth Modeling)")
    print("   ├── TeamRanker (Multi-Factor Scoring)")
    print("   └── ResumeAnalyzer (ATS Optimization)")
    print(f"✅ {settings.APP_NAME} is ready!")

    yield

    # Shutdown
    await close_database_connection()
    print(f"👋 {settings.APP_NAME} shut down")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-Powered Project Management & Skill Tracking Platform. "
        "Built with Python FastAPI, featuring NLP-based skill extraction, "
        "Monte Carlo risk prediction, career growth modeling, and ATS resume optimization."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ai.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "ai_health": "/api/ai/health",
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
