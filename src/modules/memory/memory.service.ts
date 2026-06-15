import {
  insertMemory,
  selectMemoriesByUserId,
  removeMemory,
} from "./memory.repository.js";

async function createMemoryService(data: any): Promise<any> {
  return insertMemory(data);
}

async function getMemoriesService(userId: string): Promise<any> {
  return selectMemoriesByUserId(userId);
}

async function deleteMemoryService(id: string): Promise<any> {
  return removeMemory(id);
}

export { createMemoryService, getMemoriesService, deleteMemoryService };
