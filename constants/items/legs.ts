
import { Item, EquipmentSlot, NpcType, SkillType } from '../../types';
import { IMG_BASE } from '../config';

export const LEGS_LIST: Item[] = [
  // STARTER
  { id: 'leather_legs', name: 'Leather Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 1, price: 80, sellPrice: 2, soldTo: [NpcType.TRADER], description: 'Calças de couro.', image: `${IMG_BASE}Leather_Legs.gif`, requiredLevel: 1 },

  // TIER 1 (Lvl 1-8) -> Item Lvl 2
  { id: 'brass_legs', name: 'Brass Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 2, price: 1500, sellPrice: 15, soldTo: [NpcType.TRADER], description: 'Brass Legs (Tier 1).', image: `${IMG_BASE}Brass_Legs.gif`, requiredLevel: 2 },
  
  // TIER 2 (Lvl 9-20) -> Item Lvl 8
  { id: 'plate_legs', name: 'Plate Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 3, price: 4000, sellPrice: 40, soldTo: [NpcType.TRADER], description: 'Calças de placas (Tier 2).', image: `${IMG_BASE}Plate_Legs.gif`, requiredLevel: 8 },
  
  // TIER 3 (Lvl 20-40) -> Item Lvl 20
  { id: 'crown_legs', name: 'Crown Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 4, price: 0, sellPrice: 12000, soldTo: [NpcType.BLUE_DJINN], description: 'Calças reais (Tier 3).', image: `${IMG_BASE}Crown_Legs.gif`, requiredLevel: 20 },

  // TIER 4 (Lvl 40-60) -> Item Lvl 40
  { id: 'dragon_legs', name: 'Dragon Scale Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 6, price: 0, sellPrice: 15000, soldTo: [NpcType.GREEN_DJINN], description: 'Calças de escama de dragão (Tier 4).', image: `${IMG_BASE}Dragon_Scale_Legs.gif`, requiredLevel: 40 },

  // TIER 5 (Lvl 100-200) -> Item Lvl 100
  { id: 'zaoan_legs', name: 'Zaoan Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 8, price: 0, sellPrice: 14000, soldTo: [NpcType.RASHID], description: 'Calças de Zao (Tier 5).', image: `${IMG_BASE}Zaoan_Legs.gif`, requiredLevel: 100 },

  // TIER 6 (Lvl 200-300) -> Item Lvl 200
  { id: 'rift_legs', name: 'Rift Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 10, price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID], description: 'Calças da fenda (Tier 6).', image: `${IMG_BASE}Rift_Legs.gif`, requiredLevel: 200 },

  // TIER 7 (Lvl 300-400) -> Item Lvl 300
  { id: 'prismatic_legs', name: 'Prismatic Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 12, price: 0, sellPrice: 80000, soldTo: [NpcType.RASHID], description: 'Calças prismáticas (Tier 7).', skillBonus: { [SkillType.DISTANCE]: 1 }, image: `${IMG_BASE}Prismatic_Legs.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+) -> Item Lvl 400
  { id: 'falcon_greaves', name: 'Falcon Greaves', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 15, price: 0, sellPrice: 300000, soldTo: [NpcType.RASHID], description: 'Grevas do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Greaves.gif`, requiredLevel: 400 },
];
