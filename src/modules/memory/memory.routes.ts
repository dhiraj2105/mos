import { Router } from "express";
import {
  createMemory,
  getMemories,
  deleteMemory,
  updateMemory,
} from "./memory.controller.js";

const router: Router = Router();

router.post("/", createMemory);
router.get("/:userId", getMemories);
router.put("/:id", updateMemory);
router.delete("/:id", deleteMemory);

export { router };
