#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting deployment process...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Check required environment variables
required_vars=(
    "DISCORD_APPLICATION_ID"
    "DISCORD_API_TOKEN"
    "VENICE_API_KEY"
)

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=.\+" .env; then
        echo -e "${RED}Error: ${var} is not set in .env file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}Environment validation passed${NC}"

# Build and deploy
echo "Building and deploying containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for health check
echo "Waiting for service to be healthy..."
attempts=0
max_attempts=30
until curl -s http://localhost:3000/health > /dev/null; do
    if [ $attempts -eq $max_attempts ]; then
        echo -e "${RED}Service failed to become healthy within expected time${NC}"
        docker-compose logs
        exit 1
    fi
    attempts=$((attempts + 1))
    echo "Waiting... ($attempts/$max_attempts)"
    sleep 2
done

echo -e "${GREEN}Deployment successful!${NC}"
echo "You can check the logs with: docker-compose logs -f" 