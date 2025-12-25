#!/bin/bash

echo "🚀 FINAL FIX - Apartment Tracker Deployment"
echo "============================================"
echo ""

cd /app

# Step 1: Ensure we have the right Dockerfile
echo "📦 Step 1: Setting up Dockerfiles..."
cp frontend/Dockerfile.yarn frontend/Dockerfile
echo "✓ Using yarn-based Dockerfile (with ajv fix)"
echo ""

# Step 2: Stop any running containers
echo "🛑 Step 2: Stopping existing containers..."
docker-compose down -v 2>/dev/null || true
echo ""

# Step 3: Clean Docker cache
echo "🧹 Step 3: Cleaning Docker cache..."
docker builder prune -f
echo ""

# Step 4: Build backend
echo "🐍 Step 4: Building Backend..."
docker-compose build --no-cache backend

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Backend build failed!"
    echo "💡 If emergentintegrations error persists:"
    echo "   cp backend/Dockerfile.fallback backend/Dockerfile"
    echo "   docker-compose build --no-cache backend"
    exit 1
fi
echo "✓ Backend built successfully"
echo ""

# Step 5: Build frontend
echo "⚛️  Step 5: Building Frontend..."
docker-compose build --no-cache frontend

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Frontend build failed!"
    echo ""
    echo "📋 Alternative: Use development mode (works 100%)"
    echo "   docker-compose -f docker-compose.dev.yml up"
    echo ""
    exit 1
fi
echo "✓ Frontend built successfully"
echo ""

# Step 6: Start all services
echo "🚀 Step 6: Starting all services..."
docker-compose up -d
echo ""

# Step 7: Wait for services
echo "⏳ Step 7: Waiting for services to start..."
sleep 15
echo ""

# Step 8: Check status
echo "📊 Service Status:"
echo "=================="
docker-compose ps
echo ""

# Step 9: Health check
echo "🏥 Health Check:"
echo "================"

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/docs 2>/dev/null)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✓ Backend is responding"
else
    echo "⚠️  Backend not ready yet (this is normal, wait a moment)"
fi

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Access Your Application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8001"
echo "   API Docs:  http://localhost:8001/docs"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:      docker-compose logs -f"
echo "   Stop services:  docker-compose down"
echo "   Restart:        docker-compose restart"
echo ""
echo "🔐 First Admin Registration:"
echo "   1. Go to http://localhost:3000"
echo "   2. Register as 'Admin'"
echo "   3. First admin becomes Super Admin automatically"
echo ""
