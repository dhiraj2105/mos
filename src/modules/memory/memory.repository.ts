import { query } from "../../db/postgres.js";

async function insertMemory(data: any): Promise<any> {
  const importance =
    typeof data.importanceScore === "number" ? data.importanceScore : 5;
  const category =
    typeof data.category === "string" ? data.category : "general";
  const expiresAt = data.expiresAt || null;

  const result = await query(
    "INSERT INTO memories (user_id, content, importance_score, embedding, category, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [
      data.userId,
      data.content,
      importance,
      data.embedding,
      category,
      expiresAt,
    ],
  );
  return result.rows[0];
}

async function selectMemoriesByUserId(userId: string): Promise<any> {
  const result = await query(
    "SELECT * FROM memories WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC",
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

async function updateMemory(id: string, data: any): Promise<any> {
  const importance =
    typeof data.importanceScore === "number" ? data.importanceScore : null;

  if (importance === null) {
    return null;
  }

  const result = await query(
    "UPDATE memories SET importance_score = $1 WHERE id = $2 RETURNING id, importance_score",
    [importance, id],
  );
  return result.rows[0];
}

export { insertMemory, selectMemoriesByUserId, removeMemory, updateMemory };
