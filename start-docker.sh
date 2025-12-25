#!/bin/bash

set -e

echo "========================================"
echo "Apartment Tracker - Docker Quick Start"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
echo ""

# Ask user which mode to run
echo "Select mode:"
echo "1) Production (optimized build)"
echo "2) Development (hot reload)"
read -p "Enter your choice (1 or 2): " mode_choice

if [ "$mode_choice" = "2" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    MODE="Development"
else
    COMPOSE_FILE="docker-compose.yml"
    MODE="Production"
fi

echo ""
echo "🚀 Starting Apartment Tracker in $MODE mode..."
echo ""

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down 2>/dev/null || true

# Build and start services
echo "Building and starting services..."
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "========================================"
echo "Service Status:"
echo "========================================"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "========================================"
echo "🎉 Application is ready!"
echo "========================================"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:8001"
echo "💾 MongoDB:   localhost:27017"
echo ""
echo "📋 View logs:"
echo "   docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f $COMPOSE_FILE down"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "========================================"
echo "Default Super Admin Credentials:"
echo "========================================"
echo "First person to register as admin becomes super admin"
echo "Test credentials: firstadmin@example.com / test123"
echo "========================================"
echo ""