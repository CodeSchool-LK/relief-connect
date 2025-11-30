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
}

export default CampDropOffLocationDao;

