
import { Item, EquipmentSlot, NpcType, SkillType } from '../../types';
import { IMG_BASE } from '../config';

export const SPELLBOOK_LIST: Item[] = [
  { id: 'spellbook', name: 'Spellbook', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 14, price: 150, sellPrice: 70, soldTo: [NpcType.TRADER], description: 'Livro de feitiços.', image: `${IMG_BASE}Spellbook.gif` },
  { id: 'spellbook_enlightenment', name: 'Spellbook of Enlightenment', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 18, price: 0, sellPrice: 4000, soldTo: [NpcType.BLUE_DJINN], description: 'Iluminado.', skillBonus: { [SkillType.MAGIC]: 1 }, image: `${IMG_BASE}Spellbook_of_Enlightenment.gif` },
  { id: 'spellbook_warding', name: 'Spellbook of Warding', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 20, price: 0, sellPrice: 8000, soldTo: [NpcType.GREEN_DJINN], description: 'Protetor.', skillBonus: { [SkillType.MAGIC]: 1 }, image: `${IMG_BASE}Spellbook_of_Warding.gif` },
  { id: 'spellbook_mind_control', name: 'Spellbook of Mind Control', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 16, price: 0, sellPrice: 13000, soldTo: [NpcType.BLUE_DJINN], description: 'Controle mental.', skillBonus: { [SkillType.MAGIC]: 2 }, image: `${IMG_BASE}Spellbook_of_Mind_Control.gif` },
  { id: 'spellbook_lost_souls', name: 'Spellbook of Lost Souls', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 19, price: 0, sellPrice: 20000, soldTo: [NpcType.RASHID], description: 'Almas perdidas.', skillBonus: { [SkillType.MAGIC]: 2 }, image: `${IMG_BASE}Spellbook_of_Lost_Souls.gif` },
  { id: 'spellbook_dark_mysteries', name: 'Spellbook of Dark Mysteries', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 20, price: 0, sellPrice: 30000, soldTo: [NpcType.RASHID], description: 'Mistérios sombrios.', skillBonus: { [SkillType.MAGIC]: 3 }, image: `${IMG_BASE}Spellbook_of_Dark_Mysteries.gif` },
  { id: 'umbral_master_spellbook', name: 'Umbral Master Spellbook', type: 'equipment', slot: EquipmentSlot.HAND_LEFT, defense: 20, price: 0, sellPrice: 150000, soldTo: [NpcType.RASHID], description: 'Mestre umbral.', skillBonus: { [SkillType.MAGIC]: 4 }, image: `${IMG_BASE}Umbral_Master_Spellbook.gif` },
];
