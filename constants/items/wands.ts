
import { Item, EquipmentSlot, NpcType, SkillType, Vocation, DamageType } from '../../types';
import { IMG_BASE } from '../config';

export const WANDS_LIST: Item[] = [
  // WANDS
  { id: 'wooden_wand', name: 'Wooden Wand', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 8, defense: 0, price: 300, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Varinha de treino.', scalingStat: SkillType.MAGIC, damageType: DamageType.ENERGY, requiredVocation: [Vocation.SORCERER], manaCost: 0, image: `${IMG_BASE}Wand_of_Vortex.gif`, requiredLevel: 1 }, 
  
  // TIER 1 (Lvl 1-8)
  { id: 'wand_vortex', name: 'Wand of Vortex', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 12, defense: 0, price: 2500, sellPrice: 500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.TRADER], description: 'Energia básica (Tier 1).', scalingStat: SkillType.MAGIC, damageType: DamageType.ENERGY, requiredVocation: [Vocation.SORCERER], manaCost: 2, image: `${IMG_BASE}Wand_of_Vortex.gif`, requiredLevel: 8 },
  
  // TIER 2 (Lvl 9-20)
  { id: 'wand_dragonbreath', name: 'Wand of Dragonbreath', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 20, defense: 0, price: 6500, sellPrice: 1000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.TRADER], description: 'Fogo (Tier 2).', scalingStat: SkillType.MAGIC, damageType: DamageType.FIRE, requiredVocation: [Vocation.SORCERER], manaCost: 3, image: `${IMG_BASE}Wand_of_Dragonbreath.gif`, requiredLevel: 13 },
  
  // TIER 3 (Lvl 20-40)
  { id: 'wand_draconia', name: 'Wand of Draconia', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 32, defense: 0, price: 35000, sellPrice: 2500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Fogo (Tier 3).', scalingStat: SkillType.MAGIC, damageType: DamageType.FIRE, requiredVocation: [Vocation.SORCERER], manaCost: 8, image: `${IMG_BASE}Wand_of_Draconia.gif`, requiredLevel: 22 },

  // TIER 4 (Lvl 40-60)
  { id: 'wand_inferno', name: 'Wand of Inferno', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 48, defense: 0, price: 80000, sellPrice: 5000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Fogo puro (Tier 4).', scalingStat: SkillType.MAGIC, damageType: DamageType.FIRE, requiredVocation: [Vocation.SORCERER], manaCost: 13, image: `${IMG_BASE}Wand_of_Inferno.gif`, requiredLevel: 40 },

  // TIER 5 (Lvl 100-200)
  { id: 'wand_starstorm', name: 'Wand of Starstorm', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 65, defense: 0, price: 100000, sellPrice: 15000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Energia pura (Tier 5).', scalingStat: SkillType.MAGIC, damageType: DamageType.ENERGY, requiredVocation: [Vocation.SORCERER], manaCost: 18, image: `${IMG_BASE}Wand_of_Starstorm.gif`, requiredLevel: 100 },

  // TIER 6 (Lvl 200-300)
  { id: 'wand_defiance', name: 'Wand of Defiance', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 85, defense: 0, price: 0, sellPrice: 30000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Esferas de Luz (Tier 6).', scalingStat: SkillType.MAGIC, damageType: DamageType.ENERGY, requiredVocation: [Vocation.SORCERER], manaCost: 20, image: `${IMG_BASE}Wand_of_Defiance.gif`, requiredLevel: 200 },

  // TIER 7 (Lvl 300-400)
  { id: 'cobra_wand', name: 'Cobra Wand', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 110, defense: 0, price: 0, sellPrice: 60000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Veneno da Cobra (Tier 7).', scalingStat: SkillType.MAGIC, damageType: DamageType.FIRE, requiredVocation: [Vocation.SORCERER], manaCost: 30, image: `${IMG_BASE}Cobra_Wand.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+)
  { id: 'falcon_wand', name: 'Falcon Wand', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 140, defense: 0, price: 0, sellPrice: 150000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Relíquia do Falcão (Tier 8).', scalingStat: SkillType.MAGIC, damageType: DamageType.ENERGY, requiredVocation: [Vocation.SORCERER], manaCost: 32, image: `${IMG_BASE}Falcon_Wand.gif`, requiredLevel: 400 },

  // RODS
  { id: 'wooden_rod', name: 'Wooden Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 8, defense: 0, price: 300, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Rod de treino.', scalingStat: SkillType.MAGIC, damageType: DamageType.EARTH, requiredVocation: [Vocation.DRUID], manaCost: 0, image: `${IMG_BASE}Snakebite_Rod.gif`, requiredLevel: 1 }, 

  // TIER 1 (Lvl 1-8)
  { id: 'snake_bite', name: 'Snakebite Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 12, defense: 0, price: 2500, sellPrice: 500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.TRADER], description: 'Veneno básico (Tier 1).', scalingStat: SkillType.MAGIC, damageType: DamageType.EARTH, requiredVocation: [Vocation.DRUID], manaCost: 2, image: `${IMG_BASE}Snakebite_Rod.gif`, requiredLevel: 8 },
  
  // TIER 2 (Lvl 9-20)
  { id: 'moonlight_rod', name: 'Moonlight Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 20, defense: 0, price: 6500, sellPrice: 1000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.TRADER], description: 'Gelo (Tier 2).', scalingStat: SkillType.MAGIC, damageType: DamageType.ICE, requiredVocation: [Vocation.DRUID], manaCost: 3, image: `${IMG_BASE}Moonlight_Rod.gif`, requiredLevel: 13 },
  
  // TIER 3 (Lvl 20-40)
  { id: 'northwind_rod', name: 'Northwind Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 32, defense: 0, price: 35000, sellPrice: 2500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Gelo (Tier 3).', scalingStat: SkillType.MAGIC, damageType: DamageType.ICE, requiredVocation: [Vocation.DRUID], manaCost: 8, image: `${IMG_BASE}Northwind_Rod.gif`, requiredLevel: 22 },

  // TIER 4 (Lvl 40-60)
  { id: 'hailstorm_rod', name: 'Hailstorm Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 48, defense: 0, price: 80000, sellPrice: 5000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Tempestade de gelo (Tier 4).', scalingStat: SkillType.MAGIC, damageType: DamageType.ICE, requiredVocation: [Vocation.DRUID], manaCost: 13, image: `${IMG_BASE}Hailstorm_Rod.gif`, requiredLevel: 40 },

  // TIER 5 (Lvl 100-200)
  { id: 'underworld_rod', name: 'Underworld Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 65, defense: 0, price: 120000, sellPrice: 15000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Morte súbita (Tier 5).', scalingStat: SkillType.MAGIC, damageType: DamageType.DEATH, requiredVocation: [Vocation.DRUID], manaCost: 18, image: `${IMG_BASE}Underworld_Rod.gif`, requiredLevel: 100 },

  // TIER 6 (Lvl 200-300)
  { id: 'glacial_rod', name: 'Glacial Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 85, defense: 0, price: 0, sellPrice: 30000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Frio glacial (Tier 6).', scalingStat: SkillType.MAGIC, damageType: DamageType.ICE, requiredVocation: [Vocation.DRUID], manaCost: 20, image: `${IMG_BASE}Glacial_Rod.gif`, requiredLevel: 200 },

  // TIER 7 (Lvl 300-400)
  { id: 'cobra_rod', name: 'Cobra Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 110, defense: 0, price: 0, sellPrice: 60000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Veneno da Cobra (Tier 7).', scalingStat: SkillType.MAGIC, damageType: DamageType.DEATH, requiredVocation: [Vocation.DRUID], manaCost: 30, image: `${IMG_BASE}Cobra_Rod.gif`, requiredLevel: 300 },

  // TIER 8 (Lvl 400+)
  { id: 'falcon_rod', name: 'Falcon Rod', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 140, defense: 0, price: 0, sellPrice: 150000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Relíquia do Falcão (Tier 8).', scalingStat: SkillType.MAGIC, damageType: DamageType.EARTH, requiredVocation: [Vocation.DRUID], manaCost: 32, image: `${IMG_BASE}Falcon_Rod.gif`, requiredLevel: 400 },
];
