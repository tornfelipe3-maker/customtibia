
import { Item, EquipmentSlot, NpcType, SkillType, Vocation, DamageType } from '../../types';
import { IMG_BASE } from '../config';

export const AXE_LIST: Item[] = [
  // TIER 1
  { id: 'hand_axe', name: 'Hand Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 6, defense: 1, price: 350, sellPrice: 4, soldTo: [NpcType.TRADER], description: 'Tier 1 Axe.', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Hand_Axe.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'axe', name: 'Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 12, defense: 2, price: 150, sellPrice: 7, soldTo: [NpcType.TRADER], description: 'Machado simples (Tier 2).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Axe.gif`, requiredLevel: 8 },
  
  // TIER 3
  { id: 'orcish_axe', name: 'Orcish Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 20, defense: 3, price: 5000, sellPrice: 350, soldTo: [NpcType.GREEN_DJINN], description: 'Machado orc (Tier 3).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Orcish_Axe.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'fire_axe', name: 'Fire Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 30, defense: 4, price: 40000, sellPrice: 2800, soldTo: [NpcType.BLUE_DJINN], description: 'Machado de fogo (Tier 4).', scalingStat: SkillType.AXE, damageType: DamageType.FIRE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Fire_Axe.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'noble_axe', name: 'Noble Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 42, defense: 6, price: 0, sellPrice: 10000, soldTo: [NpcType.RASHID], description: 'Machado nobre (Tier 5).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Noble_Axe.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'crystalline_axe', name: 'Crystalline Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 8, price: 0, sellPrice: 60000, soldTo: [NpcType.RASHID], description: 'Machado cristalino (Tier 6).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Crystalline_Axe.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'demonwing_axe', name: 'Demonwing Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 70, defense: 10, price: 0, sellPrice: 120000, soldTo: [NpcType.RASHID], description: 'Machado asa de demônio (Tier 7).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Demonwing_Axe.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_battleaxe', name: 'Falcon Battleaxe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 90, defense: 12, price: 0, sellPrice: 300000, soldTo: [NpcType.RASHID], description: 'Machado do Falcão (Tier 8).', scalingStat: SkillType.AXE, damageType: DamageType.ENERGY, image: `${IMG_BASE}Falcon_Battleaxe.gif`, requiredLevel: 400 },
];
