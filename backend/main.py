"""
TeamTrack Pro - Server Entry Point.
Run with: python main.py
Or with: uvicorn app.main:app --reload --port 8000
"""

import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
