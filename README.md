# Pars

> A newer take on how we connect.

Pars is a social platform (posts, follows, threads, topics) built as a monorepo, and doubles as a
side-by-side comparison/learning project across the axes a backend project commonly varies on:
backend framework, database, messaging, and search.

---

## Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS *or* Express · Bun · TypeScript — same business logic, different framework (see below) |
| **Database** | PostgreSQL + pgvector *or* MongoDB — swappable via `DATABASE_DRIVER` |
| **Cache / Sessions** | Redis |
| **Real-time** | Socket.IO + Redis adapter |
| **Auth** | better-auth · Argon2 |
| **Search** | Typesense + LangChain (semantic search, Postgres path only) |
| **Messaging (infra-only, not wired into the app)** | Kafka + RabbitMQ + BullMQ *or* NATS + JetStream |
| **Frontend** | React 19 · Vite · TanStack Router/Query · Tailwind v4 · Biome |
| **Testing** | Vitest · Supertest · Testcontainers (real ephemeral Postgres/Mongo/Redis, not mocks) |

### Why two backends and two databases?

Pars started as a single NestJS + Postgres app. The `backend-express/` and MongoDB support were
added afterward specifically to compare frameworks and databases side by side against the *same*
business logic — not because the app needs both. All the actual logic (validation, authorization,
data access) lives once in `packages/db-adapters/`; each backend is a thin routing layer over it.
See `CLAUDE.md` for the full rationale and phase-by-phase history.

---

## Monorepo structure

```
Pars/
├── backend-nestjs/            NestJS + Drizzle → PostgreSQL/MongoDB, better-auth sessions
├── backend-express/           Express — same shared services, thin Express-native routing layer
├── frontend/                  React 19 + Vite + TanStack Router, Tailwind CSS, Biome
├── packages/
│   ├── ui/                    @pars/ui — shared behavioral utilities (cn, hooks)
│   └── db-adapters/           @pars/db-adapters — shared Drizzle schema, repository
│                              interfaces/Postgres+Mongo adapters, and the framework-agnostic
│                              services both backends route requests to
├── database-postgres-pgvector/  Postgres+pgvector infra (docker-compose only)
├── database-mongodb/            MongoDB infra (single-node replica set, for transactions)
├── messaging-kafka/             Kafka (KRaft) + RabbitMQ + Redis/BullMQ — infra + demo scripts
├── messaging-nats/              NATS + JetStream — infra + demo scripts
├── search-typesense/             Typesense + LangChain semantic-search demo
├── .github/                    Workflows, issue templates
├── .husky/                     Git hooks
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- [Docker](https://www.docker.com) (for local dev services)

### Clone

```bash
git clone https://github.com/MarkAronov/Pars.git
cd Pars
bun install
```

### Backend (pick one, or run both side by side on different ports)

```bash
# Postgres (default)
cd database-postgres-pgvector && docker compose up -d && cd ..
# or MongoDB — cd database-mongodb && docker compose up -d && cd ..

cp backend-nestjs/.env.example backend-nestjs/.env   # set DATABASE_DRIVER, DATABASE_URL/MONGO_URL
bun run dev:backend-nestjs        # NestJS on :3000
bun run dev:backend-express       # Express on :3001 (same .env-style config)
```

### Frontend

```bash
bun run dev:frontend              # points at backend-nestjs (:3000)
bun run dev:frontend-express      # points at backend-express (:3001)
```

See `CLAUDE.md` for the full command reference, environment variables (including the optional
`OPENAI_API_KEY` for real semantic search), and coding standards.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Mark Aronov
