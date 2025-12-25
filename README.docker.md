# Apartment Maintenance Tracker - Docker Setup

This guide explains how to run the Apartment Maintenance Tracker application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Production Build

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - MongoDB: localhost:27017

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f mongodb
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (clears database):**
   ```bash
   docker-compose down -v
   ```

### Development Mode

For development with hot-reload:

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Benefits:**
   - Hot reload for both frontend and backend
   - Code changes reflected immediately
   - Source code mounted as volumes

## Architecture

### Services

1. **MongoDB** (Port 27017)
   - Database service
   - Persistent volume for data storage
   - Health checks enabled

2. **Backend** (Port 8001)
   - FastAPI application
   - Connected to MongoDB
   - Hot reload in development mode

3. **Frontend** (Port 3000/80)
   - React application
   - Nginx server in production
   - Development server in dev mode

### Networks

- All services communicate through a dedicated Docker network
- Services reference each other by container name

### Volumes

- `mongodb_data`: Persists MongoDB data
- Source code volumes in development mode

## Environment Variables

### Backend Environment Variables

```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=apartment_db
CORS_ORIGINS=http://localhost:3000,http://localhost
STRIPE_API_KEY=sk_test_emergent
RAZORPAY_KEY_ID=rzp_test_emergent
RAZORPAY_KEY_SECRET=test_secret_emergent
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend Environment Variables

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Production Deployment

### Update Environment Variables

1. Create `.env` file in the root directory:
   ```env
   # MongoDB
   MONGO_INITDB_DATABASE=apartment_db
   
   # Backend
   MONGO_URL=mongodb://mongodb:27017
   DB_NAME=apartment_db
   CORS_ORIGINS=https://yourdomain.com
   STRIPE_API_KEY=sk_live_your_stripe_key
   RAZORPAY_KEY_ID=rzp_live_your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   JWT_SECRET=your-strong-secret-key-here
   
   # Frontend
   REACT_APP_BACKEND_URL=https://api.yourdomain.com
   ```

2. Update `docker-compose.yml` to use `.env` file

### SSL/HTTPS Setup

For production, add SSL certificates:

1. Use Let's Encrypt with Certbot
2. Add Nginx reverse proxy
3. Configure SSL in `nginx.conf`

## Useful Commands

### Container Management

```bash
# Restart a specific service
docker-compose restart backend

# Rebuild a service
docker-compose up -d --build backend

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh

# View container status
docker-compose ps
```

### Database Operations

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh apartment_db

# Backup database
docker-compose exec mongodb mongodump --out=/data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change ports in docker-compose.yml
   # Or stop conflicting services
   sudo lsof -i :3000
   sudo lsof -i :8001
   ```

2. **MongoDB connection failed:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Ensure MongoDB is healthy
   docker-compose ps
   ```

3. **Frontend can't connect to backend:**
   - Verify `REACT_APP_BACKEND_URL` is set correctly
   - Check CORS settings in backend
   - Ensure backend is running: `docker-compose ps`

4. **Build fails:**
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   ```

### Health Checks

All services have health checks. View status:
```bash
docker-compose ps
```

Healthy services show: `Up (healthy)`

## Security Best Practices

1. **Never commit sensitive credentials**
   - Use `.env` files (add to `.gitignore`)
   - Use Docker secrets in production

2. **Update default passwords**
   - Change JWT_SECRET
   - Use strong MongoDB credentials in production

3. **Network security**
   - Don't expose MongoDB port in production
   - Use internal Docker networks

4. **Regular updates**
   - Keep base images updated
   - Update dependencies regularly

## Performance Optimization

1. **Multi-stage builds** (already implemented)
   - Reduces final image size
   - Separates build and runtime dependencies

2. **Layer caching**
   - Dependencies copied before code
   - Faster rebuilds

3. **Resource limits**
   Add to `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Verify environment variables
- Ensure all services are healthy

## License

MIT License - See LICENSE file for details