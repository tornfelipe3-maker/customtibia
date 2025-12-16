
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const ARMORS_LIST: Item[] = [
  // STARTER
  { id: 'coat', name: 'Coat', type: 'equipment', slot: EquipmentSlot.BODY, armor: 1, price: 80, sellPrice: 1, soldTo: [NpcType.TRADER], description: 'A simple coat.', image: `${IMG_BASE}Coat.gif`, requiredLevel: 1 },

  // TIER 1
  { id: 'brass_armor', name: 'Brass Armor', type: 'equipment', slot: EquipmentSlot.BODY, armor: 3, price: 3500, sellPrice: 30, soldTo: [NpcType.TRADER], description: 'Armadura de latão (Tier 1).', image: `${IMG_BASE}Brass_Armor.gif`, requiredLevel: 2 },
  
  // TIER 2
  { id: 'plate_armor', name: 'Plate Armor', type: 'equipment', slot: EquipmentSlot.BODY, armor: 5, price: 6000, sellPrice: 110, soldTo: [NpcType.TRADER], description: 'Armadura de placas (Tier 2).', image: `${IMG_BASE}Plate_Armor.gif`, requiredLevel: 8 },

  // TIER 3
  { id: 'crown_armor', name: 'Crown Armor', type: 'equipment', slot: EquipmentSlot.BODY, armor: 7, price: 0, sellPrice: 12000, soldTo: [NpcType.BLUE_DJINN], description: 'Armadura real (Tier 3).', image: `${IMG_BASE}Crown_Armor.gif`, requiredLevel: 20 },

  // TIER 4
  { id: 'dsm', name: 'Dragon Scale Mail', type: 'equipment', slot: EquipmentSlot.BODY, armor: 9, price: 0, sellPrice: 40000, soldTo: [NpcType.RASHID], description: 'Cota de escamas de dragão (Tier 4).', image: `${IMG_BASE}Dragon_Scale_Mail.gif`, requiredLevel: 40 },

  // TIER 5
  { id: 'mpa', name: 'Magic Plate Armor', type: 'equipment', slot: EquipmentSlot.BODY, armor: 12, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], description: 'MPA (Tier 5).', image: `${IMG_BASE}Magic_Plate_Armor.gif`, requiredLevel: 100 },

  // TIER 6
  { id: 'ornate_chestplate', name: 'Ornate Chestplate', type: 'equipment', slot: EquipmentSlot.BODY, armor: 15, price: 0, sellPrice: 200000, soldTo: [NpcType.RASHID], description: 'Peitoral ornamentado (Tier 6).', image: `${IMG_BASE}Ornate_Chestplate.gif`, requiredLevel: 200 },

  // TIER 7
  { id: 'prismatic_armor', name: 'Prismatic Armor', type: 'equipment', slot: EquipmentSlot.BODY, armor: 18, price: 0, sellPrice: 300000, soldTo: [NpcType.RASHID], description: 'Armadura prismática (Tier 7).', image: `${IMG_BASE}Prismatic_Armor.gif`, requiredLevel: 300 },

  // TIER 8
  { id: 'falcon_plate', name: 'Falcon Plate', type: 'equipment', slot: EquipmentSlot.BODY, armor: 22, price: 0, sellPrice: 500000, soldTo: [NpcType.RASHID], description: 'Armadura do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Plate.gif`, requiredLevel: 400 },
];
