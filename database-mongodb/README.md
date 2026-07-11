# database-mongodb

Standalone MongoDB infra, used by `backend-nestjs`/`backend-express` when
`DATABASE_DRIVER=mongo`.

Runs as a **single-node replica set** (`rs0`), not a plain standalone instance — Mongo only
supports multi-document transactions (`session.withTransaction()`) on a replica set, even a
single-node one, and the Mongo repository's cascade-delete logic (e.g. deleting a user must
also delete their `follow`/`post_like`/`media` docs) needs that atomicity.

## Usage

```bash
docker compose up -d
docker compose ps        # wait for `mongodb` healthy; `mongodb-init` exits 0 once it runs
```

Connection string: `mongodb://localhost:27017/pars_dev?replicaSet=rs0`

## Known limitation: no vector/semantic search here

Self-hosted MongoDB Community Edition has no native vector search — LangChain's Mongo vector
store (`MongoDBAtlasVectorSearch`) requires MongoDB **Atlas** specifically. This is a documented,
accepted asymmetry: the Postgres path gets real semantic search via `search-typesense/`; the
Mongo path does not. See the root restructure plan for the full rationale.

## Schema note

Mongo has no DB-level enums, composite PKs, or FKs. Enum fields (`role`, media `type`) are
validated at the repository layer; composite uniqueness (e.g. `follow` on
`{ followerId, followeeId }`) is a compound unique index created by the repository/migration
code in `packages/db-adapters/`, not by this infra folder.
