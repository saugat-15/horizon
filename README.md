# Horizon

A project and asset management platform — the visual decision making platform.

Built as a demonstration of full-stack engineering capability across a domain I spent time understanding before writing a line of code.

---

## Progress

### Backend

- [x] Express + TypeScript server
- [x] Prisma ORM + PostgreSQL schema
- [x] Docker + docker-compose setup
- [x] Database seeded with realistic domain data
- [x] `GET /api/projects` — list with client and counts
- [x] `GET /api/projects/:id` — full detail with assets, team, activity
- [x] `POST /api/projects` — create with validation
- [x] `PATCH /api/projects/:id` — status update with transaction and enum validation
- [x] `GET /api/clients` — list with project counts
- [x] `GET /api/activity` — recent feed with user and project context
- [x] `GET /api/analytics` — five parallel aggregations in one call
- [ ] `POST /api/assets/sas-token` — generate Azure SAS URL
- [ ] `POST /api/assets` — save asset record after upload
- [ ] `GET /api/assets/:projectId` — assets for a project

### Frontend

- [x] Vite + React + TypeScript scaffold
- [x] React Router setup
- [x] shadcn + Tailwind configured
- [x] Dashboard page — project cards, analytics summary, activity feed
- [x] Project detail page — assets, team members, activity timeline, status update
- [x] API integration — all pages connected to backend
- [x] Responsive layout

### Infrastructure

- [x] PostgreSQL in Docker
- [x] Express API in Docker
- [x] Frontend in Docker
- [x] Full stack `docker compose up` working
- [ ] Azure Blob Storage connected
- [ ] SAS token direct upload to Azure Blob for large 360° renders

### Polish

- [x] README completed
- [ ] Architecture decisions documented

---

## Tech Stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Frontend       | React, TypeScript, Vite, shadcn/ui, Tailwind CSS |
| Backend        | Node.js, Express, TypeScript                     |
| ORM            | Prisma                                           |
| Database       | PostgreSQL                                       |
| Storage        | Azure Blob Storage                               |
| Infrastructure | Docker, docker-compose                           |

---

## Running Locally

```bash
# start all containers
docker compose up --build

# seed the database
cd backend && npm run db:seed
```

API runs on `http://localhost:4000`
Frontend runs on `http://localhost:3000`

---

## Schema Overview

Five core models:

- **Client** — design firm clients (Australia Post, Brickworks etc)
- **Project** — engagements with a client, status tracked through lifecycle
- **Asset** — renders, site scans, documents uploaded per project
- **ProjectUser** — many-to-many join between projects and team members
- **ActivityLog** — event log powering the activity feed and analytics

Key decisions:

- `ProjectUser` as a join table enables many-to-many without duplication
- `ActivityLog` stores both `projectId` and `userId` enabling per-project and per-user activity queries
- Status updates wrapped in `$transaction` with activity log creation for data integrity
- Analytics endpoint uses `Promise.all` for parallel queries — one request, five aggregations

---

## What I'd Build Next

- [ ] Row Level Security (RLS) at the database level for true multi-tenant data isolation
- [ ] JWT authentication with user sessions
- [ ] Pagination on activity logs and asset grids
- [ ] GitHub Actions CI/CD pipeline deploying to Azure App Service on merge to main
- [ ] Per-project analytics chart — activity over time using raw SQL aggregation
