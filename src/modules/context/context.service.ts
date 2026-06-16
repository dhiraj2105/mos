import { query } from "../../db/postgres.js";
import { embedText } from "../embeddings/embedding.service.js";
import { rankMemories } from "../ranking/ranking.service.js";

type ContextMemory = {
  content: string;
  score: number;
};

type ContextResponse = {
  userId: string;
  query: string;
  memories: ContextMemory[];
};

async function buildContext(
  userId: string,
  queryText: string,
): Promise<ContextResponse> {
  const embedding = await embedText(queryText);

  const result = await query(
    "SELECT id, user_id, content, importance_score, created_at, embedding <=> $1 AS similarity_distance FROM memories WHERE user_id = $2 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY similarity_distance LIMIT 5",
    [embedding, userId],
  );

  const ranked = rankMemories(
    result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      importance_score: row.importance_score,
      similarity_distance: row.similarity_distance,
      created_at: row.created_at,
    })),
  );

  return {
    userId,
    query: queryText,
    memories: ranked.map((m) => ({
      content: m.content,
      score: m.combined_score,
    })),
  };
}

export { buildContext };
export type { ContextResponse };
