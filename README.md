# 🚀 TeamTrack Pro

> Full-Stack Project Management, Team Performance & AI-Powered Candidate Recommendation Platform

TeamTrack Pro is a **full-stack web platform** designed to help organizations manage projects, coordinate teams, track tasks, analyze performance, and support candidate evaluation through Machine Learning.

The platform combines **project management, team performance analytics, candidate recommendation, resume generation, and career-oriented functionality** into a single application.

TeamTrack Pro was developed as a **two-member collaborative project**, with different functional and technical areas implemented across the team.

---

## 📌 Project Overview

Managing projects and teams involves more than simply assigning tasks. Organizations also need visibility into:

* Project progress
* Task completion
* Employee performance
* Team productivity
* Employee skills
* Candidate suitability
* Resume quality
* Career and skill development

TeamTrack Pro brings these capabilities together in one centralized platform.

The application provides separate functionality for managers and team members while also incorporating Machine Learning to support candidate recommendation.

---

# 🎯 Problem Statement

Traditional project and team management workflows often require multiple disconnected tools for:

* Project management
* Task assignment
* Team monitoring
* Performance tracking
* Candidate evaluation
* Resume preparation
* Career assistance

This can make it difficult to maintain a unified view of projects, employees, and candidates.

TeamTrack Pro addresses this by providing a centralized platform for **project management, team analytics, candidate evaluation, and career-related functionality**.

---

# 💡 Solution

TeamTrack Pro provides a centralized web application where users can:

* Create and manage projects
* Assign and track tasks
* Monitor team performance
* Analyze productivity
* Maintain skill information
* Evaluate candidates
* Generate ATS-friendly resumes
* Access career-related features
* Use an ML-based candidate recommendation system

---

# ✨ Key Features

## 📋 Project & Task Management

The platform provides functionality for managing the complete project and task lifecycle.

### Features include:

* Project creation
* Project management
* Task creation
* Task assignment
* Task status tracking
* Task progress monitoring
* Project progress tracking

---

## 👥 Team Management

TeamTrack Pro allows managers and team members to work within a centralized team environment.

Features include:

* Team member management
* Employee profiles
* Skill information
* Work experience information
* Role-based functionality
* Team collaboration

---

## 📊 Performance Analytics

The platform provides analytics to help monitor team and employee performance.

Analytics can include:

* Task completion
* Productivity information
* Employee performance
* Team performance
* Performance rankings
* Project progress
* Visual analytics

Interactive charts and visualizations help users understand performance information more easily.

---

## 🤖 Candidate Recommendation

TeamTrack Pro includes a **Machine Learning-based candidate recommendation component**.

The system uses candidate information such as:

* Skills
* Ratings
* Availability
* Other relevant candidate attributes

to generate candidate recommendations.

The recommendation component uses **Logistic Regression** as its classification model.

---

## 📄 ATS-Friendly Resume Generation

The platform includes functionality for creating structured, ATS-friendly resumes.

The resume functionality is intended to help users organize their:

* Skills
* Education
* Experience
* Projects
* Certifications
* Other professional information

into a structured resume format.

---

## 💼 Career Assistance

The platform also includes career-oriented functionality to help users understand and work on their professional skills.

This includes functionality related to:

* Skill information
* Career insights
* Skill-gap awareness
* Professional profile improvement

---

# 🧠 Machine Learning — Candidate Recommendation

## Overview

The candidate recommendation component is designed as a **classification-based recommendation system**.

The system takes relevant candidate information as input and uses a trained Logistic Regression model to generate a recommendation.

### High-Level Workflow

```text
Candidate Information
        │
        ▼
Data Preprocessing
        │
        ▼
Feature Preparation
        │
        ▼
Feature Transformation
        │
        ▼
Logistic Regression Model
        │
        ▼
Prediction
        │
        ▼
Candidate Recommendation
```

---

## 📊 Candidate Features

The recommendation model can use structured candidate information such as:

### Skills

Candidate skills provide information about the candidate's technical and professional capabilities.

### Rating

Candidate ratings provide an additional signal for candidate evaluation.

### Availability

Candidate availability is considered as part of the recommendation criteria.

### Other Candidate Attributes

Additional structured candidate information can be included depending on the available data and recommendation requirements.

---

## ⚙️ Recommendation Pipeline

### 1. Candidate Data

Candidate information is collected from the application.

### 2. Data Preprocessing

Candidate data is prepared and transformed into a format suitable for Machine Learning.

### 3. Feature Preparation

Relevant candidate attributes are selected and converted into model-compatible features.

### 4. Model Training

The Logistic Regression model is trained using the prepared data.

### 5. Prediction

The trained model receives candidate features and generates a classification prediction.

### 6. Recommendation

The prediction is used as a decision-support signal for candidate recommendation.

---

# 🔬 Why Logistic Regression?

Logistic Regression is suitable for this implementation because the recommendation task can be formulated as a classification problem.

Advantages include:

* Suitable for binary classification
* Efficient for structured/tabular data
* Simple and interpretable
* Computationally efficient
* Provides probability-based predictions
* Useful as a baseline classification model

The ML component can be extended in future versions with more advanced models and ranking techniques.

---

# 🏗️ System Architecture

TeamTrack Pro follows a modular full-stack architecture.

```text
                         TEAMTRACK PRO
                              │
             ┌────────────────┴────────────────┐
             │                                 │
          Frontend                           Backend
             │                                 │
     React + TypeScript                    Python APIs
             │                                 │
             └────────────────┬────────────────┘
                              │
                       Application Layer
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
 Project & Task          Performance           ML Candidate
 Management              Analytics             Recommendation
       │                      │                      │
       │                      │               Feature Processing
       │                      │                      │
       │                      │              Logistic Regression
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                              │
                              ▼
                         User Interface
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Vite
* Zustand
* Recharts

## Backend

* Python
* REST APIs
* MongoDB

## Machine Learning

* Python
* Logistic Regression
* Data preprocessing
* Feature engineering
* Classification

## Development & Version Control

* Git
* GitHub
* VS Code
* npm
* pip

---

# 🧩 Architecture Components

## Frontend Layer

Responsible for:

* User interface
* Dashboards
* Forms
* Project/task views
* Candidate views
* Resume functionality
* Analytics visualization

## Backend Layer

Responsible for:

* API handling
* Application logic
* Data processing
* Communication between frontend and backend
* Integration of application modules

## Machine Learning Layer

Responsible for:

* Candidate feature processing
* Model training
* Candidate prediction
* Recommendation generation

## Data Layer

Responsible for storing and managing:

* User information
* Projects
* Tasks
* Candidate information
* Skills
* Performance-related data

---

# 📁 Project Structure

```text
TeamTrackPro--Team-Performance-Tracking-Website/
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── models/
│   └── requirements.txt
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   ├── assets/
│   └── utils/
│
├── .gitignore
├── LICENSE
├── README.md
├── docker-compose.yml
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

---

# 🔄 Candidate Recommendation Flow

```text
                Candidate Profile
                       │
          ┌────────────┼────────────┐
          │            │            │
        Skills       Rating    Availability
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
               Data Preprocessing
                       │
                       ▼
               Feature Preparation
                       │
                       ▼
             Logistic Regression
                       │
                       ▼
                   Prediction
                       │
                       ▼
            Candidate Recommendation
```

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

* Node.js
* npm
* Python 3.10+
* pip
* Git
* MongoDB

---

## Clone the Repository

```bash
git clone https://github.com/Sakshi-369-Pro/TeamTrackPro--Team-Performance-Tracking-Website.git
```

Navigate to the project:

```bash
cd TeamTrackPro--Team-Performance-Tracking-Website
```

---

## Frontend Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

---

# 👥 Team Contributions

TeamTrack Pro was developed collaboratively by **Sakshi Singh and Prachi Singh**.

Both members contributed to different parts of the application, with their work covering the Machine Learning and full-stack/platform aspects of the project.

---

## 👩‍💻 Sakshi Singh

### Machine Learning & Candidate Recommendation

Sakshi worked on the **Machine Learning component of the project**, particularly the candidate recommendation functionality.

### Contributions

* Designed the candidate recommendation approach
* Formulated candidate recommendation as a classification problem
* Implemented **Logistic Regression**
* Worked with candidate-related features
* Prepared candidate data for Machine Learning
* Performed feature preparation and preprocessing
* Trained the classification model
* Generated candidate predictions
* Implemented recommendation logic
* Integrated the recommendation component with the application
* Tested the recommendation workflow

### Technical Focus

```text
Machine Learning
      │
      ├── Data Preparation
      ├── Feature Processing
      ├── Logistic Regression
      ├── Prediction
      └── Candidate Recommendation
```

---

## 👩‍💻 Prachi Singh

### Full-Stack Application & Platform Functionality

Prachi worked on the broader **application development and platform functionality** of TeamTrack Pro.

### Contributions

* Developed project management functionality
* Implemented task management workflows
* Worked on manager dashboard functionality
* Worked on team-member dashboard functionality
* Implemented team management features
* Developed performance and productivity analytics
* Worked on dashboard visualizations
* Implemented performance-related functionality
* Developed ATS-friendly resume functionality
* Worked on career-related functionality
* Developed frontend components
* Worked on backend/API integration
* Contributed to application architecture and module integration

### Technical Focus

```text
Full-Stack Development
      │
      ├── Frontend
      ├── Dashboards
      ├── Project Management
      ├── Task Management
      ├── Analytics
      ├── Resume Functionality
      └── Backend Integration
```

---

# 🤝 Collaboration

The application was developed collaboratively, with both members contributing to the final integrated platform.

The project brings together:

* Project management
* Task management
* Team management
* Performance analytics
* Candidate recommendation
* Machine Learning
* Resume generation
* Career assistance
* Full-stack application development

The individual contribution areas represent the **primary areas of work for each team member**, while the final application is the result of their combined development and integration.

---

# 🔮 Future Enhancements

Potential improvements to the platform include:

### Machine Learning

* Larger and more representative training datasets
* Additional candidate features
* Improved feature engineering
* Model comparison
* Cross-validation
* Hyperparameter tuning
* Precision, Recall and F1-score evaluation
* Explainable candidate recommendations
* Advanced candidate ranking

### Candidate Matching

* NLP-based skill extraction
* Resume-to-job-description matching
* Semantic skill matching
* Embedding-based candidate similarity
* Job-specific candidate ranking

### Platform

* Real-time notifications
* Real-time team communication
* Cloud deployment
* CI/CD pipeline
* Advanced authentication
* Role-based access control improvements
* Production monitoring

---

# 📈 Project Highlights

* Full-stack project management platform
* Team performance monitoring
* Productivity analytics
* Machine Learning-based candidate recommendation
* Logistic Regression classification
* Skill-based candidate evaluation
* ATS-friendly resume functionality
* Career assistance
* Interactive dashboards
* React + TypeScript frontend
* Python backend
* MongoDB-based data management
* Modular application architecture
* Two-member collaborative development

---

# 📚 Learning Outcomes

The project provided practical experience in:

* Full-stack web development
* Machine Learning
* Classification algorithms
* Data preprocessing
* Feature engineering
* REST API development
* React and TypeScript
* State management
* Data visualization
* Database integration
* Git/GitHub collaboration
* ML application integration
* Software architecture

---

# 🌐 Project Repository

**GitHub:**
https://github.com/Sakshi-369-Pro/TeamTrackPro--Team-Performance-Tracking-Website

---

# 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributors

| Contributor      | Primary Area                                    |
| ---------------- | ----------------------------------------------- |
| **Sakshi Singh** | Machine Learning & Candidate Recommendation     |
| **Prachi Singh** | Full-Stack Application & Platform Functionality |

---

⭐ If you find TeamTrack Pro useful, consider giving the repository a Star.
