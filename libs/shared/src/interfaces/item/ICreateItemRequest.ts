/**
 * Frontend interface for creating a new item
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ICreateItemRequest {
  name: string;
  description?: string;
}

