"""
NLP-based Skill Extraction Engine.
Uses TF-IDF vectorization and keyword matching for skill detection from text.
"""

import re
from typing import List, Dict, Tuple
from collections import Counter
import math


# Comprehensive skill taxonomy
SKILL_TAXONOMY = {
    "frontend": {
        "React": ["react", "reactjs", "react.js", "jsx", "tsx", "hooks", "redux", "context api", "next.js", "nextjs"],
        "Vue.js": ["vue", "vuejs", "vue.js", "vuex", "nuxt", "nuxtjs"],
        "Angular": ["angular", "angularjs", "rxjs", "ngrx"],
        "TypeScript": ["typescript", "ts", "type safety", "typed"],
        "JavaScript": ["javascript", "js", "es6", "es2015", "ecmascript", "vanilla js"],
        "HTML/CSS": ["html", "css", "html5", "css3", "sass", "scss", "less", "stylus"],
        "Tailwind CSS": ["tailwind", "tailwindcss", "utility-first"],
        "Bootstrap": ["bootstrap", "bootstrap5"],
        "Svelte": ["svelte", "sveltekit"],
    },
    "backend": {
        "Python": ["python", "py", "python3", "cpython", "pypy"],
        "Node.js": ["node", "nodejs", "node.js", "express", "expressjs", "fastify", "koa"],
        "Django": ["django", "drf", "django rest framework", "django channels"],
        "FastAPI": ["fastapi", "fast api", "starlette", "uvicorn"],
        "Flask": ["flask", "werkzeug", "jinja2"],
        "Java": ["java", "spring", "spring boot", "springboot", "hibernate", "maven", "gradle"],
        "Go": ["golang", "go", "gin", "echo", "fiber"],
        "Rust": ["rust", "cargo", "actix", "tokio"],
        "Ruby": ["ruby", "rails", "ruby on rails", "sinatra"],
        "PHP": ["php", "laravel", "symfony", "codeigniter"],
        "C#": ["csharp", "c#", ".net", "dotnet", "asp.net", "entity framework"],
    },
    "database": {
        "MongoDB": ["mongodb", "mongo", "mongoose", "pymongo", "motor"],
        "PostgreSQL": ["postgresql", "postgres", "pg", "psycopg2", "sqlalchemy"],
        "MySQL": ["mysql", "mariadb", "sequelize"],
        "Redis": ["redis", "caching", "in-memory"],
        "Elasticsearch": ["elasticsearch", "elastic", "kibana", "elk"],
        "SQLite": ["sqlite", "sqlite3"],
        "DynamoDB": ["dynamodb", "dynamo"],
        "Firebase": ["firebase", "firestore", "realtime database"],
    },
    "devops": {
        "Docker": ["docker", "dockerfile", "docker-compose", "containerization"],
        "Kubernetes": ["kubernetes", "k8s", "kubectl", "helm", "k3s"],
        "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "fargate", "cloudformation"],
        "Azure": ["azure", "microsoft azure", "azure devops"],
        "GCP": ["gcp", "google cloud", "cloud run", "bigquery"],
        "CI/CD": ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci", "circleci", "travis"],
        "Terraform": ["terraform", "iac", "infrastructure as code"],
        "Linux": ["linux", "ubuntu", "centos", "debian", "bash", "shell"],
        "Nginx": ["nginx", "reverse proxy", "load balancer"],
    },
    "ai_ml": {
        "Machine Learning": ["machine learning", "ml", "supervised", "unsupervised", "classification", "regression"],
        "Deep Learning": ["deep learning", "neural network", "cnn", "rnn", "lstm", "transformer"],
        "NLP": ["nlp", "natural language processing", "text mining", "sentiment analysis", "tokenization"],
        "Computer Vision": ["computer vision", "cv", "image recognition", "object detection", "yolo"],
        "TensorFlow": ["tensorflow", "tf", "keras"],
        "PyTorch": ["pytorch", "torch"],
        "scikit-learn": ["scikit-learn", "sklearn", "scikit"],
        "Pandas": ["pandas", "dataframe", "data manipulation"],
        "NumPy": ["numpy", "numerical computing"],
        "OpenAI": ["openai", "gpt", "gpt-4", "chatgpt", "dall-e", "whisper"],
        "LangChain": ["langchain", "llm", "large language model", "rag", "retrieval augmented"],
    },
    "tools": {
        "Git": ["git", "github", "gitlab", "bitbucket", "version control"],
        "Agile": ["agile", "scrum", "kanban", "sprint", "jira", "confluence"],
        "REST API": ["rest", "restful", "api", "endpoint", "swagger", "openapi"],
        "GraphQL": ["graphql", "apollo", "relay"],
        "WebSocket": ["websocket", "socket.io", "real-time", "ws"],
        "Testing": ["testing", "unit test", "integration test", "jest", "pytest", "mocha", "cypress", "selenium"],
        "Microservices": ["microservices", "micro-services", "service mesh", "istio"],
    },
    "soft_skills": {
        "Leadership": ["leadership", "lead", "mentor", "mentoring", "team lead"],
        "Communication": ["communication", "collaborate", "collaboration", "teamwork"],
        "Problem Solving": ["problem solving", "debugging", "troubleshooting", "analytical"],
        "Project Management": ["project management", "planning", "roadmap", "stakeholder"],
    }
}


class SkillExtractor:
    """NLP-based skill extraction from text using taxonomy matching and TF-IDF."""

    def __init__(self):
        self.taxonomy = SKILL_TAXONOMY
        self._build_reverse_index()

    def _build_reverse_index(self):
        """Build a reverse index: keyword -> (category, skill_name)."""
        self.reverse_index: Dict[str, Tuple[str, str]] = {}
        for category, skills in self.taxonomy.items():
            for skill_name, keywords in skills.items():
                for keyword in keywords:
                    self.reverse_index[keyword.lower()] = (category, skill_name)

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into lowercase words and bigrams."""
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s\.\-\/\#\+]', ' ', text)
        words = text.split()

        # Generate unigrams and bigrams
        tokens = list(words)
        for i in range(len(words) - 1):
            tokens.append(f"{words[i]} {words[i+1]}")
        for i in range(len(words) - 2):
            tokens.append(f"{words[i]} {words[i+1]} {words[i+2]}")

        return tokens

    def extract_skills(self, text: str) -> List[Dict]:
        """
        Extract skills from text using taxonomy matching.
        Returns list of {name, category, confidence, frequency}.
        """
        tokens = self._tokenize(text)
        token_counts = Counter(tokens)
        total_tokens = len(tokens)

        found_skills: Dict[str, Dict] = {}

        for token, count in token_counts.items():
            if token in self.reverse_index:
                category, skill_name = self.reverse_index[token]
                if skill_name not in found_skills:
                    found_skills[skill_name] = {
                        "name": skill_name,
                        "category": category,
                        "frequency": 0,
                        "matched_keywords": []
                    }
                found_skills[skill_name]["frequency"] += count
                found_skills[skill_name]["matched_keywords"].append(token)

        # Calculate confidence using TF-IDF-like scoring
        results = []
        for skill_name, data in found_skills.items():
            tf = data["frequency"] / max(total_tokens, 1)
            idf = math.log(len(self.reverse_index) / max(1, len(data["matched_keywords"])))
            confidence = min(round(tf * idf * 100, 1), 99.9)
            confidence = max(confidence, 30.0)  # Minimum confidence if found

            results.append({
                "name": data["name"],
                "category": data["category"],
                "confidence": confidence,
                "frequency": data["frequency"],
            })

        # Sort by confidence descending
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results

    def match_skills(self, user_skills: List[str], required_skills: List[str]) -> Dict:
        """
        Calculate skill match percentage between user skills and requirements.
        Returns match score, matched skills, missing skills.
        """
        user_set = {s.lower() for s in user_skills}
        required_set = {s.lower() for s in required_skills}

        # Also check taxonomy aliases
        expanded_user = set(user_set)
        for skill in user_set:
            for category, skills in self.taxonomy.items():
                for skill_name, keywords in skills.items():
                    if skill in [k.lower() for k in [skill_name] + keywords]:
                        expanded_user.add(skill_name.lower())
                        expanded_user.update(k.lower() for k in keywords)

        matched = []
        missing = []
        for req in required_skills:
            req_lower = req.lower()
            # Check direct match or alias match
            found = False
            for category, skills in self.taxonomy.items():
                for skill_name, keywords in skills.items():
                    all_aliases = [skill_name.lower()] + [k.lower() for k in keywords]
                    if req_lower in all_aliases:
                        if any(ua in all_aliases for ua in expanded_user):
                            matched.append(req)
                            found = True
                            break
                if found:
                    break
            if not found:
                if req_lower in expanded_user:
                    matched.append(req)
                else:
                    missing.append(req)

        match_pct = round((len(matched) / max(len(required_skills), 1)) * 100, 1)

        return {
            "match_percentage": match_pct,
            "matched_skills": matched,
            "missing_skills": missing,
            "total_required": len(required_skills),
            "total_matched": len(matched),
        }


# Singleton instance
skill_extractor = SkillExtractor()
