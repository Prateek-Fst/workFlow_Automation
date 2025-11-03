# Automatisch

## Local Installation

### Prerequisites
- Docker and Docker Compose
- Node.js and npm
- PostgreSQL
- Redis

### Docker Setup

```bash
# Clone repository
git clone https://github.com/automatisch/automatisch.git
cd automatisch

# Start with Docker
docker compose up -d

# Access: http://localhost:3000
# Login: user@automatisch.io / sample
```

### Manual Setup

```bash
# Clone repository
git clone https://github.com/automatisch/automatisch.git
cd automatisch

# Install backend dependencies
cd packages/backend
npm install

# Install frontend dependencies
cd ../web
npm install --legacy-peer-deps

# Start PostgreSQL and Redis
psql -U postgres -c "CREATE DATABASE workflow;"
redis-server

# Run database migrations
cd packages/backend
npm run db:migrate
npm run db:seed:user

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2)
cd packages/web
npm run dev
```

### Access
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **Login**: user@automatisch.io / sample

### Commands

```bash
# Docker
docker compose up -d        # Start
docker compose down         # Stop
docker compose logs -f      # View logs

# Manual
npm run dev                 # Start backend
npm run dev                 # Start frontend (in web folder)
```