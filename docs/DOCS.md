# MOS Documentation

## Overview

MOS (MemoryOS) is a lightweight memory infrastructure service designed for LLM applications. It provides:

- long-term memory storage
- semantic search over vector embeddings
- user-scoped retrieval
- context construction for prompts
- memory expiration support
- a Python embedding microservice
- Docker-based deployment with PostgreSQL + pgvector

The backend is written in Node.js + TypeScript and uses PostgreSQL with the `pgvector` extension. The embedding service is a small Flask app using `sentence-transformers`.

---

## Repository Structure

- `Dockerfile` - builds the Node.js backend image
- `docker-compose.yml` - orchestrates Postgres, embedding service, and backend
- `README.md` - project summary
- `docs/DOCS.md` - detailed documentation
- `.env` - local environment variables
- `package.json` - backend dependencies and scripts
- `tsconfig.json` - TypeScript compiler settings
- `scripts/` - database schema and migrations
- `python-service/` - Python embedding microservice
- `src/` - backend source code

### Backend source layout

- `src/app.ts` - Express app factory, route registration, logging, health
- `src/server.ts` - application entrypoint
- `src/config/env.ts` - environment variable loading
- `src/config/logger.ts` - Winston logger configuration
- `src/db/postgres.ts` - PostgreSQL pool helper
- `src/modules/` - application modules:
  - `memory/` - create, list, update, delete memories
  - `retrieval/` - semantic search endpoint
  - `context/` - context builder endpoint
  - `compression/` - prompt compression helper
  - `embeddings/` - embedding service client
  - `ranking/` - ranking algorithm

### Python service layout

- `python-service/app.py` - Flask service with `/embed`
- `python-service/requirements.txt` - Python dependencies
- `python-service/Dockerfile` - container build instructions

---

## Environment Variables

MOS uses the following runtime variables:

- `PORT` - backend server port (default `3000`)
- `DATABASE_URL` - PostgreSQL connection string
- `EMBEDDING_SERVICE_URL` - URL for the embedding service
- `NODE_ENV` - Node environment mode
- `FLASK_ENV` - Flask environment for the embedding service

### Example `.env`

```dotenv
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mos
EMBEDDING_SERVICE_URL=http://localhost:5000
NODE_ENV=production
FLASK_ENV=production
```

> Note: When using `docker-compose`, the backend connects to `postgres` and `embedding` service names directly.

---

## Database Schema

### Initial schema: `scripts/setup-db.sql`

This script creates the `memories` table and the required pgvector extension:

- `id` - UUID primary key with `gen_random_uuid()`
- `user_id` - user namespace
- `content` - text memory payload
- `importance_score` - ranking boost field
- `embedding` - 384-dimensional pgvector column
- `created_at` - timestamp default now

Indexes:

- `idx_memories_user_id` for user lookup
- `idx_memories_embedding` for vector similarity search

### Migration scripts

Current migrations:

- `scripts/migration-003-add-expiration.sql` — adds `expires_at` support and an index for expiration filtering.

This project uses a base initialization script plus separate migration files for schema changes.

### When to run migrations

- On a fresh database: run `scripts/setup-db.sql` first.
- When schema changes are introduced later: run migration scripts in order.
- If using Docker Compose for the first time, `scripts/setup-db.sql` is applied automatically by Postgres init.
- For existing data volumes or when updating the schema, run migrations manually.

### How to run migration scripts

From a machine with `psql` and access to the database:

```bash
psql -d mos -f scripts/setup-db.sql
psql -d mos -f scripts/migration-003-add-expiration.sql
```

If Postgres is running inside Docker Compose, use:

```bash
docker compose exec postgres psql -U postgres -d mos -f /docker-entrypoint-initdb.d/setup-db.sql
docker compose exec postgres psql -U postgres -d mos -f /scripts/migration-003-add-expiration.sql
```

> Note: `scripts/setup-db.sql` only runs automatically during the first startup of a fresh Postgres data volume. Migration scripts must be run manually against an existing database.

Expired memories are excluded from search, context, and list results.

---

## Build and Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

If you are using Docker Compose, it is handled automatically.

If you run PostgreSQL locally, ensure `pgvector` is installed and configure the database:

```bash
createdb mos
psql -d mos -f scripts/setup-db.sql
psql -d mos -f scripts/migration-003-add-expiration.sql
```

### 3. Start the embedding service

```bash
cd python-service
pip install -r requirements.txt
python app.py
```

### 4. Start the backend in development

```bash
npm run dev
```

### 5. Verify services

- Backend: `http://localhost:3000/health`
- Embedding: `http://localhost:5000/embed`

---

## Docker Setup

### Build and run with Docker Compose

```bash
docker compose up --build
```

This starts three services:

- `postgres` - PostgreSQL with `pgvector`
- `embedding` - Python Flask embedding service
- `backend` - Node.js MOS API server

### Do I need to do anything else?

- For a fresh installation: no additional setup is required. Just run `docker compose up --build` and the database schema in `scripts/setup-db.sql` will be initialized automatically on the first startup.
- If you already have an existing Postgres volume and the schema changes later, you must run migration scripts manually.
- After the services are up, the API endpoints are ready to use immediately at `http://localhost:3000`.

### Docker Compose details

- Postgres image: `pgvector/pgvector:pg16-latest`
- Backend port: `3000`
- Embedding port: `5000`
- Postgres password: `password`

### Docker Compose environment mapping

The backend receives:

```yaml
DATABASE_URL: postgresql://postgres:password@postgres:5432/mos
EMBEDDING_SERVICE_URL: http://embedding:5000
```

> The Docker Compose setup mounts `scripts/setup-db.sql` into Postgres initialization. On first startup, Postgres initializes the schema automatically.

> If you add new schema migrations later, run them manually against the running database instead of relying on the initial schema file.

---

## How to Use the API

All endpoints are JSON-based.

### Memory endpoints

#### Create a memory

`POST /memories`

Request body:

```json
{
  "userId": "user123",
  "content": "Remember this detail",
  "importanceScore": 7,
  "category": "personal",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

Response:

```json
{ "id": "..." }
```

Notes:

- `importanceScore` is optional and defaults to `5`
- `category` is optional and defaults to `general`
- `expiresAt` is optional; if omitted, the memory does not expire

#### Get user memories

`GET /memories/:userId`

Example:

```bash
curl http://localhost:3000/memories/user123
```

Response:

A list of active memories for that user. Expired memories are automatically excluded.

#### Update memory importance

`PUT /memories/:id`

Request body:

```json
{ "importanceScore": 8 }
```

Response:

```json
{ "id": "...", "importance_score": 8 }
```

#### Delete a memory

`DELETE /memories/:id`

Response:

```json
{ "id": "..." }
```

---

### Search endpoint

`POST /search`

Request body:

```json
{
  "userId": "user123",
  "query": "What did I say about AI?"
}
```

Response:

A ranked list of relevant memories, combining semantic similarity and importance.

Notes:

- Search uses the embedding service and `pgvector` similarity search
- Expired memories are not returned

---

### Context endpoint

`POST /context`

Request body:

```json
{
  "userId": "user123",
  "query": "Summarize my recent memories about product design"
}
```

Response:

```json
{ "context": "memory text 1\n\nmemory text 2" }
```

Notes:

- This returns a context string built from the top-ranked memories
- Expired memories are excluded

---

### Compression endpoint

`POST /compress`

Request body:

```json
{ "content": "Memory one. Memory two." }
```

Response:

```json
{ "compressed": "Memory one.\n\nMemory two." }
```

Notes:

- The current implementation performs simple concatenation
- It is intended to reduce prompt size by merging memory text blocks

---

## Backend internals

### `src/modules/memory`

- `memory.routes.ts` - Express routes for memory CRUD
- `memory.controller.ts` - request validation and response handling
- `memory.service.ts` - embedding generation, business logic, repository calls
- `memory.repository.ts` - SQL queries for insert, select, update, delete

`insertMemory` now stores `expires_at`, and `selectMemoriesByUserId` filters expired records.

### `src/modules/retrieval`

- `retrieval.routes.ts` - search route
- `retrieval.controller.ts` - request validation
- `retrieval.service.ts` - semantic vector search SQL query

Search SQL filters out expired memories using:

```sql
WHERE expires_at IS NULL OR expires_at > NOW()
```

### `src/modules/context`

- `context.routes.ts` - route for context generation
- `context.controller.ts` - request validation and response formatting
- `context.service.ts` - semantic retrieval and ranking

Context retrieval also ignores expired memories.

### `src/modules/embeddings`

- `embedding.service.ts` - HTTP client for the Python embedding service

### `src/modules/ranking`

- `ranking.service.ts` - computes `similarity_score` and `combined_score`

Ranking formula:

- `similarity_score = 1 / (1 + similarity_distance)`
- `combined_score = similarity_score + importance_score`

---

## Python embedding service

### `python-service/app.py`

- Flask app exposes `POST /embed`
- Uses `SentenceTransformer('all-MiniLM-L6-v2')`
- Returns a 384-dimensional embedding vector

Request body:

```json
{ "text": "some text" }
```

Response:

```json
{ "embedding": [0.123, 0.456, ...] }
```

### `python-service/requirements.txt`

Contains Python package dependencies for the embedding service.

---

## Deployment and running

### Local development

1. Clone the repository
2. Install Node dependencies
3. Start PostgreSQL and apply migrations
4. Start the embedding service
5. Start the backend

### Docker Compose

Run everything with:

```bash
docker compose up --build
```

Then access:

- Backend: `http://localhost:3000`
- Embedding: `http://localhost:5000`

### Health checks

- Backend: `GET /health`
- Embedding: `POST /embed`

---

## Database passwords and credentials

In this project the default database credentials are:

- username: `postgres`
- password: `password`
- database: `mos`

For production, replace these values with secure credentials and do not commit them into source control.

---

## Additional notes

- The backend is strict TypeScript with ECMAScript modules
- No external authentication is implemented by default
- Expired memories are automatically hidden from retrieval routes
- The project is designed as a minimal memory store for LLM prompt augmentation
