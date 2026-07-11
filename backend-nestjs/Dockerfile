# Build context is the REPO ROOT, not this directory — backend-nestjs now depends
# on the @pars/db-adapters workspace package, and Docker can't COPY paths from
# outside its build context. Deploy from the repo root, e.g.:
#   fly deploy --config backend-nestjs/fly.toml --dockerfile backend-nestjs/Dockerfile .

FROM oven/bun:1-debian AS deps
WORKDIR /app
# argon2 is a native module — needs gcc/g++/python3 to compile
RUN apt-get update -qq && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
# Only package.json files first (better layer caching) — every workspace member
# must be present so `bun install --frozen-lockfile` can resolve the workspace,
# even members backend-nestjs doesn't itself depend on.
COPY package.json bun.lock ./
COPY backend-nestjs/package.json ./backend-nestjs/package.json
COPY packages/db-adapters/package.json ./packages/db-adapters/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY frontend/package.json ./frontend/package.json
RUN bun install --frozen-lockfile

FROM oven/bun:1-debian AS builder
WORKDIR /app
# Bun keeps a per-workspace node_modules (symlinks into its hoisted store)
# alongside the root one — both are needed for module resolution to work.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend-nestjs/node_modules ./backend-nestjs/node_modules
COPY --from=deps /app/packages/db-adapters/node_modules ./packages/db-adapters/node_modules
COPY backend-nestjs ./backend-nestjs
COPY packages/db-adapters ./packages/db-adapters
WORKDIR /app/backend-nestjs
RUN bun run build

FROM oven/bun:1-debian AS runner
WORKDIR /app/backend-nestjs
ENV NODE_ENV=production
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend-nestjs/node_modules ./node_modules
COPY --from=builder /app/backend-nestjs/dist ./dist
COPY --from=builder /app/backend-nestjs/package.json ./package.json
COPY --from=builder /app/packages/db-adapters/node_modules /app/packages/db-adapters/node_modules
COPY --from=builder /app/packages/db-adapters/drizzle /app/packages/db-adapters/drizzle
COPY --from=builder /app/packages/db-adapters/drizzle.config.ts /app/packages/db-adapters/drizzle.config.ts
COPY --from=builder /app/packages/db-adapters/package.json /app/packages/db-adapters/package.json
EXPOSE 3000
CMD ["bun", "run", "start"]
