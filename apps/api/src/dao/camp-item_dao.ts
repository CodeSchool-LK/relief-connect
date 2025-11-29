import CampItemModel from '../models/camp-item.model';
import { ICampItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampItem';

class CampItemDao {
  private static instance: CampItemDao;

  private constructor() {}

  public static getInstance(): CampItemDao {
    if (!CampItemDao.instance) {
      CampItemDao.instance = new CampItemDao();
    }
    return CampItemDao.instance;
  }

  public async create(campId: number, itemType: string, quantity: number, notes?: string): Promise<ICampItem> {
    try {
      const item = await CampItemModel.create({
        [CampItemModel.ITEM_CAMP_ID]: campId,
        [CampItemModel.ITEM_ITEM_TYPE]: itemType,
        [CampItemModel.ITEM_QUANTITY]: quantity,
        [CampItemModel.ITEM_NOTES]: notes,
      });
      return item.toJSON() as ICampItem;
    } catch (error) {
      console.error('Error in CampItemDao.create:', error);
      throw error;
    }
  }

  public async findByCampId(campId: number): Promise<ICampItem[]> {
    try {
      const items = await CampItemModel.findAll({
        where: {
          [CampItemModel.ITEM_CAMP_ID]: campId,
        },
      });
      return items.map(item => item.toJSON() as ICampItem);
    } catch (error) {
      console.error(`Error in CampItemDao.findByCampId (${campId}):`, error);
      throw error;
    }
  }
}

export default CampItemDao;

