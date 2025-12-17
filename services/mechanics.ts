
import { Monster, HuntingTask, Player, EquipmentSlot, SkillType, PreySlot, PreyBonusType, AscensionPerk, Item, Rarity, ItemModifiers, Boss, Vocation } from "../types";
import { MONSTERS, SHOP_ITEMS, BOSSES, REGEN_RATES } from "../constants";
import { getEffectiveSkill } from "./progression";
import { GENERATE_MODIFIERS } from "./loot"; 

export const getXpStageMultiplier = (level: number): number => {
  // Balanced Curve
  if (level <= 8) return 250; 
  if (level <= 20) return 30;  
  if (level <= 50) return 20;  
  if (level <= 80) return 10;  
  if (level <= 100) return 5; 
  if (level <= 150) return 3; 
  if (level <= 200) return 2;
  if (level <= 300) return 1.5;
  return 1;                    
};

// --- REFORGE MECHANICS ---
export const getReforgeCost = (rarity?: Rarity): number => {
    switch (rarity) {
        case 'uncommon': return 3;
        case 'rare': return 8;
        case 'epic': return 15;
        case 'legendary': return 30;
        default: return 5;
    }
};

export const reforgeItemStats = (item: Item): Item => {
    if (!item.rarity || item.rarity === 'common') return item;
    
    const baseItemDef = SHOP_ITEMS.find(i => i.id === item.id) || item;
    const modifiers = GENERATE_MODIFIERS(baseItemDef, item.rarity);
    
    const newSkillBonus = { ...(baseItemDef.skillBonus || {}) };
    Object.keys(modifiers).forEach(key => {
        if (Object.values(SkillType).includes(key as SkillType)) {
            const skillKey = key as SkillType;
            newSkillBonus[skillKey] = (newSkillBonus[skillKey] || 0) + (modifiers[key] || 0);
        }
    });

    return {
        ...item,
        modifiers,
        attack: baseItemDef.attack ? baseItemDef.attack + (modifiers.attack || 0) : undefined,
        armor: baseItemDef.armor ? baseItemDef.armor + (modifiers.armor || 0) : undefined,
        defense: baseItemDef.defense ? baseItemDef.defense + (modifiers.defense || 0) : undefined,
        skillBonus: Object.keys(newSkillBonus).length > 0 ? newSkillBonus : undefined,
    };
};

// --- MONSTER VARIANTS (THE FEAR FACTOR) ---
export const createInfluencedMonster = (baseMonster: Monster, forceType?: 'enraged'|'blessed'|'corrupted'|null): Monster => {
    let variant: Monster = { ...baseMonster, isInfluenced: true };
    const roll = Math.random();
    
    let type = forceType;
    if (!type) {
        if (roll < 0.50) type = 'corrupted';      
        else if (roll < 0.90) type = 'enraged';   
        else type = 'blessed';                    
    }

    if (type === 'corrupted') {
        variant.influencedType = 'corrupted';
        variant.name = `Corrupted ${baseMonster.name}`;
        variant.hp = Math.floor(baseMonster.hp * 4.0);       
        variant.maxHp = Math.floor(baseMonster.maxHp * 4.0);
        variant.damageMin = Math.floor(baseMonster.damageMin * 1.5); 
        variant.damageMax = Math.floor(baseMonster.damageMax * 1.8);
        variant.exp = Math.floor(baseMonster.exp * 6); 
        
    } else if (type === 'enraged') {
        variant.influencedType = 'enraged';
        variant.name = `Enraged ${baseMonster.name}`;
        variant.hp = Math.floor(baseMonster.hp * 2.5); 
        variant.maxHp = Math.floor(baseMonster.maxHp * 2.5);
        variant.damageMin = Math.floor(baseMonster.damageMin * 2.0); 
        variant.damageMax = Math.floor(baseMonster.damageMax * 3.2); 
        variant.attackSpeedMs = Math.max(400, Math.floor(baseMonster.attackSpeedMs * 0.6)); 
        variant.exp = Math.floor(baseMonster.exp * 12); 

    } else if (type === 'blessed') {
        variant.influencedType = 'blessed';
        variant.name = `Blessed ${baseMonster.name}`;
        variant.hp = Math.floor(baseMonster.hp * 15.0); 
        variant.maxHp = Math.floor(baseMonster.maxHp * 15.0);
        variant.damageMin = Math.floor(baseMonster.damageMin * 1.8);
        variant.damageMax = Math.floor(baseMonster.damageMax * 2.2);
        variant.exp = Math.floor(baseMonster.exp * 40);
        variant.minGold = baseMonster.minGold * 15;
        variant.maxGold = baseMonster.maxGold * 15;
    }
    
    return variant;
};

// --- ASCENSION HELPERS ---
export const calculateSoulPointsToGain = (player: Player): number => {
    // New Threshold: Level 30
    if (player.level < 30) return 0;
    
    // Formula: 10 points at lvl 30. +10 points every 10 levels after.
    // Lvl 30 = 10 SP
    // Lvl 40 = 20 SP
    // Lvl 50 = 30 SP
    const base = (1 + Math.floor((player.level - 30) / 10)) * 10;
    
    const multiplier = 1 + ((player.ascension?.soul_gain || 0) / 20); 
    return Math.floor(base * multiplier);
};

export const getAscensionUpgradeCost = (perk: AscensionPerk, currentLevel: number): number => {
    if (perk === 'loot_boost') {
        return Math.floor(10 * Math.pow(2, currentLevel));
    }
    return (currentLevel + 1) * 10;
};

export const getAscensionBonusValue = (player: Player, perk: AscensionPerk): number => {
    const level = (player.ascension?.[perk] || 0);
    if (perk === 'boss_cd') return level * 1;
    if (perk === 'loot_boost') return level * 1; 
    return level * 5; 
};

// --- HELPERS ---
export const generatePreyCard = (): PreySlot => {
    const randomMonster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    const types: PreyBonusType[] = ['xp', 'damage', 'defense', 'loot'];
    const type = types[Math.floor(Math.random() * types.length)];
    let value = 0;
    const roll = Math.random(); 

    if (type === 'xp' || type === 'loot') {
        if (roll < 0.50) { value = Math.floor(Math.random() * 15) + 1; } 
        else if (roll < 0.80) { value = Math.floor(Math.random() * 15) + 16; } 
        else if (roll < 0.95) { value = Math.floor(Math.random() * 10) + 31; } 
        else if (roll < 0.99) { value = Math.floor(Math.random() * 9) + 41; } 
        else { value = 50; }
    } else {
        if (roll < 0.50) { value = Math.floor(Math.random() * 8) + 1; } 
        else if (roll < 0.80) { value = Math.floor(Math.random() * 7) + 9; } 
        else if (roll < 0.95) { value = Math.floor(Math.random() * 5) + 16; } 
        else if (roll < 0.99) { value = Math.floor(Math.random() * 4) + 21; } 
        else { value = 25; }
    }

    return {
        monsterId: randomMonster.id,
        bonusType: type,
        bonusValue: value,
        active: false,
        startTime: 0,
        duration: 2 * 60 * 60 * 1000 
    };
};

export const generateSingleTask = (playerLevel: number, forcedType?: 'kill' | 'collect'): HuntingTask => {
    const pool = [...MONSTERS];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const monster = pool[randomIndex];

    let taskType: 'kill' | 'collect' = 'kill';
    if (forcedType) {
        taskType = forcedType;
    } else {
        taskType = Math.random() < 0.5 ? 'kill' : 'collect';
    }

    if (taskType === 'collect' && (!monster.lootTable || monster.lootTable.filter(l => SHOP_ITEMS.find(i=>i.id===l.itemId)?.type === 'loot').length === 0)) {
        taskType = 'kill';
    }

    let targetId = monster.id;
    let targetName = monster.name;
    let amount = 0;
    
    // --- SCALING KILL REQUIREMENTS ---
    let minKills = 300; 
    let maxKills = 600;

    if (playerLevel < 20) {
        minKills = 50; maxKills = 150;
    } else if (playerLevel < 50) {
        minKills = 150; maxKills = 300;
    } else if (playerLevel >= 100) {
        minKills = 600; maxKills = 1200;
    }

    const killTarget = Math.floor(Math.random() * (maxKills - minKills + 1)) + minKills;
    let effortMetric = killTarget; 

    if (taskType === 'collect' && monster.lootTable) {
        const possibleLoot = monster.lootTable.filter(l => {
            const item = SHOP_ITEMS.find(i => i.id === l.itemId);
            return item && item.type === 'loot';
        });

        if (possibleLoot.length > 0) {
            const chosenLoot = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
            targetId = chosenLoot.itemId;
            const itemDef = SHOP_ITEMS.find(i => i.id === targetId);
            targetName = itemDef ? itemDef.name : targetId;
            
            const avgYield = (1 + (chosenLoot.maxAmount || 1)) / 2;
            const dropChance = chosenLoot.chance;
            
            let itemTarget = Math.floor(killTarget * dropChance * avgYield);
            itemTarget = Math.max(5, itemTarget);
            let expectedKills = Math.ceil(itemTarget / (dropChance * avgYield));
            
            amount = itemTarget;
            effortMetric = expectedKills;
        } else {
            amount = killTarget;
            taskType = 'kill';
        }
    } else {
        amount = killTarget;
    }

    const stageMult = getXpStageMultiplier(playerLevel);
    
    const sizeRatio = Math.min(1.5, Math.max(0, (effortMetric - minKills) / (maxKills - minKills))); 
    let bonusMultiplier = 0.3 + (sizeRatio * 0.40); 
    
    if (taskType === 'collect') {
        bonusMultiplier += 0.25; 
    }

    const totalHuntXp = monster.exp * effortMetric * stageMult;
    const xpReward = Math.floor(totalHuntXp * bonusMultiplier);
    
    const rawAvgGold = (monster.minGold + monster.maxGold) / 2;
    const bountyBase = Math.max(rawAvgGold, 20);
    const totalHuntGold = bountyBase * effortMetric;
    const goldReward = Math.floor(totalHuntGold * (bonusMultiplier + 0.5));

    return {
        uuid: Math.random().toString(36).substr(2, 9),
        type: taskType,
        category: taskType,
        status: 'available',
        targetId: targetId,
        targetName: targetName,
        monsterId: monster.id,
        amountRequired: amount,
        amountCurrent: 0,
        killsRequired: amount, 
        killsCurrent: 0, 
        rewardXp: xpReward,
        rewardGold: goldReward,
    };
};

export const generateTaskOptions = (playerLevel: number): HuntingTask[] => {
  const tasks: HuntingTask[] = [];
  for (let i = 0; i < 4; i++) {
      tasks.push(generateSingleTask(playerLevel, 'kill'));
  }
  for (let i = 0; i < 4; i++) {
      tasks.push(generateSingleTask(playerLevel, 'collect'));
  }
  return tasks;
};

// --- PRECISE OFFLINE CALCULATOR ---
export interface HuntEstimates {
    xpPerHour: number;
    rawGoldPerHour: number;
    cyclesPerHour: number;
    wastePerHour: number; // Rough gold value fallback
    
    // New exact usage tracking
    ammoId?: string;
    ammoUsagePerHour: number;
    
    runeId?: string;
    runeUsagePerHour: number;
    
    healthPotionId?: string;
    healthPotionUsagePerHour: number;
    
    manaPotionId?: string;
    manaPotionUsagePerHour: number;
}

export const estimateHuntStats = (player: Player, monster: Monster, huntCount: number = 1): HuntEstimates => {
  const weapon = player.equipment[EquipmentSlot.HAND_RIGHT];
  
  // 1. Calculate Average Damage (Simplified)
  let avgDmg = 5 + (player.level / 3); 
  
  if (weapon) {
      let attackValue = weapon.attack || 1;
      let skill = getEffectiveSkill(player, weapon.scalingStat || SkillType.SWORD);
      
      let factor = 0.06;

      if (weapon.scalingStat === SkillType.MAGIC) {
          factor = 1.0;
          skill = getEffectiveSkill(player, SkillType.MAGIC);
          avgDmg = (player.level * 0.2) + (skill * 3.5) + (attackValue * 1.5);
      } else {
          // Physical
          if (weapon.scalingStat === SkillType.DISTANCE && weapon.weaponType) {
             const ammo = player.equipment[EquipmentSlot.AMMO];
             if (ammo && ammo.attack) attackValue += ammo.attack;
             factor = 0.08;
          }
          avgDmg = (player.level * 0.2) + (skill * attackValue * factor);
      }
  }

  // Modifiers
  const activePrey = player.prey.slots.find(s => s.monsterId === monster.id && s.active);
  if (activePrey && activePrey.bonusType === 'damage') {
      avgDmg *= (1 + (activePrey.bonusValue / 100));
  }
  const ascDmgBonus = getAscensionBonusValue(player, 'damage_boost');
  avgDmg *= (1 + (ascDmgBonus / 100));
  if (player.premiumUntil > Date.now()) avgDmg *= 1.5; // +50%

  avgDmg = Math.max(5, avgDmg);

  // Time & Cycles
  const totalHp = monster.hp * huntCount;
  const turnsToKill = Math.ceil(totalHp / avgDmg);
  const attackSpeedSeconds = 2.0; 
  const secondsToKill = turnsToKill * attackSpeedSeconds;
  const respawnTime = 2; 
  
  // Cycles (Kills) Per Hour
  const cycleTime = secondsToKill + respawnTime;
  const cyclesPerHour = 3600 / cycleTime;

  // Rewards Per Cycle
  const avgGoldPerMob = (monster.minGold + monster.maxGold) / 2;
  const ascGoldBonus = getAscensionBonusValue(player, 'gold_boost');
  const finalAvgGoldPerMob = avgGoldPerMob * (1 + (ascGoldBonus / 100));
  const rawGoldPerCycle = finalAvgGoldPerMob * huntCount;

  // XP Per Cycle
  const stageMult = getXpStageMultiplier(player.level);
  const staminaMult = player.stamina > 0 ? 1.5 : 1.0;
  let xpMult = 1;
  if (activePrey && activePrey.bonusType === 'xp') xpMult = 1 + (activePrey.bonusValue / 100);
  const ascXpBonus = getAscensionBonusValue(player, 'xp_boost');
  xpMult += (ascXpBonus / 100);
  if (player.premiumUntil > Date.now()) xpMult += 1.0; // +100%
  if (player.xpBoostUntil > Date.now()) xpMult += 2.0; // +200%

  const isBoss = !!(monster as Boss).cooldownSeconds;
  const hazardXp = isBoss ? 1 : (1 + ((player.activeHazardLevel || 0) * 0.02));
  xpMult += (hazardXp - 1);

  const xpPerCycle = monster.exp * huntCount * stageMult * xpMult * staminaMult;

  // --- SUPPLY USAGE CALCULATION ---
  
  let ammoId: string | undefined;
  let ammoUsagePerHour = 0;
  let runeId: string | undefined;
  let runeUsagePerHour = 0;
  let healthPotionId: string | undefined;
  let healthPotionUsagePerHour = 0;
  let manaPotionId: string | undefined;
  let manaPotionUsagePerHour = 0;

  // 1. AMMO
  if (weapon?.scalingStat === SkillType.DISTANCE && weapon.weaponType) {
      const ammo = player.equipment[EquipmentSlot.AMMO];
      if (ammo) {
          ammoId = ammo.id;
          ammoUsagePerHour = cyclesPerHour * turnsToKill;
      }
  }

  // 2. RUNES (Auto Attack Rune)
  if (player.settings.autoAttackRune && player.settings.selectedRuneId) {
      runeId = player.settings.selectedRuneId;
      // Assume 1 rune every 2 turns max (cooldown)
      runeUsagePerHour = cyclesPerHour * (turnsToKill / 2); 
  }

  // 3. HEALTH POTIONS (Incoming DPS vs Mitigation)
  const monsterDPS = ((monster.damageMin + monster.damageMax) / 2) * huntCount / (monster.attackSpeedMs / 1000);
  
  // Mitigation
  let mitigation = 0;
  Object.values(player.equipment).forEach(i => { if (i && i.armor) mitigation += i.armor; });
  const netIncomingDPS = Math.max(0, monsterDPS - (mitigation * 0.8));
  
  // Natural Regen
  const baseRegen = REGEN_RATES[player.vocation] || REGEN_RATES[Vocation.NONE];
  const regenMultiplier = player.promoted ? 1.8 : 1.0;
  const hpRegenPerSec = baseRegen.hp * regenMultiplier;

  const hpDeficitPerSec = Math.max(0, netIncomingDPS - hpRegenPerSec);
  
  if (hpDeficitPerSec > 0 && player.settings.autoHealthPotionThreshold > 0 && player.settings.selectedHealthPotionId) {
      healthPotionId = player.settings.selectedHealthPotionId;
      const potion = SHOP_ITEMS.find(i => i.id === healthPotionId);
      if (potion && potion.restoreAmount) {
          const hpNeededPerHour = hpDeficitPerSec * 3600;
          healthPotionUsagePerHour = Math.ceil(hpNeededPerHour / potion.restoreAmount);
      }
  }

  // 4. MANA POTIONS (Spell Usage + Heal Spells)
  let manaDeficitPerSec = 0;
  const manaRegenPerSec = baseRegen.mana * regenMultiplier;
  
  // Cost from Attack Spells
  if (player.settings.autoAttackSpell && player.settings.attackSpellRotation?.length > 0) {
      // Simplified: Assume average cost of rotation every 2 seconds
      // Ideally we check specific spells, but avg 40 mana every 2s is a safe baseline for mages
      manaDeficitPerSec += 20; 
  }

  // Cost from Healing Spells (if taking damage)
  if (hpDeficitPerSec > 0 && player.settings.autoHealSpellThreshold > 0 && player.settings.selectedHealSpellId) {
      // If we are taking damage, we might use spells INSTEAD of potions if configured?
      // For simplicity, we assume potions cover heavy damage, spells cover light.
      // But if bot has heal spell, it uses mana.
      // Let's assume spell heals 100 HP for 40 Mana.
      // 2.5 HP per Mana.
      const manaForHealing = hpDeficitPerSec / 2.5;
      manaDeficitPerSec += manaForHealing;
  }

  // Net Mana Balance
  const netManaDeficit = Math.max(0, manaDeficitPerSec - manaRegenPerSec);

  if (netManaDeficit > 0 && player.settings.autoManaPotionThreshold > 0 && player.settings.selectedManaPotionId) {
      manaPotionId = player.settings.selectedManaPotionId;
      const potion = SHOP_ITEMS.find(i => i.id === manaPotionId);
      if (potion && potion.restoreAmount) {
          const manaNeededPerHour = netManaDeficit * 3600;
          manaPotionUsagePerHour = Math.ceil(manaNeededPerHour / potion.restoreAmount);
      }
  }

  // Calculate generic waste value for display
  let totalWasteCost = 0;
  const getItemPrice = (id?: string) => SHOP_ITEMS.find(i => i.id === id)?.price || 0;
  
  totalWasteCost += ammoUsagePerHour * getItemPrice(ammoId);
  totalWasteCost += runeUsagePerHour * getItemPrice(runeId);
  totalWasteCost += healthPotionUsagePerHour * getItemPrice(healthPotionId);
  totalWasteCost += manaPotionUsagePerHour * getItemPrice(manaPotionId);

  return {
    xpPerHour: Math.floor(cyclesPerHour * xpPerCycle),
    rawGoldPerHour: Math.floor(cyclesPerHour * rawGoldPerCycle),
    cyclesPerHour: cyclesPerHour,
    wastePerHour: totalWasteCost,
    
    // Detailed Breakdown
    ammoId, ammoUsagePerHour,
    runeId, runeUsagePerHour,
    healthPotionId, healthPotionUsagePerHour,
    manaPotionId, manaPotionUsagePerHour
  };
};
