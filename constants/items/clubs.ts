
import { Item, EquipmentSlot, NpcType, SkillType, Vocation, DamageType } from '../../types';
import { IMG_BASE } from '../config';

export const CLUB_LIST: Item[] = [
  // TIER 1
  { id: 'club', name: 'Club', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 6, defense: 1, price: 50, sellPrice: 1, soldTo: [NpcType.TRADER], description: 'Tier 1 Club.', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Club.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'bone_club', name: 'Bone Club', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 12, defense: 2, price: 200, sellPrice: 20, soldTo: [NpcType.TRADER], description: 'Clava de osso (Tier 2).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Bone_Club.gif`, requiredLevel: 8 },
  
  // TIER 3
  { id: 'clerical_mace', name: 'Clerical Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 20, defense: 3, price: 5500, sellPrice: 170, soldTo: [NpcType.BLUE_DJINN], description: 'Maça clerical (Tier 3).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Clerical_Mace.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'dragon_hammer', name: 'Dragon Hammer', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 30, defense: 4, price: 15000, sellPrice: 2000, soldTo: [NpcType.GREEN_DJINN], description: 'Martelo de dragão (Tier 4).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Dragon_Hammer.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'shadow_sceptre', name: 'Shadow Sceptre', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 42, defense: 6, price: 0, sellPrice: 15000, soldTo: [NpcType.RASHID], description: 'Cetro das sombras (Tier 5).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Shadow_Sceptre.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'mycological_mace', name: 'Mycological Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 8, price: 0, sellPrice: 60000, soldTo: [NpcType.RASHID], description: 'Maça micológica (Tier 6).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Mycological_Mace.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'umbral_mace', name: 'Umbral Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 70, defense: 10, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], description: 'Maça sombria (Tier 7).', scalingStat: SkillType.CLUB, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Umbral_Mace.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_mace', name: 'Falcon Mace', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 90, defense: 12, price: 0, sellPrice: 300000, soldTo: [NpcType.RASHID], description: 'Maça do Falcão (Tier 8).', scalingStat: SkillType.CLUB, damageType: DamageType.ENERGY, image: `${IMG_BASE}Falcon_Mace.gif`, requiredLevel: 400 },
];
