# Loomahoidja

Web application for connecting **pet owners** with **pet sitters**: profiles, search, booking requests, in-app messaging, and notifications.

---

## Project overview

The product is a full-stack app made of a **React (Vite) SPA** and a **Node.js REST API** backed by **MySQL/MariaDB**. The goal is a clear separation between UI, HTTP handling, business rules, and persistence so features can evolve without tangling concerns.

---

## Technology choices and architecture

We chose a stack the team already knows well:

| Layer | Choice | Why it helps |
|--------|--------|----------------|
| **Frontend** | React, Vite | Fast dev feedback, component model we use daily, easy SPA routing. |
| **Backend** | Express | Simple HTTP routing and middleware; matches common MVC-style Node patterns. |
| **Data** | Sequelize + mysql | **ORM** maps tables to models, migrations/sync stay close to code, and we avoid hand-written SQL for CRUD. |
| **Auth** | JWT + bcrypt | Stateless API sessions; password hashing is delegated to a well-tested library. |

**Structure (MVC-style):**

- **Routes** — map HTTP paths and methods to controllers.
- **Controllers** — parse requests, validate input, call services, shape HTTP responses.
- **Services** — encapsulate use cases and data access for a domain (e.g. animals, conversations), keeping controllers thin.
- **Models** — Sequelize definitions and associations; they act as the persistence layer (similar in spirit to a **repository**: all DB access goes through model/service APIs rather than scattered queries).

This matches architectures we have used before, so security reviews, onboarding, and refactors stay predictable.

---

## Getting started

### Prerequisites

- **Node.js** (LTS recommended)
- **MySQL or MariaDB**
- Optional: separate database for integration tests (see `.env.example`)

### 1. Database and environment (backend)

```bash
cd backend
cp .env.example .env
# Edit .env: DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, JWT_SECRET
# Production: set NODE_ENV=production and CORS_ORIGIN=https://your-frontend.example.com
# Optional: DB_TEST_DATABASE for integration tests
```

Create the database (name should match `DB_DATABASE`, e.g. `petsitting`).

### 2. Install and run the API

```bash
cd backend
npm install
npm start
```

- Default port: **3001** (override with `PORT` in `.env`).
- Health: `GET http://localhost:3001/health`
- API base: `http://localhost:3001/api`

On first run, Sequelize syncs models (`server.js`). Uploaded files are served under `/uploads`.

**Demo personas (after seeding):** add **`DEMO_SEED_PASSWORD`** to `backend/.env` (see `.env.example`), then run the seed scripts in `backend/seeders/` (`backend/HOW_TO_RUN.md`). Sign in as **Darude Sandstorm** (`darude@example.com`, owner) and **Toru Jüri** (`toru@example.com`, sitter) using that password—passwords are **not** stored in the repository.

### 3. Install and run the frontend

```bash
cd frontend/loomahoidja
npm install
npm run dev
```

- Dev server is printed by Vite (typically `http://localhost:5173`).
- Point the app at the API with optional env:

```bash
# frontend/loomahoidja/.env.local (optional)
VITE_API_URL=http://localhost:3001/api
```

If unset, the client defaults to `http://localhost:3001/api`.

### 4. Production build (frontend)

```bash
cd frontend/loomahoidja
npm run build
```

The backend can optionally serve the built SPA from the same origin when `SERVE_SPA=1` and `frontend/loomahoidja/dist` exists (see `backend/App.js`).

---

## Data model

Entity relationships (high level). For a shareable **image** (PNG/SVG), export this diagram from your editor or use [mermaid.live](https://mermaid.live).

```mermaid
erDiagram
  users ||--o| sitter_profiles : "has"
  users ||--o{ animals : "owns"
  sitter_profiles ||--o{ sitter_animal_types : "accepts"
  users }o--o{ chat_conversations : "via participant"
  chat_conversations ||--o{ chat_messages : "contains"
  chat_messages ||--o{ chat_message_attachments : "has"
  users ||--o{ chat_notifications : "receives"
  users ||--o{ booking_requests : "owner"
  sitter_profiles ||--o{ booking_requests : "sitter"
  animals ||--o{ booking_requests : "for"

  users {
    bigint id PK
    string email UK
    string passwordHash
    string fullName
    enum role
  }
  sitter_profiles {
    bigint id PK
    bigint userId FK UK
    decimal hourlyRate
  }
  sitter_animal_types {
    bigint id PK
    bigint sitterId FK
    enum animalType
  }
  animals {
    bigint id PK
    bigint ownerId FK
    string name
    enum animalType
  }
  chat_conversations {
    bigint id PK
  }
  chat_conversation_participants {
    bigint id PK
    bigint conversationId FK
    bigint userId FK
  }
  chat_messages {
    bigint id PK
    bigint conversationId FK
    bigint senderId FK
    enum type
  }
  chat_message_attachments {
    bigint id PK
    bigint messageId FK
    string path
  }
  chat_notifications {
    bigint id PK
    bigint userId FK
    string type
  }
  booking_requests {
    bigint id PK
    bigint ownerId FK
    bigint sitterProfileId FK
    bigint animalId FK
    date startDate
    date endDate
    enum status
  }
```

---

## API overview

There is **no OpenAPI/Swagger** spec in this repo. Use the table below; all JSON routes under `/api` expect `Content-Type: application/json` unless noted.

Protected routes require:

```http
Authorization: Bearer <JWT>
```

### Summary

| Area | Method | Path | Auth | Notes |
|------|--------|------|------|--------|
| Health | GET | `/health` | No | Liveness |
| Auth | POST | `/api/auth/register` | No | Body: email, password, fullName, role, … |
| Auth | POST | `/api/auth/login` | No | Returns JWT |
| Auth | GET | `/api/auth/me` | Yes | Current user |
| Auth | GET | `/api/auth/verify-token` | Yes | Validate token |
| Auth | POST | `/api/auth/test-token` | No | Local/dev only; **404 in production** (`NODE_ENV=production`) |
| Auth | PUT | `/api/auth/update-role` | No | Local/dev only; **404 in production** |
| Users | GET | `/api/users` | No | List (see controller for behaviour) |
| Users | GET | `/api/users/:id` | No | |
| Users | POST | `/api/users/me/photo` | Yes | `multipart/form-data`, field `photo` |
| Users | PATCH | `/api/users/me` | Yes | Profile updates |
| Animals | * | `/api/animals`, `/api/animals/:id` | Yes | CRUD; create/update may use `photo` file upload |
| Sitters | GET | `/api/sitters` | No | List / search |
| Sitters | GET | `/api/sitters/:id` | No | Public profile |
| Sitters | POST | `/api/sitters/profile` | Yes | `multipart/form-data`; sitter only; `userId` in body is ignored (token wins) |
| Sitters | DELETE | `/api/sitters/profile/:id` | Yes | Deletes profile `id` only if it belongs to the authenticated sitter |
| Bookings | GET | `/api/bookings/unavailable/:sitterProfileId` | No | Dates unavailable for calendar |
| Bookings | POST | `/api/bookings/requests` | Yes | owner — sitterProfileId, animalId, startDate, endDate |
| Bookings | GET | `/api/bookings/requests/me` | Yes | Sitter’s incoming requests |
| Bookings | GET | `/api/bookings/requests/owner` | Yes | Owner’s requests |
| Bookings | POST | `/api/bookings/requests/:id/respond` | Yes | accept/decline |
| Conversations | POST | `/api/conversations` | Yes | Create or get thread |
| Conversations | GET | `/api/conversations/:id/messages` | Yes | |
| Conversations | POST | `/api/conversations/:id/messages` | Yes | JSON text body |
| Conversations | POST | `/api/conversations/:id/messages/image` | Yes | `multipart/form-data`, field `image` |
| Notifications | GET | `/api/notifications` | Yes | Optional query `unreadOnly=true` |
| Notifications | POST | `/api/notifications/read` | Yes | Body: `{ "ids": [1,2,3] }` |

### Example requests

**Login**

```bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"<your-password-here>"}'
```

**Authenticated call**

```bash
curl -s http://localhost:3001/api/animals \
  -H "Authorization: Bearer YOUR_JWT_HERE"
```

---

## Test strategy

| Type | What it covers | How to run |
|------|----------------|------------|
| **Unit** | Validation helpers, service logic in isolation (no HTTP server). | `cd backend && npm run test:unit` |
| **Integration** | Real HTTP server + database: auth boundary, animal CRUD flow, messaging API. | `cd backend && npm run test:integration` (requires DB; uses `DB_TEST_DATABASE` when `NODE_ENV=test`) |
| **All backend tests** | Unit + integration | `cd backend && npm run test:all` |

Environment: tests expect `NODE_ENV=test`, `JWT_SECRET` set (see `backend/package.json` scripts). The frontend uses ESLint (`npm run lint` in `frontend/loomahoidja`) but has no automated test runner configured in `package.json` yet.

---

## Deployment notes

These patterns work the same on a **VPS (e.g. Zone)** or **AWS** (EC2 + RDS, or any Node host): use a **reverse proxy** (nginx, ALB, or Zone’s panel) for HTTPS and route traffic to Node.

### Easiest demo: one public URL

1. Build the SPA: `cd frontend/loomahoidja && npm run build`
2. On the server, run the API with **`SERVE_SPA=1`** so Express serves `frontend/loomahoidja/dist` and `/api` on the **same host and port** (see `backend/App.js`).
3. Configure the proxy so **`https://your-demo.example/`** forwards to the Node process (port from **`PORT`** in `.env`, often `3001` or what the host assigns).
4. **Do not** set `VITE_API_URL` for this layout: in **production** the app will call **`https://your-demo.example/api`** automatically (current origin + `/api`).
5. Set **`CORS_ORIGIN`** only if the browser loads the SPA from a **different** origin than the API (see below). If everything is one domain, you can omit it.

### Split hosts (static site + API subdomain)

If the classmate puts the SPA on one URL (e.g. S3/CloudFront or static hosting) and the API on another (e.g. `api.example.com`), they **must** build the frontend with the API URL baked in:

```bash
cd frontend/loomahoidja
VITE_API_URL=https://api.example.com/api npm run build
```

Then set the API’s **`CORS_ORIGIN`** to the SPA’s origin(s), comma-separated (e.g. `https://app.example.com`).

### Environment (production)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV=production` | Disables dev-only auth helpers (`/auth/test-token`, `/auth/update-role`). |
| `JWT_SECRET` | Strong random string. |
| `PORT` | Listen port (must match reverse proxy upstream). |
| `DB_*` | MySQL/MariaDB connection. |
| `DB_SSL=1` | Use if the DB requires TLS (common on **AWS RDS**; some **Zone** managed DBs too). |
| `DB_SSL_REJECT_UNAUTHORIZED=0` | Only if using a self-signed DB cert (last resort). |
| `TRUST_PROXY=1` | If Node sits **behind** nginx / ALB / Zone proxy (recommended for correct client IPs). |
| `CORS_ORIGIN` | Comma-separated allowed browser origins; **omit** for a quick demo with permissive CORS, or set when locking down cross-origin access. |
| `SERVE_SPA=1` | Serve the Vite `dist` folder from the API (single-URL demo). |

### Gotchas

- **Uploaded files** live under `backend/uploads/`. On a normal VPS or EC2 disk they persist; **serverless** bundles without a writable disk need a different storage strategy (not required for a typical class demo on a VM).
- **`localStorage`**: if someone previously saved `http://localhost:3001/api` in the Dev tools screen, the app now **ignores** that when the site is not opened on localhost, so a shared demo machine does not keep calling localhost by mistake.

---

## Team roles

| Area | People |
|------|--------|
| Tech lead / architect | Margit, Kelli |
| Designer | Kelli |
| Backend | Margit, Kaisa, Kelli |
| QA / testing | Kelli |
| Documentation / UX | Kelli, Kaisa, Margit |

---

## License

See repository settings / `package.json` for SPDX identifier if applicable.
