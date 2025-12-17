
import { Item, EquipmentSlot, NpcType, SkillType } from '../../types';
import { IMG_BASE } from '../config';

export const LEGS_LIST: Item[] = [
  // STARTER
  { id: 'leather_legs', name: 'Leather Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 1, price: 80, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Calças de couro.', image: `${IMG_BASE}Leather_Legs.gif`, requiredLevel: 1 },

  // TIER 1
  { id: 'brass_legs', name: 'Brass Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 2, price: 1500, sellPrice: 15, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Brass Legs (Tier 1).', image: `${IMG_BASE}Brass_Legs.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'plate_legs', name: 'Plate Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 3, price: 4000, sellPrice: 40, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Calças de placas (Tier 2).', image: `${IMG_BASE}Plate_Legs.gif`, requiredLevel: 8 },
  
  // TIER 3
  { id: 'crown_legs', name: 'Crown Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 4, price: 0, sellPrice: 12000, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Calças reais (Tier 3).', image: `${IMG_BASE}Crown_Legs.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'dragon_legs', name: 'Dragon Scale Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 6, price: 0, sellPrice: 15000, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], description: 'Calças de escama de dragão (Tier 4).', image: `${IMG_BASE}Dragon_Scale_Legs.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'zaoan_legs', name: 'Zaoan Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 8, price: 0, sellPrice: 14000, soldTo: [NpcType.RASHID], description: 'Calças de Zao (Tier 5).', image: `${IMG_BASE}Zaoan_Legs.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'rift_legs', name: 'Rift Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 10, price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID], description: 'Calças da fenda (Tier 6).', image: `${IMG_BASE}Rift_Legs.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'prismatic_legs', name: 'Prismatic Legs', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 12, price: 0, sellPrice: 80000, soldTo: [NpcType.RASHID], description: 'Calças prismáticas (Tier 7).', skillBonus: { [SkillType.DISTANCE]: 1 }, image: `${IMG_BASE}Prismatic_Legs.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_greaves', name: 'Falcon Greaves', type: 'equipment', slot: EquipmentSlot.LEGS, armor: 15, price: 0, sellPrice: 300000, soldTo: [NpcType.RASHID], description: 'Grevas do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Greaves.gif`, requiredLevel: 400 },
];
