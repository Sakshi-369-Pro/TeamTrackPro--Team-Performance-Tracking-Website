"""
ATS Resume Analysis and Optimization Engine.
Performs keyword extraction, JD matching, and ATS scoring.
Uses TF-IDF similarity for semantic matching.
"""

import re
import math
from typing import List, Dict, Any, Tuple
from collections import Counter

from .skill_extractor import skill_extractor


# ATS-critical section weights
ATS_SECTION_WEIGHTS = {
    "contact_info": 0.05,
    "summary": 0.15,
    "skills": 0.25,
    "experience": 0.30,
    "education": 0.10,
    "certifications": 0.10,
    "projects": 0.05,
}

# Power verbs that ATS systems look for
POWER_VERBS = [
    "developed", "implemented", "designed", "architected", "built",
    "optimized", "managed", "led", "delivered", "deployed",
    "automated", "improved", "reduced", "increased", "created",
    "maintained", "integrated", "tested", "debugged", "refactored",
    "mentored", "collaborated", "coordinated", "analyzed", "resolved",
    "scaled", "migrated", "launched", "streamlined", "established",
]

# Industry-standard resume keywords
INDUSTRY_KEYWORDS = {
    "methodology": ["agile", "scrum", "kanban", "waterfall", "devops", "ci/cd", "tdd", "bdd"],
    "architecture": ["microservices", "monolith", "serverless", "event-driven", "rest", "graphql", "grpc"],
    "practices": ["code review", "pair programming", "unit testing", "integration testing", "performance optimization"],
    "tools": ["git", "jira", "confluence", "slack", "docker", "kubernetes", "jenkins", "terraform"],
    "concepts": ["scalability", "high availability", "fault tolerance", "load balancing", "caching", "security"],
}


class ResumeAnalyzer:
    """
    Analyzes resumes for ATS compatibility and provides optimization suggestions.
    """

    def analyze_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze resume content and return ATS score with suggestions.
        """
        skills = resume_data.get("skills", [])
        experience = resume_data.get("experience", [])
        summary = resume_data.get("summary", "")
        education = resume_data.get("education", [])
        certifications = resume_data.get("certifications", [])
        projects = resume_data.get("projects", [])

        # Calculate section scores
        section_scores = {
            "contact_info": self._score_contact(resume_data),
            "summary": self._score_summary(summary),
            "skills": self._score_skills(skills),
            "experience": self._score_experience(experience),
            "education": self._score_education(education),
            "certifications": self._score_certifications(certifications),
            "projects": self._score_projects(projects),
        }

        # Weighted ATS score
        ats_score = sum(
            section_scores[section] * weight
            for section, weight in ATS_SECTION_WEIGHTS.items()
        )
        ats_score = round(min(100, max(0, ats_score)), 1)

        # Find missing keywords
        all_text = self._compile_resume_text(resume_data)
        missing_keywords = self._find_missing_keywords(all_text, skills)

        # Power verb analysis
        power_verb_usage = self._analyze_power_verbs(all_text)

        # Generate suggestions
        suggestions = self._generate_suggestions(section_scores, missing_keywords, power_verb_usage)

        # ATS format check
        format_issues = self._check_format(resume_data)

        return {
            "ats_score": ats_score,
            "section_scores": {k: round(v, 1) for k, v in section_scores.items()},
            "missing_keywords": missing_keywords,
            "power_verbs_used": power_verb_usage["used"],
            "power_verbs_suggested": power_verb_usage["suggested"],
            "suggestions": suggestions,
            "format_issues": format_issues,
            "strength_areas": [k for k, v in section_scores.items() if v >= 80],
            "weak_areas": [k for k, v in section_scores.items() if v < 50],
            "overall_grade": self._grade(ats_score),
        }

    def match_with_jd(self, resume_data: Dict, job_description: str) -> Dict[str, Any]:
        """
        Match resume against a specific job description.
        Returns match score, matched/missing skills, and optimization tips.
        """
        # Extract skills from JD
        jd_skills = skill_extractor.extract_skills(job_description)
        jd_skill_names = [s["name"] for s in jd_skills]

        # User skills
        user_skills = []
        for s in resume_data.get("skills", []):
            if isinstance(s, str):
                user_skills.append(s)
            elif isinstance(s, dict):
                user_skills.append(s.get("name", ""))

        # Calculate match
        match_result = skill_extractor.match_skills(user_skills, jd_skill_names)

        # Extract JD keywords not in skills
        jd_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', job_description.lower()))
        resume_text = self._compile_resume_text(resume_data).lower()
        resume_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', resume_text))
        missing_jd_words = jd_tokens - resume_tokens - {"the", "and", "for", "with", "that", "this", "from", "have", "will", "are", "you", "our", "your"}

        # Calculate JD-specific ATS score
        base_score = self.analyze_resume(resume_data)["ats_score"]
        jd_bonus = match_result["match_percentage"] * 0.3
        jd_ats_score = round(min(100, base_score * 0.7 + jd_bonus), 1)

        # Generate JD-specific suggestions
        suggestions = []
        for skill in match_result["missing_skills"][:5]:
            suggestions.append(f"Add '{skill}' to your skills section — it's required in this JD")
        if match_result["match_percentage"] < 50:
            suggestions.append("Consider gaining experience in the missing skills before applying")
        if match_result["match_percentage"] >= 70:
            suggestions.append("Strong match! Highlight your relevant projects in your summary")

        return {
            "jd_match_score": match_result["match_percentage"],
            "jd_ats_score": jd_ats_score,
            "matched_skills": match_result["matched_skills"],
            "missing_skills": match_result["missing_skills"],
            "jd_extracted_skills": [{"name": s["name"], "category": s["category"], "confidence": s["confidence"]} for s in jd_skills[:15]],
            "suggestions": suggestions,
            "keyword_density": len(match_result["matched_skills"]) / max(len(jd_skill_names), 1),
        }

    def generate_optimized_summary(self, resume_data: Dict, target_role: str = "") -> str:
        """Generate an ATS-optimized professional summary."""
        skills = resume_data.get("skills", [])
        experience = resume_data.get("experience", [])
        name = resume_data.get("name", "Professional")

        skill_names = []
        for s in skills[:6]:
            if isinstance(s, str):
                skill_names.append(s)
            elif isinstance(s, dict):
                skill_names.append(s.get("name", ""))

        years = len(experience) * 2  # Rough estimate
        skill_str = ", ".join(skill_names[:4])
        role = target_role or "Software Developer"

        summary = (
            f"Results-driven {role} with {years}+ years of experience "
            f"specializing in {skill_str}. Proven track record of delivering "
            f"high-quality, scalable solutions in fast-paced environments. "
            f"Passionate about clean code, team collaboration, and continuous improvement."
        )
        return summary

    def _score_contact(self, data: Dict) -> float:
        """Score contact information completeness."""
        fields = ["name", "email", "phone", "location"]
        present = sum(1 for f in fields if data.get(f))
        return (present / len(fields)) * 100

    def _score_summary(self, summary: str) -> float:
        """Score professional summary quality."""
        if not summary:
            return 0
        word_count = len(summary.split())
        score = 0
        if 30 <= word_count <= 80:
            score += 40
        elif word_count > 0:
            score += 20

        # Check for power verbs
        summary_lower = summary.lower()
        verb_count = sum(1 for v in POWER_VERBS if v in summary_lower)
        score += min(30, verb_count * 10)

        # Check for quantifiable achievements
        numbers = re.findall(r'\d+', summary)
        score += min(30, len(numbers) * 15)

        return min(100, score)

    def _score_skills(self, skills: List) -> float:
        """Score skills section."""
        if not skills:
            return 0
        count = len(skills)
        if count >= 8:
            return 90
        elif count >= 5:
            return 70
        elif count >= 3:
            return 50
        return 30

    def _score_experience(self, experience: List) -> float:
        """Score work experience section."""
        if not experience:
            return 0
        score = min(40, len(experience) * 15)

        for exp in experience:
            desc = str(exp.get("description", ""))
            # Check for bullet points / details
            if len(desc) > 50:
                score += 10
            # Check for numbers / metrics
            if re.search(r'\d+', desc):
                score += 10

        return min(100, score)

    def _score_education(self, education: List) -> float:
        """Score education section."""
        if not education:
            return 30  # Not always required
        return min(100, 50 + len(education) * 25)

    def _score_certifications(self, certs: List) -> float:
        """Score certifications."""
        if not certs:
            return 40  # Optional
        return min(100, 50 + len(certs) * 20)

    def _score_projects(self, projects: List) -> float:
        """Score projects section."""
        if not projects:
            return 30
        return min(100, 40 + len(projects) * 15)

    def _compile_resume_text(self, data: Dict) -> str:
        """Compile all resume text into one string."""
        parts = [
            str(data.get("summary", "")),
            " ".join(str(s) if isinstance(s, str) else s.get("name", "") for s in data.get("skills", [])),
        ]
        for exp in data.get("experience", []):
            parts.append(str(exp.get("description", "")))
            parts.append(str(exp.get("role", "")))
            parts.append(str(exp.get("company", "")))
        return " ".join(parts)

    def _find_missing_keywords(self, text: str, skills: List) -> List[str]:
        """Find important keywords missing from resume."""
        text_lower = text.lower()
        missing = []

        for category, keywords in INDUSTRY_KEYWORDS.items():
            for kw in keywords:
                if kw not in text_lower:
                    missing.append(kw)

        return missing[:10]

    def _analyze_power_verbs(self, text: str) -> Dict:
        """Analyze power verb usage."""
        text_lower = text.lower()
        used = [v for v in POWER_VERBS if v in text_lower]
        suggested = [v for v in POWER_VERBS if v not in text_lower][:5]
        return {"used": used, "suggested": suggested}

    def _check_format(self, data: Dict) -> List[str]:
        """Check for ATS format issues."""
        issues = []
        if not data.get("name"):
            issues.append("Missing name at the top")
        if not data.get("email"):
            issues.append("Missing email address")
        if not data.get("skills"):
            issues.append("Missing dedicated skills section")
        if not data.get("experience"):
            issues.append("Missing work experience section")
        return issues

    def _generate_suggestions(self, scores: Dict, missing: List, verbs: Dict) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []
        if scores.get("summary", 0) < 50:
            suggestions.append("Add a professional summary with quantifiable achievements")
        if scores.get("skills", 0) < 50:
            suggestions.append("Add more technical skills (aim for 8-12 skills)")
        if scores.get("experience", 0) < 50:
            suggestions.append("Add detailed descriptions with metrics to your experience")
        if missing:
            suggestions.append(f"Consider adding keywords: {', '.join(missing[:3])}")
        if len(verbs.get("used", [])) < 3:
            suggestions.append(f"Use power verbs like: {', '.join(verbs.get('suggested', [])[:3])}")
        return suggestions[:5]

    def _grade(self, score: float) -> str:
        """Convert score to letter grade."""
        if score >= 90: return "A+"
        if score >= 80: return "A"
        if score >= 70: return "B+"
        if score >= 60: return "B"
        if score >= 50: return "C"
        return "D"


# Singleton
resume_analyzer = ResumeAnalyzer()
