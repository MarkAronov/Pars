# Pars — Project Rules & Coding Standards

## Project overview

Pars is a social platform (posts, follows, threads, topics) built as a monorepo:

```
/
├── backend/          NestJS + Prisma → PostgreSQL, better-auth sessions
├── frontend/         React 19 + Vite + TanStack Router, Tailwind CSS, Biome
└── packages/ui/      @pars/ui — shared behavioral utilities (cn, hooks)
```

**Package manager:** Bun everywhere. Never use npm, yarn, or pnpm.

---

## Tech stack

### Backend
- **Runtime:** Bun + NestJS
- **ORM:** Prisma (schema at `backend/prisma/schema.prisma`)
- **Auth:** better-auth with email/password, session cookies
- **Linting:** Biome (`unsafeParameterDecoratorsEnabled: true` for NestJS decorators)

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

---

## Git / pre-push hooks

Husky runs on `git push`:
1. Backend: `tsc --noEmit` then `bun build`
2. Frontend: `tsc -b && vite build`

**The pre-push hook WILL fail if there are type errors.** Fix them before pushing. The frontend build also runs Biome lint-staged on commit.

**Commit style:** Conventional commits — `feat:`, `fix:`, `refactor:`, `chore:`. One clear sentence explaining why, not what.

---

## Backend patterns

- **Controllers** are thin — delegate logic to services.
- **DTOs** use `class-validator` decorators; Prisma types are used for return shapes.
- **Guards:** `SessionAuthGuard` protects authenticated endpoints; `CurrentUser()` decorator provides the authed user.
- Prisma select projection via `PUBLIC_SELECT` constant — don't return password hashes or internal fields.
- `PATCH /api/users/me` — updates displayName, bio (PatchUserRegularDto)
- `PATCH /api/users/me/important` — updates email, username, requires currentPassword
- `POST /api/posts/:id/like` — toggle like

---

## What's NOT done yet (known stubs)

- **ForgotPasswordPage** — UI exists but `authClient.forgetPassword` is stubbed. Backend needs `sendResetPassword` configured in `auth.config.ts`.
- **Follow/Unfollow** — frontend hooks exist; backend endpoints are on `feat/backend-follow-api` (Drizzle branch, not merged).
- **Search** — backend has search service; frontend needs a search input + results view wired to `/api/search`.
- **SettingsPage** — real account settings form.
- **Notifications** — not implemented.

---

## Commands

```bash
# From repo root
bun install                        # install all workspaces

# Backend
cd backend && bun run dev          # start NestJS dev server
cd backend && bun run build        # production build

# Frontend
cd frontend && bun run dev         # Vite dev server
cd frontend && bun run build       # production build (also runs tsc)
cd frontend && bun run lint        # Biome lint

# Shared package
cd packages/ui && bun run build    # if needed
```
