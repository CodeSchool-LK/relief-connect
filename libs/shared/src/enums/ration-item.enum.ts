/**
 * Ration Item Type enum
 * Single source of truth for all ration item types
 * Used by both frontend and backend
 */
export enum RationItemType {
  DRY_RATIONS = 'dry_rations',
  READY_MEALS = 'ready_meals',
  MILK_POWDER = 'milk_powder',
  BOTTLED_WATER = 'bottled_water',
  FIRST_AID = 'first_aid',
  MEDICINES = 'medicines',
  MOSQUITO_REPELLENT = 'mosquito_repellent',
  HYGIENE = 'hygiene',
  SANITARY_PADS = 'sanitary_pads',
  BABY_DIAPERS = 'baby_diapers',
  DISINFECTANT = 'disinfectant',
  CLOTHES = 'clothes',
  BLANKETS = 'blankets',
  TOWELS = 'towels',
  TEMPORARY_SHELTERS = 'temporary_shelters',
  POLYTHENE_SHEETS = 'polythene_sheets',
  FLASHLIGHTS = 'flashlights',
}

/**
 * Ration item metadata for seeding and frontend display
 */
export interface IRationItemMetadata {
  code: RationItemType;
  label: string;
  icon: string;
  description?: string;
}

/**
 * Complete list of ration items with metadata
 * Single source of truth for seeding and frontend
 */
export const RATION_ITEMS_METADATA: IRationItemMetadata[] = [
  { code: RationItemType.DRY_RATIONS, label: 'Dry rations (rice, dhal, canned food)', icon: '🍚' },
  { code: RationItemType.READY_MEALS, label: 'Ready‑to‑eat meals', icon: '🍱' },
  { code: RationItemType.MILK_POWDER, label: 'Milk powder / baby food', icon: '🥛' },
  { code: RationItemType.BOTTLED_WATER, label: 'Bottled water', icon: '💧' },
  { code: RationItemType.FIRST_AID, label: 'First aid kit', icon: '🩹' },
  { code: RationItemType.MEDICINES, label: 'Basic medicines (Panadol / ORS)', icon: '💊' },
  { code: RationItemType.MOSQUITO_REPELLENT, label: 'Mosquito repellent', icon: '🦟' },
  { code: RationItemType.HYGIENE, label: 'Soap / toothpaste / toothbrush', icon: '🧴' },
  { code: RationItemType.SANITARY_PADS, label: 'Sanitary pads', icon: '🩹' },
  { code: RationItemType.BABY_DIAPERS, label: 'Baby diapers', icon: '👶' },
  { code: RationItemType.DISINFECTANT, label: 'Disinfectant / cleaning liquid', icon: '🧽' },
  { code: RationItemType.CLOTHES, label: 'Clothes', icon: '👕' },
  { code: RationItemType.BLANKETS, label: 'Blankets', icon: '🛏️' },
  { code: RationItemType.TOWELS, label: 'Towels', icon: '🧺' },
  { code: RationItemType.TEMPORARY_SHELTERS, label: 'Temporary shelters', icon: '⛺' },
  { code: RationItemType.POLYTHENE_SHEETS, label: 'Polythene sheets', icon: '📦' },
  { code: RationItemType.FLASHLIGHTS, label: 'Flashlights', icon: '🔦' },
];

