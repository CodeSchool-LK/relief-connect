import apiClient from './api-client';
import { IApiResponse, ICreateItemRequest, IUpdateItemRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ItemResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item/response/item_response_dto';

/**
 * Item Service
 * Handles all item-related API calls
 */
class ItemService {
  private static instance: ItemService;
  private readonly basePath = '/api/items';

  private constructor() {}

  /**
   * Get ItemService singleton instance
   */
  public static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService();
    }
    return ItemService.instance;
  }

  /**
   * Get all items
   */
  public async getAllItems(): Promise<IApiResponse<ItemResponseDto[]>> {
    try {
      const response = await apiClient.get<IApiResponse<ItemResponseDto[]>>(
        this.basePath
      );
      return response;
    } catch (error) {
      console.error('Error in ItemService.getAllItems:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch items',
      };
    }
  }

  /**
   * Get item by ID
   */
  public async getItemById(id: number): Promise<IApiResponse<ItemResponseDto>> {
    try {
      const response = await apiClient.get<IApiResponse<ItemResponseDto>>(
        `${this.basePath}/${id}`
      );
      return response;
    } catch (error) {
      console.error(`Error in ItemService.getItemById (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch item',
      };
    }
  }

  /**
   * Create a new item
   */
  public async createItem(
    createItemDto: ICreateItemRequest
  ): Promise<IApiResponse<ItemResponseDto>> {
    try {
      const response = await apiClient.post<IApiResponse<ItemResponseDto>>(
        this.basePath,
        createItemDto
      );
      return response;
    } catch (error) {
      console.error('Error in ItemService.createItem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create item',
      };
    }
  }

  /**
   * Update an item
   */
  public async updateItem(
    id: number,
    updateData: IUpdateItemRequest
  ): Promise<IApiResponse<ItemResponseDto>> {
    try {
      const response = await apiClient.put<IApiResponse<ItemResponseDto>>(
        `${this.basePath}/${id}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(`Error in ItemService.updateItem (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item',
      };
    }
  }

  /**
   * Delete an item
   */
  public async deleteItem(id: number): Promise<IApiResponse<null>> {
    try {
      const response = await apiClient.delete<IApiResponse<null>>(
        `${this.basePath}/${id}`
      );
      return response;
    } catch (error) {
      console.error(`Error in ItemService.deleteItem (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete item',
      };
    }
  }
}

// Export singleton instance
export const itemService = ItemService.getInstance();
export default itemService;

