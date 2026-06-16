import {
  insertMemory,
  selectMemoriesByUserId,
  removeMemory,
  updateMemory,
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

async function updateMemoryService(id: string, data: any): Promise<any> {
  return updateMemory(id, data);
}

export {
  createMemoryService,
  getMemoriesService,
  deleteMemoryService,
  updateMemoryService,
};
