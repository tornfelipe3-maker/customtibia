
import { Item, EquipmentSlot, NpcType, SkillType, Vocation } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const DISTANCE_LIST: Item[] = [
  // TIER 1 (Lvl 1-8) -> Item Lvl 2
  { id: 'small_stone', name: 'Small Stone', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 15, defense: 0, price: 40, sellPrice: 5, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Pedra de arremesso.', scalingStat: SkillType.DISTANCE, requiredVocation: [Vocation.PALADIN], image: `${IMG_BASE}Small_Stone.gif`, requiredLevel: 2 },
  
  // TIER 2 (Lvl 9-20) -> Item Lvl 8
  { id: 'spear', name: 'Spear', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 25, defense: 0, price: 80, sellPrice: 10, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Arma de arremesso.', scalingStat: SkillType.DISTANCE, requiredVocation: [Vocation.PALADIN], image: `${IMG_BASE}Spear.gif`, requiredLevel: 8 },
  { id: 'bow', name: 'Bow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 5, defense: 0, price: 400, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Arco simples.', scalingStat: SkillType.DISTANCE, weaponType: 'bow', requiredVocation: [Vocation.PALADIN], image: `${IMG_BASE}Bow.gif`, requiredLevel: 8 },
  { id: 'crossbow', name: 'Crossbow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 8, defense: 0, price: 500, sellPrice: 160, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Besta simples (Tier 2).', scalingStat: SkillType.DISTANCE, weaponType: 'crossbow', requiredVocation: [Vocation.PALADIN], image: `${IMG_BASE}Crossbow.gif`, requiredLevel: 8 },
  
  // TIER 3 (Lvl 20-40) -> Item Lvl 20
  { id: 'elvish_bow', name: 'Elvish Bow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 12, defense: 0, price: 2000, sellPrice: 2000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Arco preciso.', scalingStat: SkillType.DISTANCE, weaponType: 'bow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 1 }, image: `${IMG_BASE}Elvish_Bow.gif`, requiredLevel: 20 },

  // TIER 4 (Lvl 40-60) -> Item Lvl 40
  { id: 'arbalest', name: 'Arbalest', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 18, defense: 0, price: 0, sellPrice: 10000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Besta pesada.', scalingStat: SkillType.DISTANCE, weaponType: 'crossbow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 2 }, image: `${IMG_BASE}Arbalest.gif`, requiredLevel: 40 },
  { id: 'royal_spear', name: 'Royal Spear', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 42, defense: 0, price: 150, sellPrice: 15, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Lança real.', scalingStat: SkillType.DISTANCE, requiredVocation: [Vocation.PALADIN], requiredLevel: 40, image: `${IMG_BASE}Royal_Spear.gif` },

  // TIER 5 (Lvl 100-200) -> Item Lvl 100
  { id: 'composite_hornbow', name: 'Composite Hornbow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 25, defense: 0, price: 0, sellPrice: 25000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Arco composto.', scalingStat: SkillType.DISTANCE, weaponType: 'bow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 3 }, requiredLevel: 100, image: `${IMG_BASE}Composite_Hornbow.gif` },
  { id: 'umbral_bow', name: 'Umbral Bow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 35, defense: 0, price: 0, sellPrice: 45000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Arco sombrio (Tier 5).', scalingStat: SkillType.DISTANCE, weaponType: 'bow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 4 }, requiredLevel: 100, image: `${IMG_BASE}Umbral_Bow.gif` },

  // TIER 6 (Lvl 200-300) -> Item Lvl 200
  { id: 'rift_crossbow', name: 'Rift Crossbow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 45, defense: 0, price: 0, sellPrice: 50000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Besta da fenda.', scalingStat: SkillType.DISTANCE, weaponType: 'crossbow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 5 }, requiredLevel: 200, image: `${IMG_BASE}Rift_Crossbow.gif` },
  { id: 'rift_bow', name: 'Rift Bow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 42, defense: 0, price: 0, sellPrice: 60000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Arco da fenda (Tier 6).', scalingStat: SkillType.DISTANCE, weaponType: 'bow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 5 }, requiredLevel: 200, image: `${IMG_BASE}Rift_Bow.gif` },

  // TIER 7
  { id: 'cobra_crossbow', name: 'Cobra Crossbow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 0, price: 0, sellPrice: 150000, soldTo: [NpcType.RASHID], description: 'Besta da cobra (Tier 7).', scalingStat: SkillType.DISTANCE, weaponType: 'crossbow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 7 }, image: `${OUT_BASE}Cobra_Crossbow.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+) -> Item Lvl 400
  { id: 'falcon_bow', name: 'Falcon Bow', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 65, defense: 0, price: 0, sellPrice: 300000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Arco do Falcão (Tier 8).', scalingStat: SkillType.DISTANCE, weaponType: 'bow', requiredVocation: [Vocation.PALADIN], skillBonus: { [SkillType.DISTANCE]: 10 }, requiredLevel: 400, image: `${IMG_BASE}Falcon_Bow.gif` },
];
