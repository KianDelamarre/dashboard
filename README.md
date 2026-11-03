# Dashboard

A self-hosted server dashboard for organising and accessing your services, media, and links from a single page. Built with a **Spring Boot** backend, a **React** frontend, and **Spring Security** with JWT for authentication, all shipped as a single container.

[![Docker Image Size](https://img.shields.io/docker/image-size/kiansd/dashboard/latest?logo=docker&logoColor=white&style=flat-square)](https://hub.docker.com/r/kiansd/dashboard)
[![Docker Pulls](https://img.shields.io/docker/pulls/kiansd/dashboard?logo=docker&logoColor=white&style=flat-square)](https://hub.docker.com/r/kiansd/dashboard)

---

## Table of Contents

- [Overview](#overview)
- [Docker Quick-Start Guide](#-docker-quick-start-guide)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Authentication](#authentication)
- [Local Development](#local-development)
- [Project Structure](#project-structure)
- [License](#-license)

---

## Overview

The dashboard is a lightweight start-page that displays categorised link cards (Media, Services, Links, Admin) in a grid layout. Authenticated users can:

- **View** all saved links organised into columns.
- **Create, edit, and delete** links via modal forms.
- **Drag-and-drop reorder** links across columns in edit mode.
- **Manage users** (create new accounts).
- **Search the web** directly from the header.

Data is persisted in an embedded **SQLite** database.

### Tech stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Backend        | Spring Boot, Spring Web, Spring Data JPA |
| Security       | Spring Security + JWT                   |
| Frontend       | React                                   |
| Database       | SQLite                                  |
| Packaging      | Docker (single container)               |

---

## 🚀 Docker Quick-Start Guide

### 1. Docker Compose Reference

Create a `docker-compose.yml` file with the following contents:

```yaml
services:

  dashboard:
    image: kiansd/dashboard:latest
    container_name: dashboard
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:sqlite:/app/data/database.db
      - CORS_ALLOWED_ORIGINS=https://yourdomain,https://yourseconddomain
    volumes:
      - ./data:/app/data
```

### 2. Configure environment variables

Environment variables are set directly in `docker-compose.yml` under the `environment` block. Edit these as needed (see the [Environment Variables](#environment-variables) section below for details).

### 3. Start the stack

```bash
docker compose up -d
```

### 4. Access the dashboard

Open your browser and navigate to:

```
http://localhost:8080
```

### 5. Stop the stack

```bash
docker compose down
```

### Volume mounts

| Mount              | Purpose                                              |
|--------------------|------------------------------------------------------|
| `./data:/app/data` | Persists the SQLite database (links and user accounts) |

---

## Environment Variables

| Variable                 | Required | Default                          | Description                                                                                         |
|--------------------------|----------|----------------------------------|-----------------------------------------------------------------------------------------------------|
| `SPRING_DATASOURCE_URL`  | Yes      | `jdbc:sqlite:/app/data/database.db` | JDBC URL for the SQLite database. Keep it inside the mounted volume so data survives restarts.   |
| `CORS_ALLOWED_ORIGINS`   | No       | _none_                           | Comma-separated list of origins allowed to call the API. Set this to the URL(s) you access the dashboard from. |

> Add any JWT-related settings here (for example a signing secret or token lifetimes) once you expose them as environment variables.

---

## Architecture

The project is now a **single container**. The React frontend is built at image build time and served as static files by Spring Boot, which also exposes the REST API on the same port (`8080`). There is no separate identity provider; authentication is handled in-process by Spring Security.

```
┌──────────────────────────────────────────────────┐
│  dashboard container (port 8080)                 │
│                                                  │
│   Spring Boot  ──serves──▶  React (static build) │
│        │                                         │
│        ├── Spring Security (JWT filter chain)    │
│        │                                         │
│        ▼                                         │
│   SQLite  (/app/data/database.db)                │
└──────────────────────────────────────────────────┘
```

---

## Frontend

The frontend is a **React** single-page application. It is compiled during the Docker build and the output is served by Spring Boot.

### How it works

1. **On page load**, the app attempts a silent token refresh using the HTTP-only refresh cookie. If successful, the user goes straight to the dashboard; otherwise, the login form is displayed.
2. **Login** sends credentials to the backend. On success, a JWT access token is kept in memory and a refresh token is set as an HTTP-only cookie.
3. **API requests** (fetching links, creating/editing/deleting) attach the in-memory access token via the `Authorization: Bearer <token>` header.
4. **Auto-refresh**: the frontend reads the JWT expiry and schedules a refresh just before the access token expires, keeping the session alive seamlessly.
5. **Dashboard rendering**: link data is fetched from `GET /api/links` and rendered into a grid of four columns. Each link card shows an icon, name, and status indicators.
6. **Edit mode**: toggling edit mode enables drag-and-drop reordering and exposes create/edit/delete controls. Changes are batched and saved via `PATCH /api/links/batchmove`.

---

## Authentication

Authentication is handled directly by the backend using **Spring Security** and **JSON Web Tokens (JWT)**. The previous standalone `idp-server` container and the `@kiansd/idp-client` package are no longer used.

### How it works

- **Spring Security** secures all `/api/**` routes through a custom security filter chain. Public routes are limited to the authentication endpoints and the static frontend.
- **Passwords** are hashed before being stored in the SQLite database.
- **Access tokens** are short-lived JWTs, validated on each request by a JWT authentication filter that populates the Spring Security context.
- **Refresh tokens** are delivered as HTTP-only cookies and exchanged for new access tokens without re-entering credentials.
- **Logout** clears the refresh cookie and invalidates the session on the server.
- **CORS** is configured from `CORS_ALLOWED_ORIGINS`, with credentials enabled so the refresh cookie can be sent.

### Auth flow

```
Browser                         Dashboard (Spring Boot)
  │                                      │
  │──POST /login {creds}────────────────▶│
  │                                      │── authenticate (Spring Security)
  │◀──set refresh cookie─────────────────│
  │◀──return access token (JSON)─────────│
  │                                      │
  │──GET /api/links (Bearer token)──────▶│
  │                                      │── JWT filter validates token
  │◀──return link data───────────────────│
  │                                      │
  │──POST /login (refresh cookie)───────▶│
  │                                      │── validate refresh token
  │◀──return new access token────────────│
```

### Endpoints

| Method   | Path                      | Auth     | Purpose                                         |
|----------|---------------------------|----------|-------------------------------------------------|
| `POST`   | `/login`                  | Public   | Log in with credentials, or refresh via cookie  |
| `DELETE` | `/logout`                 | Required | Clear the refresh cookie and end the session    |
| `GET`    | `/api/links`              | Required | Fetch all links                                 |
| `POST`   | `/api/links`              | Required | Create a link                                   |
| `PUT`    | `/api/links/{id}`         | Required | Update a link                                   |
| `DELETE` | `/api/links/{id}`         | Required | Delete a link                                   |
| `PATCH`  | `/api/links/batchmove`    | Required | Save reordered links in a single batch          |

---

## Local Development

**Prerequisites:** JDK 17+ (match your project's Java version), Node.js, and Maven or Gradle.

```bash
# Backend
cd backend
./mvnw spring-boot:run        # or ./gradlew bootRun

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev                   # or npm start
```

When running the frontend dev server separately, add its origin (for example `http://localhost:5173`) to `CORS_ALLOWED_ORIGINS`.

---

## Project Structure

```
dashboard/
├── docker-compose.yml        # Runs the dashboard container
├── Dockerfile                # Multi-stage build: React build + Spring Boot jar
├── .dockerignore
│
├── src/                  # Spring Boot application
│   ├── pom.xml               # Dependencies & build config (or build.gradle)
│   └── src/main/
│       ├── java/.../dashboard/
│       │   ├── DashboardApplication.java
│       │   ├── config/       # Security filter chain, CORS config
│       │   ├── security/     # JWT service, JWT filter, user details
│       │   ├── auth/         # Login, refresh, and logout controllers
│       │   ├── link/         # Link entity, repository, service, controller
│       │   └── user/         # User entity, repository, service
│       └── resources/
│           ├── application.properties
│           └── static/       # Built React app (populated during the build)
│
└── dashboard-react-frontend/                 # React application
    ├── package.json
    ├── public/
    └── src/
        ├── components/       # Link cards, columns, modals
        ├── pages/            # Dashboard, login, admin
        ├── auth/             # In-memory token handling & auto-refresh
        └── api/              # API client
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for the full license text.
