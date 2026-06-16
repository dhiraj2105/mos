import {
  insertMemory,
  selectMemoriesByUserId,
  removeMemory,
} from "./memory.repository.js";
import { embedText } from "../embeddings/embedding.service.js";

async function createMemoryService(data: any): Promise<any> {
  const embedding = await embedText(data.content);
  return insertMemory({ ...data, embedding });
}

async function getMemoriesService(userId: string): Promise<any> {
  return selectMemoriesByUserId(userId);
}

async function deleteMemoryService(id: string): Promise<any> {
  return removeMemory(id);
}

export { createMemoryService, getMemoriesService, deleteMemoryService };
