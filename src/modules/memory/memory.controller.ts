import { type Request, type Response } from "express";
import {
  createMemoryService,
  getMemoriesService,
  deleteMemoryService,
} from "./memory.service.js";

type UserParams = {
  userId: string;
};

type MemoryParams = {
  id: string;
};

async function createMemory(req: Request, res: Response): Promise<void> {
  const { userId, content } = req.body ?? {};

  if (
    typeof userId !== "string" ||
    userId.trim() === "" ||
    typeof content !== "string" ||
    content.trim() === ""
  ) {
    res
      .status(400)
      .json({ error: "Invalid request: userId and content are required" });
    return;
  }

  const payload = {
    userId: userId.trim(),
    content: content.trim(),
    importanceScore: req.body.importanceScore,
  };
  const result = await createMemoryService(payload);
  res.status(201).json(result);
}

async function getMemories(
  req: Request<UserParams>,
  res: Response,
): Promise<void> {
  const { userId } = req.params;
  const result = await getMemoriesService(userId);
  res.json(result);
}

async function deleteMemory(
  req: Request<MemoryParams>,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const result = await deleteMemoryService(id);
  res.json(result);
}

export { createMemory, getMemories, deleteMemory };
