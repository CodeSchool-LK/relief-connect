/**
 * Barrel export for all Models and Sequelize instance
 * 
 * Models are auto-loaded by sequelize-typescript from config
 * No manual initialization needed!
 */
import { sequelize } from '../config';
import ItemModel from './item.model';
import HelpRequestModel from './help-request.model';
import CampModel from './camp.model';

/**
 * Initialize model associations here
 * Example: ItemModel.hasMany(OtherModel, { foreignKey: ItemModel.ITEM_ID });
 */
export const initializeAssociations = (): void => {
  // Add associations here as you create more models
  // ItemModel.hasMany(OtherModel, { foreignKey: ItemModel.ITEM_ID });
};

// Export individual models (constants are accessible via ItemModel.TABLE_NAME, etc.)
export { default as ItemModel } from './item.model';
export { default as HelpRequestModel } from './help-request.model';
export { default as CampModel } from './camp.model';

// Export sequelize instance
export { sequelize };

// Export all models object
export const models = {
  Item: ItemModel,
  HelpRequest: HelpRequestModel,
  Camp: CampModel,
  // Add more models here
};

export default models;
