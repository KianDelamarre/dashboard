# ==========================================
# STAGE 1: Build the React Frontend (pnpm)
# ==========================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY dashboard-react-frontend/package.json dashboard-react-frontend/pnpm-lock.yaml* ./
RUN pnpm install

COPY dashboard-react-frontend/ ./

# CRITICAL: Tell Vite to output to 'dist' for Docker instead of writing to the Java folder
RUN DOCKER_BUILD=true pnpm build


# ==========================================
# STAGE 2: Build the Spring Boot Backend
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src

# Copy the clean Vite 'dist' output directly into Spring Boot's static folder
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests


# ==========================================
# STAGE 3: Production Runtime Environment
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/data \
    && chown -R spring:spring /app

USER spring:spring

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]