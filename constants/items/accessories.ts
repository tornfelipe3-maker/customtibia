
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const ACCESSORIES_LIST: Item[] = [
  // ==========================================
  // AMULETS (NECK) - PROGRESSION T1 to T8
  // ==========================================
  { 
    id: 'scarf', name: 'Scarf', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 1, price: 15, sellPrice: 5, soldTo: [NpcType.TRADER, NpcType.RASHID], 
    description: 'Tier 1: Protetor básico contra o frio.', image: `${IMG_BASE}Scarf.gif` 
  },
  { 
    id: 'silver_amulet', name: 'Silver Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 2, price: 100, sellPrice: 50, soldTo: [NpcType.TRADER, NpcType.RASHID], 
    description: 'Tier 2: Amuleto de prata polida.', image: `${IMG_BASE}Silver_Amulet.gif` 
  },
  { 
    id: 'protection_amulet', name: 'Protection Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 3, price: 700, sellPrice: 250, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], 
    description: 'Tier 3: Oferece uma proteção mágica constante.', image: `${IMG_BASE}Protection_Amulet.gif` 
  },
  { 
    id: 'platinum_amulet', name: 'Platinum Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 4, price: 5000, sellPrice: 2500, soldTo: [NpcType.RASHID], 
    description: 'Tier 4: Amuleto de platina pura, muito resistente.', image: `${IMG_BASE}Platinum_Amulet.gif` 
  },
  { 
    id: 'stone_skin_amulet', name: 'Stone Skin Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 5, price: 0, sellPrice: 5000, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], 
    description: 'Tier 5: Fortalece a pele como rocha.', image: `${IMG_BASE}Stone_Skin_Amulet.gif` 
  },
  { 
    id: 'werewolf_amulet', name: 'Werewolf Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 6, price: 0, sellPrice: 15000, soldTo: [NpcType.RASHID], 
    description: 'Tier 6: Amuleto imbuído com a fúria lupina.', image: `${IMG_BASE}Werewolf_Amulet.gif` 
  },
  { 
    id: 'cobra_amulet', name: 'Cobra Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 7, price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID], 
    description: 'Tier 7: Amuleto das areias de Hyaena.', image: `${OUT_BASE}The_Cobra_Amulet.gif` 
  },
  { 
    id: 'falcon_amulet', name: 'Falcon Amulet', type: 'equipment', slot: EquipmentSlot.NECK, 
    armor: 8, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], 
    description: 'Tier 8: A relíquia suprema da ordem do Falcão.', image: `${OUT_BASE}Demonbone_Amulet.gif` 
  },

  // ==========================================
  // RINGS (RING SLOT)
  // ==========================================
  { 
    id: 'life_ring', name: 'Life Ring', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 2, price: 900, sellPrice: 450, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], 
    description: 'Anel que pulsa com energia vital.', image: `${IMG_BASE}Life_Ring.gif` 
  },
  { 
    id: 'time_ring', name: 'Time Ring', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 3, price: 2000, sellPrice: 1000, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], 
    description: 'Permite que você se mova entre as dobras do tempo.', image: `${IMG_BASE}Time_Ring.gif` 
  },
  { 
    id: 'ring_of_healing', name: 'Ring of Healing', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 4, price: 2000, sellPrice: 1000, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], 
    description: 'Acelera drasticamente sua recuperação.', image: `${IMG_BASE}Ring_of_Healing.gif` 
  },
  { 
    id: 'stealth_ring', name: 'Stealth Ring', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 5, price: 5000, sellPrice: 2500, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], 
    description: 'Torna sua presença quase imperceptível.', image: `${IMG_BASE}Stealth_Ring.gif` 
  },
  { 
    id: 'energy_ring', name: 'Energy Ring', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 6, price: 2000, sellPrice: 1000, soldTo: [NpcType.BLUE_DJINN, NpcType.RASHID], 
    description: 'Converte ameaças em energia pura.', image: `${IMG_BASE}Energy_Ring.gif` 
  },
  { 
    id: 'death_ring', name: 'Death Ring', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 8, price: 0, sellPrice: 10000, soldTo: [NpcType.RASHID], 
    description: 'Sinta o frio da morte protegendo sua alma.', image: `${IMG_BASE}Death_Ring.gif` 
  },
  { 
    id: 'might_ring', name: 'Might Ring', type: 'equipment', slot: EquipmentSlot.RING, 
    defense: 10, price: 5000, sellPrice: 2500, soldTo: [NpcType.GREEN_DJINN, NpcType.RASHID], 
    description: 'Anel forjado para os guerreiros mais poderosos.', image: `${IMG_BASE}Might_Ring.gif` 
  },
];
