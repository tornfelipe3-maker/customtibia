
import { Player, SkillType, Vocation, OfflineReport } from '../types';
import { MONSTERS, SHOP_ITEMS } from '../constants';
import { estimateHuntStats, getAscensionBonusValue } from './mechanics';
import { processSkillTraining, checkForLevelUp } from './progression';

const MAX_OFFLINE_SEC = 12 * 3600; // 12 Hours Cap

export const calculateOfflineProgress = (
    player: Player, 
    lastSaveTime: number
): { player: Player, report: OfflineReport | null, stopHunt: boolean, stopTrain: boolean } => {
    
    const now = Date.now();
    // Validate save time
    if (!lastSaveTime || lastSaveTime > now) {
        return { player: { ...player, lastSaveTime: now }, report: null, stopHunt: false, stopTrain: false };
    }

    const diffSeconds = (now - lastSaveTime) / 1000;
    
    let modifiedPlayer = { ...player };
    let report: OfflineReport | null = null;
    let stopHunt = false;
    let stopTrain = false;

    // Minimum 10 seconds to trigger report
    if (diffSeconds > 10) {
        const potentialTime = Math.min(diffSeconds, MAX_OFFLINE_SEC);
        let effectiveTime = potentialTime; // Can be reduced if supplies run out
        
        report = {
            secondsOffline: diffSeconds,
            xpGained: 0,
            goldGained: 0,
            killedMonsters: [],
            lootObtained: {},
            leveledUp: 0,
            waste: 0, 
        };

        // --- HUNTING OFFLINE ---
        if (modifiedPlayer.activeHuntId) {
            const monster = MONSTERS.find(m => m.id === modifiedPlayer.activeHuntId);
            const huntCount = modifiedPlayer.activeHuntCount || 1;
            
            if (monster) {
                // Get detailed stats including specific item usage per hour
                const stats = estimateHuntStats(modifiedPlayer, monster, huntCount);
                
                // --- SUPPLY CHECK (THE "ENOUGH POTIONS?" CHECK) ---
                // We calculate how many hours we can survive based on Inventory + Gold (Auto-Refill)
                
                let maxDurationBySupplies = MAX_OFFLINE_SEC * 2; // Default infinite if no consumption

                const checkResource = (itemId: string | undefined, usagePerHour: number) => {
                    if (!itemId || usagePerHour <= 0) return MAX_OFFLINE_SEC * 2;
                    
                    const inventoryCount = modifiedPlayer.inventory[itemId] || 0;
                    const itemPrice = SHOP_ITEMS.find(i => i.id === itemId)?.price || 999999;
                    
                    // How long can we last on inventory?
                    const hoursOnInventory = inventoryCount / usagePerHour;
                    
                    // How long can we last on auto-buy (Gold + Bank)?
                    const totalGold = modifiedPlayer.gold + modifiedPlayer.bankGold;
                    const affordableCount = Math.floor(totalGold / itemPrice);
                    const hoursOnGold = affordableCount / usagePerHour;
                    
                    return (hoursOnInventory + hoursOnGold) * 3600; // Convert to seconds
                };

                const limitAmmo = checkResource(stats.ammoId, stats.ammoUsagePerHour);
                const limitRune = checkResource(stats.runeId, stats.runeUsagePerHour);
                const limitHP = checkResource(stats.healthPotionId, stats.healthPotionUsagePerHour);
                const limitMP = checkResource(stats.manaPotionId, stats.manaPotionUsagePerHour);

                // The hunt stops at the EARLIEST limit
                const limitingFactor = Math.min(limitAmmo, limitRune, limitHP, limitMP);
                
                if (limitingFactor < effectiveTime) {
                    effectiveTime = limitingFactor;
                    // If we ran out of something critical, we stop the hunt
                    // Note: If limit is 0 (can't even start), effectiveTime is 0.
                    if (limitingFactor < diffSeconds) {
                        stopHunt = true; // Mark to stop future hunting
                    }
                }

                // If effective time is tiny (e.g. out of ammo immediately), skip rewards
                if (effectiveTime < 10) {
                    return { player: modifiedPlayer, report, stopHunt: true, stopTrain };
                }

                report.secondsOffline = effectiveTime; // Update report to show actual hunted time

                // --- APPLY CONSUMPTION ---
                const consumeResource = (itemId: string | undefined, usagePerHour: number) => {
                    if (!itemId || usagePerHour <= 0) return;
                    
                    const totalNeeded = Math.ceil(usagePerHour * (effectiveTime / 3600));
                    let remainingNeeded = totalNeeded;
                    const itemPrice = SHOP_ITEMS.find(i => i.id === itemId)?.price || 0;

                    // 1. Deduct from Inventory
                    const inBag = modifiedPlayer.inventory[itemId] || 0;
                    if (inBag >= remainingNeeded) {
                        modifiedPlayer.inventory[itemId] -= remainingNeeded;
                        if (modifiedPlayer.inventory[itemId] === 0) delete modifiedPlayer.inventory[itemId];
                        remainingNeeded = 0;
                    } else {
                        remainingNeeded -= inBag;
                        delete modifiedPlayer.inventory[itemId];
                    }

                    // 2. Deduct from Gold (Auto-Refill cost)
                    if (remainingNeeded > 0) {
                        const cost = remainingNeeded * itemPrice;
                        report!.waste += cost; // Track waste for report
                        
                        if (modifiedPlayer.gold >= cost) {
                            modifiedPlayer.gold -= cost;
                        } else {
                            const debt = cost - modifiedPlayer.gold;
                            modifiedPlayer.gold = 0;
                            modifiedPlayer.bankGold = Math.max(0, modifiedPlayer.bankGold - debt);
                        }
                    }
                };

                consumeResource(stats.ammoId, stats.ammoUsagePerHour);
                consumeResource(stats.runeId, stats.runeUsagePerHour);
                consumeResource(stats.healthPotionId, stats.healthPotionUsagePerHour);
                consumeResource(stats.manaPotionId, stats.manaPotionUsagePerHour);


                // --- APPLY REWARDS (Based on Effective Time) ---
                const hoursPassed = effectiveTime / 3600;
                let totalCycles = Math.floor(stats.cyclesPerHour * hoursPassed);
                if (totalCycles === 0 && effectiveTime > 30 && stats.cyclesPerHour > 0) totalCycles = 1;
                const totalKills = totalCycles * huntCount;

                // XP
                const safeTotalXp = Math.floor(stats.xpPerHour * hoursPassed);
                modifiedPlayer.currentXp += safeTotalXp;
                report.xpGained = safeTotalXp;

                // Gold
                const safeTotalGold = Math.floor(stats.rawGoldPerHour * hoursPassed);
                modifiedPlayer.gold += safeTotalGold;
                report.goldGained = safeTotalGold;

                // Loot
                const lootSummary: {[key:string]: number} = {};
                
                if (totalKills > 0) {
                    report.killedMonsters.push({ name: monster.name, count: totalKills });

                    // Calculate Loot Modifiers
                    let lootMult = 1;
                    const activePrey = modifiedPlayer.prey.slots.find(s => s.monsterId === monster.id && s.active);
                    if (activePrey && activePrey.bonusType === 'loot') lootMult += (activePrey.bonusValue / 100);
                    
                    lootMult += (getAscensionBonusValue(modifiedPlayer, 'loot_boost') / 100);
                    if (modifiedPlayer.premiumUntil > now) lootMult += 0.20; // +20%
                    const isBoss = !!(monster as any).cooldownSeconds;
                    const hazardLoot = isBoss ? 0 : (modifiedPlayer.activeHazardLevel || 0);
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

                // Level Ups
                const startLevel = modifiedPlayer.level;
                const lvlResult = checkForLevelUp(modifiedPlayer);
                modifiedPlayer = lvlResult.player;
                const endLevel = modifiedPlayer.level;
                report.leveledUp = endLevel - startLevel;
            }

            // Always reset start time for next cycle logic if continuous
            if (stopHunt) {
                // Keep stopHunt true to UI
            } else {
                modifiedPlayer.activeHuntStartTime = Date.now();
            }

        // --- TRAINING OFFLINE ---
        } else if (modifiedPlayer.activeTrainingSkill) {
            const skill = modifiedPlayer.activeTrainingSkill;
            let pointsGained = effectiveTime; 
            
            if (skill === SkillType.MAGIC) {
                pointsGained *= 25; 
            }
            
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
            
            if (diffSeconds >= MAX_OFFLINE_SEC) {
                stopTrain = true;
            } else {
                modifiedPlayer.activeTrainingStartTime = Date.now();
            }
        } 
    }

    return { player: modifiedPlayer, report, stopHunt, stopTrain };
};
