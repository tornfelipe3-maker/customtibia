
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const HELMETS_LIST: Item[] = [
  // STARTER
  { id: 'leather_helmet', name: 'Leather Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 1, price: 80, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Protetor de couro.', image: `${IMG_BASE}Leather_Helmet.gif`, requiredLevel: 1 },

  // TIER 1 (Lvl 1-8) -> Item Lvl 2
  { id: 'brass_helmet', name: 'Brass Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 1, price: 400, sellPrice: 5, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Capacete de latão (Tier 1).', image: `${IMG_BASE}Brass_Helmet.gif`, requiredLevel: 2 },
  
  // TIER 2 (Lvl 9-20) -> Item Lvl 8
  // Using Steel Helmet sprite as "Plate" replacement (Silver Brass look)
  { id: 'plate_helmet', name: 'Plate Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 2, price: 800, sellPrice: 15, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Capacete de placas (Tier 2).', image: `${IMG_BASE}Steel_Helmet.gif`, requiredLevel: 8 },

  // TIER 3 (Lvl 20-40) -> Item Lvl 20
  { id: 'crown_helmet', name: 'Crown Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 3, price: 0, sellPrice: 2500, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Elmo real (Tier 3).', image: `${IMG_BASE}Crown_Helmet.gif`, requiredLevel: 20 },

  // TIER 4 (Lvl 40-60) -> Item Lvl 40
  { id: 'dragon_helmet', name: 'Dragon Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 4, price: 0, sellPrice: 4000, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], description: 'Capacete de dragão (Tier 4).', image: `${IMG_BASE}Dragon_Helmet.gif`, requiredLevel: 40 },

  // TIER 5 (Lvl 100-200) -> Item Lvl 100
  { id: 'zaoan_helmet', name: 'Zaoan Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 5, price: 0, sellPrice: 45000, soldTo: [NpcType.RASHID], description: 'Elmo de Zao (Tier 5).', image: `${IMG_BASE}Zaoan_Helmet.gif`, requiredLevel: 100 },

  // TIER 6 (Lvl 200-300) -> Item Lvl 200
  { id: 'rift_helmet', name: 'Rift Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 6, price: 0, sellPrice: 60000, soldTo: [NpcType.RASHID], description: 'Elmo da fenda (Tier 6).', image: `${IMG_BASE}Rift_Helmet.gif`, requiredLevel: 200 },

  // TIER 7 (Lvl 300-400) -> Item Lvl 300
  { id: 'prismatic_helmet', name: 'Prismatic Helmet', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 7, price: 0, sellPrice: 80000, soldTo: [NpcType.RASHID], description: 'Elmo prismático (Tier 7).', image: `${IMG_BASE}Prismatic_Helmet.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+) -> Item Lvl 400
  { id: 'falcon_coif', name: 'Falcon Coif', type: 'equipment', slot: EquipmentSlot.HEAD, armor: 9, price: 0, sellPrice: 200000, soldTo: [NpcType.RASHID], description: 'Coifa do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Coif.gif`, requiredLevel: 400 },
];
