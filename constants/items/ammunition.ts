
import { Item, EquipmentSlot, NpcType } from '../../types';
import { IMG_BASE } from '../config';

export const AMMUNITION_LIST: Item[] = [
  // TIER 1 - Arrow (RP ATK 6)
  { id: 'arrow', name: 'Arrow', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 6, price: 3, sellPrice: 1, soldTo: [NpcType.TRADER], description: 'Munição básica para Arcos.', ammoType: 'arrow', image: `${IMG_BASE}Arrow.gif`, requiredLevel: 2 },
  
  // TIER 2 - Bolt (RP ATK 11)
  { id: 'bolt', name: 'Bolt', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 11, price: 4, sellPrice: 1, soldTo: [NpcType.TRADER], description: 'Munição para Bestas (Tier 2).', ammoType: 'bolt', image: `${IMG_BASE}Bolt.gif`, requiredLevel: 8 },
  
  // TIER 3 - Sniper Arrow (RP ATK 19)
  { id: 'sniper_arrow', name: 'Sniper Arrow', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 19, price: 10, sellPrice: 3, soldTo: [NpcType.TRADER], description: 'Flecha precisa (Tier 3).', ammoType: 'arrow', image: `${IMG_BASE}Sniper_Arrow.gif`, requiredLevel: 20 },

  // TIER 4 - Onyx Arrow (RP ATK 28)
  { id: 'onyx_arrow', name: 'Onyx Arrow', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 28, price: 20, sellPrice: 5, soldTo: [NpcType.TRADER], description: 'Flecha de ônix (Tier 4).', ammoType: 'arrow', image: `${IMG_BASE}Onyx_Arrow.gif`, requiredLevel: 40 },

  // TIER 5 - Power Bolt (RP ATK 40)
  { id: 'power_bolt', name: 'Power Bolt', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 40, price: 35, sellPrice: 10, soldTo: [NpcType.TRADER], description: 'Poderoso (Tier 5).', ammoType: 'bolt', image: `${IMG_BASE}Power_Bolt.gif`, requiredLevel: 70 },

  // TIER 6 - Prismatic Bolt (RP ATK 52)
  { id: 'prismatic_bolt', name: 'Prismatic Bolt', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 52, price: 50, sellPrice: 15, soldTo: [NpcType.BLUE_DJINN], description: 'Besta prismática (Tier 6).', ammoType: 'bolt', requiredLevel: 90, image: `${IMG_BASE}Prismatic_Bolt.gif` },

  // TIER 7 - Spectral Bolt (RP ATK 66)
  { id: 'spectral_bolt', name: 'Spectral Bolt', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 66, price: 0, sellPrice: 20, soldTo: [NpcType.RASHID], description: 'Munição fantasma (Tier 7).', ammoType: 'bolt', requiredLevel: 150, image: `${IMG_BASE}Spectral_Bolt.gif` },

  // TIER 8 - Diamond Arrow (RP ATK 85)
  { id: 'diamond_arrow', name: 'Diamond Arrow', type: 'equipment', slot: EquipmentSlot.AMMO, attack: 85, price: 100, sellPrice: 30, soldTo: [NpcType.RASHID], description: 'Flecha de área (Tier 8).', ammoType: 'arrow', requiredLevel: 300, image: `${IMG_BASE}Diamond_Arrow.gif` },
];
