"""
AI Task Analysis Engine.
Breaks down complex tasks into subtasks, estimates complexity,
identifies required skills, and detects risk factors.
"""

import re
from typing import List, Dict, Any
from .skill_extractor import skill_extractor


# Complexity indicators
HIGH_COMPLEXITY_KEYWORDS = [
    "architecture", "migration", "refactor", "optimization", "security",
    "authentication", "authorization", "database design", "api design",
    "deployment", "infrastructure", "scalability", "performance",
    "real-time", "websocket", "microservice", "distributed",
    "machine learning", "ai", "algorithm", "integration",
]

MEDIUM_COMPLEXITY_KEYWORDS = [
    "implement", "build", "create", "develop", "feature",
    "component", "module", "service", "endpoint", "page",
    "form", "validation", "testing", "dashboard", "chart",
]

LOW_COMPLEXITY_KEYWORDS = [
    "fix", "bug", "update", "change", "modify", "style",
    "css", "typo", "rename", "cleanup", "format", "docs",
    "readme", "comment", "log", "color", "font", "spacing",
]

# Subtask templates by task type
SUBTASK_TEMPLATES = {
    "api": [
        {"title": "Design API schema and endpoints", "hours": 2},
        {"title": "Implement data models/schemas", "hours": 2},
        {"title": "Build controller/route logic", "hours": 3},
        {"title": "Add input validation", "hours": 1},
        {"title": "Write unit tests", "hours": 2},
        {"title": "Add error handling", "hours": 1},
        {"title": "Document API endpoints", "hours": 1},
    ],
    "frontend": [
        {"title": "Create component structure", "hours": 1},
        {"title": "Build UI layout with styling", "hours": 3},
        {"title": "Implement state management", "hours": 2},
        {"title": "Add form validation", "hours": 1},
        {"title": "Connect to API endpoints", "hours": 2},
        {"title": "Add loading and error states", "hours": 1},
        {"title": "Test responsiveness", "hours": 1},
    ],
    "auth": [
        {"title": "Design auth flow", "hours": 1},
        {"title": "Implement registration endpoint", "hours": 2},
        {"title": "Implement login with JWT", "hours": 2},
        {"title": "Add password hashing", "hours": 1},
        {"title": "Build token refresh mechanism", "hours": 2},
        {"title": "Add role-based access control", "hours": 2},
        {"title": "Test auth edge cases", "hours": 2},
    ],
    "database": [
        {"title": "Design database schema", "hours": 2},
        {"title": "Create migration scripts", "hours": 1},
        {"title": "Implement CRUD operations", "hours": 3},
        {"title": "Add indexing for performance", "hours": 1},
        {"title": "Write seed data scripts", "hours": 1},
        {"title": "Test database operations", "hours": 2},
    ],
    "general": [
        {"title": "Analyze requirements", "hours": 1},
        {"title": "Plan implementation approach", "hours": 1},
        {"title": "Implement core logic", "hours": 3},
        {"title": "Add edge case handling", "hours": 1},
        {"title": "Write tests", "hours": 2},
        {"title": "Code review and refactor", "hours": 1},
    ],
}


class TaskAnalyzer:
    """
    Analyzes task descriptions to generate subtasks, estimate complexity,
    identify required skills, and detect potential risks.
    """

    def analyze(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full task analysis.
        
        Input: {title, description, deadline?, priority?}
        Output: {subtasks, complexity, skills, risks, suggestions, estimated_hours}
        """
        title = task_data.get("title", "")
        description = task_data.get("description", "")
        deadline = task_data.get("deadline")
        priority = task_data.get("priority", "medium")

        full_text = f"{title} {description}"

        # Detect task type
        task_type = self._detect_task_type(full_text)

        # Calculate complexity
        complexity = self._calculate_complexity(full_text, priority)

        # Extract required skills
        extracted_skills = skill_extractor.extract_skills(full_text)

        # Generate subtasks
        subtasks = self._generate_subtasks(full_text, task_type, complexity)

        # Estimate total time
        total_hours = sum(st["estimated_hours"] for st in subtasks)

        # Identify risks
        risks = self._identify_risks(full_text, complexity, deadline, priority)

        # Generate suggestions
        suggestions = self._generate_suggestions(task_type, complexity, extracted_skills)

        return {
            "task_type": task_type,
            "complexity_score": complexity,
            "complexity_label": self._complexity_label(complexity),
            "estimated_total_hours": total_hours,
            "subtasks": subtasks,
            "required_skills": [
                {"name": s["name"], "category": s["category"], "confidence": s["confidence"]}
                for s in extracted_skills[:8]
            ],
            "risk_factors": risks,
            "suggestions": suggestions,
            "priority_assessment": self._assess_priority(complexity, deadline, priority),
        }

    def _detect_task_type(self, text: str) -> str:
        """Detect the type of task from description."""
        text_lower = text.lower()

        if any(kw in text_lower for kw in ["api", "endpoint", "route", "backend", "server"]):
            return "api"
        elif any(kw in text_lower for kw in ["auth", "login", "register", "password", "jwt", "token"]):
            return "auth"
        elif any(kw in text_lower for kw in ["database", "schema", "model", "migration", "mongodb", "sql"]):
            return "database"
        elif any(kw in text_lower for kw in ["ui", "component", "page", "frontend", "react", "css", "form", "dashboard"]):
            return "frontend"
        else:
            return "general"

    def _calculate_complexity(self, text: str, priority: str) -> int:
        """Calculate task complexity score 1-10."""
        text_lower = text.lower()
        score = 3  # Base

        # Keyword-based scoring
        high_count = sum(1 for kw in HIGH_COMPLEXITY_KEYWORDS if kw in text_lower)
        med_count = sum(1 for kw in MEDIUM_COMPLEXITY_KEYWORDS if kw in text_lower)
        low_count = sum(1 for kw in LOW_COMPLEXITY_KEYWORDS if kw in text_lower)

        score += high_count * 1.5
        score += med_count * 0.5
        score -= low_count * 0.3

        # Priority adjustment
        if priority == "urgent":
            score += 1
        elif priority == "high":
            score += 0.5

        # Word count factor (longer descriptions = more complex)
        word_count = len(text.split())
        if word_count > 100:
            score += 1
        elif word_count > 50:
            score += 0.5

        return max(1, min(10, round(score)))

    def _generate_subtasks(self, text: str, task_type: str, complexity: int) -> List[Dict]:
        """Generate subtasks based on task type and complexity."""
        templates = SUBTASK_TEMPLATES.get(task_type, SUBTASK_TEMPLATES["general"])

        # Adjust number of subtasks based on complexity
        if complexity <= 3:
            templates = templates[:3]
        elif complexity <= 6:
            templates = templates[:5]

        subtasks = []
        for i, template in enumerate(templates):
            # Adjust hours based on complexity
            hour_multiplier = 1 + (complexity - 5) * 0.2
            adjusted_hours = max(0.5, round(template["hours"] * hour_multiplier, 1))

            subtasks.append({
                "order": i + 1,
                "title": template["title"],
                "estimated_hours": adjusted_hours,
                "completed": False,
                "dependencies": [i] if i > 0 else [],
            })

        return subtasks

    def _identify_risks(self, text: str, complexity: int, deadline: str, priority: str) -> List[Dict]:
        """Identify potential risk factors."""
        risks = []
        text_lower = text.lower()

        if complexity >= 7:
            risks.append({
                "type": "high_complexity",
                "severity": "high",
                "message": "Task has high complexity — consider pair programming or code review checkpoints",
            })

        if any(kw in text_lower for kw in ["migration", "refactor", "legacy"]):
            risks.append({
                "type": "regression_risk",
                "severity": "high",
                "message": "Refactoring/migration tasks carry regression risk — ensure test coverage",
            })

        if any(kw in text_lower for kw in ["third-party", "external", "api", "integration"]):
            risks.append({
                "type": "dependency_risk",
                "severity": "medium",
                "message": "External dependency — ensure fallback and timeout handling",
            })

        if priority in ["urgent", "high"] and complexity >= 6:
            risks.append({
                "type": "time_pressure",
                "severity": "high",
                "message": "High priority + high complexity — risk of cutting corners",
            })

        if any(kw in text_lower for kw in ["security", "auth", "encryption", "password"]):
            risks.append({
                "type": "security_risk",
                "severity": "high",
                "message": "Security-sensitive task — follow OWASP guidelines and get security review",
            })

        return risks[:4]

    def _generate_suggestions(self, task_type: str, complexity: int, skills: List[Dict]) -> List[str]:
        """Generate helpful suggestions for the task."""
        suggestions = []

        if complexity >= 7:
            suggestions.append("Break this into smaller PRs for easier review")
        if task_type == "api":
            suggestions.append("Write API documentation alongside implementation")
        if task_type == "frontend":
            suggestions.append("Build mobile-first, then scale up for desktop")
        if task_type == "auth":
            suggestions.append("Use established libraries (bcrypt, JWT) — don't roll your own crypto")
        if task_type == "database":
            suggestions.append("Add database indexes for frequently queried fields")

        suggestions.append("Write tests before or alongside implementation")
        suggestions.append("Commit frequently with clear commit messages")

        return suggestions[:5]

    def _complexity_label(self, score: int) -> str:
        """Convert complexity score to label."""
        if score <= 3: return "Simple"
        if score <= 5: return "Moderate"
        if score <= 7: return "Complex"
        return "Very Complex"

    def _assess_priority(self, complexity: int, deadline: str, priority: str) -> str:
        """Assess if current priority is appropriate."""
        if complexity >= 7 and priority in ["low", "medium"]:
            return "Consider raising priority — high complexity tasks need more attention"
        if complexity <= 3 and priority == "urgent":
            return "This seems like a quick task — urgent priority may not be needed"
        return "Priority level seems appropriate for this task"


# Singleton
task_analyzer = TaskAnalyzer()
