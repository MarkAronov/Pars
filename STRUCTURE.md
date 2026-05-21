# Pars — Project Structure

> Privacy-first social media platform.
> Monorepo: `backend/` (NestJS + Bun) · `frontend/` (React 19 + Vite)

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Repository Layout](#repository-layout)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Schema](#database-schema)
6. [Authentication](#authentication)
7. [Real-time (WebSockets)](#real-time-websockets)
8. [Observability](#observability)
9. [Testing Strategy](#testing-strategy)
10. [CI/CD & GitHub Ecosystem](#cicd--github-ecosystem)
11. [Running Locally](#running-locally)
12. [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime / Package manager | Bun |
| Backend framework | NestJS 10 |
| Database | PostgreSQL 17 + pgvector |
| ORM | Prisma 6 |
| Cache / Session store | Redis 7 |
| Message queue (side-effects) | RabbitMQ 3 (`amqplib`) |
| Event streaming | Kafka (`kafkajs`) |
| Auth | Better Auth (Prisma adapter, httpOnly cookies, Argon2, TOTP 2FA) |
| Password hashing | Argon2 |
| Real-time | Socket.io + `@socket.io/redis-adapter` |
| Frontend framework | React 19 |
| Build tool | Vite 6 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Styling | Tailwind CSS v4 |
| Component dev | Storybook v8 |
| E2E testing | Playwright |
| Linting / Formatting | Biome |
| Containerisation | Docker + Docker Compose |

---

## Repository Layout

```
Pars/                               ← monorepo root (no submodules)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  ← lint, test, build on every push/PR
│   │   ├── deploy.yml              ← deploy backend (Fly.io) + frontend (Vercel)
│   │   └── security.yml            ← Gitleaks, OWASP Dependency-Check, Trivy
│   ├── CODEOWNERS
│   ├── copilot-instructions.md
│   ├── dependabot.yml
│   └── ISSUE_TEMPLATE/
├── .husky/
│   ├── pre-commit                  ← biome check
│   └── pre-push                    ← vitest run
├── backend/
├── frontend/
├── STRUCTURE.md                    ← this file
└── package.json                    ← root workspace scripts
```

---

## Backend Architecture

```
backend/
├── prisma/
│   └── schema.prisma               ← PostgreSQL + pgvector schema
├── src/
│   ├── main.ts                     ← NestJS bootstrap, helmet, CORS, Swagger
│   ├── app.module.ts               ← root module wiring
│   ├── database/
│   │   ├── prisma.module.ts        ← @Global() PrismaModule
│   │   ├── prisma.service.ts       ← PrismaClient lifecycle
│   │   └── redis.module.ts         ← @Global() REDIS_CLIENT token (ioredis)
│   ├── api/
│   │   ├── auth/                   ← Better Auth handler + guards + decorators
│   │   ├── user/                   ← profile CRUD, password change
│   │   ├── post/                   ← posts, likes
│   │   ├── thread/                 ← forum threads (belong to topics)
│   │   ├── topic/                  ← topic taxonomy (mod-gated creation)
│   │   ├── media/                  ← avatar / background upload (magic-byte validation)
│   │   ├── search/                 ← full-text search across posts/users/topics
│   │   ├── feed/                   ← personalised feed from followed users
│   │   └── misc/                   ← GET /health
│   └── gateways/
│       ├── feed.gateway.ts         ← /feed namespace, broadcasts new posts
│       ├── notifications.gateway.ts ← /notifications, per-user rooms
│       └── presence.gateway.ts     ← /presence, Redis TTL-based online status
├── observability/
│   ├── prometheus.yml
│   ├── loki.yml
│   ├── promtail.yml
│   └── grafana/datasources.yml
├── __tests__/
│   ├── globalSetup.ts              ← Testcontainers (pgvector + Redis)
│   ├── setup.ts                    ← NestJS app bootstrap per file
│   ├── database.ts                 ← shared app/prisma getters
│   └── api/
│       ├── user/                   ← full user lifecycle tests
│       └── post/                   ← post creation tests
├── docker-compose.yml              ← postgres, redis, rabbitmq, kafka, zookeeper
├── docker-compose.observability.yml ← GlitchTip, Prometheus, Loki, Grafana, Umami, Uptime Kuma
└── fly.toml                        ← Fly.io deployment config
```

### Module conventions

Each domain module has these files:

| File | Purpose |
|------|---------|
| `<name>.module.ts` | NestJS module wiring |
| `<name>.controller.ts` | Route handlers, `@UseGuards`, `@Body`, `@Param` |
| `<name>.service.ts` | Business logic, Prisma calls |
| `<name>.dto.ts` | Input validation via `class-validator` |

### Guards & decorators

| Symbol | Location | Purpose |
|--------|----------|---------|
| `SessionAuthGuard` | `auth/guards/session.guard.ts` | Validates Better Auth session cookie; attaches `req.user` |
| `RolesGuard` | `auth/guards/roles.guard.ts` | Checks `req.user.role` against `@Roles(...)` metadata |
| `@Roles(...)` | `auth/guards/roles.guard.ts` | Sets required roles via `Reflect.defineMetadata` |
| `@CurrentUser()` | `auth/decorators/current-user.decorator.ts` | Param decorator returning `req.user` |

### API prefix

All routes are under `/api` (set via `app.setGlobalPrefix('api')` in `main.ts`).

| Module | Prefix |
|--------|--------|
| Auth | `/api/auth/*` (delegated to Better Auth) |
| Users | `/api/users` |
| Posts | `/api/posts` |
| Threads | `/api/threads` |
| Topics | `/api/topics` |
| Media | `/api/media` |
| Search | `/api/search` |
| Feed | `/api/feed` |
| Health | `/health` |
| Swagger | `/api/docs` (non-production only) |

---

## Frontend Architecture

```
frontend/
├── .storybook/
│   ├── main.ts                     ← Storybook config, react-vite framework
│   └── preview.ts                  ← global CSS import, controls matchers
├── e2e/
│   ├── auth.setup.ts               ← Playwright auth setup (saves storageState)
│   └── feed.spec.ts                ← feed page E2E tests
├── env/
│   └── .env.example                ← documented env vars
├── src/
│   ├── main.tsx                    ← QueryClientProvider + ReactQueryDevtools
│   ├── index.css                   ← Tailwind v4 @import
│   ├── lib/
│   │   └── api.ts                  ← fetch wrapper (credentials:include, BASE_URL)
│   ├── store/
│   │   └── auth.store.ts           ← Zustand: user, sessionId, setUser, logout
│   ├── hooks/
│   │   ├── useUser.ts              ← TanStack Query: user profile
│   │   ├── usePosts.ts             ← TanStack Query: posts + mutations
│   │   ├── useThreads.ts           ← TanStack Query: threads
│   │   ├── useTopics.ts            ← TanStack Query: topics
│   │   └── useFeed.ts              ← TanStack Query: personalised feed
│   └── components/
│       ├── 1-ions/                 ← design tokens (colours, spacing, etc.)
│       ├── 2-atoms/                ← smallest reusable components (+ Storybook stories)
│       ├── 3-molecules/            ← composites of atoms (+ Storybook stories)
│       ├── 4-organisms/            ← ThemeEngine, complex sections
│       ├── 5-templates/            ← page layouts (ContainerPage, PageRouter)
│       └── 6-pages/                ← full pages (StartPage, UserPage)
├── playwright.config.ts            ← Chromium + Firefox + mobile-safari
└── vercel.json                     ← Vercel deployment config
```

### State management conventions

| Type | Tool | Location |
|------|------|---------|
| Server state (async, cached) | TanStack Query | `src/hooks/use*.ts` |
| Global client state | Zustand | `src/store/*.store.ts` |
| Component-local state | `useState` / `useReducer` | inline in component |

### API calls

All API calls go through `src/lib/api.ts`. **Never call `fetch` directly in components.**

```ts
// ✅ Correct
import { api } from '../lib/api';
const data = await api.get<UserProfile>('/api/users/me');

// ❌ Wrong — never do this in a component
const res = await fetch('http://localhost:3000/api/users/me');
```

---

## Database Schema

### Models

| Model | Purpose |
|-------|---------|
| `User` | Core identity + Pars profile fields + optional `embedding vector(1536)` |
| `Session` | Better Auth session store |
| `Account` | OAuth / credential accounts (hashed password lives here) |
| `Verification` | Email verification tokens |
| `TwoFactor` | TOTP secret + backup codes |
| `Follow` | Composite PK `[followerId, followeeId]` |
| `Topic` | Taxonomy categories (unique name) |
| `Thread` | Forum threads — belongs to Topic, has `originalPosterId` (FK → User) |
| `Post` | Posts — optional `title`, required `content`, optional `embedding vector(1536)`, GIN full-text index on `(title, content)` |
| `PostLike` | Composite PK `[postId, userId]` |
| `Media` | File metadata (type: AVATAR \| BACKGROUND \| IMAGE \| VIDEO) |

### Notable decisions

- **pgvector** for semantic search embeddings on `User` and `Post` (1536 dimensions — OpenAI `text-embedding-3-small` compatible).
- All table names are `snake_case` via `@@map`.
- Passwords are stored in `account.password` (Argon2 hash) — **not** in `user`.
- Sessions are stored in Redis (Better Auth default) — the `session` table is for Better Auth's Prisma adapter fallback.

---

## Authentication

Better Auth is initialised once in `AuthModule.onModuleInit()` via `initAuth(prisma)`. A lazy singleton `getAuth()` is used by the `SessionAuthGuard` and `AuthController`.

### Sign-up / sign-in flow

```
Client → POST /api/auth/sign-up/email  (name, email, password)
Client → POST /api/auth/sign-in/email  (email, password)
Server → Set-Cookie: pars.session_token=...  (httpOnly, SameSite=Lax)
```

### Protected route flow

```
Client → GET /api/users/me + Cookie header
SessionAuthGuard → auth.api.getSession(headers) → attaches req.user
Controller → @CurrentUser() user
```

### Role hierarchy

`user` < `moderator` < `admin`

Use `@Roles('moderator', 'admin')` on handlers that require elevated access.

---

## Real-time (WebSockets)

Three Socket.io gateways, all using the Redis pub/sub adapter for horizontal scaling:

| Gateway | Namespace | Events |
|---------|-----------|--------|
| `FeedGateway` | `/feed` | `new_post` broadcast |
| `NotificationsGateway` | `/notifications` | `join(userId)` → per-user room; `sendToUser(userId, event, payload)` |
| `PresenceGateway` | `/presence` | `user_online` / `user_offline`; Redis TTL 300 s |

---

## Observability

Started independently with `docker-compose -f docker-compose.observability.yml up -d`.

| Service | Port | Purpose |
|---------|------|---------|
| GlitchTip | 8000 | Error tracking (Sentry-compatible DSN) |
| Prometheus | 9090 | Metrics scraping |
| Loki | 3100 | Log aggregation |
| Promtail | — | Docker log shipping → Loki |
| Grafana | 3001 | Dashboards (Prometheus + Loki datasources provisioned) |
| Umami | 3002 | Privacy-first web analytics |
| Uptime Kuma | 3003 | Uptime monitoring |

---

## Testing Strategy

### Backend — integration tests (Vitest + Testcontainers)

- `globalSetup.ts` spins up real **pgvector** and **Redis** containers via Testcontainers.
- `setup.ts` boots a full NestJS app before each test file; wipes all tables after each test.
- Tests hit real HTTP endpoints with `supertest`.
- No mocking — tests exercise the full stack.

Run: `cd backend && bun test`

### Frontend — component tests (Storybook + MSW)

- Every `2-atoms` and `3-molecules` component has a `.stories.tsx` file.
- MSW intercepts `fetch` calls — no real API calls in component tests.

Run: `cd frontend && bun run storybook`

### Frontend — E2E (Playwright)

- `auth.setup.ts` signs in once and saves `storageState`.
- Tests run on Chromium, Firefox, and mobile Safari.
- `webServer` auto-starts Vite dev server.

Run: `cd frontend && bunx playwright test`

---

## CI/CD & GitHub Ecosystem

### Workflows

| File | Trigger | Jobs |
|------|---------|------|
| `ci.yml` | push / PR | change detection → backend lint+test, frontend lint+test+build |
| `deploy.yml` | push to `main` | path-filtered deploy: backend → Fly.io, frontend → Vercel |
| `security.yml` | push / schedule | Gitleaks, OWASP Dependency-Check, Trivy container scan |

### Other GitHub configuration

- **CODEOWNERS** — auto-assigns reviewers per path
- **Dependabot** — weekly updates for npm and GitHub Actions
- **Issue templates** — bug report and feature request
- **Husky** — `pre-commit`: biome check; `pre-push`: vitest run

---

## Running Locally

```bash
# 1. Start infrastructure
cd backend
docker compose up -d

# 2. Install dependencies
bun install

# 3. Run migrations
bun run db:migrate

# 4. Start backend (dev)
bun run dev

# 5. In a new terminal — start frontend
cd ../frontend
bun install
bun run dev
```

Backend: http://localhost:3000  
Frontend: http://localhost:5173  
Swagger: http://localhost:3000/api/docs

---

## Environment Variables

### Backend (`backend/env/`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SESSION_SECRET` | Better Auth secret (≥32 chars) | required in production |
| `CORS_ORIGIN` | Allowed origin(s), comma-separated | `http://localhost:5173` |
| `PORT` | HTTP listen port | `3000` |
| `NODE_ENV` | `development` \| `production` \| `test` | `development` |

### Frontend (`frontend/env/`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend base URL (no trailing slash) |
| `VITE_SOCKET_URL` | Socket.io server URL |
| `VITE_GLITCHTIP_DSN` | GlitchTip DSN for error tracking |

Copy `env/.env.example` to `env/.env.development` and fill in values.
