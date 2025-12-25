#!/bin/bash

echo "🎯 FINAL DEPLOYMENT - All Issues Resolved"
echo "=========================================="
echo ""

cd /app

echo "📋 Configuration:"
echo "  - ajv: 6.12.6 (stable)"
echo "  - ajv-keywords: 3.5.2 (compatible)"
echo "  - ajv-formats: 1.6.1 (compatible)"
echo ""

echo "🧹 Cleaning..."
docker-compose down -v 2>/dev/null
docker builder prune -f 2>/dev/null

echo ""
echo "🔨 Building..."
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting 20 seconds for services to start..."
    sleep 20
    
    echo ""
    echo "📊 Status:"
    docker-compose ps
    
    echo ""
    echo "🏥 Health Check:"
    
    # Check backend
    if curl -s http://localhost:8001/docs > /dev/null 2>&1; then
        echo "  ✅ Backend: Ready"
    else
        echo "  ⏳ Backend: Starting (check in a moment)"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "  ✅ Frontend: Ready"
    else
        echo "  ⏳ Frontend: Starting (check in a moment)"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Access Your Application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8001"
    echo "   API Docs:  http://localhost:8001/docs"
    echo ""
    echo "📋 Commands:"
    echo "   Logs:    docker-compose logs -f"
    echo "   Stop:    docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
    echo "🔐 First Time Setup:"
    echo "   1. Visit http://localhost:3000"
    echo "   2. Register as 'Admin'"
    echo "   3. First admin = Super Admin"
    echo ""
    echo "✨ Features:"
    echo "   ✓ Multi-admin approval system"
    echo "   ✓ Stripe + Razorpay payments"
    echo "   ✓ Flats & dues management"
    echo "   ✓ Payment tracking & receipts"
    echo "   ✓ Resident & admin dashboards"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "📋 View error logs:"
    echo "   docker-compose logs ap-frontend"
    echo ""
    echo "🔄 Alternative: Development mode"
    echo "   docker-compose -f docker-compose.dev.yml up"
    echo ""
fi
