
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const ACCESSORIES_LIST: Item[] = [
  // ==========================================
  // AMULETS (NECK) - 1 POR TIER (ARMOR 1-8)
  // ==========================================
  { id: 'scarf', name: 'Scarf', type: 'equipment', slot: EquipmentSlot.NECK, armor: 1, price: 15, sellPrice: 5, soldTo: [NpcType.TRADER], description: 'Tier 1 Amulet.', image: `${IMG_BASE}Scarf.gif` },
  { id: 'silver_amulet', name: 'Silver Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 2, price: 100, sellPrice: 50, soldTo: [NpcType.TRADER], description: 'Tier 2 Amulet.', image: `${IMG_BASE}Silver_Amulet.gif` },
  { id: 'protection_amulet', name: 'Protection Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 3, price: 300, sellPrice: 150, soldTo: [NpcType.TRADER], description: 'Tier 3 Amulet.', image: `${IMG_BASE}Protection_Amulet.gif` },
  { id: 'platinum_amulet', name: 'Platinum Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 4, price: 0, sellPrice: 2500, soldTo: [NpcType.RASHID], description: 'Tier 4 Amulet.', image: `${IMG_BASE}Platinum_Amulet.gif` },
  { id: 'stone_skin_amulet', name: 'Stone Skin Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 5, price: 5000, sellPrice: 1000, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], description: 'Tier 5 Amulet.', image: `${IMG_BASE}Stone_Skin_Amulet.gif` },
  { id: 'werewolf_amulet', name: 'Werewolf Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 6, price: 0, sellPrice: 15000, soldTo: [NpcType.RASHID], description: 'Tier 6 Amulet.', image: `${IMG_BASE}Werewolf_Amulet.gif` },
  { id: 'cobra_amulet', name: 'Cobra Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 7, price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID], description: 'Tier 7 Amulet.', image: `${IMG_BASE}Cobra_Amulet.gif` },
  { id: 'falcon_amulet', name: 'Falcon Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 8, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], description: 'Tier 8 Amulet.', image: `${IMG_BASE}Falcon_Amulet.gif` },

  // ==========================================
  // RINGS - DEFENSE & UTILITY
  // ==========================================
  { id: 'life_ring', name: 'Life Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 2, price: 900, sellPrice: 100, soldTo: [NpcType.BLUE_DJINN, NpcType.TRADER], description: 'Anel da Vida (Def 2).', image: `${IMG_BASE}Life_Ring.gif` },
  { id: 'time_ring', name: 'Time Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 3, price: 2000, sellPrice: 300, soldTo: [NpcType.BLUE_DJINN], description: 'Anel do Tempo (Def 3).', image: `${IMG_BASE}Time_Ring.gif` },
  { id: 'ring_of_healing', name: 'Ring of Healing', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 4, price: 2000, sellPrice: 500, soldTo: [NpcType.BLUE_DJINN], description: 'Anel de Cura (Def 4).', image: `${IMG_BASE}Ring_of_Healing.gif` },
  { id: 'stealth_ring', name: 'Stealth Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 5, price: 5000, sellPrice: 1000, soldTo: [NpcType.BLUE_DJINN], description: 'Anel Furtivo (Def 5).', image: `${IMG_BASE}Stealth_Ring.gif` },
  { id: 'energy_ring', name: 'Energy Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 6, price: 2000, sellPrice: 1500, soldTo: [NpcType.BLUE_DJINN], description: 'Anel de Energia (Def 6).', image: `${IMG_BASE}Energy_Ring.gif` },
  { id: 'death_ring', name: 'Death Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 8, price: 0, sellPrice: 8000, soldTo: [NpcType.RASHID, NpcType.GREEN_DJINN], description: 'Anel da Morte (Def 8).', image: `${IMG_BASE}Death_Ring.gif` },
  { id: 'might_ring', name: 'Might Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 10, price: 10000, sellPrice: 20000, soldTo: [NpcType.RASHID, NpcType.GREEN_DJINN], description: 'Anel do Poder (Def 10).', image: `${IMG_BASE}Might_Ring.gif` },
];
