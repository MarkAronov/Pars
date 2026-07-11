# search-typesense

Standalone Typesense infra + a LangChain semantic-search demo, wired against the Postgres path
only (see the asymmetry note below).

Unlike the other axes in this restructure, search isn't a two-option comparison: Typesense
already does both keyword and vector search in one self-hosted engine, has an official LangChain
vector-store integration, and covers this project's actual needs — there's no genuine technical
tension here the way there is for Kafka-vs-NATS or Postgres-vs-Mongo.

## Usage

```bash
docker compose up -d
docker compose ps        # wait for typesense healthy

bun install               # installs demo-script dependencies (standalone, not part of the root workspace)
bun run demo               # creates a collection, indexes 3 sample docs, runs a semantic query
```

The demo uses a small deterministic bag-of-words pseudo-embedding (no external API key needed)
purely to prove the LangChain ↔ Typesense wiring end-to-end. Real usage in `backend-nestjs`
would swap this for whatever embedding model populates the `embedding vector(1536)` columns in
`database-postgres-pgvector`'s schema, via `@langchain/community`'s `PGVectorStore` reading the
same columns directly — Typesense here demonstrates the same LangChain `VectorStore` interface
against a dedicated search engine instead.

## Known limitation: Postgres path only

LangChain's MongoDB vector store (`MongoDBAtlasVectorSearch`) requires MongoDB **Atlas**
specifically — self-hosted MongoDB Community Edition (what `database-mongodb/` runs) has no
native vector search. This demo and any future real wiring is scoped to the Postgres+pgvector
path; the Mongo path is documented as intentionally unsupported for semantic search.
