type RankedMemory = {
  id: string;
  user_id: string;
  content: string;
  importance_score: number;
  similarity_distance: number;
  similarity_score: number;
  combined_score: number;
  created_at: string;
};

type MemoryWithDistance = Omit<
  RankedMemory,
  "similarity_score" | "combined_score"
>;

function rankMemories(rows: MemoryWithDistance[]): RankedMemory[] {
  return rows
    .map((row) => {
      const similarity_score = 1 / (1 + row.similarity_distance);
      const combined_score = similarity_score + row.importance_score;

      return {
        ...row,
        similarity_score,
        combined_score,
      };
    })
    .sort((a, b) => b.combined_score - a.combined_score);
}

export { rankMemories };
export type { RankedMemory, MemoryWithDistance };
