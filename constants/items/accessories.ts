
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const ACCESSORIES_LIST: Item[] = [
  // Amulets (Neck)
  { id: 'scarf', name: 'Scarf', type: 'equipment', slot: EquipmentSlot.NECK, armor: 1, price: 15, sellPrice: 1, soldTo: [NpcType.TRADER], description: 'Protects from cold.', image: `${IMG_BASE}Scarf.gif` },
  { id: 'silver_amulet', name: 'Silver Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 0, defense: 2, price: 50, sellPrice: 20, soldTo: [NpcType.TRADER], description: 'Silver protection (Tier 2).', image: `${IMG_BASE}Silver_Amulet.gif` },
  { id: 'protection_amulet', name: 'Protection Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 2, price: 100, sellPrice: 40, soldTo: [NpcType.TRADER], description: 'Basic protection (Tier 3).', image: `${IMG_BASE}Protection_Amulet.gif` },
  { id: 'elven_amulet', name: 'Elven Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 2, price: 500, sellPrice: 100, soldTo: [NpcType.BLUE_DJINN], description: 'Elven magic.', image: `${IMG_BASE}Elven_Amulet.gif` },
  { id: 'strange_talisman', name: 'Strange Talisman', type: 'equipment', slot: EquipmentSlot.NECK, armor: 0, defense: 5, price: 100, sellPrice: 30, soldTo: [NpcType.TRADER], description: 'Unknown power.', image: `${IMG_BASE}Strange_Talisman.gif` },
  
  { id: 'platinum_amulet', name: 'Platinum Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 2, price: 0, sellPrice: 2500, soldTo: [NpcType.RASHID], description: 'Amuleto de platina (Tier 4).', image: `${IMG_BASE}Platinum_Amulet.gif` },
  { id: 'stone_skin_amulet', name: 'Stone Skin Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 5, price: 5000, sellPrice: 500, soldTo: [NpcType.GREEN_DJINN], description: '5 cargas (Tier 5).', image: `${IMG_BASE}Stone_Skin_Amulet.gif` },
  { id: 'dragon_necklace', name: 'Dragon Necklace', type: 'equipment', slot: EquipmentSlot.NECK, armor: 2, price: 0, sellPrice: 100, soldTo: [NpcType.GREEN_DJINN], description: 'Necklace of a Dragon.', image: `${IMG_BASE}Dragon_Necklace.gif` },
  { id: 'werewolf_amulet', name: 'Werewolf Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 3, price: 0, sellPrice: 25000, soldTo: [NpcType.RASHID], description: 'Amuleto de lobisomem (Tier 6).', image: `${IMG_BASE}Werewolf_Amulet.gif` },
  { id: 'cobra_amulet', name: 'Cobra Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 3, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], description: 'Cobra Amulet (Tier 7).', image: `${IMG_BASE}Cobra_Amulet.gif` },
  { id: 'falcon_amulet', name: 'Falcon Amulet', type: 'equipment', slot: EquipmentSlot.NECK, armor: 4, price: 0, sellPrice: 200000, soldTo: [NpcType.RASHID], description: 'Amuleto do Falcão (Tier 8).', image: `${IMG_BASE}Falcon_Circlet.gif` },

  // Rings
  { id: 'life_ring', name: 'Life Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 2, price: 900, sellPrice: 50, soldTo: [NpcType.BLUE_DJINN], description: 'Anel da Vida (Tier 2).', image: `${IMG_BASE}Life_Ring.gif` },
  { id: 'time_ring', name: 'Time Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 3, price: 2000, sellPrice: 100, soldTo: [NpcType.BLUE_DJINN], description: 'Anel do Tempo (Tier 3).', image: `${IMG_BASE}Time_Ring.gif` },
  { id: 'ring_of_healing', name: 'Ring of Healing', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 4, price: 2000, sellPrice: 100, soldTo: [NpcType.BLUE_DJINN], description: 'Anel de Cura (Tier 4).', image: `${IMG_BASE}Ring_of_Healing.gif` },
  
  { id: 'stealth_ring', name: 'Stealth Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 5, price: 2000, sellPrice: 200, soldTo: [NpcType.BLUE_DJINN], description: 'Anel Furtivo (Tier 5).', image: `${IMG_BASE}Stealth_Ring.gif` },
  { id: 'energy_ring', name: 'Energy Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 6, price: 2000, sellPrice: 100, soldTo: [NpcType.BLUE_DJINN], description: 'Anel de Energia.', image: `${IMG_BASE}Energy_Ring.gif` },
  
  { id: 'death_ring', name: 'Death Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 8, price: 0, sellPrice: 1000, soldTo: [NpcType.RASHID], description: 'Anel da Morte (Tier 6).', image: `${IMG_BASE}Death_Ring.gif` },
  { id: 'might_ring', name: 'Might Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 0, defense: 10, price: 5000, sellPrice: 250, soldTo: [NpcType.GREEN_DJINN], description: 'Anel do Poder (Tier 7).', image: `${IMG_BASE}Might_Ring.gif` },
  { id: 'prismatic_ring', name: 'Prismatic Ring', type: 'equipment', slot: EquipmentSlot.RING, armor: 2, defense: 12, price: 0, sellPrice: 15000, soldTo: [NpcType.RASHID], description: 'Anel Prismático (Tier 8).', image: `${IMG_BASE}Prismatic_Ring.gif` },
];
