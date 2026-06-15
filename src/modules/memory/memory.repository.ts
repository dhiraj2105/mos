import { query } from "../../db/postgres.js";

async function insertMemory(data: any): Promise<any> {
  const importance =
    typeof data.importanceScore === "number" ? data.importanceScore : 5;

  const result = await query(
    "INSERT INTO memories (user_id, content, importance_score) VALUES ($1, $2, $3) RETURNING id",
    [data.userId, data.content, importance],
  );
  return result.rows[0];
}

async function selectMemoriesByUserId(userId: string): Promise<any> {
  const result = await query(
    "SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
}

async function removeMemory(id: string): Promise<any> {
  const result = await query(
    "DELETE FROM memories WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0];
}

export { insertMemory, selectMemoriesByUserId, removeMemory };
