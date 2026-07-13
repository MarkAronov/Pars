# Pars — Project Rules & Coding Standards

## Project overview

Pars is a social platform (posts, follows, threads, topics) built as a monorepo. It also doubles
as a side-by-side comparison project: `backend-nestjs` and `backend-express` are two different
framework implementations of the *same* API, routing to the *same* shared business logic in
`packages/db-adapters`, each swappable between Postgres and MongoDB via `DATABASE_DRIVER`.

```
/
├── backend-nestjs/          NestJS + Drizzle → PostgreSQL/MongoDB, better-auth sessions
├── backend-express/         Express — same shared services, thin Express-native routing layer
├── frontend/                React 19 + Vite + TanStack Router, Tailwind CSS, Biome
├── packages/
│   ├── ui/                  @pars/ui — shared behavioral utilities (cn, hooks)
│   └── db-adapters/         @pars/db-adapters — shared Drizzle schema, repository
│                            interfaces/Postgres+Mongo adapters, and the framework-agnostic
│                            services both backends route requests to
├── database-postgres-pgvector/  Postgres+pgvector infra (docker-compose only)
├── database-mongodb/            MongoDB infra (single-node replica set, for transactions)
├── messaging-kafka/             Kafka (KRaft) + RabbitMQ + Redis/BullMQ — infra + demo scripts,
│                                 not wired into either backend
├── messaging-nats/              NATS + JetStream — infra + demo scripts, not wired into either backend
└── search-typesense/             Typesense + LangChain semantic-search demo
```

**Package manager:** Bun everywhere. Never use npm, yarn, or pnpm.

**When adding or changing a feature that touches business logic** (validation, authorization, data
access): make the change once in `packages/db-adapters/src/services|repositories`, not in either
backend's routing layer. Both backends should only ever need routing-glue changes (new route +
middleware wiring), never duplicated logic — that duplication is exactly what the shared package
exists to prevent.

---

## Tech stack

### Backend
- **Runtime:** Bun + NestJS
- **ORM:** Drizzle ORM (`DrizzleService` via `backend/src/database/drizzle.service.ts`; schema at `backend/src/database/schema/`)
- **Auth:** better-auth with email/password + 2FA plugin, session cookies, Drizzle adapter
- **Cache:** Redis via ioredis (`RedisModule`) — wired globally, not yet used in API services
- **Linting:** Biome (`unsafeParameterDecoratorsEnabled: true` for NestJS decorators)
- **API docs:** Swagger UI available at `http://localhost:3000/api` when running in dev

> **Note:** A `PrismaService` and `prisma.module.ts` exist in the codebase but are unused — all API services and better-auth use Drizzle. Do not import or extend Prisma for new features.

### Frontend
- **Framework:** React 19 + Vite
- **Router:** TanStack Router (file: `frontend/src/router.tsx`)
- **Server state:** TanStack Query
- **Auth client:** better-auth client — use `authClient.useSession()`, NOT a custom Zustand store
- **Styling:** Tailwind CSS v4 + `cn()` from `@pars/ui` via `frontend/src/lib/utils.ts`
- **Icons:** Lucide React
- **Radix UI:** `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu` for accessible primitives
- **Animation:** Framer Motion for drawer/transitions
- **Linting:** Biome

### Shared
- **`@pars/ui`** (`packages/ui/`): exports `cn()`, `useHoverRipple`, `useReducedMotion`, `useIsMobile`. No Tailwind classes inside — each project owns its design tokens.

---

## Frontend architecture: atomic design

Follow this strict hierarchy. Each layer builds on the one below:

```
frontend/src/components/
├── 1-ions/      Design tokens (colors, spacing, typography, sizing, borders, layout, zIndex)
├── 2-atoms/     Primitive components — PostCard, Drawer, ViewMediaDialog, PostOptionsMenu
├── 3-molecules/ Composite components — Header, Footer, UserCard, PostCardGroup
├── 4-organisms/ Complex compositions (ThemeEngine, page-level wrappers)
├── 5-templates/ Layout shells — AppLayout
└── 6-pages/     Full pages — HomePage, UserPage, ExplorePage, etc.
```

**Rules:**
- Atoms use only ions (tokens). Never custom inline design values.
- Molecules use atoms + ions.
- Organisms use molecules + atoms + ions.
- Templates compose organisms + molecules.
- Pages use all levels. Pages should be lightweight — delegate layout to templates.

---

## Design tokens (1-ions)

**All design values must come from the ion layer.** Never hardcode colors, spacing, or radii.

```ts
// ✅ Correct
import { COLORS, TYPOGRAPHY, BORDERS, GAP } from '../1-ions';
className={cn(COLORS.bg, TYPOGRAPHY.TEXT.sm, BORDERS.RADIUS.lg, GAP.md)}

// ❌ Wrong
className="bg-neutral-950 text-sm rounded-lg gap-4"
```

**Acceptable to hardcode:** Tailwind layout utilities — `flex`, `grid`, `items-center`, `justify-between`, `relative`, `absolute`, `overflow-hidden`, `flex-1`, `w-full`, etc. These are structural, not design values.

**Token files:**
- `colors.ts` — COLORS, HOVER (neutral-950 dark theme, violet accent)
- `spacing.ts` — GAP, PADDING, STACK
- `typography.ts` — FONT, TEXT, WEIGHT, LEADING
- `sizing.ts` — ICON, AVATAR
- `borders.ts` — BORDERS, RADIUS, BORDER
- `layout.ts` — LAYOUT (content widths, page padding)
- `zIndex.ts` — ZINDEX (header=40, drawer=50, dialog=60, toast=70)

When you need a new design value: add it to the relevant ion file, export from `1-ions/index.ts`, then use it in components. Never define values inline.

---

## Routing

TanStack Router is configured in `frontend/src/router.tsx`.

**Critical: pathless layout routes and `from` param.** The authenticated area uses a pathless layout route with `id: 'app'`. This means TypeScript-facing route paths are prefixed with `/app`:

```ts
// ❌ Wrong — will fail TypeScript
useParams({ from: '/u/$username' })

// ✅ Correct
useParams({ from: '/app/u/$username' })
```

**Route structure:**
- Public (no auth guard): `/`, `/login`, `/signup`, `/about`, `/forgot-password`, `*` (404)
- Authenticated (guarded via `beforeLoad` session check): `/home`, `/explore`, `/settings`, `/u/$username`

---

## Auth

Use `authClient` from `frontend/src/lib/auth.ts` everywhere. Do not create Zustand stores for session state.

```ts
// ✅ Correct — everywhere you need session
const { data: session } = authClient.useSession();
const userId = session?.user?.id;

// ❌ Wrong — don't do this
import { useAuthStore } from '../store/auth.store';
```

`better-auth` v1 does NOT export `bearerClient` from `better-auth/client/plugins`. Do not import it. Cookie-based sessions work without it.

---

## API calls

Use `api` from `frontend/src/lib/api.ts`. Do not call `fetch` directly in components.

Hooks live in `frontend/src/hooks/`:
- `useFeed.ts` — paginated feed
- `usePosts.ts` — posts CRUD + like toggle
- `useUser.ts` — user profile, follow/unfollow
- `useThreads.ts` — thread list/detail
- `useTopics.ts` — topic list/detail

---

## Styling rules

- `cn()` is the ONLY way to merge class names. Import from `../../lib/utils` (which re-exports from `@pars/ui`).
- No inline `style={{}}` unless dealing with dynamic values impossible to express as classes (e.g., `backgroundImage` from a URL).
- No CSS modules.
- No `@apply` in CSS files.
- All Tailwind classes must be statically analyzable (no template literals for class names at runtime).

---

## Code style

- **Arrow functions everywhere.** No `function` declarations.
- **No comments in normal cases.** Only add a comment when the WHY is non-obvious: a hidden constraint, a workaround, an invariant that would surprise a reader. Never describe what the code does.
- **No docstrings or multi-line comment blocks.**
- **TypeScript strict mode.** No `any`. No non-null assertions (`!`) — use conditional rendering or optional chaining instead.
- **Biome enforces a11y rules:** Interactive elements must be `<button>` or proper role elements, not plain `<div>` with click handlers.
- Import order: Biome auto-organizes alphabetically on commit — don't fight it.
- **Diagnose before fixing.** Read the relevant code and trace the actual root cause before making changes. Never try random edits hoping one sticks.
- **After any frontend change:** run `bun run build` then `bun run lint` from `frontend/`. Fix all errors before considering the task done.

---

## Git / pre-push hooks

Husky runs on `git push`:
1. Backend: `tsc --noEmit` then `bun build`
2. Frontend: `tsc -b && vite build`

**The pre-push hook WILL fail if there are type errors.** Fix them before pushing. The frontend build also runs Biome lint-staged on commit.

**Commit style:** Conventional commits — `feat:`, `fix:`, `refactor:`, `chore:`. One clear sentence explaining why, not what.

---

## Backend patterns

- **Controllers** are thin — delegate logic to services. Services, DTOs, and repository
  interfaces/implementations live in `packages/db-adapters/`, not in `backend-nestjs/` itself —
  see the multi-stack restructure section below.
- Services are plain framework-agnostic classes (no Nest decorators) that depend on a repository
  *interface*, not a concrete database. `backend-nestjs`'s `DatabaseModule` picks the Postgres or
  Mongo implementation at DI-wiring time based on `DATABASE_DRIVER`.
- **Guards:** `SessionAuthGuard` protects authenticated endpoints; `CurrentUser()` decorator provides the authed user.
- **Roles:** `RolesGuard` + `@Roles('admin' | 'moderator')` for elevated actions.
- Repositories project only the public-facing fields (e.g. `PublicUser`) — never return password
  hashes or internal fields.

### API endpoint reference

All routes are prefixed `/api/` via the global prefix set in `main.ts`.

**Users** (`/api/users`)
- `GET /` — paginated list (`?page&limit`)
- `GET /me` — own profile (auth required)
- `GET /:id` — profile by id or username
- `PATCH /me` — update displayName / bio (`PatchUserRegularDto`)
- `PATCH /me/important` — update username / email, requires currentPassword (`PatchUserImportantDto`)
- `PATCH /me/password` — change password (`PatchUserPasswordDto`)
- `DELETE /me` — delete own account
- `DELETE /:id` — admin: delete any account
- `POST /:id/follow` — follow a user
- `DELETE /:id/follow` — unfollow a user
- `GET /:id/followers` — paginated followers list
- `GET /:id/following` — paginated following list

**Posts** (`/api/posts`)
- `GET /` — paginated list
- `GET /:id` — single post
- `POST /` — create post (`CreatePostDto`)
- `PATCH /:id` — edit post (`PatchPostDto`, owner or admin)
- `DELETE /:id` — delete post (owner or admin)
- `POST /:id/like` — toggle like

**Threads** (`/api/threads`)
- `GET /` — list (`?page&limit&topicId`)
- `GET /:id` — single thread
- `POST /` — create thread
- `PATCH /:id` — edit thread (owner or admin)
- `DELETE /:id` — delete thread (owner or admin)

**Topics** (`/api/topics`)
- `GET /` — list (default limit 50)
- `GET /:id` — single topic
- `POST /` — create (moderator/admin only)
- `PATCH /:id` — edit (moderator/admin only)
- `DELETE /:id` — delete (admin only)

**Feed** (`/api/feed`)
- `GET /` — chronological feed for the authed user (auth required, paginated)

**Search** (`/api/search`)
- `GET /?q=&type=posts|users|topics&page=&limit=` — full-text search across posts, users, or topics
- `GET /?q=&type=semantic&limit=` — vector similarity search over posts via pgvector. Postgres only
  (501 under `DATABASE_DRIVER=mongo`); requires `OPENAI_API_KEY` to be set (503 otherwise)

**Media** (`/api/media`)
- `POST /avatar` — upload avatar image (`multipart/form-data`, field name: `file`)
- `POST /background` — upload profile background image (`multipart/form-data`, field name: `file`)
- `DELETE /:id` — delete a media record and its file

Media files are stored locally at `backend/media/{avatar,backgroundImage}/`. Allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`. Returned URL format: `/media/{subdir}/{filename}`. There is no CDN or S3 — files are served directly from the NestJS static assets.

### Database migrations (Drizzle Kit)

The Drizzle schema, `drizzle.config.ts`, and migration SQL live in `packages/db-adapters/` (shared across backends), not in `backend-nestjs/`.

```bash
cd packages/db-adapters
bunx drizzle-kit generate   # generate migration SQL from schema changes
bunx drizzle-kit migrate    # apply pending migrations to the database
bunx drizzle-kit studio     # open Drizzle Studio (browser DB GUI)
```

Or from repo root: `bun run db:generate` / `bun run db:migrate` / `bun run db:studio`.
Or from `backend-nestjs/`: `bun run db:generate` etc. (proxies into `../packages/db-adapters`).

Run `generate` after any schema change in `packages/db-adapters/src/schema/`, then `migrate` to apply.

---

## Environment variables

### Backend (create `backend-nestjs/.env`)
```
DATABASE_DRIVER=postgres                # or 'mongo' — picks the repository implementation
DATABASE_URL=postgresql://user:password@localhost:5432/pars   # required when DATABASE_DRIVER=postgres
MONGO_URL=mongodb://localhost:27017/pars_dev?replicaSet=rs0   # required when DATABASE_DRIVER=mongo
SESSION_SECRET=change-me-in-production-32-chars!!
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379        # optional — defaults to localhost:6379
OPENAI_API_KEY=                         # optional — enables real semantic search + post embeddings
```

`DATABASE_DRIVER` defaults to Postgres when unset. The Mongo path needs `database-mongodb/`'s docker-compose running first (single-node replica set — required for the Mongo repositories' cascade-delete transactions).

`OPENAI_API_KEY` is optional and costs real money per call when set — leave it empty for local dev/tests. Without it, `embedText()` (`packages/db-adapters/src/search/embeddings.ts`) silently no-ops: posts are created normally, they just don't get an embedding, and `GET /api/search?type=semantic` returns 503. With it set, posts get a real `text-embedding-3-small` embedding on create/edit, and semantic search does a real pgvector cosine-similarity query against the existing `embedding vector(1536)` columns. Postgres only — self-hosted MongoDB has no native vector search, so `type=semantic` returns 501 under `DATABASE_DRIVER=mongo`.

### Frontend (copy `frontend/env/.env.example` → `frontend/env/.env.development`)
```
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_GLITCHTIP_DSN=                    # leave empty in development
```

### Frontend, pointed at backend-express instead

`frontend/env/.env.development.express` is checked in (nothing secret in it — just `localhost:3001`)
and used by `bun run dev:express-backend` (`vite --mode development.express`). Vite's `envDir: './env'`
config picks it up automatically; no changes needed to `api.ts` or `auth.ts`, since both already read
`VITE_API_BASE_URL` at module load. Run the two dev servers side by side to compare backends against
the same seeded data — `bun run dev` (port 3000, backend-nestjs) vs `bun run dev:express-backend`
(port 3001, backend-express).

---

## What's NOT done yet (known stubs)

- **ForgotPasswordPage** — UI exists but `authClient.forgetPassword` is stubbed. Backend needs `sendResetPassword` configured in `auth.config.ts`.
- **Search** — backend `/api/search` (including `type=semantic`, Postgres-only) is fully implemented; frontend needs a search input + results view wired to it.
- **SettingsPage** — real account settings form (PATCH /me endpoints exist).
- **Notifications** — the `/notifications` Socket.IO namespace exists on both backends (join/sendToUser), but no REST action triggers a notification yet, and the frontend doesn't listen for one.
- **Real-time feed/presence on the frontend** — both backends run `/feed` and `/presence` Socket.IO namespaces (`VITE_SOCKET_URL` points at them), but the frontend doesn't consume them yet.
- **backend-express Mongo semantic search** — same documented asymmetry as backend-nestjs: self-hosted MongoDB has no native vector search, so `type=semantic` returns 501 under `DATABASE_DRIVER=mongo` on either backend.

---

## Commands

```bash
# From repo root
bun install                            # install all workspaces

# Backend — NestJS (:3000)
bun run dev:backend-nestjs             # start dev server
bun run build:backend-nestjs           # production build
bun run test:backend-nestjs            # vitest (real testcontainers, no mocks)

# Backend — Express (:3001), same API, same shared services
bun run dev:backend-express
bun run build:backend-express
bun run test:backend-express

# Frontend
bun run dev:frontend                   # Vite dev server, points at backend-nestjs
bun run dev:frontend-express           # Vite dev server, points at backend-express
cd frontend && bun run build           # production build (also runs tsc)
cd frontend && bun run lint            # Biome lint

# Shared package
cd packages/ui && bun run build        # if needed
```
