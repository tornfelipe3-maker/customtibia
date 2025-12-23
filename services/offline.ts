
import { Player, SkillType, Vocation, OfflineReport, ImbuType, DeathReport } from '../types';
import { MONSTERS, SHOP_ITEMS, getXpForLevel, REGEN_RATES } from '../constants';
import { estimateHuntStats, getAscensionBonusValue, getEffectiveMaxHp, getEffectiveMaxMana } from './mechanics';
import { processSkillTraining, checkForLevelUp } from './progression';

const MAX_OFFLINE_SEC = 12 * 3600; // 12 Hours Cap

export const calculateOfflineProgress = (
    player: Player, 
    lastSaveTime: number
): { player: Player, report: OfflineReport | null, stopHunt: boolean, stopTrain: boolean } => {
    
    const now = Date.now();
    if (!lastSaveTime || lastSaveTime > now) {
        return { player: { ...player, lastSaveTime: now }, report: null, stopHunt: false, stopTrain: false };
    }

    const diffSeconds = (now - lastSaveTime) / 1000;
    
    let modifiedPlayer = { ...player };
    let report: OfflineReport | null = null;
    let stopHunt = false;
    let stopTrain = false;

    if (diffSeconds > 10) {
        const potentialTime = Math.min(diffSeconds, MAX_OFFLINE_SEC);
        let effectiveTime = potentialTime; 
        let diedOffline = false;
        
        report = {
            secondsOffline: diffSeconds,
            xpGained: 0,
            goldGained: 0,
            killedMonsters: [],
            lootObtained: {},
            leveledUp: 0,
            waste: 0, 
        };

        if (modifiedPlayer.activeHuntId) {
            const monster = MONSTERS.find(m => m.id === modifiedPlayer.activeHuntId);
            const huntCount = modifiedPlayer.activeHuntCount || 1;
            
            if (monster) {
                const stats = estimateHuntStats(modifiedPlayer, monster, huntCount);
                
                // --- SURVIVAL CHECK: Can the player survive the DPS? ---
                // monsterDPS is calculated in estimateHuntStats
                const monsterDPS = ((monster.damageMin + monster.damageMax) / 2) * huntCount / (monster.attackSpeedMs / 1000);
                
                // Mitigation (Armor)
                let armorTotal = 0;
                Object.values(modifiedPlayer.equipment).forEach(i => { if (i && i.armor) armorTotal += i.armor; });
                const mitigation = armorTotal * 0.8;
                
                // Healing Per Second
                const baseRegen = REGEN_RATES[modifiedPlayer.vocation] || REGEN_RATES[Vocation.NONE];
                const regenMult = modifiedPlayer.promoted ? 1.8 : 1.0;
                const hpsRegen = baseRegen.hp * regenMult;
                
                let hpsPotion = 0;
                if (modifiedPlayer.settings.selectedHealthPotionId) {
                    const potion = SHOP_ITEMS.find(i => i.id === modifiedPlayer.settings.selectedHealthPotionId);
                    if (potion && potion.restoreAmount) {
                        const boost = 1 + (getAscensionBonusValue(modifiedPlayer, 'potion_hp_boost') / 100);
                        hpsPotion = (potion.restoreAmount * boost) / 1.0; // 1s CD
                    }
                }
                
                const totalHPS = hpsRegen + hpsPotion;
                const netDamagePerSec = Math.max(0, monsterDPS - mitigation - totalHPS);
                
                if (netDamagePerSec > 0) {
                    const timeToDie = modifiedPlayer.hp / netDamagePerSec;
                    if (timeToDie < effectiveTime) {
                        effectiveTime = Math.max(0, timeToDie);
                        diedOffline = true;
                        stopHunt = true;
                    }
                }

                // Supplies Limiting Factor
                const checkResource = (itemId: string | undefined, usagePerHour: number) => {
                    if (!itemId || usagePerHour <= 0) return MAX_OFFLINE_SEC * 2;
                    const inventoryCount = modifiedPlayer.inventory[itemId] || 0;
                    const itemPrice = SHOP_ITEMS.find(i => i.id === itemId)?.price || 999999;
                    const totalGold = modifiedPlayer.gold + modifiedPlayer.bankGold;
                    const affordableCount = Math.floor(totalGold / itemPrice);
                    const hoursOnGold = (inventoryCount + affordableCount) / usagePerHour;
                    return hoursOnGold * 3600; 
                };

                const limitAmmo = checkResource(stats.ammoId, stats.ammoUsagePerHour);
                const limitRune = checkResource(stats.runeId, stats.runeUsagePerHour);
                const limitHP = checkResource(stats.healthPotionId, stats.healthPotionUsagePerHour);
                const limitMP = checkResource(stats.manaPotionId, stats.manaPotionUsagePerHour);

                const supplyLimitingFactor = Math.min(limitAmmo, limitRune, limitHP, limitMP);
                
                if (supplyLimitingFactor < effectiveTime) {
                    effectiveTime = supplyLimitingFactor;
                    diedOffline = false; // If out of supplies before dying, you just stop hunting safely
                    if (supplyLimitingFactor < diffSeconds) {
                        stopHunt = true; 
                    }
                }

                if (effectiveTime < 10 && !diedOffline) {
                    return { player: modifiedPlayer, report, stopHunt: true, stopTrain };
                }

                report.secondsOffline = effectiveTime; 

                // Process Death Penalty
                if (diedOffline) {
                    let penaltyRate = 0.10; 
                    const hadBlessing = modifiedPlayer.hasBlessing;
                    if (hadBlessing) { 
                        penaltyRate = 0.04; 
                        modifiedPlayer.hasBlessing = false; // CONSUME BLESSING
                    }
                    
                    const xpLoss = Math.floor(modifiedPlayer.maxXp * penaltyRate);
                    const goldLoss = Math.floor(modifiedPlayer.gold * penaltyRate);
                    
                    let levelWasReduced = false;
                    if (modifiedPlayer.currentXp >= xpLoss) {
                        modifiedPlayer.currentXp -= xpLoss;
                    } else {
                        if (modifiedPlayer.level > 1) {
                            const debt = xpLoss - modifiedPlayer.currentXp;
                            modifiedPlayer.level--;
                            levelWasReduced = true;
                            modifiedPlayer.maxXp = getXpForLevel(modifiedPlayer.level + 1);
                            modifiedPlayer.currentXp = Math.max(0, modifiedPlayer.maxXp - debt);
                        } else {
                            modifiedPlayer.currentXp = 0;
                        }
                    }
                    
                    modifiedPlayer.gold = Math.max(0, modifiedPlayer.gold - goldLoss);
                    modifiedPlayer.hp = getEffectiveMaxHp(modifiedPlayer);
                    modifiedPlayer.mana = getEffectiveMaxMana(modifiedPlayer);
                    
                    // Skill Loss
                    Object.keys(modifiedPlayer.skills).forEach(key => {
                        const skill = modifiedPlayer.skills[key as SkillType];
                        const loss = 100 * penaltyRate;
                        skill.progress -= loss;
                        if (skill.progress < 0) {
                            if (skill.level > 10) {
                                skill.level--;
                                skill.progress += 100;
                            } else {
                                skill.progress = 0;
                            }
                        }
                    });

                    report.deathReport = {
                        xpLoss,
                        goldLoss,
                        levelDown: levelWasReduced,
                        vocation: modifiedPlayer.vocation,
                        killerName: monster.name,
                        hasBlessing: hadBlessing
                    };
                }

                // Consume Supplies
                const consumeResource = (itemId: string | undefined, usagePerHour: number) => {
                    if (!itemId || usagePerHour <= 0) return;
                    const totalNeeded = Math.ceil(usagePerHour * (effectiveTime / 3600));
                    let remainingNeeded = totalNeeded;
                    const itemPrice = SHOP_ITEMS.find(i => i.id === itemId)?.price || 0;
                    const inBag = modifiedPlayer.inventory[itemId] || 0;
                    if (inBag >= remainingNeeded) {
                        modifiedPlayer.inventory[itemId] -= remainingNeeded;
                        if (modifiedPlayer.inventory[itemId] === 0) delete modifiedPlayer.inventory[itemId];
                        remainingNeeded = 0;
                    } else {
                        remainingNeeded -= inBag;
                        delete modifiedPlayer.inventory[itemId];
                    }
                    if (remainingNeeded > 0) {
                        const cost = remainingNeeded * itemPrice;
                        report!.waste += cost; 
                        if (modifiedPlayer.gold >= cost) { modifiedPlayer.gold -= cost; } 
                        else { const debt = cost - modifiedPlayer.gold; modifiedPlayer.gold = 0; modifiedPlayer.bankGold = Math.max(0, modifiedPlayer.bankGold - debt); }
                    }
                };

                consumeResource(stats.ammoId, stats.ammoUsagePerHour);
                consumeResource(stats.runeId, stats.runeUsagePerHour);
                consumeResource(stats.healthPotionId, stats.healthPotionUsagePerHour);
                consumeResource(stats.manaPotionId, stats.manaPotionUsagePerHour);

                // Gains until Death/End
                const hoursPassed = effectiveTime / 3600;
                let totalCycles = Math.floor(stats.cyclesPerHour * hoursPassed);
                if (totalCycles === 0 && effectiveTime > 30 && stats.cyclesPerHour > 0) totalCycles = 1;
                const totalKills = totalCycles * huntCount;

                const safeTotalXp = Math.floor(stats.xpPerHour * hoursPassed);
                modifiedPlayer.currentXp += safeTotalXp;
                report.xpGained = safeTotalXp;

                const safeTotalGold = Math.floor(stats.rawGoldPerHour * hoursPassed);
                modifiedPlayer.gold += safeTotalGold;
                report.goldGained = safeTotalGold;

                const lootSummary: {[key:string]: number} = {};
                
                if (totalKills > 0) {
                    report.killedMonsters.push({ name: monster.name, count: totalKills });

                    if (modifiedPlayer.taskOptions) {
                        modifiedPlayer.taskOptions.forEach(task => {
                            if (task.status === 'active' && !task.isComplete && task.type === 'kill' && task.monsterId === monster.id) {
                                task.killsCurrent = (task.killsCurrent || 0) + totalKills;
                                const req = task.killsRequired || task.amountRequired;
                                if (task.killsCurrent >= req) {
                                    task.killsCurrent = req;
                                    task.isComplete = true;
                                }
                            }
                        });
                    }

                    let lootMult = 1;
                    const activePrey = modifiedPlayer.prey.slots.find(s => s.monsterId === monster.id && s.active);
                    if (activePrey && activePrey.bonusType === 'loot') lootMult += (activePrey.bonusValue / 100);
                    lootMult += (getAscensionBonusValue(modifiedPlayer, 'loot_boost') / 100);
                    if (modifiedPlayer.premiumUntil > now) lootMult += 0.20; 
                    const isBoss = !!(monster as any).cooldownSeconds;
                    const hazardLoot = isBoss ? 0 : (modifiedPlayer.activeHazardLevel || 0) * 5;
                    lootMult += (hazardLoot / 100);
                    
                    const GLOBAL_DROP_RATE = 1.5; 

                    if (monster.lootTable) {
                        monster.lootTable.forEach(drop => {
                            if (modifiedPlayer.skippedLoot && modifiedPlayer.skippedLoot.includes(drop.itemId)) return;
                            const chance = drop.chance * lootMult * GLOBAL_DROP_RATE;
                            const avgAmount = (1 + drop.maxAmount) / 2;
                            const totalDrops = Math.floor(totalKills * chance * avgAmount);
                            if (totalDrops > 0) {
                                const item = SHOP_ITEMS.find(i => i.id === drop.itemId);
                                if (item) {
                                    lootSummary[drop.itemId] = totalDrops;
                                    modifiedPlayer.inventory[drop.itemId] = (modifiedPlayer.inventory[drop.itemId] || 0) + totalDrops;
                                }
                            }
                        });
                    }
                }
                report.lootObtained = lootSummary;

                const startLevel = modifiedPlayer.level;
                const lvlResult = checkForLevelUp(modifiedPlayer);
                modifiedPlayer = lvlResult.player;
                const endLevel = modifiedPlayer.level;
                report.leveledUp = endLevel - startLevel;
            }

            if (!stopHunt) {
                modifiedPlayer.activeHuntStartTime = Date.now();
            }

        } else if (modifiedPlayer.activeTrainingSkill) {
            const skill = modifiedPlayer.activeTrainingSkill;
            let pointsGained = effectiveTime; 
            if (skill === SkillType.MAGIC) pointsGained *= 25; 
            const startLevel = modifiedPlayer.skills[skill].level;
            const startPct = modifiedPlayer.skills[skill].progress;
            const result = processSkillTraining(modifiedPlayer, skill, pointsGained);
            modifiedPlayer = result.player;
            const endLevel = modifiedPlayer.skills[skill].level;
            const endPct = modifiedPlayer.skills[skill].progress;
            const levelsGained = endLevel - startLevel;
            const pctGained = (levelsGained * 100) + (endPct - startPct);
            report.skillTrained = skill;
            report.skillGain = pctGained;
            if (diffSeconds >= MAX_OFFLINE_SEC) stopTrain = true;
            else modifiedPlayer.activeTrainingStartTime = Date.now();
        }

        // --- IMBUEMENT OFFLINE TICK ---
        if (modifiedPlayer.imbuActive && modifiedPlayer.imbuements) {
            const secondsToSubtract = Math.floor(effectiveTime);
            Object.keys(modifiedPlayer.imbuements).forEach(key => {
                const imbu = modifiedPlayer.imbuements[key as ImbuType];
                if (imbu && imbu.tier > 0 && imbu.timeRemaining > 0) {
                    imbu.timeRemaining = Math.max(0, imbu.timeRemaining - secondsToSubtract);
                    if (imbu.timeRemaining === 0) imbu.tier = 0;
                }
            });
        }
    }

    return { player: modifiedPlayer, report, stopHunt, stopTrain };
};
