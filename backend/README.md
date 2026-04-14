# 🧠 TeamTrack Pro — Python AI/ML Backend

## Tech Stack
- **Framework:** Python FastAPI
- **Database:** MongoDB (Motor async driver)
- **Auth:** JWT (python-jose + bcrypt)
- **AI/ML:** scikit-learn, NLP, Monte Carlo, TF-IDF
- **API Docs:** Swagger UI (auto-generated)

## ML Engines

| Engine | File | Algorithm |
|--------|------|-----------|
| **Skill Extractor** | `app/ml/skill_extractor.py` | NLP Tokenization + TF-IDF Scoring |
| **Task Analyzer** | `app/ml/task_analyzer.py` | Complexity Classification + Decomposition |
| **Risk Predictor** | `app/ml/risk_predictor.py` | Monte Carlo Simulation + Weighted Scoring |
| **Career Predictor** | `app/ml/career_predictor.py` | Trajectory Analysis + Growth Modeling |
| **Team Ranker** | `app/ml/team_ranker.py` | Multi-Factor Weighted Ranking |
| **Resume Analyzer** | `app/ml/resume_analyzer.py` | ATS Scoring + Keyword Gap Analysis |

## Setup

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment file
cp .env.example .env

# 5. Run the server
python main.py
# Or:
uvicorn app.main:app --reload --port 8000
```

## API Docs
After running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### AI/ML Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/extract-skills` | NLP skill extraction from text |
| POST | `/api/ai/analyze-task` | Task complexity analysis + subtask generation |
| POST | `/api/ai/predict-risk` | Project risk prediction (Monte Carlo) |
| POST | `/api/ai/career-insights` | Career growth prediction |
| POST | `/api/ai/rank-team` | Smart team member ranking |
| POST | `/api/ai/analyze-resume` | ATS resume scoring |
| POST | `/api/ai/match-jd` | Resume vs Job Description matching |
| POST | `/api/ai/generate-summary` | AI professional summary generation |
| GET  | `/api/ai/health` | ML engine health check |
