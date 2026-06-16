import { type Request, type Response } from "express";
import { compressMemories } from "./compression.service.js";

type CompressRequest = {
  content: string;
};

async function compress(
  req: Request<{}, {}, CompressRequest>,
  res: Response,
): Promise<void> {
  const { content } = req.body ?? {};

  if (typeof content !== "string" || content.trim() === "") {
    res.status(400).json({ error: "Invalid request: content is required" });
    return;
  }

  const compressed = compressMemories([{ content: content.trim() }]);
  res.json({ compressed });
}

export { compress };
