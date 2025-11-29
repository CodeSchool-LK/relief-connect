/**
 * Barrel export for all Models and Sequelize instance
 * 
 * Models are auto-loaded by sequelize-typescript from config
 * No manual initialization needed!
 */
import { sequelize } from '../config';
import ItemModel from './item.model';
import HelpRequestModel from './help-request.model';
import HelpRequestInventoryItemModel from './help-request-inventory-item.model';
import CampModel from './camp.model';
import UserModel from './user.model';
import RefreshTokenModel from './refresh-token.model';
import DonationModel from './donation.model';

/**
 * Initialize model associations here
 * Example: ItemModel.hasMany(OtherModel, { foreignKey: ItemModel.ITEM_ID });
 * 
 * Note: @BelongsTo decorators in models automatically create belongsTo associations,
 * so we only need to set up the inverse hasMany/hasOne relationships here.
 */
export const initializeAssociations = (): void => {
  // User-RefreshToken association
  // The @BelongsTo decorator in RefreshTokenModel already creates the belongsTo side,
  // so we only need to set up the hasMany side here
  UserModel.hasMany(RefreshTokenModel, { 
    foreignKey: RefreshTokenModel.REFRESH_TOKEN_USER_ID, 
    as: 'refreshTokens' 
  });

  // User-HelpRequest association
  // The @BelongsTo decorator in HelpRequestModel already creates the belongsTo side,
  // so we only need to set up the hasMany side here
  UserModel.hasMany(HelpRequestModel, { 
    foreignKey: HelpRequestModel.HELP_REQUEST_USER_ID, 
    as: 'helpRequests' 
  });

  // User-Donation association (donator)
  // The @BelongsTo decorator in DonationModel already creates the belongsTo side,
  // so we only need to set up the hasMany side here
  UserModel.hasMany(DonationModel, { 
    foreignKey: DonationModel.DONATION_DONATOR_ID, 
    as: 'donations' 
  });

  // HelpRequest-Donation association
  // The @BelongsTo decorator in DonationModel already creates the belongsTo side,
  // so we only need to set up the hasMany side here
  HelpRequestModel.hasMany(DonationModel, { 
    foreignKey: DonationModel.DONATION_HELP_REQUEST_ID, 
    as: 'donations' 
  });

  // HelpRequest-InventoryItem association
  // The @BelongsTo decorator in HelpRequestInventoryItemModel already creates the belongsTo side,
  // so we only need to set up the hasMany side here
  HelpRequestModel.hasMany(HelpRequestInventoryItemModel, { 
    foreignKey: HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID, 
    as: 'inventoryItems' 
  });
};

// Export individual models (constants are accessible via ItemModel.TABLE_NAME, etc.)
export { default as ItemModel } from './item.model';
export { default as HelpRequestModel } from './help-request.model';
export { default as HelpRequestInventoryItemModel } from './help-request-inventory-item.model';
export { default as CampModel } from './camp.model';
export { default as UserModel } from './user.model';
export { default as RefreshTokenModel } from './refresh-token.model';
export { default as DonationModel } from './donation.model';

// Export sequelize instance
export { sequelize };

// Export all models object
export const models = {
  Item: ItemModel,
  HelpRequest: HelpRequestModel,
  HelpRequestInventoryItem: HelpRequestInventoryItemModel,
  Camp: CampModel,
  User: UserModel,
  RefreshToken: RefreshTokenModel,
  Donation: DonationModel,
  // Add more models here
};

export default models;
