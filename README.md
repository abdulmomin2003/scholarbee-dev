# ScholarBee Recommendation System & Platform

This repository contains the complete source code for the ScholarBee platform, including the student portal frontend, the backend API, and database schemas.

## 📂 Repository Structure

The core codebase is located inside the `scholarbee-dev` directory, which is divided into three main services:

- **`backend-api/`**: The core NestJS backend application. Handles all API requests, interacts with the database (MongoDB), interfaces with Redis for caching, and manages the rules-based recommendation engine.
- **`student-portal/`**: The frontend web application built with Next.js and React. This is the user-facing platform where students can search for programs, view recommendations, and manage their applications.
- **`database/`**: Contains database-related files, seed data, and schema definitions.

## 🚀 Getting Started

### Prerequisites
Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
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

## 🛠 Useful Commands

### Resetting Recommendation Data
If you are actively testing the recommendation engine and need to wipe the existing click/event data and Redis cache to start fresh, you can use the provided Makefile target from the root directory:

```bash
make reset-recommendations
```

## 📄 Documentation
Additional technical documentation regarding the recommendation system architecture, features, and algorithms can be found in the root directory:
- `ScholarBee_Recommendation_System_Documentation.html`
- `Recommendation_System_Contract.pdf`
- `recommendation_system_plan.md`
