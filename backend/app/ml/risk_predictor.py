"""
Project Risk Prediction Engine.
Uses weighted scoring, velocity analysis, and Monte Carlo simulation
to predict project delays and identify bottlenecks.
"""

import random
import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta


class RiskPredictor:
    """
    ML-inspired project risk prediction engine.
    Uses historical task data, team velocity, and weighted heuristics
    to forecast project health and potential delays.
    """

    # Feature weights (tuned from historical patterns)
    WEIGHTS = {
        "velocity_score": 0.25,
        "completion_rate": 0.20,
        "quality_score": 0.15,
        "team_load_balance": 0.15,
        "deadline_proximity": 0.10,
        "blocker_penalty": 0.10,
        "scope_creep": 0.05,
    }

    def predict_risk(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict project risk using multi-factor analysis.
        
        Input: project_data with tasks, members, timeline info
        Output: risk assessment with score, factors, and recommendations
        """
        tasks = project_data.get("tasks", [])
        members = project_data.get("members", [])
        start_date = project_data.get("start_date")
        end_date = project_data.get("end_date")

        # Calculate individual risk factors
        velocity = self._calculate_velocity_score(tasks)
        completion = self._calculate_completion_rate(tasks)
        quality = self._calculate_quality_score(tasks)
        load_balance = self._calculate_load_balance(tasks, members)
        deadline = self._calculate_deadline_proximity(tasks, end_date)
        blockers = self._calculate_blocker_penalty(tasks)
        scope = self._calculate_scope_creep(tasks)

        # Weighted composite risk score (0-100, higher = more risky)
        risk_score = (
            self.WEIGHTS["velocity_score"] * (100 - velocity) +
            self.WEIGHTS["completion_rate"] * (100 - completion) +
            self.WEIGHTS["quality_score"] * (100 - quality) +
            self.WEIGHTS["team_load_balance"] * (100 - load_balance) +
            self.WEIGHTS["deadline_proximity"] * deadline +
            self.WEIGHTS["blocker_penalty"] * blockers +
            self.WEIGHTS["scope_creep"] * scope
        )

        risk_score = max(0, min(100, round(risk_score, 1)))

        # Determine risk level
        if risk_score < 25:
            risk_level = "low"
            risk_label = "On Track"
        elif risk_score < 50:
            risk_level = "medium"
            risk_label = "Needs Attention"
        elif risk_score < 75:
            risk_level = "high"
            risk_label = "At Risk"
        else:
            risk_level = "critical"
            risk_label = "Critical"

        # Predict delay using Monte Carlo simulation
        predicted_delay = self._monte_carlo_delay(tasks, velocity, completion)

        # Identify bottlenecks
        bottlenecks = self._identify_bottlenecks(tasks, members)

        # Generate recommendations
        recommendations = self._generate_recommendations(
            risk_score, velocity, completion, quality, load_balance, bottlenecks
        )

        # Risk factors breakdown
        risk_factors = [
            {"name": "Team Velocity", "score": round(velocity, 1), "weight": self.WEIGHTS["velocity_score"],
             "impact": "positive" if velocity > 70 else "negative"},
            {"name": "Completion Rate", "score": round(completion, 1), "weight": self.WEIGHTS["completion_rate"],
             "impact": "positive" if completion > 60 else "negative"},
            {"name": "Quality Score", "score": round(quality, 1), "weight": self.WEIGHTS["quality_score"],
             "impact": "positive" if quality > 70 else "negative"},
            {"name": "Load Balance", "score": round(load_balance, 1), "weight": self.WEIGHTS["team_load_balance"],
             "impact": "positive" if load_balance > 60 else "negative"},
            {"name": "Deadline Pressure", "score": round(deadline, 1), "weight": self.WEIGHTS["deadline_proximity"],
             "impact": "negative" if deadline > 50 else "positive"},
            {"name": "Blockers", "score": round(blockers, 1), "weight": self.WEIGHTS["blocker_penalty"],
             "impact": "negative" if blockers > 30 else "positive"},
        ]

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_label": risk_label,
            "predicted_delay_days": predicted_delay,
            "confidence": min(95, 60 + len(tasks) * 2),
            "risk_factors": risk_factors,
            "bottlenecks": bottlenecks,
            "recommendations": recommendations,
            "analysis_timestamp": datetime.utcnow().isoformat(),
        }

    def _calculate_velocity_score(self, tasks: List[Dict]) -> float:
        """Score based on actual vs estimated time ratio."""
        completed = [t for t in tasks if t.get("status") == "completed"]
        if not completed:
            return 50.0

        ratios = []
        for t in completed:
            est = t.get("estimatedTime", 1)
            actual = t.get("actualTime", est)
            if est > 0:
                ratio = min(actual / est, 2.0)
                ratios.append(ratio)

        if not ratios:
            return 50.0

        avg_ratio = sum(ratios) / len(ratios)
        # Score: 1.0 ratio = 100, 2.0 ratio = 0
        score = max(0, (2.0 - avg_ratio) / 1.0 * 100)
        return min(100, score)

    def _calculate_completion_rate(self, tasks: List[Dict]) -> float:
        """Percentage of tasks completed."""
        if not tasks:
            return 0.0
        completed = sum(1 for t in tasks if t.get("status") == "completed")
        return (completed / len(tasks)) * 100

    def _calculate_quality_score(self, tasks: List[Dict]) -> float:
        """Average quality rating normalized to 0-100."""
        completed = [t for t in tasks if t.get("qualityRating")]
        if not completed:
            return 70.0
        avg = sum(t["qualityRating"] for t in completed) / len(completed)
        return (avg / 5.0) * 100

    def _calculate_load_balance(self, tasks: List[Dict], members: List[Dict]) -> float:
        """How evenly tasks are distributed across team."""
        if not members or not tasks:
            return 50.0

        member_counts = {}
        for t in tasks:
            assignee = t.get("assignedTo", "unknown")
            if isinstance(assignee, list):
                for a in assignee:
                    member_counts[str(a)] = member_counts.get(str(a), 0) + 1
            else:
                member_counts[str(assignee)] = member_counts.get(str(assignee), 0) + 1

        if not member_counts:
            return 50.0

        counts = list(member_counts.values())
        avg = sum(counts) / len(counts)
        variance = sum((c - avg) ** 2 for c in counts) / len(counts)
        std_dev = math.sqrt(variance)

        # Lower std_dev = better balance
        balance_score = max(0, 100 - (std_dev / max(avg, 1)) * 100)
        return min(100, balance_score)

    def _calculate_deadline_proximity(self, tasks: List[Dict], end_date: Optional[str]) -> float:
        """Pressure score based on how close the deadline is."""
        if not end_date:
            return 30.0

        try:
            deadline = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            now = datetime.now(deadline.tzinfo) if deadline.tzinfo else datetime.utcnow()
            days_left = (deadline - now).days

            if days_left <= 0:
                return 100.0
            elif days_left <= 7:
                return 80.0
            elif days_left <= 14:
                return 60.0
            elif days_left <= 30:
                return 40.0
            else:
                return 20.0
        except (ValueError, TypeError):
            return 30.0

    def _calculate_blocker_penalty(self, tasks: List[Dict]) -> float:
        """Penalty for blocked or stalled tasks."""
        if not tasks:
            return 0.0
        blocked = sum(1 for t in tasks if t.get("status") in ["blocked", "on-hold"])
        overdue = sum(1 for t in tasks if t.get("status") != "completed"
                      and t.get("dueDate") and t.get("dueDate") < datetime.utcnow().isoformat())
        penalty = ((blocked + overdue) / max(len(tasks), 1)) * 100
        return min(100, penalty)

    def _calculate_scope_creep(self, tasks: List[Dict]) -> float:
        """Detect scope creep based on task additions."""
        if not tasks:
            return 0.0
        recent = sum(1 for t in tasks if t.get("createdAt", "") > (
            datetime.utcnow() - timedelta(days=7)).isoformat())
        ratio = recent / max(len(tasks), 1)
        return min(100, ratio * 200)

    def _monte_carlo_delay(self, tasks: List[Dict], velocity: float, completion: float) -> int:
        """
        Simple Monte Carlo simulation to predict delay in days.
        Runs 100 simulations with randomized task completion times.
        """
        incomplete = [t for t in tasks if t.get("status") != "completed"]
        if not incomplete:
            return 0

        delays = []
        for _ in range(100):
            total_extra_hours = 0
            for t in incomplete:
                est = t.get("estimatedTime", 8)
                # Add randomness based on velocity
                velocity_factor = max(0.5, (200 - velocity) / 100)
                actual = est * velocity_factor * random.uniform(0.8, 1.5)
                extra = max(0, actual - est)
                total_extra_hours += extra

            delay_days = int(total_extra_hours / 8)
            delays.append(delay_days)

        avg_delay = sum(delays) / len(delays)
        return max(0, round(avg_delay))

    def _identify_bottlenecks(self, tasks: List[Dict], members: List[Dict]) -> List[Dict]:
        """Identify team members or task areas causing delays."""
        bottlenecks = []

        # Check for overloaded members
        member_load = {}
        for t in tasks:
            if t.get("status") != "completed":
                assignee = str(t.get("assignedTo", "unknown"))
                member_load[assignee] = member_load.get(assignee, 0) + 1

        avg_load = sum(member_load.values()) / max(len(member_load), 1)
        for member_id, load in member_load.items():
            if load > avg_load * 1.5:
                bottlenecks.append({
                    "type": "overloaded_member",
                    "member_id": member_id,
                    "severity": "high" if load > avg_load * 2 else "medium",
                    "message": f"Member has {load} pending tasks (avg: {avg_load:.0f})",
                })

        # Check for stalled tasks
        for t in tasks:
            progress = t.get("progress", 0)
            if t.get("status") == "in-progress" and progress < 20:
                bottlenecks.append({
                    "type": "stalled_task",
                    "task_id": str(t.get("_id", "")),
                    "task_title": t.get("title", "Unknown"),
                    "severity": "medium",
                    "message": f"Task '{t.get('title', '')}' is in progress but only {progress}% done",
                })

        return bottlenecks[:5]  # Top 5 bottlenecks

    def _generate_recommendations(self, risk_score, velocity, completion,
                                   quality, load_balance, bottlenecks) -> List[str]:
        """Generate actionable recommendations based on analysis."""
        recs = []

        if velocity < 60:
            recs.append("Team velocity is below target. Consider reducing scope or extending timeline.")
        if completion < 40:
            recs.append("Low completion rate detected. Schedule a team standup to unblock pending tasks.")
        if quality < 60:
            recs.append("Quality scores are declining. Implement code review checkpoints.")
        if load_balance < 50:
            recs.append("Workload is unevenly distributed. Reassign tasks to balance the team.")
        if any(b["type"] == "overloaded_member" for b in bottlenecks):
            recs.append("Some members are overloaded. Consider adding resources or redistributing work.")
        if risk_score > 70:
            recs.append("Project is at high risk. Schedule an emergency review meeting.")
        if risk_score < 30:
            recs.append("Project is on track. Maintain current pace and celebrate small wins.")

        return recs[:5]


# Singleton instance
risk_predictor = RiskPredictor()
