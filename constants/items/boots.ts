
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const BOOTS_LIST: Item[] = [
  // STARTER / TIER 1
  { id: 'leather_boots', name: 'Leather Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 1, price: 80, sellPrice: 2, soldTo: [NpcType.TRADER], description: 'Botas de couro (Tier 1).', image: `${IMG_BASE}Leather_Boots.gif`, requiredLevel: 1 },
  
  // TIER 2 (Lvl 9-20) -> Item Lvl 8
  { id: 'steel_boots', name: 'Steel Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 2, price: 0, sellPrice: 30000, soldTo: [NpcType.RASHID], description: 'Botas de aço (Tier 2).', image: `${IMG_BASE}Steel_Boots.gif`, requiredLevel: 8 },

  // TIER 3 (Lvl 20-40) -> Item Lvl 20
  { id: 'boh', name: 'Boots of Haste', type: 'equipment', slot: EquipmentSlot.FEET, armor: 2, price: 0, sellPrice: 30000, soldTo: [NpcType.BLUE_DJINN], description: 'Botas da velocidade (Tier 3).', image: `${IMG_BASE}Boots_of_Haste.gif`, requiredLevel: 20 },

  // TIER 4 (Lvl 40-60) -> Item Lvl 40
  { id: 'knight_boots', name: 'Knight Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 3, price: 0, sellPrice: 2500, soldTo: [NpcType.GREEN_DJINN], description: 'Botas de cavaleiro (Tier 4).', image: `${IMG_BASE}Knight_Boots.gif`, requiredLevel: 40 },

  // TIER 5 (Lvl 100-200) -> Item Lvl 100
  { id: 'guardian_boots', name: 'Guardian Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 4, price: 0, sellPrice: 35000, soldTo: [NpcType.RASHID], description: 'Botas guardiãs (Tier 5).', image: `${IMG_BASE}Guardian_Boots.gif`, requiredLevel: 100 },

  // TIER 6 (Lvl 200-300) -> Item Lvl 200
  { id: 'depth_calcei', name: 'Depth Calcei', type: 'equipment', slot: EquipmentSlot.FEET, armor: 5, price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID], description: 'Botas das profundezas (Tier 6).', image: `${IMG_BASE}Depth_Calcei.gif`, requiredLevel: 200 },

  // TIER 7 (Lvl 300-400) -> Item Lvl 300
  { id: 'prismatic_boots', name: 'Prismatic Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 6, price: 0, sellPrice: 70000, soldTo: [NpcType.RASHID], description: 'Botas prismáticas (Tier 7).', image: `${IMG_BASE}Prismatic_Boots.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+) -> Item Lvl 400
  { id: 'falcon_boots', name: 'Falcon Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 7, price: 0, sellPrice: 150000, soldTo: [NpcType.RASHID], description: 'Botas do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Greaves.gif`, requiredLevel: 400 }, // Using greaves icon as placeholder
];
