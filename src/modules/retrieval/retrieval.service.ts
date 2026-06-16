import { query } from "../../db/postgres.js";
import { embedText } from "../embeddings/embedding.service.js";

type MemoryRow = {
  id: string;
  user_id: string;
  content: string;
  importance_score: number;
  created_at: string;
};

async function searchMemories(queryText: string): Promise<MemoryRow[]> {
  const embedding = await embedText(queryText);

  const result = await query<MemoryRow>(
    "SELECT id, user_id, content, importance_score, created_at FROM memories ORDER BY embedding <=> $1 LIMIT 5",
    [embedding],
  );

  return result.rows;
}

export { searchMemories };
