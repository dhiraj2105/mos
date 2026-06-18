import { query } from "../../db/postgres.js";
import { embedText } from "../embeddings/embedding.service.js";
import { rankMemories, type RankedMemory } from "../ranking/ranking.service.js";

type MemoryRow = {
  id: string;
  user_id: string;
  content: string;
  importance_score: number;
  created_at: string;
  similarity_distance: number;
};

async function searchMemories(queryText: string): Promise<RankedMemory[]> {
  const embedding = await embedText(queryText);

  const vectorString = `[${embedding.join(",")}]`;

  const result = await query<MemoryRow>(
    `
  SELECT
    id,
    user_id,
    content,
    importance_score,
    created_at,
    embedding <=> $1::vector AS similarity_distance
  FROM memories
  WHERE expires_at IS NULL OR expires_at > NOW()
  ORDER BY similarity_distance
  LIMIT 5
  `,
    [vectorString],
  );

  return rankMemories(result.rows);
}

export { searchMemories };
