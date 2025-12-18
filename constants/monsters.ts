
import { Monster } from '../types';
import { IMG_BASE } from './config';

export const MONSTERS: Monster[] = [
    // ========================================================================
    // TIER 1: LEVEL 1-8
    // ========================================================================
    { 
        id: 'rat', name: 'Rat', level: 1, hp: 35, maxHp: 35, exp: 5, minGold: 3, maxGold: 8, damageMin: 0, damageMax: 3, attackSpeedMs: 2000, image: `${IMG_BASE}Rat.gif`, 
        lootTable: [
            { itemId: 'cheese', chance: 0.5, maxAmount: 2 },        
            { itemId: 'rat_tail', chance: 0.35, maxAmount: 1 },     
            { itemId: 'scarf', chance: 0.05, maxAmount: 1 }, // T1
            { itemId: 'dagger', chance: 0.08, maxAmount: 1 }
        ] 
    },
    { 
        id: 'troll', name: 'Troll', level: 5, hp: 90, maxHp: 90, exp: 25, minGold: 8, maxGold: 18, damageMin: 5, damageMax: 12, attackSpeedMs: 2000, image: `${IMG_BASE}Troll.gif`,
        lootTable: [
            { itemId: 'meat', chance: 0.4, maxAmount: 2 },
            { itemId: 'troll_hair', chance: 0.30, maxAmount: 1 },   
            { itemId: 'scarf', chance: 0.08, maxAmount: 1 }, // T1
            { itemId: 'spear', chance: 0.25, maxAmount: 2 }
        ] 
    },

    // ========================================================================
    // TIER 2: LEVEL 9-20
    // ========================================================================
    { 
        id: 'wolf', name: 'Wolf', level: 9, hp: 120, maxHp: 120, exp: 40, minGold: 10, maxGold: 20, damageMin: 8, damageMax: 20, attackSpeedMs: 1800, image: `${IMG_BASE}Wolf.gif`,
        lootTable: [
            { itemId: 'meat', chance: 0.5, maxAmount: 3 },
            { itemId: 'life_ring', chance: 0.01, maxAmount: 1 } // T2 Ring
        ] 
    },
    { 
        id: 'skeleton', name: 'Skeleton', level: 12, hp: 180, maxHp: 180, exp: 65, minGold: 15, maxGold: 30, damageMin: 15, damageMax: 30, attackSpeedMs: 2000, image: `${IMG_BASE}Skeleton.gif`,
        lootTable: [
            { itemId: 'bone', chance: 0.50, maxAmount: 3 }, 
            { itemId: 'silver_amulet', chance: 0.03, maxAmount: 1 }, // T2 Amulet
            { itemId: 'life_ring', chance: 0.02, maxAmount: 1 } // T2 Ring
        ] 
    },

    // ========================================================================
    // TIER 3: LEVEL 20-40
    // ========================================================================
    { 
        id: 'ghoul', name: 'Ghoul', level: 20, hp: 350, maxHp: 350, exp: 160, minGold: 35, maxGold: 80, damageMin: 30, damageMax: 60, attackSpeedMs: 1800, image: `${IMG_BASE}Ghoul.gif`, 
        lootTable: [
            { itemId: 'rotten_piece_of_cloth', chance: 0.25, maxAmount: 1 }, 
            { itemId: 'protection_amulet', chance: 0.01, maxAmount: 1 }, // T3 Amulet
            { itemId: 'life_ring', chance: 0.02, maxAmount: 1 }
        ] 
    },
    { 
        id: 'orc_berserker', name: 'Orc Berserker', level: 25, hp: 500, maxHp: 500, exp: 240, minGold: 50, maxGold: 100, damageMin: 50, damageMax: 100, attackSpeedMs: 1500, image: `${IMG_BASE}Orc_Berserker.gif`,
        lootTable: [
            { itemId: 'orc_leather', chance: 0.30, maxAmount: 1 },
            { itemId: 'time_ring', chance: 0.03, maxAmount: 1 } // T3 Ring
        ] 
    },

    // ========================================================================
    // TIER 4: LEVEL 40-60
    // ========================================================================
    { 
        id: 'giant_spider', name: 'Giant Spider', level: 50, hp: 2000, maxHp: 2000, exp: 1600, minGold: 140, maxGold: 300, damageMin: 140, damageMax: 240, attackSpeedMs: 1200, image: `${IMG_BASE}Giant_Spider.gif`,
        lootTable: [
            { itemId: 'spider_silk', chance: 0.12, maxAmount: 1 }, 
            { itemId: 'platinum_amulet', chance: 0.04, maxAmount: 1 }, // T4 Amulet
            { itemId: 'ring_of_healing', chance: 0.03, maxAmount: 1 } // T4 Ring
        ] 
    },
    { 
        id: 'dragon', name: 'Dragon', level: 60, hp: 3200, maxHp: 3200, exp: 2100, minGold: 180, maxGold: 400, damageMin: 180, damageMax: 280, attackSpeedMs: 2000, elements: { fire: 1.0, earth: 0.2 }, image: `${IMG_BASE}Dragon.gif`,
        lootTable: [
            { itemId: 'dragon_scale', chance: 0.15, maxAmount: 1 },
            { itemId: 'platinum_amulet', chance: 0.03, maxAmount: 1 } // T4 Amulet
        ] 
    },

    // ========================================================================
    // TIER 5: LEVEL 100-200
    // ========================================================================
    { 
        id: 'hero', name: 'Hero', level: 100, hp: 4500, maxHp: 4500, exp: 3500, minGold: 220, maxGold: 550, damageMin: 220, damageMax: 350, attackSpeedMs: 1500, image: `${IMG_BASE}Hero.gif`,
        lootTable: [
            { itemId: 'warrior_sweat', chance: 0.20, maxAmount: 1 }, 
            { itemId: 'stone_skin_amulet', chance: 0.02, maxAmount: 1 }, // T5
            { itemId: 'stealth_ring', chance: 0.02, maxAmount: 1 } // T5 Ring
        ] 
    },
    { 
        id: 'dragon_lord', name: 'Dragon Lord', level: 160, hp: 8000, maxHp: 8000, exp: 7500, minGold: 400, maxGold: 900, damageMin: 350, damageMax: 600, attackSpeedMs: 1800, elements: { fire: 1.0, earth: 0.2 }, image: `${IMG_BASE}Dragon_Lord.gif`,
        lootTable: [
            { itemId: 'stone_skin_amulet', chance: 0.04, maxAmount: 1 }, // T5
            { itemId: 'energy_ring', chance: 0.03, maxAmount: 1 } // T5 Ring
        ] 
    },

    // ========================================================================
    // TIER 6: LEVEL 200-300
    // ========================================================================
    { 
        id: 'demon', name: 'Demon', level: 280, hp: 22000, maxHp: 22000, exp: 22000, minGold: 1200, maxGold: 2500, damageMin: 700, damageMax: 1200, attackSpeedMs: 2000, elements: { fire: 1.0, energy: 0.5, ice: 1.2 }, image: `${IMG_BASE}Demon.gif`,
        lootTable: [
            { itemId: 'demon_horn', chance: 0.40, maxAmount: 2 },    
            { itemId: 'werewolf_amulet', chance: 0.02, maxAmount: 1 }, // T6 Amulet
            { itemId: 'death_ring', chance: 0.04, maxAmount: 1 }  // T6 Ring
        ] 
    },

    // ========================================================================
    // TIER 7: LEVEL 300-400
    // ========================================================================
    { 
        id: 'plaguesmith', name: 'Plaguesmith', level: 380, hp: 40000, maxHp: 40000, exp: 40000, minGold: 2200, maxGold: 3500, damageMin: 1200, damageMax: 1800, attackSpeedMs: 2200, elements: { earth: 0, fire: 1.1 }, image: `${IMG_BASE}Plaguesmith.gif`,
        lootTable: [
            { itemId: 'vial_of_poison', chance: 0.40, maxAmount: 2 },    
            { itemId: 'cobra_amulet', chance: 0.02, maxAmount: 1 }, // T7 Amulet
            { itemId: 'might_ring', chance: 0.02, maxAmount: 1 }   // T7 Ring
        ] 
    },

    // ========================================================================
    // TIER 8: LEVEL 400+
    // ========================================================================
    { 
        id: 'hellgorak', name: 'Hellgorak', level: 600, hp: 75000, maxHp: 75000, exp: 80000, minGold: 5000, maxGold: 8000, damageMin: 2000, damageMax: 3500, attackSpeedMs: 2000, elements: { physical: 0.6, ice: 1.05 }, image: `${IMG_BASE}Hellgorak.gif`,
        lootTable: [
            { itemId: 'demonic_blood', chance: 0.5, maxAmount: 2 },     
            { itemId: 'falcon_amulet', chance: 0.02, maxAmount: 1 }, // T8 Amulet
            { itemId: 'might_ring', chance: 0.05, maxAmount: 1 }    // T8 Ring
        ] 
    },
];
