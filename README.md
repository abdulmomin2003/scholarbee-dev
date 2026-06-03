# ScholarBee Recommendation System & Platform

This repository contains the complete source code for the ScholarBee platform, including the student portal frontend, the backend API, the machine learning recommendation service, and database schemas.

## 📂 Repository Structure

The core codebase is located inside the `scholarbee-dev` directory, which is divided into four main services:

- **`backend-api/`**: The core NestJS backend application. Handles all API requests, interacts with the database (MongoDB), interfaces with Redis for caching, and manages the rules-based recommendation engine.
- **`student-portal/`**: The frontend web application built with Next.js and React. This is the user-facing platform where students can search for programs, view recommendations, and manage their applications.
- **`ml-service/`**: A Python-based Machine Learning service. It is responsible for advanced recommendation re-ranking (Shadow mode & Live ML scoring) based on user interactions.
- **`database/`**: Contains database-related files, seed data, and schema definitions.

## 🚀 Getting Started

### Prerequisites
Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python](https://www.python.org/) (v3.9 or higher for the ML service)
- [MongoDB](https://www.mongodb.com/) (Running locally on port 27017 or accessible via URI)
- [Redis](https://redis.io/) (Running locally for caching recommendations)

### 1. Running the Backend API
The backend is built with NestJS.

```bash
cd scholarbee-dev/backend-api
npm install
npm run start:dev
```
*The backend server typically runs on port 3010 or as defined in your `.env` file.*

### 2. Running the Student Portal (Frontend)
The frontend is a Next.js application.

```bash
cd scholarbee-dev/student-portal
npm install
npm run dev
```
*The frontend typically runs on port 3000.*

### 3. Running the ML Service
The machine learning service requires Python and a virtual environment.

```bash
cd scholarbee-dev/ml-service
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
# Run the FastAPI server (adjust the start command according to the service's specific configuration)
python main.py  # or uvicorn main:app --reload
```

## 🛠 Useful Commands

### Resetting ML Data
If you are actively testing the recommendation engine and need to wipe the existing click/event data and Redis cache to start fresh, you can use the provided Makefile targets from the root directory:

**Hard reset via local script (No auth required):**
```bash
make reset-ml
```

**Hard reset via API (Requires Super Admin token):**
```bash
make reset-ml-auth SUPER_ADMIN_TOKEN="your_jwt_token_here"
```

## 📄 Documentation
Additional technical documentation regarding the recommendation system architecture, features, and algorithms can be found in the root directory:
- `ScholarBee_Recommendation_System_Documentation.html`
- `Recommendation_System_Contract.pdf`
- `recommendation_system_plan.md`
