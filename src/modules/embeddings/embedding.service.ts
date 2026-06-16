const EMBEDDING_SERVICE_URL =
  process.env.EMBEDDING_SERVICE_URL || "http://localhost:5000";

type EmbedRequest = {
  text: string;
};

type EmbedResponse = {
  embedding: number[];
};

async function embedText(text: string): Promise<number[]> {
  const response = await fetch(`${EMBEDDING_SERVICE_URL}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding service error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as EmbedResponse;
  return data.embedding;
}

export { embedText };
