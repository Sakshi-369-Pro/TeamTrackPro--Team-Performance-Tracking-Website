"""
Smart Team Member Ranking Engine.
Uses multi-factor weighted scoring to rank candidates for project assignments.
Includes synergy scoring based on past collaboration history.
"""

from typing import List, Dict, Any
import math


class TeamRanker:
    """
    Ranks team members for project suitability using weighted multi-factor analysis.
    Factors: skill match, performance, availability, collaboration history, speed.
    """

    # Ranking weights
    WEIGHTS = {
        "skill_match": 0.30,
        "performance": 0.25,
        "availability": 0.15,
        "quality": 0.15,
        "speed": 0.10,
        "synergy": 0.05,
    }

    def rank_members(
        self,
        members: List[Dict[str, Any]],
        requirements: Dict[str, Any],
        priority: str = "balanced"
    ) -> List[Dict[str, Any]]:
        """
        Rank team members based on project requirements and priority focus.
        
        Args:
            members: List of member profiles with skills, metrics
            requirements: {required_skills, project_type, deadline_urgency}
            priority: "quality" | "speed" | "balanced"
        
        Returns:
            Ranked list of members with scores and explanations
        """
        # Adjust weights based on priority
        weights = self._adjust_weights(priority)
        required_skills = requirements.get("required_skills", [])
        
        ranked = []
        for member in members:
            scores = self._calculate_member_scores(member, required_skills, requirements)
            
            # Weighted composite score
            composite = sum(
                weights.get(factor, 0) * score
                for factor, score in scores.items()
            )
            composite = round(min(100, max(0, composite)), 1)
            
            # Generate explanation
            explanation = self._generate_explanation(member, scores, priority)
            
            # Determine fit level
            if composite >= 80:
                fit_level = "Excellent"
                fit_color = "green"
            elif composite >= 60:
                fit_level = "Good"
                fit_color = "blue"
            elif composite >= 40:
                fit_level = "Fair"
                fit_color = "yellow"
            else:
                fit_level = "Low"
                fit_color = "red"
            
            ranked.append({
                "member": member,
                "composite_score": composite,
                "fit_level": fit_level,
                "fit_color": fit_color,
                "scores": {k: round(v, 1) for k, v in scores.items()},
                "explanation": explanation,
                "strengths": self._identify_member_strengths(member, scores),
                "concerns": self._identify_concerns(member, scores),
            })
        
        # Sort by composite score
        ranked.sort(key=lambda x: x["composite_score"], reverse=True)
        
        # Add rank position
        for i, r in enumerate(ranked):
            r["rank"] = i + 1
        
        return ranked

    def _adjust_weights(self, priority: str) -> Dict[str, float]:
        """Adjust scoring weights based on priority focus."""
        if priority == "quality":
            return {
                "skill_match": 0.25,
                "performance": 0.15,
                "availability": 0.10,
                "quality": 0.35,
                "speed": 0.05,
                "synergy": 0.10,
            }
        elif priority == "speed":
            return {
                "skill_match": 0.20,
                "performance": 0.15,
                "availability": 0.25,
                "quality": 0.10,
                "speed": 0.25,
                "synergy": 0.05,
            }
        else:  # balanced
            return self.WEIGHTS.copy()

    def _calculate_member_scores(
        self, member: Dict, required_skills: List[str], requirements: Dict
    ) -> Dict[str, float]:
        """Calculate individual factor scores for a member."""
        # Skill match
        member_skills = set()
        for s in member.get("skills", []):
            if isinstance(s, str):
                member_skills.add(s.lower())
            elif isinstance(s, dict):
                member_skills.add(s.get("name", "").lower())
        
        required_lower = {s.lower() for s in required_skills}
        if required_lower:
            matched = member_skills.intersection(required_lower)
            skill_match = (len(matched) / len(required_lower)) * 100
        else:
            skill_match = 50.0
        
        # Performance
        metrics = member.get("metrics", {})
        completion_rate = metrics.get("taskCompletionRate", 70)
        total_tasks = metrics.get("totalTasksCompleted", 0)
        performance = min(100, completion_rate * 0.6 + min(total_tasks, 50) * 0.8)
        
        # Availability
        availability = member.get("availability", "available")
        avail_score = {"available": 100, "busy": 30, "offline": 0}.get(availability, 50)
        
        # Quality
        quality_rating = metrics.get("averageQualityScore", 3.0)
        quality = (quality_rating / 5.0) * 100
        
        # Speed (on-time delivery)
        on_time = metrics.get("onTimeDeliveryRate", 70)
        speed = on_time
        
        # Synergy (past collaboration)
        synergy = self._calculate_synergy(member, requirements.get("existing_team", []))
        
        return {
            "skill_match": skill_match,
            "performance": performance,
            "availability": avail_score,
            "quality": quality,
            "speed": speed,
            "synergy": synergy,
        }

    def _calculate_synergy(self, member: Dict, existing_team: List[str]) -> float:
        """Calculate collaboration synergy with existing team."""
        if not existing_team:
            return 50.0
        
        # Check past shared projects
        member_projects = {
            wh.get("projectId", "") for wh in member.get("workHistory", [])
        }
        shared = 0
        for teammate_id in existing_team:
            # In real implementation, check shared project history
            shared += 1  # Simplified
        
        return min(100, 50 + shared * 10)

    def _generate_explanation(self, member: Dict, scores: Dict, priority: str) -> str:
        """Generate human-readable explanation for ranking."""
        name = member.get("name", "This member")
        parts = []
        
        if scores.get("skill_match", 0) >= 80:
            parts.append(f"strong skill match ({scores['skill_match']:.0f}%)")
        elif scores.get("skill_match", 0) >= 50:
            parts.append(f"moderate skill match ({scores['skill_match']:.0f}%)")
        
        if scores.get("quality", 0) >= 80:
            parts.append("excellent quality track record")
        
        if scores.get("speed", 0) >= 80:
            parts.append("high on-time delivery rate")
        
        if scores.get("availability", 0) >= 80:
            parts.append("currently available")
        elif scores.get("availability", 0) < 50:
            parts.append("currently busy")
        
        if parts:
            return f"{name} has {', '.join(parts)}."
        return f"{name} is a potential candidate."

    def _identify_member_strengths(self, member: Dict, scores: Dict) -> List[str]:
        """Identify key strengths of a member."""
        strengths = []
        if scores.get("skill_match", 0) >= 70:
            strengths.append("Skill match")
        if scores.get("quality", 0) >= 80:
            strengths.append("High quality")
        if scores.get("speed", 0) >= 80:
            strengths.append("Fast delivery")
        if scores.get("availability", 0) >= 80:
            strengths.append("Available now")
        return strengths

    def _identify_concerns(self, member: Dict, scores: Dict) -> List[str]:
        """Identify potential concerns."""
        concerns = []
        if scores.get("skill_match", 0) < 40:
            concerns.append("Low skill match")
        if scores.get("availability", 0) < 50:
            concerns.append("Limited availability")
        if scores.get("quality", 0) < 60:
            concerns.append("Quality needs improvement")
        return concerns


# Singleton
team_ranker = TeamRanker()
