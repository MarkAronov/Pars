# database-postgres-pgvector

Standalone Postgres + pgvector infra, used by `backend-nestjs` (via `include:` in its own
`docker-compose.yml`) and available for `backend-express` once it exists.

Owns the docker-compose service definition and the one-time `CREATE EXTENSION vector` init
script. Table schema and migrations live in the backend's own `drizzle/` folder, not here.

## Usage

```bash
docker compose up -d
docker compose ps          # wait for postgres to report healthy
```

Connection string: `postgresql://pars:pars@localhost:5432/pars_dev` (override via
`POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD` env vars).

## Why pgvector, not plain postgres

The `user`/`post` tables have `embedding vector(1536)` columns for semantic search
(see `search-typesense/`), which requires the `vector` extension — not available on the
stock `postgres` image.
