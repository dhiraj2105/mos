import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";

import { DATABASE_URL } from "../config/env.js";

const pool: Pool = new Pool({
  connectionString: DATABASE_URL,
});

async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: any[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, values);
}

async function getConnection() {
  return pool.connect();
}

export { pool, query, getConnection };
