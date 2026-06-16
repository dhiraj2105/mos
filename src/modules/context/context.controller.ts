import { type Request, type Response } from "express";
import { buildContext } from "./context.service.js";

type ContextRequest = {
  userId: string;
  query: string;
};

async function context(
  req: Request<{}, {}, ContextRequest>,
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

  const contextData = await buildContext(userId.trim(), query.trim());
  res.json({
    context: contextData.memories.map((m) => m.content).join("\n\n"),
  });
}

export { context };
