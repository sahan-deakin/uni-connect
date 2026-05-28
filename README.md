# UniConnect — Dockerised Deployment

A university social platform built with Node.js, Express, MongoDB, and Socket.io.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| [Docker](https://docs.docker.com/get-docker/) | 24+ |
| [Docker Compose](https://docs.docker.com/compose/install/) | v2 (bundled with Docker Desktop) |

> **Note:** Docker Desktop (Mac/Windows) includes both Docker and Compose. On Linux, install the `docker-compose-plugin` package.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/uni-connect.git
cd uni-connect
```

### 2. Configure environment (optional)

The application ships with sensible defaults and works out of the box without any configuration. If you want to customise values (e.g. a stronger JWT secret), copy the example file:

```bash
cp .env.example .env
# Edit .env with your preferred values
```

> **No `.env` file is required to run the application.** All defaults are set in `docker-compose.yml` and the application source. If you do create a `.env`, Docker Compose will pick it up automatically.

### 3. Build and start

```bash
docker compose up --build
```

Docker Compose will:
1. Pull the official `mongo:7` image.
2. Build the Node.js application image from the `Dockerfile`.
3. Start MongoDB first and wait until it is healthy.
4. Start the application container once MongoDB is ready.

The first build takes ~60–90 seconds. Subsequent starts (without `--build`) are fast.

### 4. Verify the application is running

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the UniConnect home/login page.

---

## Available Ports

| Service | Host port | Container port |
|---------|-----------|----------------|
| Node.js app | **3000** | 3000 |
| MongoDB | not exposed | 27017 (internal only) |

---

## API Endpoints

### Student identity endpoint (HD Task 8.2)

```
GET http://localhost:3000/api/student
```

**Expected response:**

```json
{
  "name": "YOUR FULL NAME",
  "studentId": "YOUR_STUDENT_ID"
}
```

### Health check

```
GET http://localhost:3000/health
```

**Expected response (when healthy):**

```json
{
  "status": "ok",
  "db": "connected"
}
```

---

## Core Features (Database-Backed)

The following features require a running MongoDB connection and can be used to verify end-to-end database integration:

| Feature | How to test |
|---------|-------------|
| **User registration** | Visit `http://localhost:3000` → Sign Up |
| **User login** | Visit `http://localhost:3000/login.html` → Log In |
| **Events** | Log in → navigate to Events |
| **Forum** | Log in → navigate to Forum |
| **Resources** | Log in → navigate to Resources |

---

## Stopping the Application

```bash
# Stop and remove containers (data volume is preserved)
docker compose down

# Stop, remove containers AND delete all MongoDB data
docker compose down -v
```

---

## Seeding Sample Data (Optional)

After the containers are running, you can seed the database with sample records:

```bash
docker compose exec app node scripts/seed.js
docker compose exec app node scripts/seedDashboard.js
```

---

## Configuration Reference

All configuration is passed to the app container as environment variables. Values can be set in a `.env` file in the project root.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `MONGO_URI` | `mongodb://mongo:27017/uni-connect` | MongoDB connection string (set by docker-compose) |
| `JWT_SECRET` | `uniconnect-dev-secret` | Secret used to sign JWT tokens |

> **Security note:** The default `JWT_SECRET` is intentional for local development and marking purposes. Do not use this value in a production deployment.

---

## Sensitive Information

No sensitive credentials are required from the marker to run this application. The defaults in `docker-compose.yml` are sufficient for full end-to-end functionality. A `.env.example` file is provided for reference.

If any configuration values are explicitly excluded from this repository for security reasons, they will be noted clearly in the OnTrack submission comments along with instructions for obtaining them.

---

## Troubleshooting

**Port 3000 already in use:**
```bash
# Check what's using port 3000
lsof -i :3000   # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Or change the host port in docker-compose.yml:
# ports:
#   - "3001:3000"   ← use 3001 on your machine instead
```

**MongoDB not connecting / app crashes on startup:**
```bash
# Check logs for both services
docker compose logs mongo
docker compose logs app

# Restart with a clean state
docker compose down -v && docker compose up --build
```

**Rebuild after code changes:**
```bash
docker compose up --build
```

---

## Project Structure

```
uni-connect/
├── controllers/       # Route handler logic
├── middleware/        # Auth middleware (JWT verification)
├── models/            # Mongoose schemas
├── public/            # Static frontend (HTML, CSS, JS)
├── routes/            # Express router definitions
├── scripts/           # DB seed scripts
├── services/          # Business logic & Socket.io setup
├── server.js          # Application entry point
├── Dockerfile         # Container image definition
├── docker-compose.yml # Multi-service orchestration
├── .env.example       # Environment variable reference
└── .dockerignore      # Files excluded from Docker build context
```
