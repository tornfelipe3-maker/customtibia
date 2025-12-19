
import { Item, NpcType, Vocation } from '../../types';
import { IMG_BASE } from '../config';

export const POTION_LIST: Item[] = [
  // Low Tier - Cheap
  { id: 'health_potion', name: 'Health Potion', type: 'potion', potionType: 'health', restoreAmount: 150, price: 45, sellPrice: 5, soldTo: [NpcType.TRADER], description: 'Restores ~150 HP.', image: `${IMG_BASE}Health_Potion.gif` },
  { id: 'mana_potion', name: 'Mana Potion', type: 'potion', potionType: 'mana', restoreAmount: 100, price: 50, sellPrice: 5, soldTo: [NpcType.TRADER], description: 'Restores ~100 MP.', image: `${IMG_BASE}Mana_Potion.gif` },
  
  // Mid Tier - More expensive
  { id: 'strong_health_potion', name: 'Strong Health Potion', type: 'potion', potionType: 'health', restoreAmount: 300, price: 100, sellPrice: 10, soldTo: [NpcType.TRADER], description: 'Restores ~300 HP. (Lvl 50)', requiredLevel: 50, image: `${IMG_BASE}Strong_Health_Potion.gif` },
  // REGRAS ALTERADAS: Liberado para todas as vocações (incluindo Knights)
  { id: 'strong_mana_potion', name: 'Strong Mana Potion', type: 'potion', potionType: 'mana', restoreAmount: 200, price: 80, sellPrice: 8, soldTo: [NpcType.TRADER], description: 'Restores ~200 MP. (Lvl 50)', requiredLevel: 50, image: `${IMG_BASE}Strong_Mana_Potion.gif` },

  { id: 'great_health_potion', name: 'Great Health Potion', type: 'potion', potionType: 'health', restoreAmount: 500, price: 190, sellPrice: 20, soldTo: [NpcType.TRADER], description: 'Restores ~500 HP. (Lvl 80, Knight)', requiredLevel: 80, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Great_Health_Potion.gif` },
  { id: 'great_mana_potion', name: 'Great Mana Potion', type: 'potion', potionType: 'mana', restoreAmount: 300, price: 120, sellPrice: 15, soldTo: [NpcType.TRADER], description: 'Restores ~300 MP. (Lvl 80, Mage)', requiredLevel: 80, requiredVocation: [Vocation.SORCERER, Vocation.DRUID], image: `${IMG_BASE}Great_Mana_Potion.gif` },
  { id: 'great_spirit_potion', name: 'Great Spirit Potion', type: 'potion', potionType: 'spirit', restoreAmount: 350, restoreAmountSecondary: 150, price: 190, sellPrice: 20, soldTo: [NpcType.TRADER], description: 'Restores ~350 HP & ~150 MP. (Lvl 80, Paladin)', requiredLevel: 80, requiredVocation: [Vocation.PALADIN], image: `${IMG_BASE}Great_Spirit_Potion.gif` },

  // High Tier - Expensive (The Waste Makers)
  { id: 'ultimate_health_potion', name: 'Ultimate Health Potion', type: 'potion', potionType: 'health', restoreAmount: 750, price: 310, sellPrice: 30, soldTo: [NpcType.TRADER], description: 'Restores ~750 HP. (Lvl 130, Knight)', requiredLevel: 130, requiredVocation: [Vocation.KNIGHT], image: `${IMG_BASE}Ultimate_Health_Potion.gif` },
  { id: 'ultimate_mana_potion', name: 'Ultimate Mana Potion', type: 'potion', potionType: 'mana', restoreAmount: 500, price: 350, sellPrice: 35, soldTo: [NpcType.TRADER], description: 'Restores ~500 MP. (Lvl 130, Mage)', requiredLevel: 130, requiredVocation: [Vocation.SORCERER, Vocation.DRUID], image: `${IMG_BASE}Ultimate_Mana_Potion.gif` },
  { id: 'ultimate_spirit_potion', name: 'Ultimate Spirit Potion', type: 'potion', potionType: 'spirit', restoreAmount: 420, restoreAmountSecondary: 250, price: 350, sellPrice: 35, soldTo: [NpcType.TRADER], description: 'Restores ~420 HP & ~250 MP. (Lvl 130, Paladin)', requiredLevel: 130, requiredVocation: [Vocation.PALADIN], image: `${IMG_BASE}Ultimate_Spirit_Potion.gif` },
];
