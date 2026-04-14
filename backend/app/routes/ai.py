"""
AI/ML API Routes.
Exposes all ML engines via REST endpoints.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from ..core.security import get_current_user
from ..ml.skill_extractor import skill_extractor
from ..ml.risk_predictor import risk_predictor
from ..ml.career_predictor import career_predictor
from ..ml.team_ranker import team_ranker
from ..ml.resume_analyzer import resume_analyzer
from ..ml.task_analyzer import task_analyzer

router = APIRouter(prefix="/api/ai", tags=["AI/ML"])


# ─── Request Schemas ───

class SkillExtractionRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Text to extract skills from")

class TaskAnalysisRequest(BaseModel):
    title: str
    description: str
    deadline: Optional[str] = None
    priority: str = "medium"

class ProjectRiskRequest(BaseModel):
    tasks: List[Dict[str, Any]]
    members: List[Dict[str, Any]]
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class CareerInsightRequest(BaseModel):
    skills: List[Any]
    tasks_completed: int = 0
    avg_rating: float = 0
    work_history: List[Dict[str, Any]] = []
    current_role: str = "Developer"

class TeamRankingRequest(BaseModel):
    members: List[Dict[str, Any]]
    requirements: Dict[str, Any]
    priority: str = "balanced"

class ResumeAnalysisRequest(BaseModel):
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    summary: Optional[str] = ""
    skills: List[Any] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []

class JDMatchRequest(BaseModel):
    resume: ResumeAnalysisRequest
    job_description: str = Field(..., min_length=10)


# ─── Endpoints ───

@router.post("/extract-skills")
async def extract_skills(req: SkillExtractionRequest):
    """Extract technical and soft skills from text using NLP."""
    skills = skill_extractor.extract_skills(req.text)
    return {"success": True, "data": skills, "count": len(skills)}


@router.post("/analyze-task")
async def analyze_task(req: TaskAnalysisRequest):
    """Analyze a task: generate subtasks, estimate complexity, identify risks."""
    result = task_analyzer.analyze(req.dict())
    return {"success": True, "data": result}


@router.post("/predict-risk")
async def predict_project_risk(req: ProjectRiskRequest):
    """Predict project risk using multi-factor analysis and Monte Carlo simulation."""
    result = risk_predictor.predict_risk(req.dict())
    return {"success": True, "data": result}


@router.post("/career-insights")
async def generate_career_insights(req: CareerInsightRequest):
    """Generate personalized career growth insights and recommendations."""
    result = career_predictor.predict(req.dict())
    return {"success": True, "data": result}


@router.post("/rank-team")
async def rank_team_members(req: TeamRankingRequest):
    """Rank team members for project suitability using weighted scoring."""
    ranked = team_ranker.rank_members(req.members, req.requirements, req.priority)
    return {"success": True, "data": ranked, "count": len(ranked)}


@router.post("/analyze-resume")
async def analyze_resume(req: ResumeAnalysisRequest):
    """Analyze resume for ATS compatibility and provide optimization tips."""
    result = resume_analyzer.analyze_resume(req.dict())
    return {"success": True, "data": result}


@router.post("/match-jd")
async def match_job_description(req: JDMatchRequest):
    """Match resume against a job description for skill alignment."""
    result = resume_analyzer.match_with_jd(req.resume.dict(), req.job_description)
    return {"success": True, "data": result}


@router.post("/generate-summary")
async def generate_summary(req: ResumeAnalysisRequest):
    """Generate an ATS-optimized professional summary."""
    summary = resume_analyzer.generate_optimized_summary(req.dict())
    return {"success": True, "data": {"summary": summary}}


@router.get("/health")
async def ai_health():
    """Check AI/ML services health status."""
    return {
        "success": True,
        "status": "operational",
        "engines": {
            "skill_extractor": "active",
            "task_analyzer": "active",
            "risk_predictor": "active",
            "career_predictor": "active",
            "team_ranker": "active",
            "resume_analyzer": "active",
        },
        "model_version": "2.0.0",
    }
