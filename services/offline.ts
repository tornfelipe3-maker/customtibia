
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

    // Minimum 10 seconds to trigger report to avoid spam on refresh
    if (diffSeconds > 10) {
        const effectiveTime = Math.min(diffSeconds, MAX_OFFLINE_SEC);
        
        report = {
            secondsOffline: diffSeconds,
            xpGained: 0,
            goldGained: 0,
            killedMonsters: [],
            lootObtained: {},
            leveledUp: 0,
            waste: 0, // Init waste
        };

        // --- HUNTING OFFLINE ---
        if (modifiedPlayer.activeHuntId) {
            const monster = MONSTERS.find(m => m.id === modifiedPlayer.activeHuntId);
            const huntCount = modifiedPlayer.activeHuntCount || 1;
            
            if (monster) {
                // Get rates
                const stats = estimateHuntStats(modifiedPlayer, monster, huntCount);
                
                // Calculate total cycles (kills)
                const hoursPassed = effectiveTime / 3600;
                let totalCycles = Math.floor(stats.cyclesPerHour * hoursPassed);
                
                // Ensure at least 1 kill if user has enough damage and time > 30s
                if (totalCycles === 0 && effectiveTime > 30 && stats.cyclesPerHour > 0) {
                    totalCycles = 1;
                }

                const totalKills = totalCycles * huntCount;

                // 1. Grant XP
                // Calculate based on exact kills to be precise
                const xpPerKill = (stats.xpPerHour / stats.cyclesPerHour) || 0; // approximate back from hourly rate
                const totalXp = Math.floor(totalKills * (xpPerKill / huntCount)); // XP per individual mob * count
                
                // Use the safe estimate function directly for totals to avoid rounding errors in reverse math
                const safeTotalXp = Math.floor(stats.xpPerHour * hoursPassed);
                const appliedXp = Math.max(totalXp, safeTotalXp); // Take the better of the two to benefit player

                modifiedPlayer.currentXp += appliedXp;
                report.xpGained = appliedXp;

                // 2. Grant Gold
                const safeTotalGold = Math.floor(stats.rawGoldPerHour * hoursPassed);
                modifiedPlayer.gold += safeTotalGold;
                report.goldGained = safeTotalGold;

                // 3. Apply Waste (Supplies)
                // Assuming player buys supplies automatically with bank/gold
                const estimatedWaste = Math.floor(stats.wastePerHour * hoursPassed);
                
                if (modifiedPlayer.gold + modifiedPlayer.bankGold < estimatedWaste) {
                    // Ran out of gold for supplies - reduce effective time
                    const affordableRatio = (modifiedPlayer.gold + modifiedPlayer.bankGold) / estimatedWaste;
                    // Apply reduced gains? For simplicity, we just deduct what they have and stop hunting
                    // But to be fair, we just deduct cost. If negative, they enter "debt" or stop?
                    // Let's assume they stop if they can't afford.
                    
                    // Actually, let's just deduct from gold. If gold < 0, set to 0 and maybe stop future hunt?
                    // Simpler: Deduct waste. 
                    let remainingWaste = estimatedWaste;
                    if (modifiedPlayer.gold >= remainingWaste) {
                        modifiedPlayer.gold -= remainingWaste;
                    } else {
                        remainingWaste -= modifiedPlayer.gold;
                        modifiedPlayer.gold = 0;
                        modifiedPlayer.bankGold = Math.max(0, modifiedPlayer.bankGold - remainingWaste);
                    }
                } else {
                    // Normal deduction
                    if (modifiedPlayer.gold >= estimatedWaste) {
                        modifiedPlayer.gold -= estimatedWaste;
                    } else {
                        const remainder = estimatedWaste - modifiedPlayer.gold;
                        modifiedPlayer.gold = 0;
                        modifiedPlayer.bankGold -= remainder;
                    }
                }
                report.waste = estimatedWaste;

                // 4. Grant Loot
                const lootSummary: {[key:string]: number} = {};
                
                if (totalKills > 0) {
                    report.killedMonsters.push({ name: monster.name, count: totalKills });

                    // Calculate Loot Modifiers
                    let lootMult = 1;
                    // FIX: Added '&& s.active' to ensure only active preys count for offline loot
                    const activePrey = modifiedPlayer.prey.slots.find(s => s.monsterId === monster.id && s.active);
                    if (activePrey && activePrey.bonusType === 'loot') lootMult += (activePrey.bonusValue / 100);
                    
                    lootMult += (getAscensionBonusValue(modifiedPlayer, 'loot_boost') / 100);
                    if (modifiedPlayer.premiumUntil > now) lootMult += 0.05;
                    const isBoss = !!(monster as any).cooldownSeconds;
                    const hazardLoot = isBoss ? 0 : (modifiedPlayer.activeHazardLevel || 0);
                    lootMult += (hazardLoot / 100);
                    
                    const GLOBAL_DROP_RATE = 1.5; 

                    if (monster.lootTable) {
                        monster.lootTable.forEach(drop => {
                            // SKIP IF MARKED AS IGNORED
                            if (modifiedPlayer.skippedLoot && modifiedPlayer.skippedLoot.includes(drop.itemId)) return;

                            // Expected drops = Kills * Chance * Multipliers * AvgAmount
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

                // 5. Check Level Ups
                const startLevel = modifiedPlayer.level;
                const lvlResult = checkForLevelUp(modifiedPlayer);
                modifiedPlayer = lvlResult.player;
                const endLevel = modifiedPlayer.level;
                report.leveledUp = endLevel - startLevel;
            }

            if (diffSeconds >= MAX_OFFLINE_SEC) {
                stopHunt = true;
            } else {
                modifiedPlayer.activeHuntStartTime = Date.now();
            }

        // --- TRAINING OFFLINE ---
        } else if (modifiedPlayer.activeTrainingSkill) {
            const skill = modifiedPlayer.activeTrainingSkill;
            let pointsGained = effectiveTime; 
            
            if (skill === SkillType.MAGIC) {
                pointsGained *= 25; // Magic takes more "points" per second implicitly in formula
            }
            
            // Snapshot progress
            const startLevel = modifiedPlayer.skills[skill].level;
            const startPct = modifiedPlayer.skills[skill].progress;
            
            // Apply
            const result = processSkillTraining(modifiedPlayer, skill, pointsGained);
            modifiedPlayer = result.player;
            
            // Calculate delta for report
            const endLevel = modifiedPlayer.skills[skill].level;
            const endPct = modifiedPlayer.skills[skill].progress;
            
            // Simple visual approximation of "levels gained" or "percent gained"
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
