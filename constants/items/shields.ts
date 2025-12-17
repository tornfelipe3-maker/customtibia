
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const SHIELDS_LIST: Item[] = [
  // STARTER
  { id: 'wooden_shield', name: 'Wooden Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 10, price: 150, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Escudo de madeira básico.', image: `${IMG_BASE}Wooden_Shield.gif`, requiredLevel: 1 },

  // TIER 1 (Lvl 1-8)
  { id: 'brass_shield', name: 'Brass Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 15, price: 400, sellPrice: 10, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Escudo de latão (Tier 1).', image: `${IMG_BASE}Brass_Shield.gif`, requiredLevel: 2 },

  // TIER 2 (Lvl 9-20)
  { id: 'plate_shield', name: 'Plate Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 20, price: 800, sellPrice: 25, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'Escudo de placas (Tier 2).', image: `${IMG_BASE}Plate_Shield.gif`, requiredLevel: 8 },

  // TIER 3 (Lvl 20-40)
  { id: 'crown_shield', name: 'Crown Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 25, price: 0, sellPrice: 8000, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Escudo real (Tier 3).', image: `${IMG_BASE}Crown_Shield.gif`, requiredLevel: 20 },

  // TIER 4 (Lvl 40-60)
  { id: 'dragon_shield', name: 'Dragon Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 30, price: 5000, sellPrice: 4000, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], description: 'Escudo de dragão (Tier 4).', image: `${IMG_BASE}Dragon_Shield.gif`, requiredLevel: 40 },

  // TIER 5 (Lvl 100-200)
  { id: 'guardian_shield', name: 'Guardian Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 35, price: 3000, sellPrice: 1500, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Escudo guardião (Tier 5).', image: `${IMG_BASE}Guardian_Shield.gif`, requiredLevel: 100 },

  // TIER 6 (Lvl 200-300)
  { id: 'mastermind_shield', name: 'Mastermind Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 40, price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID], description: 'MMS (Tier 6).', image: `${IMG_BASE}Mastermind_Shield.gif`, requiredLevel: 200 },

  // TIER 7 (Lvl 300-400)
  { id: 'great_shield', name: 'Great Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 45, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], description: 'Escudo lendário (Tier 7).', image: `${IMG_BASE}Great_Shield.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+)
  { id: 'falcon_shield', name: 'Falcon Shield', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 50, price: 0, sellPrice: 200000, soldTo: [NpcType.RASHID], description: 'Escudo do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Shield.gif`, requiredLevel: 400 },
];
