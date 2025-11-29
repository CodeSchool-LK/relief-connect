import { RationItemType } from '../../enums/ration-item.enum';

/**
 * Frontend interface for creating a new item
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ICreateItemRequest {
  code: RationItemType;
  name: string;
  description?: string;
}

