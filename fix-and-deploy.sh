#!/bin/bash

set -e

echo "🔧 Docker Build Troubleshooter"
echo "=============================="
echo ""

cd /app

# Check if files exist
echo "📁 Checking required files..."
if [ -f "frontend/package.json" ]; then
    echo "✅ frontend/package.json exists"
else
    echo "❌ frontend/package.json missing"
    exit 1
fi

if [ -f "frontend/yarn.lock" ]; then
    echo "✅ frontend/yarn.lock exists"
else
    echo "⚠️  frontend/yarn.lock missing (will be generated)"
fi

if [ -f "backend/requirements.txt" ]; then
    echo "✅ backend/requirements.txt exists"
else
    echo "❌ backend/requirements.txt missing"
    exit 1
fi

echo ""
echo "🧹 Cleaning up old containers and images..."
docker-compose down -v 2>/dev/null || true
docker system prune -f

echo ""
echo "🔨 Building with simple Dockerfiles..."

# Use simple frontend Dockerfile
if [ -f "frontend/Dockerfile.simple" ]; then
    echo "Using simplified frontend Dockerfile..."
    cp frontend/Dockerfile frontend/Dockerfile.backup
    cp frontend/Dockerfile.simple frontend/Dockerfile
fi

# Build backend first
echo ""
echo "🐍 Building backend..."
docker-compose build --no-cache backend

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    echo "Trying alternative approach..."
    
    # Try with fallback Dockerfile
    if [ -f "backend/Dockerfile.fallback" ]; then
        cp backend/Dockerfile backend/Dockerfile.backup
        cp backend/Dockerfile.fallback backend/Dockerfile
        docker-compose build --no-cache backend
    fi
fi

# Build frontend
echo ""
echo "⚛️  Building frontend..."
docker-compose build --no-cache frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f"
echo ""
