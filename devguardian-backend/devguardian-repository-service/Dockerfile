FROM maven:3.9.6-eclipse-temurin-21-jammy AS builder
WORKDIR /build

# Copy Maven parent POM and module POMs
COPY pom.xml .
COPY devguardian-common/pom.xml devguardian-common/
COPY devguardian-eureka-server/pom.xml devguardian-eureka-server/
COPY devguardian-gateway/pom.xml devguardian-gateway/
COPY devguardian-auth-service/pom.xml devguardian-auth-service/
COPY devguardian-repository-service/pom.xml devguardian-repository-service/
COPY devguardian-analysis-service/pom.xml devguardian-analysis-service/
COPY devguardian-ai-service/pom.xml devguardian-ai-service/
COPY devguardian-notification-service/pom.xml devguardian-notification-service/

# Copy sources for common library and Repository service
COPY devguardian-common devguardian-common
COPY devguardian-repository-service devguardian-repository-service

# Build the Repository service (and its dependencies like devguardian-common)
RUN --mount=type=cache,target=/root/.m2 mvn clean package -pl :devguardian-repository-service -am -DskipTests

# Runner stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /build/devguardian-repository-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
