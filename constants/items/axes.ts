import { Item, EquipmentSlot, NpcType, SkillType, Vocation, DamageType } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const AXE_LIST: Item[] = [
  // TIER 1
  { id: 'hand_axe', name: 'Hand Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 10, defense: 1, price: 350, sellPrice: 20, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Tier 1 Axe.', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Hand_Axe.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'axe', name: 'Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 18, defense: 2, price: 150, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Machado simples (Tier 2).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Axe.gif`, requiredLevel: 8 },
  
  // TIER 3
  { id: 'orcish_axe', name: 'Orcish Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 28, defense: 3, price: 5000, sellPrice: 2000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Machado orc (Tier 3).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Orcish_Axe.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'fire_axe', name: 'Fire Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 40, defense: 4, price: 40000, sellPrice: 8000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Machado de fogo (Tier 4).', scalingStat: SkillType.AXE, damageType: DamageType.FIRE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Fire_Axe.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'noble_axe', name: 'Noble Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 6, price: 0, sellPrice: 10000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Machado nobre (Tier 5).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Noble_Axe.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'crystalline_axe', name: 'Crystalline Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 72, defense: 8, price: 0, sellPrice: 45000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Machado cristalino (Tier 6).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Crystalline_Axe.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'cobra_axe', name: 'Cobra Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 105, defense: 8, price: 0, sellPrice: 120000, soldTo: [NpcType.RASHID], description: 'Machado da cobra (Tier 7).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${OUT_BASE}Cobra_Axe.gif`, requiredLevel: 300 },
  { id: 'demonwing_axe', name: 'Demonwing Axe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 90, defense: 10, price: 0, sellPrice: 80000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Machado asa de demônio (Tier 7).', scalingStat: SkillType.AXE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Demonwing_Axe.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_battleaxe', name: 'Falcon Battleaxe', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 110, defense: 12, price: 0, sellPrice: 300000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Machado do Falcão (Tier 8).', scalingStat: SkillType.AXE, damageType: DamageType.ENERGY, image: `${IMG_BASE}Falcon_Battleaxe.gif`, requiredLevel: 400 },
];