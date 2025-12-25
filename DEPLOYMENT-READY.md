# ✅ DOCKER DEPLOYMENT - READY TO USE

## 🎯 Quick Deploy (ONE COMMAND)

```bash
./deploy-production.sh
```

This script will:
- Stop existing containers
- Clean Docker cache
- Build MongoDB, Backend, and Frontend
- Start all services
- Show status and access URLs

---

## 📋 What's Fixed

### ✅ Frontend Dockerfile
- **Old Issue:** Needed yarn.lock (caused COPY errors)
- **Fixed:** Now uses npm (works without yarn.lock)
- **File:** `/app/frontend/Dockerfile`

### ✅ Backend Dockerfile  
- **Old Issue:** emergentintegrations private package
- **Fixed:** Added private package index URL
- **Fallback:** `backend/Dockerfile.fallback` (works without emergentintegrations)

### ✅ Docker Compose
- **Fixed:** Added environment variables for frontend
- **Fixed:** Proper build contexts
- **Ready:** Production and development configs

---

## 🚀 Deployment Options

### Option 1: Automated Script (Recommended)
```bash
./deploy-production.sh
```

### Option 2: Manual Commands
```bash
# Stop existing
docker-compose down -v

# Build
docker-compose build --no-cache

# Start
docker-compose up -d

# Check status
docker-compose ps
```

### Option 3: Development Mode
```bash
# Hot reload for development
docker-compose -f docker-compose.dev.yml up
```

---

## 🌐 After Deployment

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:8001
**API Documentation:** http://localhost:8001/docs
**MongoDB:** localhost:27017

---

## 🔍 Check Everything Works

```bash
# 1. Check all services are running
docker-compose ps

# Expected output:
# apartment-mongodb     running
# apartment-backend     running (healthy)
# apartment-frontend    running (healthy)

# 2. Test backend API
curl http://localhost:8001/docs

# 3. Test frontend (open in browser)
open http://localhost:3000

# 4. View logs
docker-compose logs -f
```

---

## 🐛 If Build Fails

### Backend Fails (emergentintegrations error)

**Quick Fix:**
```bash
cp backend/Dockerfile.fallback backend/Dockerfile
docker-compose build --no-cache backend
docker-compose up -d
```

**What it does:** Uses fallback that skips emergentintegrations

### Frontend Fails (any error)

Frontend Dockerfile is already simplified and should work!

If issues persist:
```bash
# Check the Dockerfile
cat frontend/Dockerfile

# Should use npm install, not yarn
# Should not require yarn.lock
```

---

## 📁 Docker Files Structure

```
/app/
├── docker-compose.yml              ✅ Production config
├── docker-compose.dev.yml          ✅ Development config
├── deploy-production.sh            ✅ One-command deploy
├── fix-and-deploy.sh              ✅ Auto troubleshooter
├── backend/
│   ├── Dockerfile                  ✅ Main backend build
│   ├── Dockerfile.fallback         ✅ Backup (no private packages)
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile                  ✅ Simple npm-based build
│   ├── Dockerfile.simple           ✅ Same as above
│   ├── nginx.conf                  ✅ Web server config
│   └── package.json
└── .env.example                    ✅ Environment template
```

---

## ⚙️ Environment Variables

**Before deploying to production:**

1. Copy example env file:
```bash
cp .env.example .env
```

2. Edit `.env` and update:
```env
# Payment gateways (get your real keys)
STRIPE_API_KEY=sk_live_your_real_key
RAZORPAY_KEY_ID=rzp_live_your_real_key
RAZORPAY_KEY_SECRET=your_real_secret

# Security (change this!)
JWT_SECRET=your-super-secret-random-string

# CORS (your domain)
CORS_ORIGINS=https://yourdomain.com
```

3. Update docker-compose.yml to use .env file

---

## 🎯 First Time Setup

After deployment:

1. **Register First Admin**
   - Go to http://localhost:3000
   - Click "Register"
   - Choose role: "Admin"
   - This becomes the Super Admin automatically

2. **Add Flats**
   - Login as super admin
   - Go to "Manage Flats"
   - Add apartment units

3. **Set Charges**
   - Go to "Set Monthly Charges"
   - Define base charge and breakdown

4. **Test Payment**
   - Register as resident (use a flat number you created)
   - Try making a payment

---

## 🔐 Super Admin

**Current credentials:** firstadmin@example.com / test123

**To reset and create new super admin:**
```bash
# Clear database
docker-compose exec mongodb mongosh apartment_db --eval "db.users.deleteMany({role: 'admin'})"

# Register new admin at http://localhost:3000
# First admin becomes super admin
```

---

## 🛠️ Useful Commands

```bash
# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (clear data)
docker-compose down -v

# Rebuild specific service
docker-compose build --no-cache frontend

# Execute command in container
docker-compose exec backend bash
docker-compose exec mongodb mongosh apartment_db

# View running containers
docker-compose ps
```

---

## 📊 Monitoring

```bash
# Check CPU/Memory usage
docker stats

# Check disk usage
docker system df

# View container details
docker-compose exec backend ps aux
```

---

## 🧹 Cleanup

```bash
# Remove stopped containers
docker-compose down

# Remove all unused images
docker image prune -a

# Complete cleanup (careful!)
docker system prune -a --volumes
```

---

## 🚨 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs backend

# Check health
docker-compose ps
```

### Port already in use
```bash
# Find what's using the port
sudo lsof -i :3000
sudo lsof -i :8001

# Kill the process or change ports in docker-compose.yml
```

### Database connection error
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Should show "healthy"
# If not, check logs:
docker-compose logs mongodb
```

### Cannot access frontend
```bash
# Check nginx logs
docker-compose logs frontend

# Check backend is accessible
curl http://localhost:8001/docs
```

---

## 📚 Documentation

- **Main README:** `README.md`
- **Docker Guide:** `README.docker.md`
- **Quick Start:** `DOCKER-QUICKSTART.md`
- **Troubleshooting:** `DOCKER-TROUBLESHOOT.md`
- **Docker Fix:** `DOCKER-FIX.md`

---

## ✅ Production Checklist

Before going live:

- [ ] Update `.env` with production values
- [ ] Change `JWT_SECRET` to random string
- [ ] Use real Stripe/Razorpay API keys
- [ ] Update `CORS_ORIGINS` to your domain
- [ ] Set up SSL/HTTPS (use nginx reverse proxy)
- [ ] Enable MongoDB authentication
- [ ] Set up automated backups
- [ ] Configure monitoring/logging
- [ ] Test all payment flows
- [ ] Test admin approval workflow

---

## 🎉 You're All Set!

Run `./deploy-production.sh` and your app will be live!

For issues, check the troubleshooting docs or run `./fix-and-deploy.sh`

**Super Admin:** First person to register as admin
**Test Credentials:** firstadmin@example.com / test123
