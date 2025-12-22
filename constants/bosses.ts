import { Boss } from '../types';
import { IMG_BASE } from './config';

export const BOSSES: Boss[] = [
    { 
        id: 'horned_fox', 
        name: 'The Horned Fox', 
        level: 50, 
        hp: 40000, 
        maxHp: 40000, 
        exp: 25000, 
        minGold: 2000, 
        maxGold: 5000, 
        damageMin: 450, 
        damageMax: 900, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 7200, 
        isDaily: true, 
        lootTable: [
            { itemId: 'gold_token', chance: 0.5, maxAmount: 1 }
        ], 
        image: `${IMG_BASE}The_Horned_Fox.gif` 
    },
    
    { 
        id: 'demodras', 
        name: 'Demodras', 
        level: 80, 
        hp: 100000, 
        maxHp: 100000, 
        exp: 60000, 
        minGold: 5000, 
        maxGold: 10000, 
        damageMin: 900, 
        damageMax: 1800, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 7200, 
        isDaily: true, 
        lootTable: [
            { itemId: 'dragon_claw', chance: 1.0, maxAmount: 1 }, 
            { itemId: 'red_dragon_leather', chance: 1.0, maxAmount: 2 },
            { itemId: 'gold_token', chance: 0.8, maxAmount: 1 }
        ], 
        image: `${IMG_BASE}Demodras.gif` 
    },
    
    // SCARLETT ETZEL (COBRA SET)
    { 
        id: 'scarlett_etzel', 
        name: 'Scarlett Etzel', 
        level: 400, 
        hp: 750000, 
        maxHp: 750000, 
        exp: 400000, 
        minGold: 30000, 
        maxGold: 80000, 
        damageMin: 2250, 
        damageMax: 4500, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'cobra_hood', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'cobra_boots', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'cobra_amulet', chance: 0.02, maxAmount: 1 }, 
            { itemId: 'cobra_crossbow', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'cobra_axe', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_club', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_rod', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_wand', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'cobra_sword', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'blue_gem', chance: 0.4, maxAmount: 2 },
            { itemId: 'red_gem', chance: 0.5, maxAmount: 3 },
            { itemId: 'gold_token', chance: 1.0, maxAmount: 2 }
        ], 
        image: `${IMG_BASE}Scarlett_Etzel.gif` 
    },

    // OBERON (FALCON SET)
    { 
        id: 'oberon', 
        name: 'Grand Master Oberon', 
        level: 300, 
        hp: 500000, 
        maxHp: 500000, 
        exp: 350000, 
        minGold: 25000, 
        maxGold: 60000, 
        damageMin: 1800, 
        damageMax: 3750, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'falcon_shield', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'falcon_plate', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_greaves', chance: 0.01, maxAmount: 1 }, 
            { itemId: 'falcon_coif', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'falcon_battleaxe', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'falcon_longsword', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'falcon_mace', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'falcon_rod', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'falcon_wand', chance: 0.015, maxAmount: 1 }, 
            { itemId: 'gold_token', chance: 1.0, maxAmount: 2 }
        ], 
        image: `${IMG_BASE}Grand_Master_Oberon.gif` 
    },

    // DRUME (LION SET)
    {
        id: 'drume',
        name: 'Drume',
        level: 350,
        hp: 600000,
        maxHp: 600000,
        exp: 380000, 
        minGold: 20000, 
        maxGold: 50000, 
        damageMin: 2100, 
        damageMax: 4200, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'red_gem', chance: 0.4, maxAmount: 3 },
            { itemId: 'gold_token', chance: 1.0, maxAmount: 2 }
        ],
        image: `${IMG_BASE}Drume.gif`
    },

    // GOSHNAR'S MEGALOMANIA (SOUL SET)
    {
        id: 'goshnar_megalomania',
        name: 'Goshnar\'s Megalomania',
        level: 550,
        hp: 2500000, 
        maxHp: 2500000, 
        exp: 2000000, 
        minGold: 100000, 
        maxGold: 250000, 
        damageMin: 4500, 
        damageMax: 9000, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 72000, 
        isDaily: true,
        lootTable: [
            { itemId: 'gold_token', chance: 1.0, maxAmount: 5 }
        ],
        image: `${IMG_BASE}Goshnar%27s_Megalomania.gif`
    },

    // THE PRIMAL MENACE (HAZARD SYSTEM BOSS)
    {
        id: 'primal_menace',
        name: 'The Primal Menace',
        level: 250,
        hp: 1000000, 
        maxHp: 1000000, 
        exp: 600000, 
        minGold: 50000, 
        maxGold: 120000, 
        damageMin: 1500, 
        damageMax: 3000, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 72000, 
        isDaily: true,
        lootTable: [
            { itemId: 'red_gem', chance: 0.7, maxAmount: 5 },
            { itemId: 'gold_token', chance: 1.0, maxAmount: 3 }
        ],
        image: `${IMG_BASE}The_Primal_Menace.gif`
    },

    // BAKRAGORE (SANGUINE SET)
    {
        id: 'bakragore',
        name: 'Bakragore',
        level: 800,
        hp: 10000000, 
        maxHp: 10000000, 
        exp: 10000000, 
        minGold: 250000, 
        maxGold: 600000, 
        damageMin: 7500, 
        damageMax: 15000, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 72000, 
        isDaily: true, 
        lootTable: [
            { itemId: 'gold_token', chance: 1.0, maxAmount: 8 }
        ],
        image: `${IMG_BASE}Bakragore.gif`
    },

    // FEROXA
    { 
        id: 'feroxa', 
        name: 'Feroxa', 
        level: 250, 
        hp: 300000, 
        maxHp: 300000, 
        exp: 200000, 
        minGold: 10000, 
        maxGold: 25000, 
        damageMin: 1500, 
        damageMax: 3000, 
        attackSpeedMs: 2000, 
        cooldownSeconds: 7200, 
        isDaily: true, 
        lootTable: [
            { itemId: 'werewolf_amulet', chance: 0.05, maxAmount: 1 }, 
            { itemId: 'wolf_paw', chance: 1.0, maxAmount: 3 },
            { itemId: 'gold_token', chance: 1.0, maxAmount: 1 }
        ], 
        image: `${IMG_BASE}Feroxa.gif` 
    },
];