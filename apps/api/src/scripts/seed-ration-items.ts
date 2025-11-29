import 'reflect-metadata';
import { RATION_ITEMS_METADATA } from '@nx-mono-repo-deployment-test/shared/src/enums/ration-item.enum';
import ItemDao from '../dao/item_dao';

/**
 * Seed ration items into the database
 * This script ensures all ration items from the enum are present in the database
 * Should be run on application startup
 */
export async function seedRationItems(): Promise<void> {
  try {
    console.log('🌱 Seeding ration items...');
    const itemDao = ItemDao.getInstance();

    let seededCount = 0;
    let updatedCount = 0;

    for (const itemMetadata of RATION_ITEMS_METADATA) {
      try {
        const existingItem = await itemDao.findByCode(itemMetadata.code);
        
        if (existingItem) {
          // Update existing item if name or description changed
          if (existingItem.name !== itemMetadata.label || existingItem.description !== itemMetadata.icon) {
            await itemDao.upsertByCode(
              itemMetadata.code,
              itemMetadata.label,
              itemMetadata.icon
            );
            updatedCount++;
            console.log(`  ↻ Updated: ${itemMetadata.code}`);
          }
        } else {
          // Create new item
          await itemDao.upsertByCode(
            itemMetadata.code,
            itemMetadata.label,
            itemMetadata.icon
          );
          seededCount++;
          console.log(`  ✓ Seeded: ${itemMetadata.code}`);
        }
      } catch (error) {
        console.error(`  ✗ Error seeding item ${itemMetadata.code}:`, error);
        // Continue with other items even if one fails
      }
    }

    console.log(`✓ Ration items seeding completed: ${seededCount} new, ${updatedCount} updated`);
  } catch (error) {
    console.error('✗ Error seeding ration items:', error);
    throw error;
  }
}

