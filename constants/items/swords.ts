
import { Item, EquipmentSlot, NpcType, SkillType, Vocation, DamageType } from '../../types';
import { IMG_BASE } from '../config';

export const SWORD_LIST: Item[] = [
  // TIER 1
  { id: 'dagger', name: 'Dagger', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 10, defense: 1, price: 80, sellPrice: 20, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Tier 1 Sword.', scalingStat: SkillType.SWORD, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Dagger.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'short_sword', name: 'Short Sword', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 18, defense: 2, price: 200, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.GREEN_DJINN, NpcType.BLUE_DJINN], description: 'Espada curta (Tier 2).', scalingStat: SkillType.SWORD, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Short_Sword.gif`, requiredLevel: 8 },
  
  // TIER 3
  { id: 'crimson_sword', name: 'Crimson Sword', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 28, defense: 3, price: 0, sellPrice: 2500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Espada escarlate (Tier 3).', scalingStat: SkillType.SWORD, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Crimson_Sword.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'fire_sword', name: 'Fire Sword', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 40, defense: 4, price: 25000, sellPrice: 7500, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Lâmina flamejante (Tier 4).', scalingStat: SkillType.SWORD, damageType: DamageType.FIRE, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Fire_Sword.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'relic_sword', name: 'Relic Sword', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 55, defense: 6, price: 0, sellPrice: 25000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Espada antiga (Tier 5).', scalingStat: SkillType.SWORD, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Relic_Sword.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'shiny_blade', name: 'Shiny Blade', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 72, defense: 8, price: 0, sellPrice: 60000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Lâmina brilhante (Tier 6).', scalingStat: SkillType.SWORD, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Shiny_Blade.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'tagralt_blade', name: 'Tagralt Blade', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 90, defense: 10, price: 0, sellPrice: 100000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Lâmina de Tagralt (Tier 7).', scalingStat: SkillType.SWORD, damageType: DamageType.EARTH, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Tagralt_Blade.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_longsword', name: 'Falcon Longsword', type: 'equipment', slot: EquipmentSlot.HAND_RIGHT, attack: 110, defense: 12, price: 0, sellPrice: 300000, soldTo: [NpcType.GREEN_DJINN, NpcType.BLUE_DJINN, NpcType.RASHID], description: 'Espada do Falcão (Tier 8).', scalingStat: SkillType.SWORD, requiredVocation: [Vocation.KNIGHT], damageType: DamageType.EARTH, image: `${IMG_BASE}Falcon_Longsword.gif`, requiredLevel: 400 },
];
