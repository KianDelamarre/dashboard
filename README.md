# Dashboard

A self-hosted server dashboard for organising and accessing your services, media, and links from a single page. Built with a Node.js/Express backend, a vanilla HTML/CSS/JS frontend, and an optional decoupled identity provider (IdP) for authentication.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started with Docker Compose](#getting-started-with-docker-compose)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Authentication](#authentication)
- [Project Structure](#project-structure)

---

## Overview

The dashboard is a lightweight start-page that displays categorised link cards (Media, Services, Links, Admin) in a grid layout. Authenticated users can:

- **View** all saved links organised into columns.
- **Create, edit, and delete** links via modal forms.
- **Drag-and-drop reorder** links across columns in edit mode.
- **Manage users** (create new accounts).
- **Search the web** directly from the header.

Data is persisted in an embedded **SQLite** database.

---

## Getting Started with Docker Compose

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.
- The `idp-server:dev` Docker image built and available locally (see the `idp-server/` directory for its own build instructions).

### 1. Clone the repository

```bash
git clone <repo-url>
cd dashboard
```

### 2. Configure environment variables

Environment variables are set directly in `docker-compose.yml` under each service's `environment` block. Edit these as needed (see the [Environment Variables](#environment-variables) section below for details).

### 3. Start the stack

```bash
docker compose up --build
```

This will:

1. Start the **idp-server** on port `4002`.
2. Build and start the **dashboard** on port `4001`.
3. The dashboard backend will connect to the IdP server, fetch its public key, and begin serving.

### 4. Access the dashboard

Open your browser and navigate to:

```
https://localhost:4001
```

> **Note:** In dev mode (`DEV_MODE=true`) the server uses a self-signed SSL certificate, so your browser will warn you about the connection. Accept the risk to continue.

### 5. Stop the stack

```bash
docker compose down
```

### Docker Compose reference

```yaml

services:

//////optional - required for auth ////////
  idp-server:
    image: kiansd/idp-server
    container_name: idp-server
    environment:
      - ALLOWED_ORIGINS=http://localhost:4001 //dashboard url
    ports:
      - "4002:4002"
    volumes:
      - ./idp-server/data:/app/data
//////optional - required for auth ////////


  dashboard:
    image: kiansd/dashboard:latest
    container_name: dashboard
    ports:
      - "4001:4001"
    environment:
      - DEV_MODE=false //optional dev only
      - IDP_URL=http://idp-server:4002  //url of idp-server, if not on same docker network use host IP
      - AUTH_ENABLED=true  //optional, defaults true
      - ALLOWED_USER=admin   //optional, to decide which users from idp-server can access dashboard
    depends_on:
      - idp-server
    volumes:
    //  - ./backend:/app/backend      //dev mounts
    //  - ./frontend:/app/frontend
    //  - ./processes.json:/app/processes.json
    //  - /app/backend/node_modules
      - ./data:./backend/data    //persist links data
```

### Volume mounts

| Mount                              | Purpose                                                        |
|------------------------------------|----------------------------------------------------------------|
| `./data:/app/backend/src/db`       | Persistet links data  |
| `./idp-server/data:/app/data`      | (MOUNT FOR IDP-SERVER NOT DASHBOARD)Persists IdP server data (users, tokens) across restarts       |

---

## Environment Variables

### Dashboard service

| Variable          | Required | Default                      | Description                                                                                          |
|-------------------|----------|------------------------------|------------------------------------------------------------------------------------------------------|
| `DEV_MODE`        | No       | `undefined`                  | Set to `true` to enable HTTPS with self-signed certificates for local development.                   |
| `AUTH_ENABLED`    | No       | `true`                       | Set to `false` to disable authentication entirely (all auth is spoofed). Defaults to `true` unless explicitly set to `false`. |
| `IDP_URL`         | Yes*     | —                            | The URL of the IdP server. **Required when `AUTH_ENABLED` is `true`.** Use the Docker service name for inter-container networking (e.g. `http://idp-server:4002`). |
| `ALLOWED_USER`    | No       | `undefined`                  | Restricts dashboard access to a single username. If set, only this user can log in and access API routes. |
| `ALLOWED_ORIGINS` | No       | `https://localhost:4001`     | CORS allowed origin. Set this to the URL where the frontend is accessed from.                        |

### IdP Server service

| Variable          | Required | Description                                                                                          |
|-------------------|----------|------------------------------------------------------------------------------------------------------|
| `ALLOWED_ORIGINS` | No       | CORS allowed origins for the IdP server. Should include the dashboard's URL (e.g. `http://localhost:4001`). |

---

## Architecture

The project is composed of two containers managed by Docker Compose:

```
┌──────────────────────────────────────────────────┐
│  dashboard container (port 4001)                 │
│                                                  │
│   Express backend  ──serves──▶  Static frontend  │
│        │                                         │
│        │  @kiansd/idp-client                     │
│        │  (npm package)                          │
│        ▼                                         │
│   Communicates via HTTP                          │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│  idp-server container   │
│  (port 4002)            │
│                         │
│  Decoupled Identity     │
│  Provider server        │
└─────────────────────────┘
```

The Express backend serves the frontend as static files and exposes a REST API on the same port (`4001`). When authentication is enabled, the backend communicates with a separate **idp-server** container to handle login, token refresh, and logout.

---

## Frontend

The frontend is a **vanilla HTML/CSS/JavaScript** single-page application served statically by the Express backend — there is no build step or framework.

### How it works

1. **On page load**, the app calls `POST /token` to attempt a silent token refresh using the HTTP-only refresh cookie. If successful, the user goes straight to the dashboard; otherwise, the login form is displayed.
2. **Login** sends credentials to `POST /login`. On success, a JWT access token is stored in-memory and a refresh token is set as an HTTP-only cookie by the server.
3. **API requests** (fetching links, creating/editing/deleting) attach the in-memory access token via the `Authorization: Bearer <token>` header.
4. **Auto-refresh** — the frontend parses the JWT expiry and schedules a `POST /token` call just before the access token expires, keeping the session alive seamlessly.
5. **Dashboard rendering** — link data is fetched from `GET /links` and rendered into a grid of four columns. Each link card shows an icon, name, and status indicators.
6. **Edit mode** — toggling edit mode enables drag-and-drop reordering and exposes create/edit/delete controls. Changes are batched and saved via `PATCH /links/batchmove`.

---

## Authentication

Authentication is handled through a **decoupled Identity Provider (IdP)** architecture:

### IdP Server (`idp-server`)

A standalone authentication server that runs in its own container. It manages user credentials, issues JWTs (access + refresh tokens), and exposes a public key endpoint for token verification. Its data is persisted via a volume mount (`./idp-server/data:/app/data`).

### IdP Client (`@kiansd/idp-client`)

The backend imports the [`@kiansd/idp-client`](https://www.npmjs.com/package/@kiansd/idp-client) npm package, which provides a set of factory functions to wire up authentication without coupling the dashboard to any specific IdP implementation:

| Function                                | Purpose                                                                      |
|-----------------------------------------|------------------------------------------------------------------------------|
| `getPublicKeyFromIdp(url)`              | Fetches the IdP's public key (used to verify JWTs locally)                   |
| `createIdpClient({ baseUrl, publicKey })` | Creates a client instance configured to talk to the IdP                     |
| `createLoginController({ client, cookieOptions })` | Returns an Express handler for `POST /login` — proxies credentials to the IdP and sets cookies |
| `createLogoutController({ client, cookieOptions })` | Returns an Express handler for `DELETE /logout` — revokes tokens on the IdP and clears cookies |
| `createRequestNewAccessTokencontroller({ client })` | Returns an Express handler for `POST /token` — exchanges the refresh cookie for a new access token |
| `createAuthMiddleware({ client })`       | Returns Express middleware that validates the access token on protected routes |

### Auth flow

```
Browser                    Dashboard Backend             IdP Server
  │                              │                            │
  │──POST /login {creds}────────▶│                            │
  │                              │──forward credentials──────▶│
  │                              │◀──access + refresh tokens──│
  │◀──set refresh cookie─────────│                            │
  │◀──return access token (JSON)─│                            │
  │                              │                            │
  │──GET /links (Bearer token)──▶│                            │
  │                              │──verify JWT locally────────│
  │◀──return link data───────────│                            │
  │                              │                            │
  │──POST /token (cookie)───────▶│                            │
  │                              │──exchange refresh token───▶│
  │                              │◀──new access token─────────│
  │◀──return new access token────│                            │
```

### Gatekeeper Middleware

On top of the IdP layer, the dashboard uses its own **gatekeeper middleware** (`gatekeeper.middleware.js`) that adds an extra authorisation check:

- `restrictLoginToAllowedUser` — blocks login attempts from any user that doesn't match the `ALLOWED_USER` env var.
- `verifyRouteAccess` — blocks API access for any authenticated user that doesn't match `ALLOWED_USER`.

This effectively restricts the dashboard to a single authorised user, even if multiple accounts exist on the IdP.

### Disabling Auth

When `AUTH_ENABLED=false`, the IdP client is **not used at all**. Instead, the backend spoof-layers all auth controllers and middleware so every request passes through immediately with mock tokens. This is useful for local development without running the IdP server.

---

## Project Structure

```
dashboard/
├── docker-compose.yml        # Orchestrates dashboard + idp-server
├── dockerfile                # Builds the dashboard container
├── processes.json            # PM2 config (optional multi-process setup)
├── .dockerignore
│
├── backend/
│   ├── package.json          # Dependencies & scripts
│   ├── .env                  # Local env overrides (not used in Docker)
│   └── src/
│       ├── server.js         # Express app entry point
│       ├── db/
│       │   ├── db.js         # SQLite connection & schema init
│       │   └── database.db   # SQLite database file
│       ├── link/
│       │   ├── link.controller.js   # Route handlers for CRUD
│       │   └── link.service.js      # Database query logic
│       ├── reorder/
│       │   ├── reorder.controller.js  # Batch reorder handler
│       │   └── reorder.service.js     # Reorder logic
│       ├── middleware/
│       │   └── gatekeeper.middleware.js  # User restriction guards
│       └── utils/
│           └── utils.js
│
├── frontend/
│   ├── index.html            # Main dashboard page
│   ├── script.js             # Client-side logic (auth, API, drag-drop)
│   ├── style.css             # Dashboard styles
│   ├── admin.html            # Admin page
│   ├── admin.css             # Admin styles
│   └── imgs/                 # Static assets (icons, images)

```
