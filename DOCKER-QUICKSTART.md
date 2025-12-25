# Docker Setup - Quick Reference

## 📦 What's Been Created

### Docker Configuration Files

1. **docker-compose.yml** - Production setup
   - Multi-stage builds for optimization
   - Nginx for frontend serving
   - MongoDB with persistent storage
   - Health checks for all services

2. **docker-compose.dev.yml** - Development setup
   - Hot reload for backend and frontend
   - Volume mounts for live code updates
   - Development environment variables

3. **Backend Dockerfile** (`backend/Dockerfile`)
   - Python 3.11 slim base image
   - FastAPI with Uvicorn
   - Auto-reload enabled

4. **Frontend Dockerfile** (`frontend/Dockerfile`)
   - Multi-stage build (Node.js + Nginx)
   - Optimized production build
   - Custom Nginx configuration

5. **Support Files**
   - `nginx.conf` - Custom Nginx configuration
   - `docker-entrypoint.sh` - Environment variable injection
   - `.dockerignore` files - Optimize build context
   - `start-docker.sh` - One-command startup script

## 🚀 How to Use

### Quick Start (Recommended)

```bash
# Make script executable (first time only)
chmod +x start-docker.sh

# Start the application
./start-docker.sh
```

The script will ask you to choose:
1. Production mode (optimized)
2. Development mode (hot reload)

### Manual Commands

#### Production Mode
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Development Mode
```bash
# Start in dev mode
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🌐 Access Points

Once running, access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **MongoDB**: localhost:27017

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
# Edit .env with your values
```

Key variables:
- `STRIPE_API_KEY` - Your Stripe API key
- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay secret
- `JWT_SECRET` - Strong secret for JWT tokens
- `REACT_APP_BACKEND_URL` - Backend URL for frontend

## 📁 Container Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│                                         │
│  ┌─────────────┐   ┌────────────────┐ │
│  │  Frontend   │   │    Backend     │ │
│  │  (Nginx)    │──▶│   (FastAPI)    │ │
│  │  Port: 80   │   │   Port: 8001   │ │
│  └─────────────┘   └────────┬───────┘ │
│                              │          │
│                              ▼          │
│                     ┌────────────────┐ │
│                     │    MongoDB     │ │
│                     │   Port: 27017  │ │
│                     └────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## 🔍 Useful Commands

### Container Management
```bash
# View running containers
docker-compose ps

# Restart a service
docker-compose restart backend

# Rebuild a service
docker-compose up -d --build backend

# Execute command in container
docker-compose exec backend bash
docker-compose exec mongodb mongosh

# View logs for specific service
docker-compose logs -f backend
```

### Database Operations
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh apartment_db

# Backup database
docker-compose exec mongodb mongodump --out=/data/backup

# View MongoDB data
docker-compose exec mongodb mongosh apartment_db --eval "db.users.find().pretty()"
```

### Cleanup
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes data!)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
sudo lsof -i :3000
sudo lsof -i :8001

# Change ports in docker-compose.yml if needed
```

### Cannot Connect to Backend
1. Check if backend is running: `docker-compose ps`
2. View backend logs: `docker-compose logs backend`
3. Verify environment variables in `docker-compose.yml`
4. Check CORS settings

### MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify MongoDB is healthy
docker-compose ps
# Should show "Up (healthy)"

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

### Build Failures
```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove old images
docker image prune -a

# Start fresh
docker-compose down -v
docker-compose up -d --build
```

## 🔐 Security Notes

### Before Production Deployment:

1. **Update all secrets**:
   - Change `JWT_SECRET` to a strong random value
   - Use production API keys for Stripe and Razorpay
   - Set strong MongoDB passwords

2. **Configure CORS**:
   - Update `CORS_ORIGINS` to your domain only
   - Remove wildcard (*) in production

3. **Use environment files**:
   - Never commit `.env` files to git
   - Use Docker secrets or environment variables in production

4. **Enable SSL**:
   - Add SSL certificates to Nginx
   - Redirect HTTP to HTTPS

5. **MongoDB Security**:
   - Enable authentication
   - Use strong passwords
   - Don't expose port 27017 publicly

## 📊 Performance Optimization

### Production Optimizations Already Included:

1. **Multi-stage builds**: Reduces image size
2. **Layer caching**: Faster rebuilds
3. **Nginx compression**: Gzip enabled
4. **Static asset caching**: 1 year cache for assets
5. **Health checks**: Automatic recovery

### Additional Optimizations:

Add resource limits in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Docker Details**: See `README.docker.md`
- **API Documentation**: http://localhost:8001/docs (when running)

## ✅ Checklist for First Run

- [ ] Docker and Docker Compose installed
- [ ] Copied `.env.example` to `.env`
- [ ] Updated API keys in `.env`
- [ ] Ports 3000, 8001, 27017 are available
- [ ] Run `./start-docker.sh` or `docker-compose up -d`
- [ ] Access http://localhost:3000
- [ ] Register first admin (becomes super admin)
- [ ] Test login and features

## 🎯 What's Next?

1. **Push to GitHub**: Use the git push feature
2. **Deploy to Cloud**: 
   - DigitalOcean App Platform
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances
3. **Set Up CI/CD**: GitHub Actions for automated deployments
4. **Monitor**: Add logging and monitoring tools

---

**Note**: All Docker configurations are production-ready. Just update the environment variables and deploy!
