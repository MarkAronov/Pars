# Pars

> A newer take on how we connect.

Pars is a privacy-first social media platform built for people who want meaningful connections without the surveillance. Open source, self-hostable, and designed to evolve.

---

## Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS · Bun · TypeScript |
| **Database** | PostgreSQL · pgvector · Prisma |
| **Cache / Sessions** | Redis |
| **Task queues** | RabbitMQ |
| **Event streaming** | Kafka |
| **Real-time** | Socket.io + Redis adapter |
| **Auth** | Better Auth · Argon2 |
| **Frontend** | React 19 · Vite · TanStack Query · Zustand · Tailwind v4 |
| **Testing** | Vitest · Playwright · React Testing Library · MSW · Testcontainers |
| **Observability** | GlitchTip · Grafana + Loki · Prometheus · Umami · UptimeKuma |

---

## Monorepo structure

```
Pars/
├── backend/   # NestJS backend (submodule → MarkAronov/backend)
├── frontend/   # React frontend (submodule → MarkAronov/frontend)
├── .github/               # Workflows, issue templates, Copilot instructions
├── .husky/                # Git hooks
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
- Node.js ≥ 22 (for some tooling)

### Clone with submodules

```bash
git clone --recurse-submodules https://github.com/MarkAronov/Pars.git
cd Pars
```

### Backend

```bash
cd backend
cp env/.env.example env/.env.development
docker compose up -d          # PostgreSQL, Redis, RabbitMQ, Kafka
bun install
bunx prisma migrate dev
bun run dev
```

### Frontend

```bash
cd frontend
cp env/.env.example env/.env.local
bun install
bun run dev
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Mark Aronov
