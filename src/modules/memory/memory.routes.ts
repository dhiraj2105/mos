import { Router } from "express";
import {
  createMemory,
  getMemories,
  deleteMemory,
} from "./memory.controller.js";

const router: Router = Router();

router.post("/", createMemory);
router.get("/:userId", getMemories);
router.delete("/:id", deleteMemory);

export { router };
