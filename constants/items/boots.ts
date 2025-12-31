
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const BOOTS_LIST: Item[] = [
  // STARTER / TIER 1
  { id: 'leather_boots', name: 'Leather Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 1, price: 80, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Botas de couro (Tier 1).', image: `${IMG_BASE}Leather_Boots.gif`, requiredLevel: 1 },
  
  // TIER 2
  { id: 'steel_boots', name: 'Steel Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 2, price: 0, sellPrice: 1000, soldTo: [NpcType.RASHID], description: 'Botas de aço (Tier 2).', image: `${IMG_BASE}Steel_Boots.gif`, requiredLevel: 8 },

  // TIER 3
  { id: 'boh', name: 'Boots of Haste', type: 'equipment', slot: EquipmentSlot.FEET, armor: 3, price: 0, sellPrice: 2500, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Botas da velocidade (Tier 3).', image: `${IMG_BASE}Boots_of_Haste.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'knight_boots', name: 'Knight Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 4, price: 0, sellPrice: 10000, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], description: 'Botas de cavaleiro (Tier 4).', image: `${OUT_BASE}Metal_Spats.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'guardian_boots', name: 'Guardian Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 5, price: 0, sellPrice: 3000, soldTo: [NpcType.RASHID], description: 'Botas guardiãs (Tier 5).', image: `${IMG_BASE}Guardian_Boots.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'depth_calcei', name: 'Depth Calcei', type: 'equipment', slot: EquipmentSlot.FEET, armor: 6, price: 0, sellPrice: 60000, soldTo: [NpcType.RASHID], description: 'Botas das profundezas (Tier 6).', image: `${IMG_BASE}Depth_Calcei.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'cobra_boots', name: 'Cobra Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 5, price: 0, sellPrice: 150000, soldTo: [NpcType.RASHID], description: 'Botas das serpentes (Tier 7).', image: `${OUT_BASE}Cobra_Boots.gif`, requiredLevel: 300 },
  { id: 'prismatic_boots', name: 'Prismatic Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 7, price: 0, sellPrice: 120000, soldTo: [NpcType.RASHID], description: 'Botas prismáticas (Tier 7).', image: `${IMG_BASE}Prismatic_Boots.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_boots', name: 'Falcon Boots', type: 'equipment', slot: EquipmentSlot.FEET, armor: 8, price: 0, sellPrice: 300000, soldTo: [NpcType.RASHID], description: 'Botas do Falcão (Tier 8).', image: `${OUT_BASE}Boots_of_Enlightenment.gif`, requiredLevel: 400 },
];
