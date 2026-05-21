# Copilot Instructions — Pars

## Project overview
Pars is a privacy-first social media platform. Backend: NestJS + Bun + PostgreSQL + pgvector + Prisma + Redis + RabbitMQ + Kafka + Socket.io + Better Auth + Argon2. Frontend: React 19 + Vite + TanStack Query + Zustand + Tailwind v4 + Storybook.

## General conventions
- TypeScript strict mode everywhere — no `any` without a biome-ignore comment explaining why
- Biome for linting and formatting in both packages
- Conventional Commits for all commit messages
- Privacy-first — no third-party analytics, no Google services required

## Backend conventions (NestJS)
- One NestJS module per domain: `UserModule`, `PostModule`, `ThreadModule`, `TopicModule`, `MediaModule`, `SearchModule`, `FeedModule`, `NotificationsModule`, `AuthModule`
- Each module folder: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.entity.ts` (Prisma type alias), `<name>.dto.ts`, `<name>.types.ts`
- Guards for auth: `SessionAuthGuard`, `JwtAuthGuard`, `RolesGuard`
- All input validated via `class-validator` + `class-transformer` — never trust raw `req.body`
- Kafka producers emit domain events on every significant state change
- RabbitMQ consumers handle all side-effects (email, media, push)
- Redis is the session store — never store sessions in PostgreSQL directly
- Use Prisma for all DB access — no raw SQL except for pgvector queries

## Frontend conventions
- Numbered atomic design tiers: `1-ions` (tokens), `2-atoms`, `3-molecules`, `4-organisms`, `5-templates`, `6-pages`
- Server state via TanStack Query (`useQuery`, `useMutation`)
- Global client state via Zustand stores in `src/store/`
- Component-local state via `useState` / `useReducer`
- All API calls go through `src/lib/api.ts` — never call `fetch` directly in components
- MSW for mocking in tests — no real API calls in unit/component tests
- Every component in `2-atoms` and `3-molecules` gets a Storybook story

## Security rules
- Never put secrets in code — use environment variables
- httpOnly cookies for web sessions — never localStorage for tokens
- All file uploads validated by MIME type (magic bytes), not extension
- Rate limit all auth endpoints
