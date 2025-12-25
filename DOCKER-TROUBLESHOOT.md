# Docker Build Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: yarn.lock not found

**Error:**
```
COPY failed: file not found in build context or excluded by .dockerignore: stat yarn.lock: file does not exist
```

**Solutions:**

#### Option A: Use Simple Dockerfile (Recommended)
```bash
cp frontend/Dockerfile.simple frontend/Dockerfile
docker-compose build --no-cache frontend
docker-compose up -d
```

#### Option B: Generate yarn.lock
```bash
cd frontend
yarn install
cd ..
docker-compose build --no-cache
docker-compose up -d
```

#### Option C: Use NPM instead
Update `frontend/Dockerfile` to use npm:
```dockerfile
COPY package.json ./
RUN npm install
```

### Issue 2: emergentintegrations not found

**Error:**
```
ERROR: No matching distribution found for emergentintegrations==0.1.0
```

**Solution:**
```bash
cp backend/Dockerfile.fallback backend/Dockerfile
docker-compose build --no-cache backend
docker-compose up -d
```

### Issue 3: Build context issues

**Error:**
```
COPY failed: file not found in build context
```

**Solution:**
Check your build context in docker-compose.yml:
```yaml
frontend:
  build:
    context: ./frontend  # Should point to frontend directory
    dockerfile: Dockerfile
```

## Automated Fix Script

Run the automated troubleshooter:

```bash
chmod +x fix-and-deploy.sh
./fix-and-deploy.sh
```

This script will:
1. Check all required files
2. Clean up old containers
3. Use simplified Dockerfiles
4. Build and start services
5. Show status

## Manual Step-by-Step

### 1. Clean Everything
```bash
docker-compose down -v
docker system prune -a -f
```

### 2. Use Simple Dockerfiles
```bash
# Frontend
cp frontend/Dockerfile.simple frontend/Dockerfile

# Backend (if needed)
cp backend/Dockerfile.fallback backend/Dockerfile
```

### 3. Build Services One by One
```bash
# Build backend
docker-compose build --no-cache backend

# Build frontend
docker-compose build --no-cache frontend

# Build MongoDB (should work automatically)
docker-compose build --no-cache mongodb
```

### 4. Start Services
```bash
docker-compose up -d
```

### 5. Check Status
```bash
docker-compose ps
docker-compose logs -f
```

## Alternative: Development Mode

If production build fails, try development mode:

```bash
docker-compose -f docker-compose.dev.yml up
```

Development mode:
- Uses simpler configuration
- Has hot reload
- Easier to debug

## Verify Build Context

Check what files Docker can see:

```bash
# List files in frontend build context
cd frontend && ls -la

# List files in backend build context
cd backend && ls -la
```

## Check .dockerignore

Make sure important files aren't ignored:

```bash
cat frontend/.dockerignore
cat backend/.dockerignore
```

Important files that should NOT be in .dockerignore:
- package.json
- yarn.lock (if using yarn)
- requirements.txt
- source code files

## Debug Build Process

Build with verbose output:

```bash
docker-compose build --no-cache --progress=plain backend
docker-compose build --no-cache --progress=plain frontend
```

## Test Services Individually

### Test Backend
```bash
docker-compose up backend mongodb
# In another terminal:
curl http://localhost:8001/docs
```

### Test Frontend
```bash
docker-compose up frontend
# Visit: http://localhost:3000
```

## Common Docker Commands

```bash
# View all containers
docker ps -a

# View all images
docker images

# Remove specific container
docker rm <container_id>

# Remove specific image
docker rmi <image_id>

# View container logs
docker logs <container_name>

# Execute command in container
docker exec -it <container_name> sh

# Inspect container
docker inspect <container_name>
```

## Still Not Working?

### Option 1: Use Pre-built Images
Consider using pre-built images from Docker Hub if available.

### Option 2: Build Locally First
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

### Option 3: Simplify Further
Remove optional features:
1. Remove Stripe integration (keep only Razorpay)
2. Use basic authentication (remove super admin features)
3. Simplify Docker configuration

## Get Help

If issues persist:
1. Share the exact error message
2. Share output of `docker-compose config`
3. Share output of `docker-compose build --no-cache --progress=plain`
4. Share contents of Dockerfile causing issues

## Quick Fix Commands

```bash
# Nuclear option - complete reset
docker-compose down -v
docker system prune -a -f --volumes
cp frontend/Dockerfile.simple frontend/Dockerfile
cp backend/Dockerfile.fallback backend/Dockerfile
docker-compose build --no-cache
docker-compose up -d
```
