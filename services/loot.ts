
import { Item, Monster, Rarity, ItemModifiers, EquipmentSlot, SkillType } from "../types";
import { SHOP_ITEMS } from "../constants";

// --- RARITY LOGIC ---

const ROLL_RARITY = (influencedType: string | undefined, bonusRate: number = 0): Rarity => {
    // REGRA: Mobs normais (sem influencia) NUNCA dropam itens com tier/raridade.
    if (!influencedType) return 'common';

    const roll = Math.random();
    
    // Global chance modifiers from items/prey
    const bonus = bonusRate / 100;

    // --- BLESSED DROP LOGIC (High Tier) ---
    // Massive HP Pool = Guaranteed Rewards if you survive.
    if (influencedType === 'blessed') {
        // Legendary: 5% base (Balanced High)
        if (roll < 0.05 + bonus) return 'legendary';
        // Epic: 40% base
        if (roll < 0.40 + (bonus * 1.5)) return 'epic';
        // Fallback: Guaranteed Rare
        return 'rare';
    }

    // --- ENRAGED DROP LOGIC (Killer Tier) ---
    // High Risk of Death = Better "Jackpot" chance.
    if (influencedType === 'enraged') {
        // Legendary: 2% base
        if (roll < 0.02 + bonus) return 'legendary';
        // Epic: 15% base
        if (roll < 0.15 + bonus) return 'epic';
        // Rare: 50% base
        if (roll < 0.50 + bonus) return 'rare';
        return 'uncommon';
    }

    // --- CORRUPTED DROP LOGIC (Common Tier) ---
    // Standard Elite.
    if (influencedType === 'corrupted') {
        // Legendary: 0.2% base
        if (roll < 0.002 + (bonus * 0.5)) return 'legendary';
        // Epic: 3% base
        if (roll < 0.03 + bonus) return 'epic';
        // Rare: 20% base
        if (roll < 0.20 + bonus) return 'rare';
        return 'uncommon';
    }

    return 'common';
};

/**
 * Calculates the "Potential" of an item based on its level requirement or price.
 * This prevents early game items (Leather Helmet) from having "Godly" stats (+10% XP).
 * Returns a float between 0.25 (Weak) and 1.2 (Endgame God).
 */
const GET_ITEM_POTENTIAL = (item: Item): number => {
    // Use required level as primary indicator, fallback to price
    let score = item.requiredLevel || 0;
    
    // If no level req, estimate based on price (rough approximation)
    if (score === 0 && item.sellPrice > 0) {
        if (item.sellPrice < 500) score = 5;
        else if (item.sellPrice < 2000) score = 15;
        else if (item.sellPrice < 10000) score = 30;
        else score = 50;
    }

    if (score < 10) return 0.25;  // Starter Gear (25% effectiveness)
    if (score < 30) return 0.40;  // Early Game
    if (score < 60) return 0.60;  // Mid Game
    if (score < 100) return 0.85; // High Level
    if (score < 200) return 1.0;  // End Game
    return 1.2;                   // BiS
};

export const GENERATE_MODIFIERS = (item: Item, rarity: Rarity): ItemModifiers => {
    const mods: ItemModifiers = {};
    const itemPotential = GET_ITEM_POTENTIAL(item);

    const multiplier = {
        'common': 1,
        'uncommon': 1.15,
        'rare': 1.35,
        'epic': 1.60,
        'legendary': 2.20
    }[rarity];

    // Helper: Scales bonus based on rarity multiplier AND item potential.
    // This ensures a Low Level Legendary doesn't get +120% attack, but maybe +30%.
    const calcBonus = (baseValue: number) => {
        if (!baseValue || baseValue <= 0) return 0;
        
        // Calculate the raw increase (e.g. 100 dmg * 1.2 boost = +120)
        const rawIncrease = baseValue * (multiplier - 1);
        
        // Dampen based on item potential (e.g. +120 * 0.25 potential = +30)
        const dampedIncrease = rawIncrease * itemPotential;

        // Ensure at least +1 if it's supposed to have a bonus and isn't common
        if (dampedIncrease < 1 && rarity !== 'common') return 1;
        
        return Math.ceil(dampedIncrease);
    };

    // 1. Basic Stats (Atk/Def/Arm) - Scale purely on Base Stats (Already balanced by the item itself)
    if (item.attack && item.attack > 0 && !item.isRune) mods.attack = calcBonus(item.attack);
    if (item.armor && item.armor > 0) mods.armor = calcBonus(item.armor);
    if (item.defense && item.defense > 0) mods.defense = calcBonus(item.defense);

    // 2. Special Affix Pool
    const specialChance = {
        'common': 0,
        'uncommon': 0.3, 
        'rare': 1.0,     
        'epic': 2.0,     
        'legendary': 3.0 
    }[rarity];

    let rollCount = Math.floor(specialChance);
    if (Math.random() < (specialChance - rollCount)) rollCount++;

    const possibleBonuses: Array<{ key: keyof ItemModifiers, type: 'flat' | 'percent', min: number, max: number }> = [
        { key: 'xpBoost', type: 'percent', min: 1, max: 2 }, 
        { key: 'lootBoost', type: 'percent', min: 1, max: 2 },
        { key: 'attackSpeed', type: 'percent', min: 1, max: 2 },
        { key: 'blessedChance', type: 'percent', min: 1, max: 1 }, 
        { key: 'critChance', type: 'percent', min: 1, max: 2 },
        // --- NEW ATTRIBUTES ---
        { key: 'bossSlayer', type: 'percent', min: 2, max: 5 },
        { key: 'dodgeChance', type: 'percent', min: 1, max: 1 }, // Very Strong, start low
        { key: 'goldFind', type: 'percent', min: 2, max: 5 },
        { key: 'executioner', type: 'percent', min: 1, max: 1 }, // Rare
        { key: 'reflection', type: 'percent', min: 3, max: 5 },  // Thorns
    ];

    if (item.scalingStat) {
        for(let i=0; i<3; i++) possibleBonuses.push({ key: item.scalingStat, type: 'flat', min: 1, max: 1 });
    }
    possibleBonuses.push({ key: SkillType.DEFENSE, type: 'flat', min: 1, max: 1 });
    possibleBonuses.push({ key: SkillType.MAGIC, type: 'flat', min: 1, max: 1 });

    const rarityMult = { 'common': 0, 'uncommon': 1, 'rare': 2, 'epic': 3, 'legendary': 5 }[rarity];

    for (let i = 0; i < rollCount; i++) {
        const bonus = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        
        let val = Math.floor(Math.random() * (bonus.max - bonus.min + 1)) + bonus.min;
        
        // Apply Rarity Multiplier (e.g. 5x for Legendary)
        val = val * rarityMult; 

        // Apply Item Potential (Nerf weak items, Buff strong items)
        val = Math.floor(val * itemPotential);

        // Ensure at least 1 if it triggered
        if (val < 1) val = 1;

        if (val > 0) {
            // @ts-ignore
            mods[bonus.key] = (mods[bonus.key] || 0) + val;
        }
    }

    if (Object.keys(mods).length === 0 && rarity !== 'common') {
        if (item.slot === EquipmentSlot.RING || item.slot === EquipmentSlot.NECK) {
            mods.armor = 1;
        } else {
            mods.defense = 1;
        }
    }

    return mods;
};

export const generateLootWithRarity = (
    monster: Monster, 
    lootBonusPercent: number = 0
): { standard: {[key:string]: number}, unique: Item[] } => {
    
    const standardLoot: { [itemId: string]: number } = {};
    const uniqueLoot: Item[] = [];
    
    // GLOBAL LOOT BUFF: All drops are 1.5x more likely by default
    const GLOBAL_DROP_RATE = 1.5; 
    
    const multiplier = (1 + (lootBonusPercent / 100)) * GLOBAL_DROP_RATE;
    const isInfluenced = monster.isInfluenced || false;

    if (monster.lootTable) {
        monster.lootTable.forEach(drop => {
            let dropChance = drop.chance * multiplier;
            if (isInfluenced) dropChance *= 1.5; 

            if (Math.random() <= dropChance) {
                const itemDef = SHOP_ITEMS.find(i => i.id === drop.itemId);
                if (!itemDef) return;

                if (itemDef.type === 'equipment' && !itemDef.isRune && itemDef.slot !== EquipmentSlot.AMMO) {
                    // Pass influenced type string to properly guarantee rarities
                    const influencedType = monster.isInfluenced ? monster.influencedType : undefined;
                    const rarity = ROLL_RARITY(influencedType, lootBonusPercent / 10);
                    
                    if (rarity !== 'common') {
                        const modifiers = GENERATE_MODIFIERS(itemDef, rarity);
                        const newSkillBonus = { ...(itemDef.skillBonus || {}) };
                        Object.keys(modifiers).forEach(key => {
                            if (Object.values(SkillType).includes(key as SkillType)) {
                                const skillKey = key as SkillType;
                                newSkillBonus[skillKey] = (newSkillBonus[skillKey] || 0) + (modifiers[key] || 0);
                            }
                        });

                        const priceMult = {
                            'common': 1,
                            'uncommon': 3,
                            'rare': 10,
                            'epic': 20,
                            'legendary': 50
                        }[rarity];

                        const uniqueItem: Item = {
                            ...itemDef,
                            uniqueId: Math.random().toString(36).substr(2, 9),
                            rarity,
                            modifiers,
                            attack: itemDef.attack ? itemDef.attack + (modifiers.attack || 0) : undefined,
                            armor: itemDef.armor ? itemDef.armor + (modifiers.armor || 0) : undefined,
                            defense: itemDef.defense ? itemDef.defense + (modifiers.defense || 0) : undefined,
                            skillBonus: Object.keys(newSkillBonus).length > 0 ? newSkillBonus : undefined,
                            sellPrice: Math.floor(itemDef.sellPrice * priceMult)
                        };
                        uniqueLoot.push(uniqueItem);
                    } else {
                        standardLoot[drop.itemId] = (standardLoot[drop.itemId] || 0) + 1;
                    }
                } else {
                    const amount = Math.floor(Math.random() * drop.maxAmount) + 1;
                    standardLoot[drop.itemId] = (standardLoot[drop.itemId] || 0) + amount;
                }
            }
        });
    }

    return { standard: standardLoot, unique: uniqueLoot };
};

export const calculateLootDrop = (monster: Monster, lootBonusPercent: number = 0): { [itemId: string]: number } => {
    const result = generateLootWithRarity(monster, lootBonusPercent);
    return result.standard;
};

// Calculates total gold value of a loot object
export const calculateLootValue = (loot: { [itemId: string]: number }): number => {
    let totalValue = 0;
    Object.entries(loot).forEach(([itemId, qty]) => {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item && item.sellPrice > 0) {
            totalValue += item.sellPrice * qty;
        }
    });
    return totalValue;
};
