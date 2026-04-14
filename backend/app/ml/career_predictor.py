"""
Career Growth Prediction Engine.
Uses performance trajectory analysis, skill gap identification,
and weighted scoring to predict career paths and suggest improvements.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
import math


# Career progression paths
CAREER_PATHS = {
    "frontend": {
        "Junior Frontend Developer": {"min_tasks": 0, "min_rating": 0, "min_skills": 1},
        "Frontend Developer": {"min_tasks": 15, "min_rating": 3.0, "min_skills": 3},
        "Senior Frontend Developer": {"min_tasks": 50, "min_rating": 4.0, "min_skills": 5},
        "Lead Frontend Engineer": {"min_tasks": 100, "min_rating": 4.5, "min_skills": 7},
        "Frontend Architect": {"min_tasks": 200, "min_rating": 4.7, "min_skills": 10},
    },
    "backend": {
        "Junior Backend Developer": {"min_tasks": 0, "min_rating": 0, "min_skills": 1},
        "Backend Developer": {"min_tasks": 15, "min_rating": 3.0, "min_skills": 3},
        "Senior Backend Developer": {"min_tasks": 50, "min_rating": 4.0, "min_skills": 5},
        "Lead Backend Engineer": {"min_tasks": 100, "min_rating": 4.5, "min_skills": 7},
        "Backend Architect": {"min_tasks": 200, "min_rating": 4.7, "min_skills": 10},
    },
    "fullstack": {
        "Junior Full Stack Developer": {"min_tasks": 0, "min_rating": 0, "min_skills": 2},
        "Full Stack Developer": {"min_tasks": 20, "min_rating": 3.0, "min_skills": 5},
        "Senior Full Stack Developer": {"min_tasks": 60, "min_rating": 4.0, "min_skills": 8},
        "Staff Engineer": {"min_tasks": 120, "min_rating": 4.5, "min_skills": 12},
        "Principal Engineer": {"min_tasks": 250, "min_rating": 4.8, "min_skills": 15},
    },
}

# Course recommendations database
COURSE_DB = {
    "React": [
        {"title": "React - The Complete Guide", "platform": "Udemy", "url": "https://udemy.com/react-complete-guide", "level": "intermediate"},
        {"title": "Advanced React Patterns", "platform": "Frontend Masters", "url": "https://frontendmasters.com/advanced-react", "level": "advanced"},
    ],
    "TypeScript": [
        {"title": "TypeScript Deep Dive", "platform": "Udemy", "url": "https://udemy.com/typescript-deep-dive", "level": "intermediate"},
        {"title": "Production TypeScript", "platform": "egghead.io", "url": "https://egghead.io/typescript", "level": "advanced"},
    ],
    "Python": [
        {"title": "Python for Everybody", "platform": "Coursera", "url": "https://coursera.org/python-everybody", "level": "beginner"},
        {"title": "Advanced Python Programming", "platform": "Udemy", "url": "https://udemy.com/advanced-python", "level": "advanced"},
    ],
    "Docker": [
        {"title": "Docker & Kubernetes Complete Guide", "platform": "Udemy", "url": "https://udemy.com/docker-kubernetes", "level": "intermediate"},
    ],
    "AWS": [
        {"title": "AWS Solutions Architect", "platform": "A Cloud Guru", "url": "https://acloudguru.com/aws-sa", "level": "intermediate"},
    ],
    "Machine Learning": [
        {"title": "ML Specialization", "platform": "Coursera", "url": "https://coursera.org/ml-specialization", "level": "beginner"},
        {"title": "Deep Learning Specialization", "platform": "Coursera", "url": "https://coursera.org/deep-learning", "level": "advanced"},
    ],
    "System Design": [
        {"title": "System Design Interview", "platform": "Educative", "url": "https://educative.io/system-design", "level": "advanced"},
    ],
    "GraphQL": [
        {"title": "GraphQL Complete Course", "platform": "Udemy", "url": "https://udemy.com/graphql-complete", "level": "intermediate"},
    ],
    "Redis": [
        {"title": "Redis University", "platform": "Redis", "url": "https://university.redis.com", "level": "intermediate"},
    ],
    "Microservices": [
        {"title": "Microservices Architecture", "platform": "Udemy", "url": "https://udemy.com/microservices", "level": "advanced"},
    ],
}


class CareerPredictor:
    """
    Predicts career growth trajectory and generates personalized recommendations
    based on user's skills, work history, and performance metrics.
    """

    def predict(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive career insights for a user.
        """
        skills = user_data.get("skills", [])
        tasks_completed = user_data.get("tasks_completed", 0)
        avg_rating = user_data.get("avg_rating", 0)
        work_history = user_data.get("work_history", [])
        current_role = user_data.get("current_role", "Developer")

        # Determine primary domain
        domain = self._detect_domain(skills)

        # Calculate growth score
        growth_score = self._calculate_growth_score(
            tasks_completed, avg_rating, len(skills), work_history
        )

        # Predict next role
        next_role = self._predict_next_role(domain, tasks_completed, avg_rating, len(skills))

        # Identify skill gaps
        skill_gaps = self._identify_skill_gaps(skills, domain, next_role)

        # Generate course recommendations
        courses = self._recommend_courses(skill_gaps, skills)

        # Calculate promotion timeline
        promotion_timeline = self._estimate_promotion_timeline(
            growth_score, tasks_completed, avg_rating
        )

        # Identify strengths
        strengths = self._identify_strengths(skills, work_history, avg_rating)

        # Generate weekly goals
        weekly_goals = self._generate_weekly_goals(skill_gaps, growth_score, tasks_completed)

        # Efficiency tips
        efficiency_tips = self._generate_efficiency_tips(avg_rating, tasks_completed, growth_score)

        return {
            "growth_score": round(growth_score, 1),
            "domain": domain,
            "current_level": self._get_current_level(domain, tasks_completed, avg_rating, len(skills)),
            "next_role": next_role,
            "promotion_timeline": promotion_timeline,
            "skill_gaps": skill_gaps,
            "courses": courses,
            "strengths": strengths,
            "weekly_goals": weekly_goals,
            "efficiency_tips": efficiency_tips,
            "analysis_timestamp": datetime.utcnow().isoformat(),
        }

    def _detect_domain(self, skills: List[str]) -> str:
        """Detect primary domain from skills."""
        frontend_count = 0
        backend_count = 0
        skill_names = [s.lower() if isinstance(s, str) else s.get("name", "").lower() for s in skills]

        frontend_keywords = ["react", "vue", "angular", "css", "html", "tailwind", "frontend", "ui", "ux"]
        backend_keywords = ["python", "node", "django", "fastapi", "express", "database", "sql", "api", "backend"]

        for s in skill_names:
            if any(k in s for k in frontend_keywords):
                frontend_count += 1
            if any(k in s for k in backend_keywords):
                backend_count += 1

        if frontend_count > backend_count * 1.5:
            return "frontend"
        elif backend_count > frontend_count * 1.5:
            return "backend"
        else:
            return "fullstack"

    def _calculate_growth_score(self, tasks: int, rating: float, skill_count: int,
                                 work_history: List) -> float:
        """Calculate overall growth score 0-100."""
        task_score = min(40, (tasks / 100) * 40)
        rating_score = (rating / 5.0) * 30
        skill_score = min(20, (skill_count / 10) * 20)
        experience_score = min(10, len(work_history) * 2)

        return task_score + rating_score + skill_score + experience_score

    def _get_current_level(self, domain: str, tasks: int, rating: float, skills: int) -> str:
        """Determine current career level."""
        path = CAREER_PATHS.get(domain, CAREER_PATHS["fullstack"])
        current = list(path.keys())[0]

        for role, req in path.items():
            if tasks >= req["min_tasks"] and rating >= req["min_rating"] and skills >= req["min_skills"]:
                current = role

        return current

    def _predict_next_role(self, domain: str, tasks: int, rating: float, skills: int) -> Dict:
        """Predict the next career role."""
        path = CAREER_PATHS.get(domain, CAREER_PATHS["fullstack"])
        roles = list(path.items())
        current_idx = 0

        for i, (role, req) in enumerate(roles):
            if tasks >= req["min_tasks"] and rating >= req["min_rating"] and skills >= req["min_skills"]:
                current_idx = i

        if current_idx < len(roles) - 1:
            next_role, next_req = roles[current_idx + 1]
            return {
                "title": next_role,
                "requirements": next_req,
                "tasks_needed": max(0, next_req["min_tasks"] - tasks),
                "rating_needed": max(0, next_req["min_rating"] - rating),
                "skills_needed": max(0, next_req["min_skills"] - skills),
            }

        return {
            "title": "You've reached the top! Consider CTO/VP Engineering roles.",
            "requirements": {},
            "tasks_needed": 0,
            "rating_needed": 0,
            "skills_needed": 0,
        }

    def _identify_skill_gaps(self, skills: List, domain: str, next_role: Dict) -> List[Dict]:
        """Identify skills the user should learn."""
        skill_names = {(s.lower() if isinstance(s, str) else s.get("name", "").lower()) for s in skills}

        recommended_skills = {
            "frontend": ["React", "TypeScript", "GraphQL", "Testing", "System Design", "Docker", "CI/CD"],
            "backend": ["Python", "Docker", "AWS", "Redis", "Microservices", "System Design", "GraphQL"],
            "fullstack": ["React", "Python", "TypeScript", "Docker", "AWS", "GraphQL", "System Design", "Redis"],
        }

        gaps = []
        for skill in recommended_skills.get(domain, []):
            if skill.lower() not in skill_names:
                gaps.append({
                    "skill": skill,
                    "priority": "high" if skill in ["TypeScript", "Docker", "System Design"] else "medium",
                    "reason": f"Essential for {next_role.get('title', 'next level')} role",
                })

        return gaps[:6]

    def _recommend_courses(self, skill_gaps: List[Dict], current_skills: List) -> List[Dict]:
        """Recommend courses based on skill gaps."""
        courses = []
        for gap in skill_gaps:
            skill = gap["skill"]
            if skill in COURSE_DB:
                for course in COURSE_DB[skill]:
                    courses.append({**course, "for_skill": skill})
                    if len(courses) >= 5:
                        return courses
        return courses

    def _estimate_promotion_timeline(self, growth_score: float, tasks: int, rating: float) -> str:
        """Estimate time to next promotion."""
        if growth_score > 80:
            return "1-2 months"
        elif growth_score > 60:
            return "3-4 months"
        elif growth_score > 40:
            return "5-8 months"
        else:
            return "8-12 months"

    def _identify_strengths(self, skills: List, work_history: List, rating: float) -> List[str]:
        """Identify user's top strengths."""
        strengths = []
        if rating >= 4.5:
            strengths.append("Exceptional code quality")
        if rating >= 4.0:
            strengths.append("Consistently delivers high-quality work")
        if len(skills) >= 8:
            strengths.append("Versatile skill set across multiple domains")
        if len(work_history) >= 3:
            strengths.append("Diverse industry experience")

        skill_names = [s if isinstance(s, str) else s.get("name", "") for s in skills]
        if any("react" in s.lower() for s in skill_names):
            strengths.append("Strong frontend architecture skills")
        if any("python" in s.lower() for s in skill_names):
            strengths.append("Solid backend development foundation")

        return strengths[:5]

    def _generate_weekly_goals(self, gaps: List, growth: float, tasks: int) -> List[str]:
        """Generate personalized weekly goals."""
        goals = ["Complete at least 3 tasks with 90%+ quality rating"]

        if gaps:
            goals.append(f"Start learning {gaps[0]['skill']} - complete intro tutorial")
        if growth < 50:
            goals.append("Spend 2 hours on code reviews to improve quality")
        goals.append("Document one completed project for portfolio")
        if tasks < 20:
            goals.append("Take on one stretch task outside comfort zone")

        return goals[:5]

    def _generate_efficiency_tips(self, rating: float, tasks: int, growth: float) -> List[str]:
        """Generate personalized efficiency tips."""
        tips = []
        if rating < 4.0:
            tips.append("Focus on writing tests before implementation (TDD)")
        if tasks < 30:
            tips.append("Break large tasks into smaller, manageable sub-tasks")
        tips.append("Use time-boxing: allocate fixed 25-min focus blocks")
        tips.append("Review and refactor code before marking tasks complete")
        if growth < 60:
            tips.append("Pair program with senior developers for faster learning")

        return tips[:4]


# Singleton
career_predictor = CareerPredictor()
