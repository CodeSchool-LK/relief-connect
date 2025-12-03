import { CampDao, CampItemDao, CampDropOffLocationDao, VolunteerClubDao, CampInventoryItemDao } from '../dao';
import { CreateCampDto, UpdateCampDto, CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ICamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICamp';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation';
import { CampType, CampNeed, UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { CampItemModel, CampHelpRequestModel, CampDonationModel, CampDropOffLocationModel } from '../models';
import { sequelize } from '../models';

/**
 * Service layer for Camp business logic
 * Handles validation and business rules
 */
class CampService {
  private static instance: CampService;
  private campDao: CampDao;

  private constructor(campDao: CampDao) {
    this.campDao = campDao;
  }

  /**
   * Get CampService singleton instance
   */
  public static getInstance(): CampService {
    if (!CampService.instance) {
      CampService.instance = new CampService(CampDao.getInstance());
    }
    return CampService.instance;
  }

  /**
   * Get all camps with optional filters
   */
  public async getAllCamps(filters?: {
    campType?: CampType;
    needs?: CampNeed[];
    district?: string;
    bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  }): Promise<IApiResponse<CampResponseDto[]>> {
    try {
      const camps = await this.campDao.findAll(filters);
      
      // Fetch items and drop-off locations for all camps
      const campItemDao = CampItemDao.getInstance();
      const campDropOffLocationDao = CampDropOffLocationDao.getInstance();
      
      const campDtos = await Promise.all(
        camps.map(async (camp) => {
          const [items, dropOffLocations] = await Promise.all([
            campItemDao.findByCampId(camp.id!),
            campDropOffLocationDao.findByCampId(camp.id!),
          ]);
          return new CampResponseDto(camp, items, dropOffLocations);
        })
      );

      return {
        success: true,
        data: campDtos,
        count: campDtos.length,
      };
    } catch (error) {
      console.error('Error in CampService.getAllCamps:', error);
      return {
        success: false,
        error: 'Failed to retrieve camps',
      };
    }
  }

  /**
   * Get camp by ID
   * @param id - Camp ID
   * @param userId - Optional user ID for authorization check
   * @param userRole - Optional user role for authorization check
   */
  public async getCampById(id: number, userId?: number, userRole?: UserRole): Promise<IApiResponse<CampResponseDto>> {
    try {
      const camp = await this.campDao.findById(id);

      if (!camp) {
        return {
          success: false,
          error: 'Camp not found',
        };
      }

      // Allow public access to view camps
      // Authorization checks only apply for editing/managing camps, not viewing
      // If user is authenticated, we can use their info for additional features, but viewing is public

      // Fetch associated items, drop-off locations, help requests, and donations
      const campItemDao = CampItemDao.getInstance();
      const campDropOffLocationDao = CampDropOffLocationDao.getInstance();
      
      const [items, dropOffLocations, helpRequestLinks, donationLinks] = await Promise.all([
        campItemDao.findByCampId(id),
        campDropOffLocationDao.findByCampId(id),
        CampHelpRequestModel.findAll({
          where: {
            [CampHelpRequestModel.CAMP_ID]: id,
          },
        }),
        CampDonationModel.findAll({
          where: {
            [CampDonationModel.CAMP_ID]: id,
          },
        }),
      ]);

      const helpRequestIds = helpRequestLinks.map(link => link.get(CampHelpRequestModel.HELP_REQUEST_ID) as number);
      const donationIds = donationLinks.map(link => link.get(CampDonationModel.DONATION_ID) as number);

      return {
        success: true,
        data: new CampResponseDto(camp, items, dropOffLocations, helpRequestIds, donationIds),
      };
    } catch (error) {
      console.error(`Error in CampService.getCampById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve camp',
      };
    }
  }

  /**
   * Create a new camp
   * @param createCampDto - Camp creation data
   * @param userId - ID of the volunteer club user creating the camp
   */
  public async createCamp(createCampDto: CreateCampDto, userId: number): Promise<IApiResponse<CampResponseDto>> {
    try {
      // Validate coordinates
      if (createCampDto.lat < -90 || createCampDto.lat > 90) {
        return {
          success: false,
          error: 'Invalid latitude',
        };
      }
      if (createCampDto.lng < -180 || createCampDto.lng > 180) {
        return {
          success: false,
          error: 'Invalid longitude',
        };
      }

      // Validate name
      if (!createCampDto.name || createCampDto.name.trim().length === 0) {
        return {
          success: false,
          error: 'Camp name is required',
        };
      }

      // Validate needs array
      if (!createCampDto.needs || createCampDto.needs.length === 0) {
        return {
          success: false,
          error: 'At least one need must be specified',
        };
      }

      // Validate short note
      if (!createCampDto.shortNote || createCampDto.shortNote.trim().length === 0) {
        return {
          success: false,
          error: 'Short note is required',
        };
      }
      if (createCampDto.shortNote.length > 500) {
        return {
          success: false,
          error: 'Short note must not exceed 500 characters',
        };
      }

      // Get volunteer club for the user
      const volunteerClubDao = VolunteerClubDao.getInstance();
      const volunteerClub = await volunteerClubDao.findByUserId(userId);
      if (!volunteerClub) {
        return {
          success: false,
          error: 'Volunteer club not found for this user',
        };
      }

      // Business logic: Trim whitespace
      const trimmedDto = new CreateCampDto({
        lat: createCampDto.lat,
        lng: createCampDto.lng,
        campType: createCampDto.campType,
        name: createCampDto.name.trim(),
        peopleRange: createCampDto.peopleRange,
        peopleCount: createCampDto.peopleCount,
        needs: createCampDto.needs,
        shortNote: createCampDto.shortNote.trim(),
        description: createCampDto.description?.trim(),
        location: createCampDto.location?.trim(),
        contactType: createCampDto.contactType,
        contact: createCampDto.contact?.trim(),
        items: createCampDto.items,
        // dropOffLocations are processed separately below to handle string lat/lng conversion
        helpRequestIds: createCampDto.helpRequestIds,
        donationIds: createCampDto.donationIds,
      });

      // Create the camp
      const camp = await this.campDao.create(trimmedDto, volunteerClub.id);

      // Create camp items
      const campItemDao = CampItemDao.getInstance();
      if (createCampDto.items && createCampDto.items.length > 0) {
        await Promise.all(
          createCampDto.items.map(item =>
            campItemDao.create(camp.id!, item.itemType, item.quantity, item.notes)
          )
        );

        // Initialize inventory items with needed quantities
        const campInventoryItemDao = CampInventoryItemDao.getInstance();
        const inventoryItems: Record<string, number> = {};
        createCampDto.items.forEach(item => {
          inventoryItems[item.itemType] = (inventoryItems[item.itemType] || 0) + item.quantity;
        });
        await campInventoryItemDao.createInventoryItems(camp.id!, inventoryItems);
      }

      // Create drop-off locations
      const dropOffLocationDao = CampDropOffLocationDao.getInstance();
      if (createCampDto.dropOffLocations && createCampDto.dropOffLocations.length > 0) {
        await Promise.all(
          createCampDto.dropOffLocations.map(location => {
            // Convert string lat/lng to numbers if provided
            let latNum: number | undefined = undefined;
            let lngNum: number | undefined = undefined;
            
            if (location.lat !== undefined && location.lat !== null) {
              const parsed = typeof location.lat === 'string' ? parseFloat(location.lat) : location.lat;
              if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
                latNum = parsed;
              }
            }
            
            if (location.lng !== undefined && location.lng !== null) {
              const parsed = typeof location.lng === 'string' ? parseFloat(location.lng) : location.lng;
              if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
                lngNum = parsed;
              }
            }
            
            // Convert date strings to Date objects if provided
            let startDate: Date | undefined = undefined;
            let endDate: Date | undefined = undefined;
            
            if (location.dropOffStartDate) {
              startDate = new Date(location.dropOffStartDate);
            }
            if (location.dropOffEndDate) {
              endDate = new Date(location.dropOffEndDate);
            }
            
            return dropOffLocationDao.create({
              campId: camp.id!,
              name: location.name,
              address: location.address,
              lat: latNum,
              lng: lngNum,
              contactNumber: location.contactNumber,
              notes: location.notes,
              dropOffStartDate: startDate,
              dropOffEndDate: endDate,
              dropOffStartTime: location.dropOffStartTime,
              dropOffEndTime: location.dropOffEndTime,
            });
          })
        );
      }

      // Link help requests
      if (createCampDto.helpRequestIds && createCampDto.helpRequestIds.length > 0) {
        await Promise.all(
          createCampDto.helpRequestIds.map(helpRequestId =>
            CampHelpRequestModel.create({
              [CampHelpRequestModel.CAMP_ID]: camp.id!,
              [CampHelpRequestModel.HELP_REQUEST_ID]: helpRequestId,
            })
          )
        );
      }

      // Link donations
      if (createCampDto.donationIds && createCampDto.donationIds.length > 0) {
        await Promise.all(
          createCampDto.donationIds.map(donationId =>
            CampDonationModel.create({
              [CampDonationModel.CAMP_ID]: camp.id!,
              [CampDonationModel.DONATION_ID]: donationId,
            })
          )
        );
      }

      return {
        success: true,
        data: new CampResponseDto(camp),
        message: 'Camp created successfully',
      };
    } catch (error) {
      console.error('Error in CampService.createCamp:', error);
      return {
        success: false,
        error: 'Failed to create camp',
      };
    }
  }

  /**
   * Update an existing camp
   * @param id - Camp ID
   * @param updateCampDto - Update data
   * @param userId - ID of the user making the update
   * @param userRole - Role of the user making the update
   */
  public async updateCamp(
    id: number,
    updateCampDto: UpdateCampDto,
    userId: number,
    userRole: UserRole
  ): Promise<IApiResponse<CampResponseDto>> {
    const transaction = await sequelize.transaction();
    try {
      // Get the existing camp
      const existingCamp = await this.campDao.findById(id);
      if (!existingCamp) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Camp not found',
        };
      }

      // Authorization check: Only admins or the owning volunteer club can update
      const isAdmin = userRole === UserRole.SYSTEM_ADMINISTRATOR || userRole === UserRole.ADMIN;
      
      if (!isAdmin) {
        // Check if user is the owner of the camp's volunteer club
        const volunteerClubDao = VolunteerClubDao.getInstance();
        const volunteerClub = await volunteerClubDao.findByUserId(userId);
        
        if (!volunteerClub || volunteerClub.id !== existingCamp.volunteerClubId) {
          await transaction.rollback();
          return {
            success: false,
            error: 'Access denied. You can only update camps owned by your volunteer club.',
          };
        }
      }

      // Validate coordinates if provided
      if (updateCampDto.lat !== undefined && (updateCampDto.lat < -90 || updateCampDto.lat > 90)) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Invalid latitude',
        };
      }
      if (updateCampDto.lng !== undefined && (updateCampDto.lng < -180 || updateCampDto.lng > 180)) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Invalid longitude',
        };
      }

      // Prepare update data
      const updateData: Partial<ICamp> = {};
      if (updateCampDto.lat !== undefined) updateData.lat = updateCampDto.lat;
      if (updateCampDto.lng !== undefined) updateData.lng = updateCampDto.lng;
      if (updateCampDto.campType !== undefined) updateData.campType = updateCampDto.campType;
      if (updateCampDto.name !== undefined) updateData.name = updateCampDto.name.trim();
      if (updateCampDto.peopleRange !== undefined) updateData.peopleRange = updateCampDto.peopleRange;
      if (updateCampDto.peopleCount !== undefined) updateData.peopleCount = updateCampDto.peopleCount;
      if (updateCampDto.needs !== undefined) updateData.needs = updateCampDto.needs;
      if (updateCampDto.shortNote !== undefined) updateData.shortNote = updateCampDto.shortNote.trim();
      if (updateCampDto.description !== undefined) updateData.description = updateCampDto.description?.trim();
      if (updateCampDto.location !== undefined) updateData.location = updateCampDto.location?.trim();
      if (updateCampDto.contactType !== undefined) updateData.contactType = updateCampDto.contactType;
      if (updateCampDto.contact !== undefined) updateData.contact = updateCampDto.contact?.trim();
      if (updateCampDto.status !== undefined) updateData.status = updateCampDto.status;

      // Update the camp
      const updatedCamp = await this.campDao.update(id, updateData);
      if (!updatedCamp) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Failed to update camp',
        };
      }

      // Handle items update (replace all items if provided)
      if (updateCampDto.items !== undefined) {
        const campItemDao = CampItemDao.getInstance();
        // Delete existing items
        await CampItemModel.destroy({
          where: { campId: id },
          transaction,
        });
        // Create new items
        if (updateCampDto.items.length > 0) {
          await Promise.all(
            updateCampDto.items.map(item =>
              campItemDao.create(updatedCamp.id!, item.itemType!, item.quantity!, item.notes)
            )
          );
        }
      }

      // Handle drop-off locations update (replace all if provided)
      if (updateCampDto.dropOffLocations !== undefined) {
        const dropOffLocationDao = CampDropOffLocationDao.getInstance();
        // Delete existing drop-off locations
        await CampDropOffLocationModel.destroy({
          where: { campId: id },
          transaction,
        });
        // Create new drop-off locations
        if (updateCampDto.dropOffLocations.length > 0) {
          await Promise.all(
            updateCampDto.dropOffLocations.map(location => {
              // Convert string lat/lng to numbers if provided
              let latNum: number | undefined = undefined;
              let lngNum: number | undefined = undefined;
              
              if (location.lat !== undefined && location.lat !== null) {
                const parsed = typeof location.lat === 'string' ? parseFloat(location.lat) : location.lat;
                if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
                  latNum = parsed;
                }
              }
              
              if (location.lng !== undefined && location.lng !== null) {
                const parsed = typeof location.lng === 'string' ? parseFloat(location.lng) : location.lng;
                if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
                  lngNum = parsed;
                }
              }
              
              // Convert date strings to Date objects if provided
              let startDate: Date | undefined = undefined;
              let endDate: Date | undefined = undefined;
              
              if (location.dropOffStartDate) {
                startDate = new Date(location.dropOffStartDate);
              }
              if (location.dropOffEndDate) {
                endDate = new Date(location.dropOffEndDate);
              }
              
              return dropOffLocationDao.create({
                campId: updatedCamp.id!,
                name: location.name!,
                address: location.address,
                lat: latNum,
                lng: lngNum,
                contactNumber: location.contactNumber,
                notes: location.notes,
                dropOffStartDate: startDate,
                dropOffEndDate: endDate,
                dropOffStartTime: location.dropOffStartTime,
                dropOffEndTime: location.dropOffEndTime,
              }, transaction);
            })
          );
        }
      }

      // Handle help requests update (replace all if provided)
      if (updateCampDto.helpRequestIds !== undefined) {
        // Delete existing links
        await CampHelpRequestModel.destroy({
          where: { campId: id },
          transaction,
        });
        // Create new links
        if (updateCampDto.helpRequestIds.length > 0) {
          await Promise.all(
            updateCampDto.helpRequestIds.map(helpRequestId =>
              CampHelpRequestModel.create({
                [CampHelpRequestModel.CAMP_ID]: updatedCamp.id!,
                [CampHelpRequestModel.HELP_REQUEST_ID]: helpRequestId,
              }, { transaction })
            )
          );
        }
      }

      // Handle donations update (replace all if provided)
      if (updateCampDto.donationIds !== undefined) {
        // Delete existing links
        await CampDonationModel.destroy({
          where: { campId: id },
          transaction,
        });
        // Create new links
        if (updateCampDto.donationIds.length > 0) {
          await Promise.all(
            updateCampDto.donationIds.map(donationId =>
              CampDonationModel.create({
                [CampDonationModel.CAMP_ID]: updatedCamp.id!,
                [CampDonationModel.DONATION_ID]: donationId,
              }, { transaction })
            )
          );
        }
      }

      await transaction.commit();

      // Fetch updated camp with all relations
      const finalCamp = await this.campDao.findById(updatedCamp.id!);
      return {
        success: true,
        data: new CampResponseDto(finalCamp!),
        message: 'Camp updated successfully',
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`Error in CampService.updateCamp (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update camp',
      };
    }
  }

  /**
   * Get all drop-off locations for active camps
   */
  public async getAllDropOffLocationsForActiveCamps(): Promise<IApiResponse<Array<ICampDropOffLocation & { campName?: string; campId?: number }>>> {
    try {
      const dropOffLocationDao = CampDropOffLocationDao.getInstance();
      const locations = await dropOffLocationDao.findAllForActiveCamps();
      
      const locationsWithCampInfo = locations
        .filter(loc => loc.campId !== undefined) // Filter out locations without valid campId
        .map(loc => {
          const { camp, ...locationData } = loc;
          return {
            ...locationData,
            campName: camp?.name,
            campId: camp?.id,
          } as ICampDropOffLocation & { campName?: string; campId?: number };
        });
      
      return {
        success: true,
        data: locationsWithCampInfo,
        count: locationsWithCampInfo.length,
      };
    } catch (error) {
      console.error('Error in CampService.getAllDropOffLocationsForActiveCamps:', error);
      return {
        success: false,
        error: 'Failed to retrieve drop-off locations',
      };
    }
  }

  /**
   * Get inventory items for a camp
   * @param campId - The camp ID
   */
  public async getCampInventoryItems(campId: number): Promise<IApiResponse<ICampInventoryItem[]>> {
    try {
      const campInventoryItemDao = CampInventoryItemDao.getInstance();
      
      const inventoryItems = await campInventoryItemDao.findByCampId(campId);
      
      return {
        success: true,
        data: inventoryItems,
        message: 'Camp inventory items retrieved successfully',
      };
    } catch (error) {
      console.error(`Error in CampService.getCampInventoryItems (${campId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve camp inventory items',
      };
    }
  }
}

export default CampService;

