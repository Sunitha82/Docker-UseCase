# Complete Docker Compose Guide - Multi-Container Application

> **🎯 Prerequisites**: Only Docker and Docker Compose need to be installed. All services (PostgreSQL, Redis) will be automatically downloaded by Docker.

## **Use Case: Multi-Container Application with Docker Compose**

Deploy a web application with a database and Redis cache using Docker Compose. This guide covers setup, monitoring, troubleshooting, and management.

---

## **Initial Setup**

### **1. Create docker-compose.yml**
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_USER=user
      - DB_PASSWORD=password
      - DB_NAME=myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

### **2. Create Sample Application Files**

**package.json:**
```json
{
  "name": "multi-container-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0"
  }
}
```

**server.js:**
```javascript
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Multi-container app running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/data', async (req, res) => {
  try {
    // Test database
    const dbResult = await pool.query('SELECT NOW() as db_time');
    
    // Test Redis
    await redisClient.set('test_key', 'Hello Redis!');
    const redisResult = await redisClient.get('test_key');
    
    res.json({
      database: dbResult.rows[0],
      redis: redisResult,
      status: 'All services connected!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### **3. Start the Application**
```bash
# Start all services (Docker will download images on first run)
docker-compose up -d

# View startup logs
docker-compose logs -f
```

---

## **Service Monitoring & Management**

### **Check Service Status**
```bash
# View all running services with their status
docker-compose ps
```

**Expected output:**
```
    Name                   Command               State           Ports
-------------------------------------------------------------------------
myapp_web_1     docker-entrypoint.s ...   Up      0.0.0.0:3000->3000/tcp
myapp_db_1      docker-entrypoint.s ...   Up      5432/tcp
myapp_redis_1   docker-entrypoint.s ...   Up      0.0.0.0:6379->6379/tcp
```

### **View Service Logs**
```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs web
docker-compose logs db
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f web

# View last 50 lines of logs
docker-compose logs --tail=50 web

# View logs with timestamps
docker-compose logs -t web
```

### **Test Your Services**

**Test the web application:**
```bash
# Basic connectivity test
curl http://localhost:3000

# Health check endpoint
curl http://localhost:3000/health

# Test database and Redis connectivity
curl http://localhost:3000/data
```

**Test database connection:**
```bash
# Connect to PostgreSQL command line
docker-compose exec db psql -U user -d myapp

# Quick connection test
docker-compose exec db pg_isready -U user

# Check database version
docker-compose exec db psql -U user -d myapp -c "SELECT version();"
```

**Test Redis:**
```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# Test Redis with ping command
docker-compose exec redis redis-cli ping
# Should return: PONG

# Test Redis operations
docker-compose exec redis redis-cli set test "Hello World"
docker-compose exec redis redis-cli get test
```

### **Inspect Service Details**
```bash
# Check environment variables in web service
docker-compose exec web env

# Test network connectivity between services
docker-compose exec web ping db
docker-compose exec web ping redis

# Check if services can connect on specific ports
docker-compose exec web nc -zv db 5432
docker-compose exec web nc -zv redis 6379

# Check listening ports inside containers
docker-compose exec web netstat -tlnp
docker-compose exec db netstat -tlnp
```

### **Access Service Shells**
```bash
# Access web container shell
docker-compose exec web /bin/sh

# Access database container bash
docker-compose exec db bash

# Access Redis container shell
docker-compose exec redis sh

# Run commands inside containers
docker-compose exec web ls -la /app
docker-compose exec db ls -la /var/lib/postgresql/data
```

---

## **Database Operations**

### **Database Setup and Management**
```bash
# Connect to database
docker-compose exec db psql -U user -d myapp

# Create tables (run inside psql)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product VARCHAR(100),
    quantity INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Insert sample data
INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

INSERT INTO orders (user_id, product, quantity) VALUES 
(1, 'Laptop', 1),
(2, 'Mouse', 2);

# Query data
SELECT * FROM users;
SELECT * FROM orders;

# Exit psql
\q
```

### **Database Backup and Restore**
```bash
# Create backup
docker-compose exec db pg_dump -U user myapp > backup.sql

# Restore backup (if needed)
docker-compose exec -T db psql -U user myapp < backup.sql

# Copy files from container
docker-compose exec db pg_dump -U user myapp > /tmp/backup.sql
docker cp $(docker-compose ps -q db):/tmp/backup.sql ./backup.sql
```

---

## **Scaling and Performance**

### **Scale Services**
```bash
# Scale the web service to 3 instances
docker-compose up -d --scale web=3

# Check scaled services
docker-compose ps

# Scale back to 1 instance
docker-compose up -d --scale web=1
```

### **Monitor Resource Usage**
```bash
# View real-time stats for all containers
docker stats

# View stats for compose services only
docker stats $(docker-compose ps -q)

# View resource usage without streaming
docker stats --no-stream

# Check disk usage
docker system df

# Check specific container resource usage
docker stats myapp_web_1
```

### **Performance Testing**
```bash
# Simple load test with curl
for i in {1..10}; do curl http://localhost:3000/data; done

# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:3000/

# Monitor during load testing
watch docker stats
```

---

## **Service Management**

### **Restart and Stop Services**
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart web

# Stop all services (keeps containers)
docker-compose stop

# Stop specific service
docker-compose stop web

# Start stopped services
docker-compose start

# Stop and remove containers
docker-compose down

# Stop and remove containers, networks, and volumes
docker-compose down -v
```

### **Update and Rebuild Services**
```bash
# Rebuild specific service
docker-compose build web

# Rebuild and restart
docker-compose up -d --build

# Pull latest images
docker-compose pull

# Force recreate containers
docker-compose up -d --force-recreate
```

---

## **Complete Health Check Workflow**

Run this comprehensive check to verify all services:

```bash
echo "=== Docker Compose Health Check ==="

echo "1. Checking service status..."
docker-compose ps

echo -e "\n2. Checking logs for errors..."
docker-compose logs --tail=10

echo -e "\n3. Testing web service..."
curl -s http://localhost:3000 | jq .

echo -e "\n4. Testing health endpoint..."
curl -s http://localhost:3000/health | jq .

echo -e "\n5. Testing database and Redis connectivity..."
curl -s http://localhost:3000/data | jq .

echo -e "\n6. Testing database directly..."
docker-compose exec db pg_isready -U user

echo -e "\n7. Testing Redis directly..."
docker-compose exec redis redis-cli ping

echo -e "\n8. Testing inter-service connectivity..."
docker-compose exec web ping -c 1 db
docker-compose exec web ping -c 1 redis

echo -e "\n9. Checking resource usage..."
docker stats --no-stream

echo -e "\n=== Health Check Complete ==="
```

---

## **Troubleshooting Guide**

### **Service Won't Start**
```bash
# Check the logs for that service
docker-compose logs [service-name]

# Check the Dockerfile and docker-compose.yml syntax
docker-compose config

# Try building manually
docker-compose build [service-name]

# Try running without detached mode to see errors
docker-compose up [service-name]
```

### **Can't Connect to Service**
```bash
# Verify port mappings
docker-compose ps

# Check if service is listening
docker-compose exec [service-name] netstat -tlnp

# Test connectivity from another service
docker-compose exec web telnet db 5432
docker-compose exec web telnet redis 6379

# Check network connectivity
docker network ls
docker network inspect myapp_app-network
```

### **Database Connection Issues**
```bash
# Check database is ready
docker-compose exec db pg_isready -U user

# Check database logs
docker-compose logs db

# Verify environment variables
docker-compose exec db env | grep POSTGRES
docker-compose exec web env | grep DB_

# Test database connection manually
docker-compose exec web psql -h db -U user -d myapp
```

### **Redis Connection Issues**
```bash
# Check Redis logs
docker-compose logs redis

# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Check Redis info
docker-compose exec redis redis-cli info

# Test from web service
docker-compose exec web redis-cli -h redis ping
```

### **Application Not Responding**
```bash
# Check application logs
docker-compose logs web

# Check if app is listening on correct port
docker-compose exec web netstat -tlnp | grep 3000

# Check environment variables
docker-compose exec web env

# Test from inside container
docker-compose exec web curl http://localhost:3000
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Check container limits
docker-compose exec web cat /sys/fs/cgroup/memory/memory.limit_in_bytes

# Check logs for errors
docker-compose logs web | grep -i error

# Check database performance
docker-compose exec db psql -U user -d myapp -c "SELECT * FROM pg_stat_activity;"
```

### **Clean Restart Procedure**
If multiple issues persist:

```bash
# 1. Stop everything
docker-compose down

# 2. Remove volumes (WARNING: This deletes data)
docker-compose down -v

# 3. Remove old images
docker-compose down --rmi all

# 4. Clean Docker system
docker system prune -f

# 5. Rebuild and start fresh
docker-compose build --no-cache
docker-compose up -d

# 6. Run health check
docker-compose logs -f
```

---

## **Production Tips**

### **Environment Variables**
Create a `.env` file for production settings:
```bash
# .env file
POSTGRES_USER=produser
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=production_db
REDIS_PASSWORD=redis_secure_password
NODE_ENV=production
```

### **Docker Compose Override**
Create `docker-compose.prod.yml` for production:
```yaml
version: '3.8'
services:
  web:
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    
  db:
    restart: unless-stopped
    volumes:
      - /data/postgres:/var/lib/postgresql/data
    
  redis:
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

Use with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### **Monitoring in Production**
```bash
# Set up log rotation
docker-compose logs --follow > app.log &

# Monitor with auto-restart
docker-compose up -d --restart unless-stopped

# Health checks
while true; do
  curl -f http://localhost:3000/health || docker-compose restart web
  sleep 60
done
```

---

This comprehensive guide covers everything you need to know about managing multi-container Docker applications with Docker Compose, from initial setup to production deployment and troubleshooting.