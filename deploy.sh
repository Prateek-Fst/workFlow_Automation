#!/bin/bash

# Automatisch Deployment Script
# Usage: ./deploy.sh [development|production]

set -e

MODE=${1:-development}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Deploying Automatisch in $MODE mode..."

# Function to generate secure keys
generate_keys() {
    echo "🔐 Generating security keys..."
    
    if ! command -v openssl &> /dev/null; then
        echo "❌ OpenSSL is required but not installed. Please install OpenSSL first."
        exit 1
    fi
    
    ENCRYPTION_KEY=$(openssl rand -base64 36)
    WEBHOOK_SECRET_KEY=$(openssl rand -base64 36)
    APP_SECRET_KEY=$(openssl rand -base64 36)
    POSTGRES_PASSWORD=$(openssl rand -base64 24)
    
    echo "✅ Security keys generated successfully"
}

# Function to create environment file
create_env_file() {
    local env_file=".env.${MODE}"
    
    echo "📝 Creating environment file: $env_file"
    
    cat > "$env_file" << EOF
# Automatisch ${MODE} Configuration
# Generated on $(date)

# Security Keys
ENCRYPTION_KEY=${ENCRYPTION_KEY}
WEBHOOK_SECRET_KEY=${WEBHOOK_SECRET_KEY}
APP_SECRET_KEY=${APP_SECRET_KEY}

# Database Configuration
POSTGRES_DATABASE=automatisch
POSTGRES_USERNAME=automatisch_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Application Configuration
HOST=${HOST:-localhost}
PROTOCOL=${PROTOCOL:-http}
WEB_APP_URL=${WEB_APP_URL:-http://localhost:3000}
WEBHOOK_URL=${WEBHOOK_URL:-http://localhost:3000}

# Optional Features
ENABLE_BULLMQ_DASHBOARD=${ENABLE_BULLMQ_DASHBOARD:-true}
TELEMETRY_ENABLED=${TELEMETRY_ENABLED:-false}
EOF
    
    echo "✅ Environment file created: $env_file"
}

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required but not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose is required but not installed. Please install Docker Compose first."
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to deploy
deploy() {
    local env_file=".env.${MODE}"
    
    echo "🐳 Starting Docker deployment..."
    
    # Use docker compose if available, fallback to docker-compose
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    $DOCKER_COMPOSE --env-file "$env_file" -f "$COMPOSE_FILE" down
    
    # Pull latest images
    echo "📥 Pulling latest images..."
    $DOCKER_COMPOSE --env-file "$env_file" -f "$COMPOSE_FILE" pull
    
    # Build and start services
    echo "🏗️ Building and starting services..."
    $DOCKER_COMPOSE --env-file "$env_file" -f "$COMPOSE_FILE" up -d --build
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    echo "🏥 Checking service health..."
    $DOCKER_COMPOSE --env-file "$env_file" -f "$COMPOSE_FILE" ps
    
    echo "✅ Deployment completed successfully!"
}

# Function to show deployment info
show_info() {
    echo ""
    echo "🎉 Automatisch is now running!"
    echo ""
    echo "📍 Access Information:"
    echo "   Web Interface: ${WEB_APP_URL:-http://localhost:3000}"
    echo "   Default Login: user@automatisch.io"
    echo "   Default Password: sample"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs: docker compose logs -f"
    echo "   Stop services: docker compose down"
    echo "   Restart: docker compose restart"
    echo "   Update: ./deploy.sh $MODE"
    echo ""
    echo "⚠️  Important: Change the default password after first login!"
    echo ""
}

# Main execution
main() {
    echo "🎯 Automatisch Multi-Branch Deployment Script"
    echo "=============================================="
    
    # Set compose file based on mode
    if [ "$MODE" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
        echo "🏭 Production mode selected"
    else
        echo "🛠️ Development mode selected"
    fi
    
    check_prerequisites
    generate_keys
    create_env_file
    deploy
    show_info
}

# Handle script arguments
case "$1" in
    "development"|"dev"|"")
        MODE="development"
        ;;
    "production"|"prod")
        MODE="production"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [development|production]"
        echo ""
        echo "Options:"
        echo "  development  Deploy in development mode (default)"
        echo "  production   Deploy in production mode"
        echo "  help         Show this help message"
        exit 0
        ;;
    *)
        echo "❌ Invalid mode: $1"
        echo "Use: $0 [development|production]"
        exit 1
        ;;
esac

# Run main function
main