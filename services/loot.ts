
import { Item, Monster, Rarity, ItemModifiers, EquipmentSlot, SkillType } from "../types";
import { SHOP_ITEMS } from "../constants";

// --- RARITY LOGIC ---

const ROLL_RARITY = (influencedType: string | undefined, bonusRate: number = 0): Rarity => {
    if (!influencedType) return 'common';

    const roll = Math.random();
    const bonus = bonusRate / 100;

    if (influencedType === 'blessed') {
        if (roll < 0.05 + bonus) return 'legendary';
        if (roll < 0.40 + (bonus * 1.5)) return 'epic';
        return 'rare';
    }

    if (influencedType === 'enraged') {
        if (roll < 0.02 + bonus) return 'legendary';
        if (roll < 0.15 + bonus) return 'epic';
        if (roll < 0.50 + bonus) return 'rare';
        return 'uncommon';
    }

    if (influencedType === 'corrupted') {
        if (roll < 0.002 + (bonus * 0.5)) return 'legendary';
        if (roll < 0.03 + bonus) return 'epic';
        if (roll < 0.20 + bonus) return 'rare';
        return 'uncommon';
    }

    return 'common';
};

const GET_ITEM_POTENTIAL = (item: Item): number => {
    let score = item.requiredLevel || 0;
    
    if (score === 0 && item.sellPrice > 0) {
        if (item.sellPrice < 500) score = 5;
        else if (item.sellPrice < 2000) score = 15;
        else if (item.sellPrice < 10000) score = 30;
        else score = 50;
    }

    if (score < 10) return 0.25;
    if (score < 30) return 0.40;
    if (score < 60) return 0.60;
    if (score < 100) return 0.85;
    if (score < 200) return 1.0;
    return 1.2;
};

export const GENERATE_MODIFIERS = (item: Item, rarity: Rarity): ItemModifiers => {
    const mods: ItemModifiers = {};
    const itemPotential = GET_ITEM_POTENTIAL(item);
    
    // --- VARIANCE LOGIC ---
    // A quality roll between 0.7 (Poor) and 1.3 (Perfect)
    const qualityFactor = 0.7 + (Math.random() * 0.6);

    const multiplier = {
        'common': 1,
        'uncommon': 1.15,
        'rare': 1.35,
        'epic': 1.60,
        'legendary': 2.20
    }[rarity];

    const calcBonus = (baseValue: number) => {
        if (!baseValue || baseValue <= 0) return 0;
        
        // Base bonus scaled by rarity
        const rawIncrease = baseValue * (multiplier - 1);
        
        // Applied variance and item potential
        const variantIncrease = rawIncrease * itemPotential * qualityFactor;

        if (variantIncrease < 1 && rarity !== 'common') return 1;
        
        return Math.ceil(variantIncrease);
    };

    // 1. Basic Stats (Atk/Def/Arm)
    if (item.attack && item.attack > 0 && !item.isRune) mods.attack = calcBonus(item.attack);
    if (item.armor && item.armor > 0) mods.armor = calcBonus(item.armor);
    if (item.defense && item.defense > 0) mods.defense = calcBonus(item.defense);

    // 2. Special Affix Pool
    const specialChance = {
        'common': 0,
        'uncommon': 0.35, 
        'rare': 1.1,     
        'epic': 2.2,     
        'legendary': 4.5 
    }[rarity];

    let rollCount = Math.floor(specialChance);
    if (Math.random() < (specialChance - rollCount)) rollCount++;

    const possibleBonuses: Array<{ key: keyof ItemModifiers, type: 'flat' | 'percent', min: number, max: number }> = [
        // Increased min/max ranges for higher RNG variance
        { key: 'xpBoost', type: 'percent', min: 1, max: 3 }, 
        { key: 'lootBoost', type: 'percent', min: 1, max: 3 },
        { key: 'attackSpeed', type: 'percent', min: 1, max: 3 },
        { key: 'blessedChance', type: 'percent', min: 1, max: 2 }, 
        { key: 'critChance', type: 'percent', min: 1, max: 3 },
        { key: 'bossSlayer', type: 'percent', min: 2, max: 8 },
        { key: 'dodgeChance', type: 'percent', min: 1, max: 2 },
        { key: 'goldFind', type: 'percent', min: 3, max: 10 },
        { key: 'executioner', type: 'percent', min: 1, max: 2 },
        { key: 'reflection', type: 'percent', min: 4, max: 12 },
    ];

    if (item.scalingStat) {
        for(let i=0; i<3; i++) possibleBonuses.push({ key: item.scalingStat, type: 'flat', min: 1, max: 2 });
    }
    possibleBonuses.push({ key: SkillType.DEFENSE, type: 'flat', min: 1, max: 2 });
    possibleBonuses.push({ key: SkillType.MAGIC, type: 'flat', min: 1, max: 2 });

    const rarityBaseMult = { 'common': 0, 'uncommon': 1, 'rare': 2, 'epic': 3.5, 'legendary': 6 }[rarity];

    for (let i = 0; i < rollCount; i++) {
        const bonus = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        
        let baseVal = Math.floor(Math.random() * (bonus.max - bonus.min + 1)) + bonus.min;
        
        // Final value = base * rarity * potential * quality
        let finalVal = Math.floor(baseVal * rarityBaseMult * itemPotential * qualityFactor);

        if (finalVal < 1) finalVal = 1;

        if (finalVal > 0) {
            // @ts-ignore
            mods[bonus.key] = (mods[bonus.key] || 0) + finalVal;
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
                    const influencedType = monster.isInfluenced ? monster.influencedType : undefined;
                    const rarity = ROLL_RARITY(influencedType, lootBonusPercent / 10);
                    
                    if (rarity !== 'common') {
                        const modifiers = GENERATE_MODIFIERS(itemDef, rarity);
                        const newSkillBonus: any = { ...(itemDef.skillBonus || {}) };
                        
                        Object.keys(modifiers).forEach(key => {
                            // Fix: Don't add base stats (attack, defense, armor) to skill bonus even if keys match enum
                            if (['attack', 'defense', 'armor'].includes(key)) return;

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
