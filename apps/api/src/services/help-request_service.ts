import { HelpRequestDao, HelpRequestInventoryItemDao, ItemDao } from '../dao';
import { CreateHelpRequestDto, HelpRequestResponseDto, HelpRequestWithOwnershipResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request';
import { InventoryItemResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/inventory';
import { IApiResponse, IHelpRequestSummary } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { Urgency, RationItemType } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Service layer for HelpRequest business logic
 * Handles validation and business rules
 */
class HelpRequestService {
  private static instance: HelpRequestService;
  private helpRequestDao: HelpRequestDao;
  private inventoryItemDao: HelpRequestInventoryItemDao;
  private itemDao: ItemDao;

  private constructor(
    helpRequestDao: HelpRequestDao,
    inventoryItemDao: HelpRequestInventoryItemDao,
    itemDao: ItemDao
  ) {
    this.helpRequestDao = helpRequestDao;
    this.inventoryItemDao = inventoryItemDao;
    this.itemDao = itemDao;
  }

  /**
   * Get HelpRequestService singleton instance
   */
  public static getInstance(): HelpRequestService {
    if (!HelpRequestService.instance) {
      HelpRequestService.instance = new HelpRequestService(
        HelpRequestDao.getInstance(),
        HelpRequestInventoryItemDao.getInstance(),
        ItemDao.getInstance()
      );
    }
    return HelpRequestService.instance;
  }

  /**
   * Get all help requests with optional filters
   */
  public async getAllHelpRequests(filters?: {
    urgency?: Urgency;
    district?: string;
  }): Promise<IApiResponse<HelpRequestResponseDto[]>> {
    try {
      const helpRequests = await this.helpRequestDao.findAll(filters);
      const helpRequestDtos = helpRequests.map(hr => new HelpRequestResponseDto(hr));

      return {
        success: true,
        data: helpRequestDtos,
        count: helpRequestDtos.length,
      };
    } catch (error) {
      console.error('Error in HelpRequestService.getAllHelpRequests:', error);
      return {
        success: false,
        error: 'Failed to retrieve help requests',
      };
    }
  }

  /**
   * Get help request by ID
   * @param id - The help request ID
   * @param requesterUserId - Optional user ID of the requester (to determine ownership)
   */
  public async getHelpRequestById(
    id: number,
    requesterUserId?: number
  ): Promise<IApiResponse<HelpRequestWithOwnershipResponseDto>> {
    try {
      const helpRequest = await this.helpRequestDao.findById(id);

      if (!helpRequest) {
        return {
          success: false,
          error: 'Help request not found',
        };
      }

      // Determine if requester is the owner
      const isOwner = requesterUserId !== undefined && helpRequest.userId === requesterUserId;

      return {
        success: true,
        data: new HelpRequestWithOwnershipResponseDto(helpRequest, isOwner),
      };
    } catch (error) {
      console.error(`Error in HelpRequestService.getHelpRequestById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve help request',
      };
    }
  }

  /**
   * Create a new help request
   * @param createHelpRequestDto - Help request data
   * @param userId - Optional user ID to track who created the request
   */
  public async createHelpRequest(createHelpRequestDto: CreateHelpRequestDto, userId?: number): Promise<IApiResponse<HelpRequestResponseDto>> {
    try {
      // Validate coordinates
      if (createHelpRequestDto.lat < -90 || createHelpRequestDto.lat > 90) {
        return {
          success: false,
          error: 'Invalid latitude',
        };
      }
      if (createHelpRequestDto.lng < -180 || createHelpRequestDto.lng > 180) {
        return {
          success: false,
          error: 'Invalid longitude',
        };
      }

      // Validate short note length
      if (!createHelpRequestDto.shortNote || createHelpRequestDto.shortNote.trim().length === 0) {
        return {
          success: false,
          error: 'Short note is required',
        };
      }
      if (createHelpRequestDto.shortNote.length > 160) {
        return {
          success: false,
          error: 'Short note must not exceed 160 characters',
        };
      }

      // Business logic: Trim whitespace
      const trimmedDto = new CreateHelpRequestDto({
        lat: createHelpRequestDto.lat,
        lng: createHelpRequestDto.lng,
        urgency: createHelpRequestDto.urgency,
        shortNote: createHelpRequestDto.shortNote.trim(),
        approxArea: createHelpRequestDto.approxArea.trim(),
        contactType: createHelpRequestDto.contactType,
        contact: createHelpRequestDto.contact?.trim(),
        name: createHelpRequestDto.name?.trim(),
        totalPeople: createHelpRequestDto.totalPeople,
        elders: createHelpRequestDto.elders,
        children: createHelpRequestDto.children,
        pets: createHelpRequestDto.pets,
        rationItems: createHelpRequestDto.rationItems,
      });

      // Validate ration items exist in database
      if (trimmedDto.rationItems && trimmedDto.rationItems.length > 0) {
        const invalidItems: string[] = [];
        for (const itemCode of trimmedDto.rationItems) {
          // Validate it's a valid enum value
          if (!Object.values(RationItemType).includes(itemCode as RationItemType)) {
            invalidItems.push(itemCode);
            continue;
          }
          // Validate it exists in database
          const item = await this.itemDao.findByCode(itemCode);
          if (!item) {
            invalidItems.push(itemCode);
          }
        }
        if (invalidItems.length > 0) {
          return {
            success: false,
            error: `Invalid ration items: ${invalidItems.join(', ')}. Please ensure all items are seeded.`,
          };
        }
      }

      const helpRequest = await this.helpRequestDao.create(trimmedDto, userId);

      // Create inventory items for ration items
      // If rationItems is provided as an array of strings, create inventory items with quantityNeeded = 1 for each
      // TODO: Enhance to support quantities in the future
      if (trimmedDto.rationItems && trimmedDto.rationItems.length > 0) {
        const inventoryItemsMap: Record<string, number> = {};
        trimmedDto.rationItems.forEach(itemCode => {
          inventoryItemsMap[itemCode] = 1; // Default quantity of 1 per item
        });
        await this.inventoryItemDao.createInventoryItems(helpRequest.id!, inventoryItemsMap);
      }

      return {
        success: true,
        data: new HelpRequestResponseDto(helpRequest),
        message: 'Help request created successfully',
      };
    } catch (error) {
      console.error('Error in HelpRequestService.createHelpRequest:', error);
      return {
        success: false,
        error: 'Failed to create help request',
      };
    }
  }

  /**
   * Get comprehensive summary statistics for help requests
   * Returns all counts including by urgency, status, district, people totals, and ration items
   */
  public async getHelpRequestsSummary(): Promise<IApiResponse<IHelpRequestSummary>> {
    try {
      const summary = await this.helpRequestDao.getSummary();

      return {
        success: true,
        data: summary,
        count: summary.total,
      };
    } catch (error) {
      console.error('Error in HelpRequestService.getHelpRequestsSummary:', error);
      return {
        success: false,
        error: 'Failed to retrieve help requests summary',
      };
    }
  }

  /**
   * Get inventory items for a help request
   * Returns inventory summary with pending, donated, and remaining quantities
   */
  public async getInventoryItems(helpRequestId: number): Promise<IApiResponse<InventoryItemResponseDto[]>> {
    try {
      // Verify help request exists
      const helpRequest = await this.helpRequestDao.findById(helpRequestId);
      if (!helpRequest) {
        return {
          success: false,
          error: 'Help request not found',
        };
      }

      const inventoryItems = await this.inventoryItemDao.findByHelpRequestId(helpRequestId);
      const inventoryDtos = inventoryItems.map(item => new InventoryItemResponseDto(item));

      return {
        success: true,
        data: inventoryDtos,
        count: inventoryDtos.length,
      };
    } catch (error) {
      console.error(`Error in HelpRequestService.getInventoryItems (${helpRequestId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve inventory items',
      };
    }
  }
}

export default HelpRequestService;

