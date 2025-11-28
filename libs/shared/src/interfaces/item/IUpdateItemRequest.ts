/**
 * Frontend interface for updating an existing item
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface IUpdateItemRequest {
  name?: string;
  description?: string;
  statusCode?: number;
  specialNotes?: string;
}

