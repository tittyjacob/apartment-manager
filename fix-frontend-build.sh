#!/bin/bash

echo "🔧 Frontend Build Fixer"
echo "======================="
echo ""

cd /app

echo "Trying different build approaches..."
echo ""

# Approach 1: Use yarn (most reliable for React apps)
echo "📦 Approach 1: Building with Yarn..."
cp frontend/Dockerfile.yarn frontend/Dockerfile
docker-compose build --no-cache frontend 2>&1 | tee /tmp/build1.log

if [ $? -eq 0 ]; then
    echo "✅ Success with Yarn!"
    docker-compose up -d
    exit 0
fi

echo "❌ Yarn approach failed"
echo ""

# Approach 2: Use Node 16 (better compatibility)
echo "📦 Approach 2: Building with Node 16..."
cp frontend/Dockerfile.node16 frontend/Dockerfile
docker-compose build --no-cache frontend 2>&1 | tee /tmp/build2.log

if [ $? -eq 0 ]; then
    echo "✅ Success with Node 16!"
    docker-compose up -d
    exit 0
fi

echo "❌ Node 16 approach failed"
echo ""

# Approach 3: Build locally then copy
echo "📦 Approach 3: Building locally..."
cd frontend

# Check if node_modules exists locally
if [ -d "node_modules" ] && [ -d "build" ]; then
    echo "Found existing build, using it..."
    cd ..
    
    # Create simple Dockerfile that copies pre-built files
    cat > frontend/Dockerfile << 'EOF'
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

    docker-compose build --no-cache frontend
    
    if [ $? -eq 0 ]; then
        echo "✅ Success with pre-built files!"
        docker-compose up -d
        exit 0
    fi
fi

echo ""
echo "❌ All approaches failed!"
echo ""
echo "📋 Build logs saved to:"
echo "   /tmp/build1.log (yarn)"
echo "   /tmp/build2.log (node16)"
echo ""
echo "🔍 Manual fix options:"
echo ""
echo "Option 1: Build locally first, then Docker"
echo "  cd frontend"
echo "  npm install --force"
echo "  npm run build"
echo "  cd .."
echo "  # Then use Approach 3 above"
echo ""
echo "Option 2: Use development mode (no build needed)"
echo "  docker-compose -f docker-compose.dev.yml up"
echo ""
echo "Option 3: Fix package.json dependencies"
echo "  Update ajv and ajv-keywords versions"
echo ""
