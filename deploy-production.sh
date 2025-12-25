#!/bin/bash

echo "🚀 Apartment Tracker - Production Deployment"
echo "=============================================="
echo ""

# Stop any running containers
echo "📦 Stopping existing containers..."
docker-compose down -v 2>/dev/null || true

# Clean up
echo "🧹 Cleaning Docker cache..."
docker builder prune -f

# Build services
echo ""
echo "🔨 Building services..."
echo ""

echo "1️⃣  Building MongoDB..."
docker-compose build mongodb

echo ""
echo "2️⃣  Building Backend..."
docker-compose build --no-cache backend

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Backend build failed!"
    echo ""
    echo "💡 If you see emergentintegrations error, the library requires private access."
    echo "   You can:"
    echo "   1. Skip Stripe (keep Razorpay only)"
    echo "   2. Use standard Stripe SDK"
    echo ""
    echo "   For quick fix, run:"
    echo "   cp backend/Dockerfile.fallback backend/Dockerfile"
    echo "   docker-compose build --no-cache backend"
    echo ""
    exit 1
fi

echo ""
echo "3️⃣  Building Frontend..."
docker-compose build --no-cache frontend

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Frontend build failed!"
    exit 1
fi

# Start services
echo ""
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to start..."
sleep 15

# Show status
echo ""
echo "📊 Service Status:"
echo "=================="
docker-compose ps

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8001"
echo "   API Docs:  http://localhost:8001/docs"
echo ""
echo "📋 View Logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop Services:"
echo "   docker-compose down"
echo ""
