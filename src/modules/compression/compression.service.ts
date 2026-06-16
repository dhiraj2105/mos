type Memory = {
  content: string;
  score?: number;
};

function compressMemories(memories: Memory[]): string {
  if (memories.length === 0) {
    return "";
  }

  return memories.map((m) => m.content).join("\n\n");
}

export { compressMemories };
export type { Memory };
