
import { Monster } from '../types';
import { IMG_BASE } from './config';

export const MONSTERS: Monster[] = [
    // ========================================================================
    // TIER 1: LEVEL 1-8
    // High Drop Rate for Set (Brass), High Product Count for Gold flow
    // ========================================================================
    { 
        id: 'rat', name: 'Rat', level: 1, hp: 35, maxHp: 35, exp: 5, minGold: 2, maxGold: 8, damageMin: 0, damageMax: 3, attackSpeedMs: 2000, image: `${IMG_BASE}Rat.gif`, 
        lootTable: [
            { itemId: 'cheese', chance: 0.5, maxAmount: 2 },
            { itemId: 'rat_tail', chance: 0.5, maxAmount: 2 }, // Easy Task (Avg 1 per kill)
            { itemId: 'coat', chance: 0.20, maxAmount: 1 },    // Very Easy Start
            { itemId: 'leather_boots', chance: 0.15, maxAmount: 1 },
            { itemId: 'wooden_shield', chance: 0.15, maxAmount: 1 },
            { itemId: 'dagger', chance: 0.15, maxAmount: 1 },
            { itemId: 'small_amethyst', chance: 0.01, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'troll', name: 'Troll', level: 5, hp: 90, maxHp: 90, exp: 25, minGold: 8, maxGold: 18, damageMin: 5, damageMax: 12, attackSpeedMs: 2000, image: `${IMG_BASE}Troll.gif`,
        lootTable: [
            { itemId: 'meat', chance: 0.4, maxAmount: 2 },
            { itemId: 'troll_hair', chance: 0.4, maxAmount: 1 }, 
            { itemId: 'brass_helmet', chance: 0.10, maxAmount: 1 }, // 10% Drop
            { itemId: 'brass_armor', chance: 0.08, maxAmount: 1 }, 
            { itemId: 'brass_legs', chance: 0.08, maxAmount: 1 }, 
            { itemId: 'hand_axe', chance: 0.15, maxAmount: 1 }, 
            { itemId: 'spear', chance: 0.3, maxAmount: 3 },
            { itemId: 'silver_amulet', chance: 0.02, maxAmount: 1 }
        ] 
    },

    // ========================================================================
    // TIER 2: LEVEL 9-20
    // Transition to Plate Set. Good Profit if low potion usage.
    // ========================================================================
    { 
        id: 'wolf', name: 'Wolf', level: 9, hp: 120, maxHp: 120, exp: 40, minGold: 10, maxGold: 25, damageMin: 8, damageMax: 20, attackSpeedMs: 1800, image: `${IMG_BASE}Wolf.gif`,
        lootTable: [
            { itemId: 'meat', chance: 0.5, maxAmount: 3 },
            { itemId: 'wolf_paw', chance: 0.4, maxAmount: 1 }, // Valuable early game
            { itemId: 'plate_shield', chance: 0.05, maxAmount: 1 },
            { itemId: 'short_sword', chance: 0.08, maxAmount: 1 }
        ] 
    },
    { 
        id: 'skeleton', name: 'Skeleton', level: 12, hp: 180, maxHp: 180, exp: 65, minGold: 15, maxGold: 35, damageMin: 15, damageMax: 30, attackSpeedMs: 2000, image: `${IMG_BASE}Skeleton.gif`,
        lootTable: [
            { itemId: 'bone', chance: 0.6, maxAmount: 3 }, // High count for tasks
            { itemId: 'plate_helmet', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'plate_armor', chance: 0.03, maxAmount: 1 },
            { itemId: 'axe', chance: 0.05, maxAmount: 1 },
            { itemId: 'bone_club', chance: 0.05, maxAmount: 1 },
            { itemId: 'small_topaz', chance: 0.01, maxAmount: 1 }
        ] 
    },
    { 
        id: 'orc', name: 'Orc', level: 15, hp: 220, maxHp: 220, exp: 90, minGold: 20, maxGold: 45, damageMin: 20, damageMax: 40, attackSpeedMs: 2000, image: `${IMG_BASE}Orc.gif`, 
        lootTable: [
            { itemId: 'orc_tooth', chance: 0.4, maxAmount: 2 }, 
            { itemId: 'plate_legs', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'short_sword', chance: 0.06, maxAmount: 1 }, 
            { itemId: 'health_potion', chance: 0.10, maxAmount: 1 } // Sustain
        ] 
    },

    // ========================================================================
    // TIER 3: LEVEL 20-40
    // Set (Crown). Intro to Waste (Potions needed).
    // ========================================================================
    { 
        id: 'ghoul', name: 'Ghoul', level: 20, hp: 350, maxHp: 350, exp: 160, minGold: 30, maxGold: 70, damageMin: 30, damageMax: 60, attackSpeedMs: 1800, image: `${IMG_BASE}Ghoul.gif`, 
        lootTable: [
            { itemId: 'rotten_piece_of_cloth', chance: 0.2, maxAmount: 1 }, 
            { itemId: 'ghoul_snack', chance: 0.35, maxAmount: 1 }, 
            { itemId: 'crown_helmet', chance: 0.005, maxAmount: 1 }, // Rare starts here (0.5%)
            { itemId: 'life_ring', chance: 0.01, maxAmount: 1 }
        ] 
    },
    { 
        id: 'orc_berserker', name: 'Orc Berserker', level: 25, hp: 500, maxHp: 500, exp: 240, minGold: 40, maxGold: 90, damageMin: 50, damageMax: 100, attackSpeedMs: 1500, image: `${IMG_BASE}Orc_Berserker.gif`,
        lootTable: [
            { itemId: 'orc_leather', chance: 0.3, maxAmount: 2 },
            { itemId: 'crown_legs', chance: 0.005, maxAmount: 1 },
            { itemId: 'crimson_sword', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'orcish_axe', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'health_potion', chance: 0.15, maxAmount: 2 } // Helps sustain the hunt
        ] 
    },
    { 
        id: 'minotaur_guard', name: 'Minotaur Guard', level: 30, hp: 650, maxHp: 650, exp: 320, minGold: 50, maxGold: 100, damageMin: 60, damageMax: 110, attackSpeedMs: 2000, image: `${IMG_BASE}Minotaur_Guard.gif`,
        lootTable: [
            { itemId: 'minotaur_leather', chance: 0.35, maxAmount: 1 },
            { itemId: 'crown_armor', chance: 0.004, maxAmount: 1 }, // Very Rare
            { itemId: 'crown_shield', chance: 0.01, maxAmount: 1 },
            { itemId: 'wand_draconia', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'mana_potion', chance: 0.15, maxAmount: 2 }
        ] 
    },
    { 
        id: 'cyclops', name: 'Cyclops', level: 35, hp: 800, maxHp: 800, exp: 400, minGold: 60, maxGold: 130, damageMin: 70, damageMax: 130, attackSpeedMs: 2200, image: `${IMG_BASE}Cyclops.gif`,
        lootTable: [
            { itemId: 'cyclops_toe', chance: 0.5, maxAmount: 1 }, 
            { itemId: 'strong_health_potion', chance: 0.05, maxAmount: 1 },
            { itemId: 'meat', chance: 0.5, maxAmount: 4 }
        ] 
    },

    // ========================================================================
    // TIER 4: LEVEL 40-60
    // Dragon Tier. Drops cover waste only if lucky or collecting products.
    // ========================================================================
    { 
        id: 'dragon_hatchling', name: 'Dragon Hatchling', level: 40, hp: 1200, maxHp: 1200, exp: 700, minGold: 80, maxGold: 150, damageMin: 90, damageMax: 160, attackSpeedMs: 1800, image: `${IMG_BASE}Dragon_Hatchling.gif`,
        lootTable: [
            { itemId: 'dragon_ham', chance: 0.4, maxAmount: 2 }, 
            { itemId: 'small_emerald', chance: 0.08, maxAmount: 1 }, // Gems start mattering
            { itemId: 'dragon_shield', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'elvish_bow', chance: 0.02, maxAmount: 1 }
        ] 
    },
    { 
        id: 'necromancer', name: 'Necromancer', level: 45, hp: 1500, maxHp: 1500, exp: 1000, minGold: 90, maxGold: 200, damageMin: 100, damageMax: 180, attackSpeedMs: 2000, elements: { holy: 1.2 }, image: `${IMG_BASE}Necromancer.gif`,
        lootTable: [
            { itemId: 'eyedrops', chance: 0.25, maxAmount: 1 }, 
            { itemId: 'dragon_legs', chance: 0.001, maxAmount: 1 }, // 0.1% Rare
            { itemId: 'boh', chance: 0.005, maxAmount: 1 },         // 0.5%
            { itemId: 'wand_inferno', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'mana_potion', chance: 0.25, maxAmount: 2 }
        ] 
    },
    { 
        id: 'giant_spider', name: 'Giant Spider', level: 50, hp: 2000, maxHp: 2000, exp: 1600, minGold: 120, maxGold: 280, damageMin: 140, damageMax: 240, attackSpeedMs: 1200, image: `${IMG_BASE}Giant_Spider.gif`,
        lootTable: [
            { itemId: 'spider_silk', chance: 0.08, maxAmount: 1 }, // Valuable
            { itemId: 'knight_boots', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'platinum_amulet', chance: 0.01, maxAmount: 1 },
            { itemId: 'strong_health_potion', chance: 0.1, maxAmount: 1 }
        ] 
    },
    { 
        id: 'dragon', name: 'Dragon', level: 60, hp: 3200, maxHp: 3200, exp: 2100, minGold: 150, maxGold: 350, damageMin: 180, damageMax: 280, attackSpeedMs: 2000, elements: { fire: 1.0, earth: 0.2 }, image: `${IMG_BASE}Dragon.gif`,
        lootTable: [
            { itemId: 'green_dragon_leather', chance: 0.15, maxAmount: 1 }, 
            { itemId: 'dragon_scale', chance: 0.10, maxAmount: 1 },
            { itemId: 'dsm', chance: 0.001, maxAmount: 1 },       // Ultra Rare (0.1%)
            { itemId: 'dragon_shield', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'fire_axe', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'fire_sword', chance: 0.01, maxAmount: 1 },
            { itemId: 'strong_health_potion', chance: 0.15, maxAmount: 2 }
        ] 
    },

    // ========================================================================
    // TIER 5: LEVEL 100-200
    // Gold sinks. Players need to loot Gems/Products to profit.
    // ========================================================================
    { 
        id: 'hero', name: 'Hero', level: 100, hp: 4500, maxHp: 4500, exp: 3500, minGold: 200, maxGold: 500, damageMin: 220, damageMax: 350, attackSpeedMs: 1500, image: `${IMG_BASE}Hero.gif`,
        lootTable: [
            { itemId: 'warrior_sweat', chance: 0.15, maxAmount: 1 }, 
            { itemId: 'red_piece_of_cloth', chance: 0.10, maxAmount: 1 },
            { itemId: 'zaoan_helmet', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'crown_armor', chance: 0.02, maxAmount: 1 },
            { itemId: 'relic_sword', chance: 0.01, maxAmount: 1 },  
            { itemId: 'great_health_potion', chance: 0.2, maxAmount: 2 },
            { itemId: 'great_mana_potion', chance: 0.2, maxAmount: 2 }
        ] 
    },
    { 
        id: 'vampire_lord', name: 'Vampire Lord', level: 120, hp: 6000, maxHp: 6000, exp: 5000, minGold: 250, maxGold: 600, damageMin: 280, damageMax: 450, attackSpeedMs: 1500, image: `${IMG_BASE}Vampire_Lord.gif`,
        lootTable: [
            { itemId: 'vampire_dust', chance: 0.2, maxAmount: 1 }, 
            { itemId: 'vampire_teeth', chance: 0.3, maxAmount: 2 },
            { itemId: 'zaoan_legs', chance: 0.005, maxAmount: 1 },   
            { itemId: 'guardian_boots', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'wand_starstorm', chance: 0.01, maxAmount: 1 },
            { itemId: 'skull', chance: 0.5, maxAmount: 3 }
        ] 
    },
    { 
        id: 'dragon_lord', name: 'Dragon Lord', level: 160, hp: 8000, maxHp: 8000, exp: 7500, minGold: 300, maxGold: 800, damageMin: 350, damageMax: 600, attackSpeedMs: 1800, elements: { fire: 1.0, earth: 0.2 }, image: `${IMG_BASE}Dragon_Lord.gif`,
        lootTable: [
            { itemId: 'red_dragon_leather', chance: 0.2, maxAmount: 1 },
            { itemId: 'dragon_claw_common', chance: 0.05, maxAmount: 1 }, // Valuable Product
            { itemId: 'mpa', chance: 0.0005, maxAmount: 1 },              // 0.05% Chance
            { itemId: 'dsm', chance: 0.005, maxAmount: 1 },
            { itemId: 'royal_spear', chance: 0.3, maxAmount: 5 },
            { itemId: 'great_health_potion', chance: 0.2, maxAmount: 2 }
        ] 
    },
    { 
        id: 'behemoth', name: 'Behemoth', level: 180, hp: 11000, maxHp: 11000, exp: 10000, minGold: 400, maxGold: 900, damageMin: 450, damageMax: 800, attackSpeedMs: 2500, image: `${IMG_BASE}Behemoth.gif`,
        lootTable: [
            { itemId: 'behemoth_claw', chance: 0.25, maxAmount: 1 },  
            { itemId: 'noble_axe', chance: 0.01, maxAmount: 1 },     
            { itemId: 'guardian_shield', chance: 0.03, maxAmount: 1 },
            { itemId: 'giant_sword', chance: 0.01, maxAmount: 1 },
            { itemId: 'ultimate_health_potion', chance: 0.15, maxAmount: 2 }
        ] 
    },

    // ========================================================================
    // TIER 6: LEVEL 200-300
    // Gems are key here.
    // ========================================================================
    { 
        id: 'warlock', name: 'Warlock', level: 200, hp: 14000, maxHp: 14000, exp: 14000, minGold: 600, maxGold: 1200, damageMin: 550, damageMax: 900, attackSpeedMs: 2000, image: `${IMG_BASE}Warlock.gif`,
        lootTable: [
            { itemId: 'skull', chance: 0.6, maxAmount: 5 },
            { itemId: 'old_parchment', chance: 0.25, maxAmount: 1 }, 
            { itemId: 'ruby', chance: 0.15, maxAmount: 1 },         // Profit source
            { itemId: 'blue_gem', chance: 0.05, maxAmount: 1 },
            { itemId: 'rift_helmet', chance: 0.002, maxAmount: 1 },  
            { itemId: 'wand_defiance', chance: 0.005, maxAmount: 1 },
            { itemId: 'great_mana_potion', chance: 0.4, maxAmount: 3 }
        ] 
    },
    { 
        id: 'demon', name: 'Demon', level: 280, hp: 22000, maxHp: 22000, exp: 22000, minGold: 1000, maxGold: 2000, damageMin: 700, damageMax: 1200, attackSpeedMs: 2000, elements: { fire: 1.0, energy: 0.5, ice: 1.2 }, image: `${IMG_BASE}Demon.gif`,
        lootTable: [
            { itemId: 'demon_horn', chance: 0.35, maxAmount: 2 },    // Reliable income
            { itemId: 'demon_dust', chance: 0.2, maxAmount: 1 },
            { itemId: 'ornate_chestplate', chance: 0.001, maxAmount: 1 }, 
            { itemId: 'mpa', chance: 0.002, maxAmount: 1 }, 
            { itemId: 'giant_sword', chance: 0.03, maxAmount: 1 },
            { itemId: 'ultimate_health_potion', chance: 0.25, maxAmount: 3 },
            { itemId: 'ultimate_mana_potion', chance: 0.25, maxAmount: 3 }
        ] 
    },

    // ========================================================================
    // TIER 7: LEVEL 300-400
    // High Waste, High Reward if rare drops.
    // ========================================================================
    { 
        id: 'hellhound', name: 'Hellhound', level: 300, hp: 30000, maxHp: 30000, exp: 30000, minGold: 1500, maxGold: 2500, damageMin: 1000, damageMax: 1600, attackSpeedMs: 1500, elements: { fire: 0, ice: 1.2 }, image: `${IMG_BASE}Hellhound.gif`,
        lootTable: [
            { itemId: 'hellhound_slobber', chance: 0.35, maxAmount: 2 }, 
            { itemId: 'opal', chance: 0.1, maxAmount: 1 },             
            { itemId: 'prismatic_boots', chance: 0.002, maxAmount: 1 },  
            { itemId: 'umbral_bow', chance: 0.002, maxAmount: 1 },
            { itemId: 'hardened_bone', chance: 0.5, maxAmount: 3 }
        ] 
    },
    { 
        id: 'plaguesmith', name: 'Plaguesmith', level: 380, hp: 40000, maxHp: 40000, exp: 40000, minGold: 2000, maxGold: 3000, damageMin: 1200, damageMax: 1800, attackSpeedMs: 2200, elements: { earth: 0, fire: 1.1 }, image: `${IMG_BASE}Plaguesmith.gif`,
        lootTable: [
            { itemId: 'vial_of_poison', chance: 0.35, maxAmount: 2 },    
            { itemId: 'piece_of_iron', chance: 0.45, maxAmount: 3 },
            { itemId: 'prismatic_armor', chance: 0.002, maxAmount: 1 }, 
            { itemId: 'demonwing_axe', chance: 0.003, maxAmount: 1 },
            { itemId: 'steel_boots', chance: 0.15, maxAmount: 1 } // Common drop for profit
        ] 
    },

    // ========================================================================
    // TIER 8: LEVEL 400+
    // Endgame. Huge HP sponges. Products + Gems sustain the hunt.
    // ========================================================================
    { 
        id: 'dawnfire_asura', name: 'Dawnfire Asura', level: 400, hp: 50000, maxHp: 50000, exp: 50000, minGold: 2500, maxGold: 4000, damageMin: 1500, damageMax: 2200, attackSpeedMs: 1200, elements: { fire: 0.5, death: 0.8, ice: 1.1 }, image: `${IMG_BASE}Dawnfire_Asura.gif`,
        lootTable: [
            { itemId: 'asura_hair', chance: 0.45, maxAmount: 2 },        
            { itemId: 'diamond', chance: 0.15, maxAmount: 1 },          
            { itemId: 'ruby', chance: 0.25, maxAmount: 2 },
            { itemId: 'falcon_boots', chance: 0.0005, maxAmount: 1 },    
            { itemId: 'falcon_wand', chance: 0.0005, maxAmount: 1 },
            { itemId: 'ultimate_spirit_potion', chance: 0.35, maxAmount: 3 }
        ] 
    },
    { 
        id: 'hellgorak', name: 'Hellgorak', level: 600, hp: 75000, maxHp: 75000, exp: 80000, minGold: 4000, maxGold: 6000, damageMin: 2000, damageMax: 3500, attackSpeedMs: 2000, elements: { physical: 0.6, ice: 1.05 }, image: `${IMG_BASE}Hellgorak.gif`,
        lootTable: [
            { itemId: 'demonic_blood', chance: 0.4, maxAmount: 2 },     
            { itemId: 'gold_ingot', chance: 0.25, maxAmount: 1 },
            { itemId: 'falcon_greaves', chance: 0.0005, maxAmount: 1 },  
            { itemId: 'falcon_longsword', chance: 0.001, maxAmount: 1 },
            { itemId: 'great_shield', chance: 0.0002, maxAmount: 1 }
        ] 
    },
];
