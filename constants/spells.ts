
import { Spell, Vocation, DamageType } from '../types';

export const SPELLS: Spell[] = [
    // --- HEALING SPELLS ---
    
    // Generic
    { id: 'exura', name: 'Light Healing (Exura)', manaCost: 25, minLevel: 8, reqMagicLevel: 0, price: 170, type: 'heal', vocations: [Vocation.KNIGHT, Vocation.PALADIN, Vocation.SORCERER, Vocation.DRUID], cooldown: 1000 },
    { id: 'exura_gran', name: 'Intense Healing (Exura Gran)', manaCost: 80, minLevel: 20, reqMagicLevel: 2, price: 350, type: 'heal', vocations: [Vocation.PALADIN, Vocation.SORCERER, Vocation.DRUID], cooldown: 1000 },
    { id: 'exura_vita', name: 'Ultimate Healing (Exura Vita)', manaCost: 180, minLevel: 30, reqMagicLevel: 7, price: 1000, type: 'heal', vocations: [Vocation.SORCERER, Vocation.DRUID], cooldown: 1000 },
    
    // Knight Healing
    { id: 'exura_ico', name: 'Recovery (Exura Ico)', manaCost: 50, minLevel: 30, reqMagicLevel: 4, price: 2000, type: 'heal', vocations: [Vocation.KNIGHT], cooldown: 1000 },
    { id: 'exura_gran_ico', name: 'Intense Recovery (Exura Gran Ico)', manaCost: 250, minLevel: 80, reqMagicLevel: 8, price: 10000, type: 'heal', vocations: [Vocation.KNIGHT], cooldown: 60000 }, 

    // Paladin Healing
    { id: 'exura_san', name: 'Divine Healing (Exura San)', manaCost: 180, minLevel: 40, reqMagicLevel: 15, price: 3000, type: 'heal', vocations: [Vocation.PALADIN], cooldown: 1000 },
    { id: 'exura_gran_san', name: 'Salvation (Exura Gran San)', manaCost: 250, minLevel: 60, reqMagicLevel: 20, price: 15000, type: 'heal', vocations: [Vocation.PALADIN], cooldown: 1000 },

    // Druid Healing
    { id: 'exura_gran_mas_res', name: 'Mass Healing (Mas Res)', manaCost: 200, minLevel: 36, reqMagicLevel: 19, price: 9000, type: 'heal', vocations: [Vocation.DRUID], cooldown: 2000 },


    // --- ATTACK SPELLS ---

    // Knight Attack (Needs high base damage to penetrate defense)
    { id: 'exori', name: 'Berserk (Exori)', manaCost: 120, minLevel: 35, reqMagicLevel: 4, price: 2500, type: 'attack', vocations: [Vocation.KNIGHT], damageType: DamageType.PHYSICAL, cooldown: 4000 },
    { id: 'exori_min', name: 'Fierce Berserk (Exori Min)', manaCost: 350, minLevel: 70, reqMagicLevel: 6, price: 7500, type: 'attack', vocations: [Vocation.KNIGHT], damageType: DamageType.PHYSICAL, cooldown: 6000 },
    { id: 'exori_gran', name: 'Front Sweep (Exori Gran)', manaCost: 350, minLevel: 90, reqMagicLevel: 6, price: 3000, type: 'attack', vocations: [Vocation.KNIGHT], damageType: DamageType.PHYSICAL, cooldown: 6000 },
    { id: 'exori_hur', name: 'Whirlwind Throw (Exori Hur)', manaCost: 50, minLevel: 28, reqMagicLevel: 4, price: 1000, type: 'attack', vocations: [Vocation.KNIGHT], damageType: DamageType.PHYSICAL, cooldown: 6000 },
    { id: 'exori_mas', name: 'Groundshaker (Exori Mas)', manaCost: 180, minLevel: 33, reqMagicLevel: 4, price: 1500, type: 'attack', vocations: [Vocation.KNIGHT], damageType: DamageType.PHYSICAL, cooldown: 8000 },
    
    // Paladin Attack
    { id: 'exori_con', name: 'Ethereal Spear (Exori Con)', manaCost: 30, minLevel: 23, reqMagicLevel: 3, price: 1100, type: 'attack', vocations: [Vocation.PALADIN], damageType: DamageType.PHYSICAL, cooldown: 2000 },
    { id: 'exori_san', name: 'Divine Missile (Exori San)', manaCost: 25, minLevel: 40, reqMagicLevel: 15, price: 1800, type: 'attack', vocations: [Vocation.PALADIN], damageType: DamageType.HOLY, cooldown: 2000 },
    { id: 'exevo_mas_san', name: 'Divine Caldera (Mas San)', manaCost: 180, minLevel: 50, reqMagicLevel: 15, price: 3000, type: 'attack', vocations: [Vocation.PALADIN], damageType: DamageType.HOLY, cooldown: 4000 },

    // Sorcerer Attack
    { id: 'exori_flam', name: 'Fire Strike (Exori Flam)', manaCost: 25, minLevel: 12, reqMagicLevel: 1, price: 800, type: 'attack', vocations: [Vocation.SORCERER, Vocation.DRUID], damageType: DamageType.FIRE, cooldown: 2000 },
    { id: 'exori_vis', name: 'Energy Strike (Exori Vis)', manaCost: 25, minLevel: 12, reqMagicLevel: 1, price: 800, type: 'attack', vocations: [Vocation.SORCERER, Vocation.DRUID], damageType: DamageType.ENERGY, cooldown: 2000 },
    { id: 'exori_mort', name: 'Death Strike (Exori Mort)', manaCost: 25, minLevel: 16, reqMagicLevel: 2, price: 1200, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.DEATH, cooldown: 2000 },
    
    { id: 'exevo_flam_hur', name: 'Fire Wave (Flam Hur)', manaCost: 30, minLevel: 18, reqMagicLevel: 2, price: 800, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.FIRE, cooldown: 4000 },
    { id: 'exevo_vis_hur', name: 'Energy Wave (Vis Hur)', manaCost: 180, minLevel: 38, reqMagicLevel: 15, price: 2500, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.ENERGY, cooldown: 8000 },
    { id: 'exevo_vis_lux', name: 'Energy Beam (Vis Lux)', manaCost: 50, minLevel: 23, reqMagicLevel: 6, price: 1000, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.ENERGY, cooldown: 4000 },
    { id: 'exevo_gran_vis_lux', name: 'Great Energy Beam (Gran Vis Lux)', manaCost: 120, minLevel: 29, reqMagicLevel: 10, price: 1800, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.ENERGY, cooldown: 6000 },
    
    { id: 'exevo_gran_mas_vis', name: 'Rage of the Skies (Mas Vis)', manaCost: 650, minLevel: 55, reqMagicLevel: 30, price: 6000, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.ENERGY, cooldown: 40000 },
    { id: 'exevo_gran_mas_flam', name: 'Hell\'s Core (Mas Flam)', manaCost: 1200, minLevel: 60, reqMagicLevel: 40, price: 8000, type: 'attack', vocations: [Vocation.SORCERER], damageType: DamageType.FIRE, cooldown: 40000 },

    // Druid Attack
    { id: 'exori_tera', name: 'Terra Strike (Exori Tera)', manaCost: 25, minLevel: 13, reqMagicLevel: 1, price: 800, type: 'attack', vocations: [Vocation.DRUID, Vocation.SORCERER], damageType: DamageType.EARTH, cooldown: 2000 },
    { id: 'exori_frigo', name: 'Ice Strike (Exori Frigo)', manaCost: 25, minLevel: 15, reqMagicLevel: 1, price: 800, type: 'attack', vocations: [Vocation.DRUID, Vocation.SORCERER], damageType: DamageType.ICE, cooldown: 2000 },
    { id: 'exori_moe_ico', name: 'Physical Strike (Moe Ico)', manaCost: 25, minLevel: 16, reqMagicLevel: 3, price: 800, type: 'attack', vocations: [Vocation.DRUID], damageType: DamageType.PHYSICAL, cooldown: 2000 },

    { id: 'exevo_frigo_hur', name: 'Ice Wave (Frigo Hur)', manaCost: 30, minLevel: 18, reqMagicLevel: 2, price: 800, type: 'attack', vocations: [Vocation.DRUID], damageType: DamageType.ICE, cooldown: 4000 },
    { id: 'exevo_tera_hur', name: 'Terra Wave (Tera Hur)', manaCost: 220, minLevel: 38, reqMagicLevel: 15, price: 2500, type: 'attack', vocations: [Vocation.DRUID], damageType: DamageType.EARTH, cooldown: 8000 },
    { id: 'exevo_gran_frigo_hur', name: 'Strong Ice Wave (Gran Frigo)', manaCost: 180, minLevel: 40, reqMagicLevel: 18, price: 6000, type: 'attack', vocations: [Vocation.DRUID], damageType: DamageType.ICE, cooldown: 8000 },

    { id: 'exevo_gran_mas_tera', name: 'Wrath of Nature (Mas Tera)', manaCost: 750, minLevel: 55, reqMagicLevel: 35, price: 6000, type: 'attack', vocations: [Vocation.DRUID], damageType: DamageType.EARTH, cooldown: 40000 },
    { id: 'exevo_gran_mas_frigo', name: 'Eternal Winter (Mas Frigo)', manaCost: 1150, minLevel: 60, reqMagicLevel: 40, price: 8000, type: 'attack', vocations: [Vocation.DRUID], damageType: DamageType.ICE, cooldown: 40000 },
];
