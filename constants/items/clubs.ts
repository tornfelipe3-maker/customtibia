
import { Item, EquipmentSlot, NpcType, SkillType, Vocation, DamageType } from '../../types';
import { IMG_BASE } from '../config';

export const CLUB_LIST: Item[] = [
  // TIER 1
  { id: 'club', name: 'Club', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 10, defense: 1, price: 50, sellPrice: 10, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Tier 1 Club.', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Club.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'bone_club', name: 'Bone Club', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 18, defense: 2, price: 200, sellPrice: 80, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Clava de osso (Tier 2).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Bone_Club.gif`, requiredLevel: 8 },
  
  // TIER 3
  { id: 'clerical_mace', name: 'Clerical Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 28, defense: 3, price: 5500, sellPrice: 1500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Maça clerical (Tier 3).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Clerical_Mace.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'dragon_hammer', name: 'Dragon Hammer', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 40, defense: 4, price: 15000, sellPrice: 4000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Martelo de dragão (Tier 4).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Dragon_Hammer.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'shadow_sceptre', name: 'Shadow Sceptre', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 6, price: 0, sellPrice: 15000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Cetro das sombras (Tier 5).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Shadow_Sceptre.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'mycological_mace', name: 'Mycological Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 72, defense: 8, price: 0, sellPrice: 60000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Maça micológica (Tier 6).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Mycological_Mace.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'umbral_mace', name: 'Umbral Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 90, defense: 10, price: 0, sellPrice: 100000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Maça sombria (Tier 7).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Umbral_Mace.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_mace', name: 'Falcon Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 110, defense: 12, price: 0, sellPrice: 300000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Maça do Falcão (Tier 8).', scalingStat: SkillType.CLUB, damageType: DamageType.ENERGY, image: `${IMG_BASE}Falcon_Mace.gif`, requiredLevel: 400 },
];
