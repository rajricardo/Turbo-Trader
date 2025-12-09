#!/bin/bash

# Turbo Trader - Launch Script for macOS
# This script activates the Python virtual environment and launches the Electron app

set -e  # Exit on any error

echo "=================================="
echo "   Turbo Trader - Starting App"
echo "=================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "bin" ] || [ ! -f "bin/activate" ]; then
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo "Please run ./install.sh first to set up dependencies"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ Node modules not found${NC}"
    echo "Please run ./install.sh first to set up dependencies"
    exit 1
fi

# Activate Python virtual environment
echo "Activating Python virtual environment..."
source bin/activate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
    exit 1
fi

echo ""
echo "Starting Turbo Trader..."
echo ""

# Launch the Electron app
npm start

# Deactivate virtual environment when app closes
deactivate
