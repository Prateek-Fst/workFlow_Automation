# Automatisch - Open Source Zapier Alternative with Multi-Branch Support

🧐 Automatisch is a business automation tool that lets you connect different services like Twitter, Slack, and more to automate your business processes with advanced multi-branch workflow support.

## Features

✅ **Multi-Branch Workflows**: Create complex workflows with conditional branching and parallel execution
🔄 **Visual Flow Editor**: Drag-and-drop interface with real-time position saving  
🚀 **Open Source**: Complete transparency and community-driven development
💾 **Data Sovereignty**: Store your data on your own servers

## Local Installation

### Prerequisites

- Docker and Docker Compose
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/automatisch/automatisch.git
cd automatisch

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

### Access the Application

- **Web Interface**: http://localhost:3000
- **Default Login**: `user@automatisch.io` / `sample`

### Development Setup

```bash
# Clone the repository
git clone https://github.com/automatisch/automatisch.git
cd automatisch

# Install backend dependencies
cd packages/backend
yarn install

# Install frontend dependencies  
cd ../web
yarn install

# Copy environment file
cp .env-example .env

# Start PostgreSQL and Redis (required)
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d --name redis -p 6379:6379 redis:7

# Start backend
cd packages/backend
yarn dev

# Start frontend (in new terminal)
cd packages/web  
yarn dev
```

### Environment Variables

Create `.env` file with:

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_DATABASE=automatisch
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security (generate with: openssl rand -base64 36)
ENCRYPTION_KEY=your-encryption-key
WEBHOOK_SECRET_KEY=your-webhook-secret
APP_SECRET_KEY=your-app-secret
```

## Multi-Branch Workflows

### Import Sample Workflow

1. Open the workflow editor
2. Click "Import Multi-Branch Workflow" 
3. Use the pre-loaded sample to test branching functionality

### Basic Commands

```bash
# Stop services
docker compose down

# View logs
docker compose logs -f main

# Restart services
docker compose restart

# Reset database
docker compose down -v && docker compose up -d
```

## Support

- **Issues**: [GitHub Issues](https://github.com/automatisch/automatisch/issues)
- **Discord**: [Join Community](https://discord.gg/dJSah9CVrC)

## License

AGPL-3.0 License - see [LICENSE](LICENSE) file for details.