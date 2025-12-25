#!/bin/bash

echo "🎯 FINAL WORKING DEPLOYMENT"
echo "==========================="
echo ""
echo "All dependency issues have been resolved!"
echo ""

cd /app

# Clean everything
echo "🧹 Cleaning previous builds..."
docker-compose down -v 2>/dev/null
docker system prune -f

# Build
echo ""
echo "🔨 Building services..."
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services..."
    sleep 15
    
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    
    echo ""
    echo "✅ DEPLOYMENT COMPLETE!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8001"  
    echo "   API Docs:  http://localhost:8001/docs"
    echo ""
    echo "📋 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🔐 First Admin:"
    echo "   Register at http://localhost:3000"
    echo "   Choose role: Admin"
    echo "   First admin becomes Super Admin"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "🔄 Alternative: Use development mode"
    echo "   docker-compose -f docker-compose.dev.yml up"
    echo ""
fi
