#!/bin/bash

# DevPulse Startup Script
# This script helps with initializing and running the DevPulse application

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}   DevPulse Application Startup        ${NC}"
echo -e "${GREEN}=======================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Creating from template...${NC}"
  cp .env.example .env 2>/dev/null || echo -e "${RED}No .env.example file found. Please create a .env file manually.${NC}"
fi

# Check for required dependencies
echo -e "${GREEN}Checking dependencies...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 18 ]; then
  echo -e "${RED}Node.js version $NODE_VERSION detected. DevPulse requires Node.js v18 or higher.${NC}"
  exit 1
fi

echo -e "${GREEN}Node.js v$NODE_VERSION detected.${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm is not installed. Please install npm.${NC}"
  exit 1
fi

echo -e "${GREEN}npm detected.${NC}"

# Check for Redis
echo -e "${GREEN}Checking Redis...${NC}"
if ! command -v redis-cli &> /dev/null; then
  echo -e "${YELLOW}Redis CLI not found. Make sure Redis is installed and running.${NC}"
else
  REDIS_PING=$(redis-cli ping 2>/dev/null)
  if [ "$REDIS_PING" = "PONG" ]; then
    echo -e "${GREEN}Redis is running.${NC}"
  else
    echo -e "${YELLOW}Redis does not appear to be running. Some features may not work correctly.${NC}"
  fi
fi

# Install dependencies if node_modules doesn't exist or if --force flag is provided
if [ ! -d "node_modules" ] || [[ "$*" == *"--force"* ]]; then
  echo -e "${GREEN}Installing dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please check the error messages above.${NC}"
    exit 1
  fi
fi

# Check if database needs to be set up
echo -e "${GREEN}Checking database...${NC}"
if [ ! -d "prisma/migrations" ] || [[ "$*" == *"--migrate"* ]]; then
  echo -e "${GREEN}Setting up database...${NC}"
  npx prisma migrate dev --name init
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set up database. Please check the error messages above.${NC}"
    exit 1
  fi
fi

# Start the application in development mode
if [[ "$*" == *"--prod"* ]]; then
  echo -e "${GREEN}Starting DevPulse in production mode...${NC}"
  npm run build && npm start
else
  echo -e "${GREEN}Starting DevPulse in development mode...${NC}"
  npm run dev
fi