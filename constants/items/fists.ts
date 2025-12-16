
import { Item, EquipmentSlot, NpcType, SkillType, Vocation } from '../../types';
import { IMG_BASE } from '../config';

export const FIST_LIST: Item[] = [
  // Low Level / Starter
  { id: 'leather_gloves', name: 'Leather Gloves', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 5, defense: 1, price: 10, sellPrice: 2, soldTo: [NpcType.TRADER], description: 'Luvas simples de couro.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Leather_Gloves.gif` },
  { id: 'studded_gloves', name: 'Studded Gloves', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 8, defense: 1, price: 30, sellPrice: 5, soldTo: [NpcType.TRADER], description: 'Luvas com cravos.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Studded_Gloves.gif` },
  { id: 'bone_knuckles', name: 'Bone Knuckles', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 12, defense: 1, price: 80, sellPrice: 15, soldTo: [NpcType.TRADER], description: 'Feito de ossos.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Bone_Shield.gif` }, // Using bone shield icon as placeholder or generic bone icon

  // Existing
  { id: 'brass_knuckles', name: 'Brass Knuckles', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 15, defense: 2, price: 200, sellPrice: 50, soldTo: [NpcType.TRADER], description: 'Soco inglês.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Brass_Knuckles.gif` },
  { id: 'simple_claws', name: 'Simple Claws', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 10, defense: 1, price: 50, sellPrice: 10, soldTo: [NpcType.TRADER], description: 'Garras básicas.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Wolf_Paw.gif` },
  { id: 'iron_knuckles', name: 'Iron Knuckles', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 22, defense: 2, price: 500, sellPrice: 300, soldTo: [NpcType.TRADER], description: 'Feito de ferro.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Iron_Ore.gif` },
  { id: 'cestus', name: 'Cestus', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 28, defense: 3, price: 1200, sellPrice: 500, soldTo: [NpcType.GREEN_DJINN], description: 'Luvas de combate reforçadas.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Cestus.gif` },
  { id: 'ogre_fists', name: 'Ogre Knuckles', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 30, defense: 3, price: 0, sellPrice: 300, soldTo: [NpcType.YASIR], description: 'Heavy ogre fists.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Ogre_Knuckles.gif` },
  { id: 'bear_claws_wep', name: 'Bear Claws', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 35, defense: 3, price: 0, sellPrice: 2000, soldTo: [NpcType.YASIR], description: 'Garras de urso afiadas.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Bear_Paw.gif` },
  { id: 'silencer_fists', name: 'Silencer Claws', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 40, defense: 4, price: 0, sellPrice: 490, soldTo: [NpcType.YASIR], description: 'Deadly silencer claws.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Silencer_Claws.gif` },
  { id: 'behemoth_fists', name: 'Behemoth Fists', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 45, defense: 4, price: 0, sellPrice: 10000, soldTo: [NpcType.RASHID], description: 'Punhos pesados.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Behemoth_Fang.gif` },
  { id: 'dragon_claws', name: 'Dragon Claws', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 5, price: 0, sellPrice: 30000, soldTo: [NpcType.RASHID], description: 'Lendárias garras de dragão.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Dragon_Claw.gif` },
  { id: 'fist_knuckles', name: 'Knuckles', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 20, defense: 2, price: 0, sellPrice: 200, soldTo: [NpcType.TRADER], description: 'Soco inglês de ferro.', scalingStat: SkillType.FIST, requiredVocation: [Vocation.MONK], image: `${IMG_BASE}Knuckles.gif` },
];
