import { type Request, type Response } from "express";
import { searchMemories } from "./retrieval.service.js";

type SearchRequest = {
  userId: string;
  query: string;
};

async function search(
  req: Request<{}, {}, SearchRequest>,
  res: Response,
): Promise<void> {
  const { userId, query } = req.body ?? {};

  if (
    typeof userId !== "string" ||
    userId.trim() === "" ||
    typeof query !== "string" ||
    query.trim() === ""
  ) {
    res
      .status(400)
      .json({ error: "Invalid request: userId and query are required" });
    return;
  }

  const results = await searchMemories(query.trim());
  res.json(results);
}

export { search };
