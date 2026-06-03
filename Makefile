.PHONY: reset-ml reset-ml-auth

# Variables
MONGO_URI ?= "mongodb://localhost:27017/scholarbee" # Update this to your local MongoDB connection string if different
API_URL ?= "http://localhost:3010"

# Method 1: Using the NestJS script to clear the database and cache locally (No auth required)
reset-ml:
	@echo "Hard resetting ML data using NestJS script..."
	@cd scholarbee-dev/backend-api && npx ts-node -r tsconfig-paths/register src/recommendations/scripts/hard-reset.ts

# Method 2: Calling the API endpoint (Requires SUPER_ADMIN_TOKEN environment variable)
reset-ml-auth:
	@if [ -z "$(SUPER_ADMIN_TOKEN)" ]; then \
		echo "Error: SUPER_ADMIN_TOKEN environment variable is not set."; \
		echo "Run as: make reset-ml-auth SUPER_ADMIN_TOKEN=your_token_here"; \
		exit 1; \
	fi
	@echo "Hard resetting ML data via API..."
	@curl -X POST $(API_URL)/api/admin/ml/hard-reset \
		-H "Authorization: Bearer $(SUPER_ADMIN_TOKEN)" \
		-H "Content-Type: application/json"
	@echo "\nDone."
