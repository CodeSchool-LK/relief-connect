import CampDropOffLocationModel from '../models/camp-drop-off-location.model';
import { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation';

class CampDropOffLocationDao {
  private static instance: CampDropOffLocationDao;

  private constructor() {}

  public static getInstance(): CampDropOffLocationDao {
    if (!CampDropOffLocationDao.instance) {
      CampDropOffLocationDao.instance = new CampDropOffLocationDao();
    }
    return CampDropOffLocationDao.instance;
  }

  public async create(data: {
    campId: number;
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
    contactNumber?: string;
    notes?: string;
    dropOffStartDate?: Date;
    dropOffEndDate?: Date;
    dropOffStartTime?: string;
    dropOffEndTime?: string;
  }, transaction?: any): Promise<ICampDropOffLocation> {
    try {
      const location = await CampDropOffLocationModel.create({
        [CampDropOffLocationModel.LOCATION_CAMP_ID]: data.campId,
        [CampDropOffLocationModel.LOCATION_NAME]: data.name,
        [CampDropOffLocationModel.LOCATION_ADDRESS]: data.address,
        [CampDropOffLocationModel.LOCATION_LAT]: data.lat,
        [CampDropOffLocationModel.LOCATION_LNG]: data.lng,
        [CampDropOffLocationModel.LOCATION_CONTACT_NUMBER]: data.contactNumber,
        [CampDropOffLocationModel.LOCATION_NOTES]: data.notes,
        [CampDropOffLocationModel.LOCATION_DROP_OFF_START_DATE]: data.dropOffStartDate,
        [CampDropOffLocationModel.LOCATION_DROP_OFF_END_DATE]: data.dropOffEndDate,
        [CampDropOffLocationModel.LOCATION_DROP_OFF_START_TIME]: data.dropOffStartTime,
        [CampDropOffLocationModel.LOCATION_DROP_OFF_END_TIME]: data.dropOffEndTime,
      }, transaction ? { transaction } : undefined);
      return location.toJSON() as ICampDropOffLocation;
    } catch (error) {
      console.error('Error in CampDropOffLocationDao.create:', error);
      throw error;
    }
  }

  public async findByCampId(campId: number): Promise<ICampDropOffLocation[]> {
    try {
      const locations = await CampDropOffLocationModel.findAll({
        where: {
          [CampDropOffLocationModel.LOCATION_CAMP_ID]: campId,
        },
      });
      return locations.map(loc => loc.toJSON() as ICampDropOffLocation);
    } catch (error) {
      console.error(`Error in CampDropOffLocationDao.findByCampId (${campId}):`, error);
      throw error;
    }
  }

  /**
   * Find all drop-off locations for active camps
   * Includes camp information
   */
  public async findAllForActiveCamps(): Promise<Array<ICampDropOffLocation & { camp?: { id: number; name: string; status: string } }>> {
    try {
      const { CampModel } = require('../models');
      const { CampStatus } = require('@nx-mono-repo-deployment-test/shared/src/enums');
      
      const locations = await CampDropOffLocationModel.findAll({
        include: [{
          model: CampModel,
          as: 'camp',
          where: {
            [CampModel.CAMP_STATUS]: CampStatus.ACTIVE,
          },
          attributes: ['id', 'name', 'status'],
        }],
        order: [[CampDropOffLocationModel.LOCATION_NAME, 'ASC']],
      });
      
      return locations.map(loc => {
        const locationData = loc.toJSON() as ICampDropOffLocation & { camp?: { id: number; name: string; status: string } };
        return locationData;
      });
    } catch (error) {
      console.error('Error in CampDropOffLocationDao.findAllForActiveCamps:', error);
      throw error;
    }
  }
}

export default CampDropOffLocationDao;

