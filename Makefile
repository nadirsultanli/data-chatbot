# Makefile for SQL Chatbot Docker Operations

.PHONY: help build up down logs clean dev prod restart status

# Default target
help:
	@echo "🐳 SQL Chatbot Docker Commands"
	@echo "=============================="
	@echo "Development:"
	@echo "  make dev          - Start development environment with hot reload"
	@echo "  make dev-build    - Build and start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-logs    - View production logs"
	@echo ""
	@echo "General:"
	@echo "  make status       - Show container status"
	@echo "  make clean        - Remove all containers and images"
	@echo "  make restart      - Restart all services"
	@echo "  make setup        - Create .env file from example"

# Setup
setup:
	@echo "📋 Setting up environment..."
	@if [ ! -f .env ]; then \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
			echo "✅ Created .env file from .env.example"; \
			echo "⚠️  Please edit .env file with your actual values!"; \
		else \
			echo "❌ .env.example not found"; \
		fi \
	else \
		echo "✅ .env file already exists"; \
	fi

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up

dev-build:
	@echo "🔨 Building and starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	@echo "📋 Viewing development logs..."
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose up

prod-build:
	@echo "🔨 Building and starting production environment..."
	docker-compose up --build

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose down

prod-logs:
	@echo "📋 Viewing production logs..."
	docker-compose logs -f

# General commands
status:
	@echo "📊 Container status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

restart:
	@echo "🔄 Restarting all services..."
	docker-compose down
	docker-compose up

clean:
	@echo "🧹 Cleaning up containers and images..."
	docker-compose down --rmi all --volumes --remove-orphans
	docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
	docker system prune -f

# Backend specific
backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

backend-shell:
	docker-compose exec backend bash

frontend-shell:
	docker-compose exec frontend sh

# Health checks
health:
	@echo "🔍 Checking application health..."
	@echo "Backend health:"
	@curl -f http://localhost:8000/health 2>/dev/null && echo "✅ Backend is healthy" || echo "❌ Backend is not responding"
	@echo "Frontend health:"
	@curl -f http://localhost:3000/ 2>/dev/null && echo "✅ Frontend is healthy" || echo "❌ Frontend is not responding"