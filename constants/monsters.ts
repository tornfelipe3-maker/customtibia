
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
            { itemId: 'coat', chance: 0.08, maxAmount: 1 },     
            { itemId: 'leather_boots', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'leather_helmet', chance: 0.05, maxAmount: 1 },
            { itemId: 'wooden_shield', chance: 0.06, maxAmount: 1 }, 
            { itemId: 'dagger', chance: 0.08, maxAmount: 1 },
            { itemId: 'scarf', chance: 0.01, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'troll', name: 'Troll', level: 5, hp: 90, maxHp: 90, exp: 25, minGold: 8, maxGold: 18, damageMin: 5, damageMax: 12, attackSpeedMs: 2000, image: `${IMG_BASE}Troll.gif`,
        lootTable: [
            { itemId: 'meat', chance: 0.4, maxAmount: 2 },
            { itemId: 'troll_hair', chance: 0.30, maxAmount: 1 },   
            { itemId: 'brass_helmet', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'brass_armor', chance: 0.02, maxAmount: 1 },  
            { itemId: 'brass_legs', chance: 0.02, maxAmount: 1 },   
            { itemId: 'brass_shield', chance: 0.02, maxAmount: 1 },
            { itemId: 'hand_axe', chance: 0.10, maxAmount: 1 }, 
            { itemId: 'spear', chance: 0.25, maxAmount: 2 },
            { itemId: 'scarf', chance: 0.02, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 2: LEVEL 9-20
    // ========================================================================
    { 
        id: 'wolf', name: 'Wolf', level: 9, hp: 120, maxHp: 120, exp: 40, minGold: 10, maxGold: 20, damageMin: 8, damageMax: 20, attackSpeedMs: 1800, image: `${IMG_BASE}Wolf.gif`,
        lootTable: [
            { itemId: 'meat', chance: 0.5, maxAmount: 3 },
            { itemId: 'wolf_paw', chance: 0.25, maxAmount: 1 },     
            { itemId: 'plate_shield', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'short_sword', chance: 0.08, maxAmount: 1 },
            { itemId: 'steel_boots', chance: 0.01, maxAmount: 1 },
            { itemId: 'silver_amulet', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'life_ring', chance: 0.01, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'skeleton', name: 'Skeleton', level: 12, hp: 180, maxHp: 180, exp: 65, minGold: 15, maxGold: 30, damageMin: 15, damageMax: 30, attackSpeedMs: 2000, image: `${IMG_BASE}Skeleton.gif`,
        lootTable: [
            { itemId: 'bone', chance: 0.50, maxAmount: 3 }, 
            { itemId: 'plate_helmet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'plate_armor', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'axe', chance: 0.05, maxAmount: 1 },
            { itemId: 'bone_club', chance: 0.10, maxAmount: 1 },
            { itemId: 'silver_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'life_ring', chance: 0.015, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'orc', name: 'Orc', level: 15, hp: 220, maxHp: 220, exp: 90, minGold: 20, maxGold: 40, damageMin: 20, damageMax: 40, attackSpeedMs: 2000, image: `${IMG_BASE}Orc.gif`, 
        lootTable: [
            { itemId: 'orc_tooth', chance: 0.30, maxAmount: 1 },    
            { itemId: 'plate_legs', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'short_sword', chance: 0.10, maxAmount: 1 }, 
            { itemId: 'health_potion', chance: 0.15, maxAmount: 1 },
            { itemId: 'silver_amulet', chance: 0.01, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 3: LEVEL 20-40
    // ========================================================================
    { 
        id: 'ghoul', name: 'Ghoul', level: 20, hp: 350, maxHp: 350, exp: 160, minGold: 35, maxGold: 80, damageMin: 30, damageMax: 60, attackSpeedMs: 1800, image: `${IMG_BASE}Ghoul.gif`, 
        lootTable: [
            { itemId: 'rotten_piece_of_cloth', chance: 0.25, maxAmount: 1 }, 
            { itemId: 'ghoul_snack', chance: 0.30, maxAmount: 1 }, 
            { itemId: 'crown_helmet', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'spellbook', chance: 0.02, maxAmount: 1 },
            { itemId: 'life_ring', chance: 0.02, maxAmount: 1 },
            { itemId: 'protection_amulet', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'time_ring', chance: 0.005, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'orc_berserker', name: 'Orc Berserker', level: 25, hp: 500, maxHp: 500, exp: 240, minGold: 50, maxGold: 100, damageMin: 50, damageMax: 100, attackSpeedMs: 1500, image: `${IMG_BASE}Orc_Berserker.gif`,
        lootTable: [
            { itemId: 'orc_leather', chance: 0.30, maxAmount: 1 },
            { itemId: 'crown_legs', chance: 0.01, maxAmount: 1 },
            { itemId: 'crimson_sword', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'orcish_axe', chance: 0.04, maxAmount: 1 },
            { itemId: 'boh', chance: 0.005, maxAmount: 1 },
            { itemId: 'protection_amulet', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'time_ring', chance: 0.01, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'minotaur_guard', name: 'Minotaur Guard', level: 30, hp: 650, maxHp: 650, exp: 320, minGold: 60, maxGold: 120, damageMin: 60, damageMax: 110, attackSpeedMs: 2000, image: `${IMG_BASE}Minotaur_Guard.gif`,
        lootTable: [
            { itemId: 'minotaur_leather', chance: 0.35, maxAmount: 1 },
            { itemId: 'crown_armor', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'crown_shield', chance: 0.02, maxAmount: 1 },
            { itemId: 'wand_draconia', chance: 0.02, maxAmount: 1 },
            { itemId: 'northwind_rod', chance: 0.02, maxAmount: 1 },
            { itemId: 'protection_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'time_ring', chance: 0.01, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'cyclops', name: 'Cyclops', level: 35, hp: 800, maxHp: 800, exp: 400, minGold: 80, maxGold: 160, damageMin: 70, damageMax: 130, attackSpeedMs: 2200, image: `${IMG_BASE}Cyclops.gif`,
        lootTable: [
            { itemId: 'cyclops_toe', chance: 0.50, maxAmount: 1 }, 
            { itemId: 'meat', chance: 0.6, maxAmount: 4 },
            { itemId: 'ham', chance: 0.3, maxAmount: 2 },
            { itemId: 'crimson_sword', chance: 0.01, maxAmount: 1 },
            { itemId: 'health_potion', chance: 0.10, maxAmount: 1 },
            { itemId: 'protection_amulet', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'time_ring', chance: 0.01, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 4: LEVEL 40-60
    // ========================================================================
    { 
        id: 'dragon_hatchling', name: 'Dragon Hatchling', level: 40, hp: 1200, maxHp: 1200, exp: 700, minGold: 90, maxGold: 180, damageMin: 90, damageMax: 160, attackSpeedMs: 1800, image: `${IMG_BASE}Dragon_Hatchling.gif`,
        lootTable: [
            { itemId: 'dragon_ham', chance: 0.6, maxAmount: 2 }, 
            { itemId: 'small_emerald', chance: 0.12, maxAmount: 1 }, 
            { itemId: 'dragon_shield', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'dragon_helmet', chance: 0.01, maxAmount: 1 },
            { itemId: 'elvish_bow', chance: 0.04, maxAmount: 1 },
            { itemId: 'platinum_amulet', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'ring_of_healing', chance: 0.01, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'necromancer', name: 'Necromancer', level: 45, hp: 1500, maxHp: 1500, exp: 1000, minGold: 100, maxGold: 220, damageMin: 100, damageMax: 180, attackSpeedMs: 2000, elements: { holy: 1.2 }, image: `${IMG_BASE}Necromancer.gif`,
        lootTable: [
            { itemId: 'eyedrops', chance: 0.30, maxAmount: 1 }, 
            { itemId: 'dragon_legs', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'knight_boots', chance: 0.01, maxAmount: 1 },         
            { itemId: 'wand_inferno', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'mana_potion', chance: 0.30, maxAmount: 2 },
            { itemId: 'platinum_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'ring_of_healing', chance: 0.03, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'giant_spider', name: 'Giant Spider', level: 50, hp: 2000, maxHp: 2000, exp: 1600, minGold: 140, maxGold: 300, damageMin: 140, damageMax: 240, attackSpeedMs: 1200, image: `${IMG_BASE}Giant_Spider.gif`,
        lootTable: [
            { itemId: 'spider_silk', chance: 0.12, maxAmount: 1 }, 
            { itemId: 'knight_boots', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'platinum_amulet', chance: 0.03, maxAmount: 1 }, 
            { itemId: 'ring_of_healing', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'strong_health_potion', chance: 0.15, maxAmount: 1 }
        ] 
    },
    { 
        id: 'dragon', name: 'Dragon', level: 60, hp: 3200, maxHp: 3200, exp: 2100, minGold: 180, maxGold: 400, damageMin: 180, damageMax: 280, attackSpeedMs: 2000, elements: { fire: 1.0, earth: 0.2 }, image: `${IMG_BASE}Dragon.gif`,
        lootTable: [
            { itemId: 'green_dragon_leather', chance: 0.25, maxAmount: 1 }, 
            { itemId: 'dragon_scale', chance: 0.15, maxAmount: 1 },
            { itemId: 'dragon_shield', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'dragon_helmet', chance: 0.03, maxAmount: 1 },
            { itemId: 'fire_axe', chance: 0.03, maxAmount: 1 }, 
            { itemId: 'fire_sword', chance: 0.03, maxAmount: 1 },
            { itemId: 'hailstorm_rod', chance: 0.02, maxAmount: 1 },
            { itemId: 'platinum_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'ring_of_healing', chance: 0.02, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 5: LEVEL 100-200
    // ========================================================================
    { 
        id: 'hero', name: 'Hero', level: 100, hp: 4500, maxHp: 4500, exp: 3500, minGold: 220, maxGold: 550, damageMin: 220, damageMax: 350, attackSpeedMs: 1500, image: `${IMG_BASE}Hero.gif`,
        lootTable: [
            { itemId: 'warrior_sweat', chance: 0.20, maxAmount: 1 }, 
            { itemId: 'red_piece_of_cloth', chance: 0.15, maxAmount: 1 },
            { itemId: 'zaoan_helmet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'mpa', chance: 0.01, maxAmount: 1 },
            { itemId: 'relic_sword', chance: 0.03, maxAmount: 1 },
            { itemId: 'stone_skin_amulet', chance: 0.03, maxAmount: 1 }, 
            { itemId: 'stealth_ring', chance: 0.02, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'vampire_lord', name: 'Vampire Lord', level: 120, hp: 6000, maxHp: 6000, exp: 5000, minGold: 300, maxGold: 700, damageMin: 280, damageMax: 450, attackSpeedMs: 1500, image: `${IMG_BASE}Vampire_Lord.gif`,
        lootTable: [
            { itemId: 'vampire_dust', chance: 0.25, maxAmount: 1 }, 
            { itemId: 'vampire_teeth', chance: 0.4, maxAmount: 2 },
            { itemId: 'zaoan_legs', chance: 0.02, maxAmount: 1 },   
            { itemId: 'guardian_boots', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'guardian_shield', chance: 0.015, maxAmount: 1 },
            { itemId: 'wand_starstorm', chance: 0.02, maxAmount: 1 },
            { itemId: 'underworld_rod', chance: 0.015, maxAmount: 1 },
            { itemId: 'stone_skin_amulet', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'stealth_ring', chance: 0.03, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'dragon_lord', name: 'Dragon Lord', level: 160, hp: 8000, maxHp: 8000, exp: 7500, minGold: 400, maxGold: 900, damageMin: 350, damageMax: 600, attackSpeedMs: 1800, elements: { fire: 1.0, earth: 0.2 }, image: `${IMG_BASE}Dragon_Lord.gif`,
        lootTable: [
            { itemId: 'red_dragon_leather', chance: 0.3, maxAmount: 1 },
            { itemId: 'dragon_claw_common', chance: 0.08, maxAmount: 1 }, 
            { itemId: 'dsm', chance: 0.03, maxAmount: 1 },
            { itemId: 'royal_spear', chance: 0.3, maxAmount: 3 },
            { itemId: 'arbalest', chance: 0.015, maxAmount: 1 },
            { itemId: 'stone_skin_amulet', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'stealth_ring', chance: 0.04, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'behemoth', name: 'Behemoth', level: 180, hp: 11000, maxHp: 11000, exp: 10000, minGold: 500, maxGold: 1000, damageMin: 450, damageMax: 800, attackSpeedMs: 2500, image: `${IMG_BASE}Behemoth.gif`,
        lootTable: [
            { itemId: 'behemoth_claw', chance: 0.35, maxAmount: 1 },  
            { itemId: 'noble_axe', chance: 0.04, maxAmount: 1 },     
            { itemId: 'mastermind_shield', chance: 0.02, maxAmount: 1 },
            { itemId: 'shadow_sceptre', chance: 0.03, maxAmount: 1 },
            { itemId: 'stone_skin_amulet', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'stealth_ring', chance: 0.05, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 6: LEVEL 200-300
    // ========================================================================
    { 
        id: 'warlock', name: 'Warlock', level: 200, hp: 14000, maxHp: 14000, exp: 14000, minGold: 700, maxGold: 1400, damageMin: 550, damageMax: 900, attackSpeedMs: 2000, image: `${IMG_BASE}Warlock.gif`,
        lootTable: [
            { itemId: 'old_parchment', chance: 0.35, maxAmount: 1 }, 
            { itemId: 'blue_gem', chance: 0.08, maxAmount: 1 },
            { itemId: 'rift_helmet', chance: 0.01, maxAmount: 1 },  
            { itemId: 'wand_defiance', chance: 0.02, maxAmount: 1 },
            { itemId: 'glacial_rod', chance: 0.02, maxAmount: 1 },
            { itemId: 'shiny_blade', chance: 0.01, maxAmount: 1 },
            { itemId: 'rift_crossbow', chance: 0.015, maxAmount: 1 },
            { itemId: 'depth_calcei', chance: 0.005, maxAmount: 1 },
            { itemId: 'werewolf_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'energy_ring', chance: 0.03, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'demon', name: 'Demon', level: 280, hp: 22000, maxHp: 22000, exp: 22000, minGold: 1200, maxGold: 2500, damageMin: 700, damageMax: 1200, attackSpeedMs: 2000, elements: { fire: 1.0, energy: 0.5, ice: 1.2 }, image: `${IMG_BASE}Demon.gif`,
        lootTable: [
            { itemId: 'demon_horn', chance: 0.40, maxAmount: 2 },    
            { itemId: 'demon_dust', chance: 0.25, maxAmount: 1 },
            { itemId: 'ornate_chestplate', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'mpa', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'rift_legs', chance: 0.015, maxAmount: 1 },
            { itemId: 'crystalline_axe', chance: 0.01, maxAmount: 1 },
            { itemId: 'mycological_mace', chance: 0.01, maxAmount: 1 },
            { itemId: 'depth_calcei', chance: 0.02, maxAmount: 1 },
            { itemId: 'werewolf_amulet', chance: 0.04, maxAmount: 1 }, 
            { itemId: 'energy_ring', chance: 0.05, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 7: LEVEL 300-400
    // ========================================================================
    { 
        id: 'hellhound', name: 'Hellhound', level: 300, hp: 30000, maxHp: 30000, exp: 30000, minGold: 1800, maxGold: 3000, damageMin: 1000, damageMax: 1600, attackSpeedMs: 1500, elements: { fire: 0, ice: 1.2 }, image: `${IMG_BASE}Hellhound.gif`,
        lootTable: [
            { itemId: 'hellhound_slobber', chance: 0.40, maxAmount: 2 }, 
            { itemId: 'prismatic_boots', chance: 0.01, maxAmount: 1 },  
            { itemId: 'prismatic_helmet', chance: 0.01, maxAmount: 1 },
            { itemId: 'umbral_bow', chance: 0.01, maxAmount: 1 },
            { itemId: 'tagralt_blade', chance: 0.01, maxAmount: 1 },
            { itemId: 'umbral_mace', chance: 0.01, maxAmount: 1 },
            { itemId: 'cobra_amulet', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'death_ring', chance: 0.02, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'plaguesmith', name: 'Plaguesmith', level: 380, hp: 40000, maxHp: 40000, exp: 40000, minGold: 2200, maxGold: 3500, damageMin: 1200, damageMax: 1800, attackSpeedMs: 2200, elements: { earth: 0, fire: 1.1 }, image: `${IMG_BASE}Plaguesmith.gif`,
        lootTable: [
            { itemId: 'vial_of_poison', chance: 0.40, maxAmount: 2 },    
            { itemId: 'piece_of_iron', chance: 0.50, maxAmount: 3 },
            { itemId: 'prismatic_armor', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'prismatic_legs', chance: 0.01, maxAmount: 1 },
            { itemId: 'demonwing_axe', chance: 0.01, maxAmount: 1 },
            { itemId: 'cobra_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'death_ring', chance: 0.03, maxAmount: 1 } 
        ] 
    },

    // ========================================================================
    // TIER 8: LEVEL 400+
    // ========================================================================
    { 
        id: 'dawnfire_asura', name: 'Dawnfire Asura', level: 400, hp: 50000, maxHp: 50000, exp: 50000, minGold: 3000, maxGold: 5000, damageMin: 1500, damageMax: 2200, attackSpeedMs: 1200, elements: { fire: 0.5, death: 0.8, ice: 1.1 }, image: `${IMG_BASE}Dawnfire_Asura.gif`,
        lootTable: [
            { itemId: 'asura_hair', chance: 0.50, maxAmount: 2 },        
            { itemId: 'falcon_boots', chance: 0.005, maxAmount: 1 },    
            { itemId: 'falcon_wand', chance: 0.005, maxAmount: 1 },
            { itemId: 'falcon_amulet', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'might_ring', chance: 0.04, maxAmount: 1 } 
        ] 
    },
    { 
        id: 'hellgorak', name: 'Hellgorak', level: 600, hp: 75000, maxHp: 75000, exp: 80000, minGold: 5000, maxGold: 8000, damageMin: 2000, damageMax: 3500, attackSpeedMs: 2000, elements: { physical: 0.6, ice: 1.05 }, image: `${IMG_BASE}Hellgorak.gif`,
        lootTable: [
            { itemId: 'demonic_blood', chance: 0.5, maxAmount: 2 },     
            { itemId: 'falcon_greaves', chance: 0.005, maxAmount: 1 },  
            { itemId: 'falcon_longsword', chance: 0.005, maxAmount: 1 },
            { itemId: 'great_shield', chance: 0.005, maxAmount: 1 },
            { itemId: 'falcon_amulet', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'might_ring', chance: 0.08, maxAmount: 1 } 
        ] 
    },
];
