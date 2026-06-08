.PHONY: reset-recommendations

# Variables
MONGO_URI ?= "mongodb://localhost:27017/scholarbee" # Update this to your local MongoDB connection string if different
API_URL ?= "http://localhost:3010"

# Using the NestJS script to clear the database and cache locally
reset-recommendations:
	@echo "Hard resetting recommendation engine data and cache..."
	@cd scholarbee-dev/backend-api && npx ts-node -r tsconfig-paths/register src/recommendations/scripts/recommendation-reset.ts
