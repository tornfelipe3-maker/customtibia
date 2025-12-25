
// Re-export standard configs
export * from './config';
export * from './monsters';
export * from './bosses';
export * from './quests';
export * from './spells';

// Import Item Lists
import { PRODUCTS_LIST } from './items/products';
import { ARMORS_LIST } from './items/armors';
import { LEGS_LIST } from './items/legs';
import { HELMETS_LIST } from './items/helmets';
import { BOOTS_LIST } from './items/boots';
import { SHIELDS_LIST } from './items/shields';
import { ACCESSORIES_LIST } from './items/accessories';
import { SWORD_LIST } from './items/swords';
import { AXE_LIST } from './items/axes';
import { CLUB_LIST } from './items/clubs';
import { DISTANCE_LIST } from './items/distance';
import { AMMUNITION_LIST } from './items/ammunition';
import { WANDS_LIST } from './items/wands';
import { SPELLBOOK_LIST } from './items/spellbooks';
import { POTION_LIST } from './items/potions';
import { RUNE_LIST } from './items/runes';
import { SOULWAR_SET, SANGUINE_SET } from './items/soul_sanguine';

// Add exports for the sets used in hooks/useGameActions.ts
export { SOULWAR_SET, SANGUINE_SET };

// Aggregate Shop Items
export const SHOP_ITEMS = [
    ...PRODUCTS_LIST,
    ...ARMORS_LIST,
    ...LEGS_LIST,
    ...HELMETS_LIST,
    ...BOOTS_LIST,
    ...SHIELDS_LIST,
    ...ACCESSORIES_LIST,
    ...SWORD_LIST,
    ...AXE_LIST,
    ...CLUB_LIST,
    ...DISTANCE_LIST,
    ...AMMUNITION_LIST,
    ...WANDS_LIST,
    ...SPELLBOOK_LIST,
    ...POTION_LIST,
    ...RUNE_LIST,
    ...SOULWAR_SET,
    ...SANGUINE_SET
];