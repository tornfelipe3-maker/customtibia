
import { Boss } from '../types';
import { IMG_BASE } from './config';

export const BOSSES: Boss[] = [
    { id: 'horned_fox', name: 'The Horned Fox', level: 50, hp: 8000, maxHp: 8000, exp: 15000, minGold: 1000, maxGold: 2000, damageMin: 150, damageMax: 300, attackSpeedMs: 1500, cooldownSeconds: 3600, isDaily: false, lootTable: [{ itemId: 'nose_ring', chance: 1.0, maxAmount: 1 }], image: `${IMG_BASE}The_Horned_Fox.gif` },
    
    { id: 'demodras', name: 'Demodras', level: 80, hp: 20000, maxHp: 20000, exp: 40000, minGold: 2000, maxGold: 4000, damageMin: 300, damageMax: 600, attackSpeedMs: 1500, cooldownSeconds: 7200, isDaily: false, lootTable: [{ itemId: 'dragon_claw', chance: 1.0, maxAmount: 1 }, { itemId: 'gold_ingot', chance: 0.1, maxAmount: 1 }, { itemId: 'red_dragon_leather', chance: 0.5, maxAmount: 1 }], image: `${IMG_BASE}Demodras.gif` },
    
    // SCARLETT ETZEL (COBRA SET)
    { 
        id: 'scarlett_etzel', 
        name: 'Scarlett Etzel', 
        level: 400, 
        hp: 150000, 
        maxHp: 150000, 
        exp: 250000, 
        minGold: 20000, 
        maxGold: 50000, 
        damageMin: 1500, 
        damageMax: 3000, 
        attackSpeedMs: 1000, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'cobra_hood', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_boots', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_amulet', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_crossbow', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_axe', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'cobra_rod', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'cobra_wand', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'cobra_sword', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'giant_cobra_scale', chance: 0.5, maxAmount: 1 }, 
            { itemId: 'cobra_tongue', chance: 0.5, maxAmount: 1 },
            { itemId: 'gold_ingot', chance: 0.3, maxAmount: 2 },
            { itemId: 'blue_gem', chance: 0.2, maxAmount: 1 },
            { itemId: 'violet_gem', chance: 0.1, maxAmount: 1 },
            { itemId: 'red_gem', chance: 0.2, maxAmount: 2 },
            { itemId: 'draconian_steel', chance: 0.05, maxAmount: 1 },
            { itemId: 'hell_steel', chance: 0.05, maxAmount: 1 }
        ], 
        image: `${IMG_BASE}Scarlett_Etzel.gif` 
    },

    // OBERON (FALCON SET)
    { 
        id: 'oberon', 
        name: 'Grand Master Oberon', 
        level: 300, 
        hp: 100000, 
        maxHp: 100000, 
        exp: 200000, 
        minGold: 10000, 
        maxGold: 30000, 
        damageMin: 1200, 
        damageMax: 2500, 
        attackSpeedMs: 1200, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'falcon_shield', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_plate', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'falcon_greaves', chance: 0.005, maxAmount: 1 }, 
            { itemId: 'falcon_coif', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_battleaxe', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_longsword', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_mace', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_rod', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_wand', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'grant_of_arms', chance: 0.2, maxAmount: 1 },
            { itemId: 'spatial_warp_almanac', chance: 0.05, maxAmount: 1 },
            { itemId: 'violet_gem', chance: 0.15, maxAmount: 1 },
            { itemId: 'giant_shimmering_pearl', chance: 0.2, maxAmount: 1 },
            { itemId: 'gold_ingot', chance: 0.25, maxAmount: 1 },
            { itemId: 'draconian_steel', chance: 0.05, maxAmount: 1 },
            { itemId: 'hell_steel', chance: 0.05, maxAmount: 1 }
        ], 
        image: `${IMG_BASE}Grand_Master_Oberon.gif` 
    },

    // DRUME (LION SET)
    {
        id: 'drume',
        name: 'Drume',
        level: 350,
        hp: 120000,
        maxHp: 120000,
        exp: 220000, 
        minGold: 12000, 
        maxGold: 40000, 
        damageMin: 1400, 
        damageMax: 2800, 
        attackSpeedMs: 1100, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'gold_ingot', chance: 0.3, maxAmount: 2 },
            { itemId: 'red_gem', chance: 0.2, maxAmount: 2 }
        ],
        image: `${IMG_BASE}Drume.gif`
    },

    // GOSHNAR'S MEGALOMANIA (SOUL SET)
    {
        id: 'goshnar_megalomania',
        name: 'Goshnar\'s Megalomania',
        level: 550,
        hp: 500000, 
        maxHp: 500000, 
        exp: 1000000, 
        minGold: 50000, 
        maxGold: 100000, 
        damageMin: 3000, 
        damageMax: 6000, 
        attackSpeedMs: 900, 
        cooldownSeconds: 72000, // 20 Hours
        isDaily: true,
        lootTable: [
            { itemId: 'gold_ingot', chance: 1.0, maxAmount: 5 },
            { itemId: 'violet_gem', chance: 0.5, maxAmount: 3 }
        ],
        image: `${IMG_BASE}Goshnar%27s_Megalomania.gif`
    },

    // THE PRIMAL MENACE (HAZARD SYSTEM BOSS)
    {
        id: 'primal_menace',
        name: 'The Primal Menace',
        level: 250,
        hp: 200000, 
        maxHp: 200000, 
        exp: 300000, 
        minGold: 20000, 
        maxGold: 50000, 
        damageMin: 1000, 
        damageMax: 2000, 
        attackSpeedMs: 1200, 
        cooldownSeconds: 72000, 
        isDaily: true,
        lootTable: [
            { itemId: 'gold_ingot', chance: 1.0, maxAmount: 5 },
            { itemId: 'red_gem', chance: 0.5, maxAmount: 3 },
            { itemId: 'violet_gem', chance: 0.3, maxAmount: 2 }
        ],
        image: `${IMG_BASE}The_Primal_Menace.gif`
    },

    // BAKRAGORE (SANGUINE SET)
    {
        id: 'bakragore',
        name: 'Bakragore',
        level: 800,
        hp: 2000000, 
        maxHp: 2000000, 
        exp: 5000000, 
        minGold: 100000, 
        maxGold: 300000, 
        damageMin: 5000, 
        damageMax: 10000, 
        attackSpeedMs: 800, 
        cooldownSeconds: 172800, 
        isDaily: false,
        lootTable: [
            { itemId: 'gold_ingot', chance: 1.0, maxAmount: 10 }
        ],
        image: `${IMG_BASE}Bakragore.gif`
    },

    // FEROXA
    { 
        id: 'feroxa', 
        name: 'Feroxa', 
        level: 250, 
        hp: 60000, 
        maxHp: 60000, 
        exp: 80000, 
        minGold: 3000, 
        maxGold: 8000, 
        damageMin: 500, 
        damageMax: 1000, 
        attackSpeedMs: 1500, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'werewolf_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'moonlight_crystals', chance: 1.0, maxAmount: 5 }, 
            { itemId: 'wolf_paw', chance: 1.0, maxAmount: 1 },
            { itemId: 'black_pearl', chance: 0.3, maxAmount: 3 },
            { itemId: 'white_pearl', chance: 0.3, maxAmount: 5 },
            { itemId: 'gold_ingot', chance: 0.1, maxAmount: 1 }
        ], 
        image: `${IMG_BASE}Feroxa.gif` 
    },
];
