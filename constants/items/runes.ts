
import { Item, EquipmentSlot, NpcType, DamageType } from '../../types';
import { IMG_BASE } from '../config';

export const RUNE_LIST: Item[] = [
  { id: 'gfb_rune', name: 'Great Fireball', type: 'equipment', slot: EquipmentSlot.AMMO, isRune: true, runeType: 'area', attack: 0, price: 180, sellPrice: 45, soldTo: [NpcType.TRADER], description: 'Explosão de fogo em área. (Lvl 30, ML 4)', reqMagicLevel: 4, requiredLevel: 30, damageType: DamageType.FIRE, image: `${IMG_BASE}Great_Fireball.gif` },
  { id: 'sd_rune', name: 'Sudden Death', type: 'equipment', slot: EquipmentSlot.AMMO, isRune: true, runeType: 'single', attack: 0, price: 350, sellPrice: 100, soldTo: [NpcType.TRADER], description: 'Dano de morte massivo. (Lvl 45, ML 15)', reqMagicLevel: 15, requiredLevel: 45, damageType: DamageType.DEATH, image: `${IMG_BASE}Sudden_Death.gif` },
  { id: 'avalanche_rune', name: 'Avalanche', type: 'equipment', slot: EquipmentSlot.AMMO, isRune: true, runeType: 'area', attack: 0, price: 180, sellPrice: 45, soldTo: [NpcType.TRADER], description: 'Dano de gelo em área. (Lvl 30, ML 4)', reqMagicLevel: 4, requiredLevel: 30, damageType: DamageType.ICE, image: `${IMG_BASE}Avalanche.gif` },
];
