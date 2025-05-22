# 📚 Blog Platform Backend (Node.js Microservices)

## 🏗️ Architecture

backend/
├── article-service/ # CRUD operations (Port 5001)
├── notification-service/ # Real-time WS (Port 5002)
├── user-service/ # Auth & profiles (Port 5003)
└── redis/ # Cache & pub/sub


## 🚀 Quick Start

### 1. **Start Redis (Mandatory First Step)**
```bash
sudo docker run -p 6379:6379 --name blog-redis -d redis

cd user-service
npm install && npm start

cd article-service
npm install && npm start

cd notification-service
node notification.service.js
