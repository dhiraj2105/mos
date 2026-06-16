# MOS (MemoryOS)

MOS is a lightweight memory infrastructure service for LLM applications. It provides long-term memory storage, semantic retrieval over embeddings, prompt context construction, and memory expiration support.

The service is implemented as a Node.js + TypeScript backend with PostgreSQL + pgvector for vector search, and a small Flask embedding microservice using Sentence Transformers.

## Highlights

- Store user-scoped memories with importance, category, and optional expiration
- Perform semantic search using pgvector embeddings
- Build contextual prompt content from relevant memories
- Compress memory text blocks for prompt efficiency
- Docker Compose support for local deployment

## Contents

- `src/` — backend source code
- `python-service/` — embedding service
- `scripts/` — database schema and migration files
- `docker-compose.yml` — local container orchestration
- `Dockerfile` — backend production image
- `docs/DOCS.md` — full documentation

## Quick start

### Option 1: Run with Docker Compose

```bash
docker compose up --build
```

Then use the API at `http://localhost:3000`.

### Option 2: Run locally

1. Install Node dependencies:

```bash
npm install
```

2. Start PostgreSQL with `pgvector` installed.
3. Initialize the database:

```bash
createdb mos
psql -d mos -f scripts/setup-db.sql
psql -d mos -f scripts/migration-003-add-expiration.sql
```

4. Start the embedding service:

```bash
cd python-service
pip install -r requirements.txt
python app.py
```

5. Start the backend:

```bash
npm run dev
```

## Docker details

The Compose stack starts:

- `postgres` (`pgvector/pgvector:pg16-latest`)
- `embedding` (Python Flask embedding service)
- `backend` (Node.js MOS API)

Default database connection values:

- user: `postgres`
- password: `password`
- database: `mos`

If this is the first time starting Docker Compose, the initial schema from `scripts/setup-db.sql` is applied automatically.

## API overview

### Memories

- `POST /memories` — create a memory
- `GET /memories/:userId` — list active memories for a user
- `PUT /memories/:id` — update memory importance
- `DELETE /memories/:id` — delete a memory

### Retrieval

- `POST /search` — semantic search over memories
- `POST /context` — build a prompt context string from relevant memories
- `POST /compress` — combine text blocks into a compressed string

## Schema and migrations

- `scripts/setup-db.sql` sets up the base `memories` table and vector extension
- `scripts/migration-003-add-expiration.sql` adds `expires_at` plus expiration filtering

For an existing database, run migrations manually with `psql`. Fresh Docker Compose setups only apply the base schema automatically.

## More documentation

See `docs/DOCS.md` for a complete guide, including detailed API examples, environment configuration, and migration instructions.
