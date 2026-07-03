# DevGuardian Microservices Spin-up Script

# 1. Database & Security Environment Variables (Falls back to default placeholder if not already set globally)
if (-not $env:POSTGRES_DB_USERNAME) { $env:POSTGRES_DB_USERNAME="postgres" }
if (-not $env:POSTGRES_DB_PASSWORD) { $env:POSTGRES_DB_PASSWORD="password" }
if (-not $env:JWT_SECRET) { $env:JWT_SECRET="yourjwtsecretkeystringmustbe32byteslong!!" }
if (-not $env:GITHUB_CLIENT_ID) { $env:GITHUB_CLIENT_ID="github_id" }
if (-not $env:GITHUB_CLIENT_SECRET) { $env:GITHUB_CLIENT_SECRET="github_secret" }
if (-not $env:GROQ_API_KEY) { $env:GROQ_API_KEY="groq_key" }
if (-not $env:GEMINI_API_KEY) { $env:GEMINI_API_KEY="gemini_key" }
$env:SPRING_CLOUD_COMPATIBILITY_VERIFIER_ENABLED="false"

# 2. Start Eureka Server (Required First)
Write-Host "Starting Eureka Server on port 8761..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-eureka-server"

# Wait for Eureka to initialize
Write-Host "Waiting 8 seconds for Eureka to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 3. Start API Gateway
Write-Host "Starting API Gateway on port 8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-gateway"

# 4. Start Core Microservices
Write-Host "Starting Auth Service on port 8081..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-auth-service"

Write-Host "Starting Repository Service on port 8082..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-repository-service"

Write-Host "Starting Analysis Service on port 8083..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-analysis-service"

Write-Host "Starting AI Service on port 8084..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-ai-service"

Write-Host "Starting Notification Service on port 8085..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw spring-boot:run -pl :devguardian-notification-service"

Write-Host "All processes spawned successfully! Spawned windows contain service console logs." -ForegroundColor Cyan
