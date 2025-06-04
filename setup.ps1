# setup.ps1 - Simplified version since .env already exists
# Quick setup script for SQL Chatbot Docker environment

Write-Host "🐳 SQL Chatbot Docker Setup for Windows 11" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if docker-compose is available
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found." -ForegroundColor Red
    exit 1
}

# Check .env file
if (Test-Path ".env") {
    Write-Host "✅ .env file found and configured" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Please create it with your credentials." -ForegroundColor Red
    exit 1
}

# Ask user which mode to run
Write-Host ""
Write-Host "Choose running mode:" -ForegroundColor Cyan
Write-Host "1. Development mode (with hot reload)" -ForegroundColor White
Write-Host "2. Production mode" -ForegroundColor White
Write-Host "3. Just check status and exit" -ForegroundColor Yellow
$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Starting in Development mode..." -ForegroundColor Green
        Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Backend API will be available at: http://localhost:8000" -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml up --build
    }
    "2" {
        Write-Host "🚀 Starting in Production mode..." -ForegroundColor Green
        Write-Host "Frontend will be available at: http://localhost" -ForegroundColor Cyan
        Write-Host "Backend API will be available at: http://localhost:8000" -ForegroundColor Cyan
        docker-compose up --build
    }
    "3" {
        Write-Host "✅ Setup check complete. You're ready to run Docker!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start manually:" -ForegroundColor Cyan
        Write-Host "  Development: docker-compose -f docker-compose.dev.yml up --build" -ForegroundColor White
        Write-Host "  Production:  docker-compose up --build" -ForegroundColor White
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}