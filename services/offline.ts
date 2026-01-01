
import { Player, SkillType, Vocation, OfflineReport, ImbuType, DeathReport } from '../types';
import { MONSTERS, SHOP_ITEMS, getXpForLevel, REGEN_RATES } from '../constants';
import { estimateHuntStats, getAscensionBonusValue, getEffectiveMaxHp, getEffectiveMaxMana } from './mechanics';
import { processSkillTraining, checkForLevelUp } from './progression';

// Limites estritos conforme solicitado
const MAX_HUNT_OFFLINE_SEC = 6 * 60 * 60; // 6 Horas
const MAX_TRAIN_OFFLINE_SEC = 4 * 60 * 60; // 4 Horas

export const calculateOfflineProgress = (
    player: Player, 
    lastSaveTime: number,
    currentTime: number = Date.now()
): { player: Player, report: OfflineReport | null, stopHunt: boolean, stopTrain: boolean } => {
    
    if (!lastSaveTime || lastSaveTime > currentTime) {
        return { player: { ...player, lastSaveTime: currentTime }, report: null, stopHunt: false, stopTrain: false };
    }

    const diffSeconds = (currentTime - lastSaveTime) / 1000;
    
    let modifiedPlayer = { ...player };
    let report: OfflineReport | null = null;
    let stopHunt = false;
    let stopTrain = false;

    // Apenas processa se passou mais de 10 segundos
    if (diffSeconds > 10) {
        // Determinar o limite baseado na atividade
        let limit = 0;
        if (modifiedPlayer.activeHuntId) limit = MAX_HUNT_OFFLINE_SEC;
        else if (modifiedPlayer.activeTrainingSkill) limit = MAX_TRAIN_OFFLINE_SEC;
        else limit = 2 * 3600; // 2 horas de regen passiva se não estiver fazendo nada

        let effectiveTime = Math.min(diffSeconds, limit);
        let diedOffline = false;
        
        report = {
            secondsOffline: effectiveTime, 
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
                
                // --- SURVIVAL CHECK ---
                const monsterDPS = ((monster.damageMin + monster.damageMax) / 2) * huntCount / (monster.attackSpeedMs / 1000);
                let armorTotal = 0;
                Object.values(modifiedPlayer.equipment).forEach(i => { if (i && i.armor) armorTotal += i.armor; });
                const mitigation = armorTotal * 0.8;
                
                const baseRegen = REGEN_RATES[modifiedPlayer.vocation] || REGEN_RATES[Vocation.NONE];
                const regenMult = modifiedPlayer.promoted ? 1.8 : 1.0;
                const hpsRegen = baseRegen.hp * regenMult;
                
                let hpsPotion = 0;
                if (modifiedPlayer.settings.selectedHealthPotionId) {
                    const potion = SHOP_ITEMS.find(i => i.id === modifiedPlayer.settings.selectedHealthPotionId);
                    if (potion && potion.restoreAmount) {
                        const boost = 1 + (getAscensionBonusValue(modifiedPlayer, 'potion_hp_boost') / 100);
                        hpsPotion = (potion.restoreAmount * boost) / 1.5; 
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

                // --- SUPPLY LIMIT CHECK ---
                const checkResource = (itemId: string | undefined, usagePerHour: number) => {
                    if (!itemId || usagePerHour <= 0) return effectiveTime + 1000;
                    const inventoryCount = modifiedPlayer.inventory[itemId] || 0;
                    const itemPrice = SHOP_ITEMS.find(i => i.id === itemId)?.price || 999999;
                    const totalGold = modifiedPlayer.gold + modifiedPlayer.bankGold;
                    const affordableCount = Math.floor(totalGold / itemPrice);
                    const hoursOnGold = (inventoryCount + affordableCount) / usagePerHour;
                    return hoursOnGold * 3600; 
                };

                const supplyLimit = Math.min(
                    checkResource(stats.ammoId, stats.ammoUsagePerHour),
                    checkResource(stats.runeId, stats.runeUsagePerHour),
                    checkResource(stats.healthPotionId, stats.healthPotionUsagePerHour),
                    checkResource(stats.manaPotionId, stats.manaPotionUsagePerHour)
                );
                
                if (supplyLimit < effectiveTime) {
                    effectiveTime = supplyLimit;
                    diedOffline = false;
                    stopHunt = true;
                }

                report.secondsOffline = effectiveTime; 

                // Processa Morte
                if (diedOffline) {
                    let penaltyRate = 0.10; 
                    if (modifiedPlayer.hasBlessing) { 
                        penaltyRate = 0.04; 
                        modifiedPlayer.hasBlessing = false; 
                    }
                    const xpLoss = Math.floor(modifiedPlayer.maxXp * penaltyRate);
                    const goldLoss = Math.floor(modifiedPlayer.gold * penaltyRate);
                    modifiedPlayer.currentXp = Math.max(0, modifiedPlayer.currentXp - xpLoss);
                    modifiedPlayer.gold = Math.max(0, modifiedPlayer.gold - goldLoss);
                    modifiedPlayer.hp = getEffectiveMaxHp(modifiedPlayer);
                    modifiedPlayer.mana = getEffectiveMaxMana(modifiedPlayer);
                    
                    report.deathReport = {
                        xpLoss, goldLoss, levelDown: false, 
                        vocation: modifiedPlayer.vocation, killerName: monster.name, hasBlessing: !modifiedPlayer.hasBlessing
                    };
                }

                // Aplica Ganhos Capped
                const hoursPassed = effectiveTime / 3600;
                const xpGained = Math.floor(stats.xpPerHour * hoursPassed);
                const goldGained = Math.floor(stats.rawGoldPerHour * hoursPassed);
                
                modifiedPlayer.currentXp += xpGained;
                modifiedPlayer.gold += goldGained;
                report.xpGained = xpGained;
                report.goldGained = goldGained;
                report.killedMonsters.push({ name: monster.name, count: Math.floor(stats.cyclesPerHour * hoursPassed * huntCount) });

                const startLevel = modifiedPlayer.level;
                const lvlResult = checkForLevelUp(modifiedPlayer);
                modifiedPlayer = lvlResult.player;
                report.leveledUp = modifiedPlayer.level - startLevel;
                
                if (effectiveTime >= MAX_HUNT_OFFLINE_SEC) stopHunt = true;

            }
        } else if (modifiedPlayer.activeTrainingSkill) {
            const skillType = modifiedPlayer.activeTrainingSkill;
            const startSkillLevel = modifiedPlayer.skills[skillType].level;

            let pointsGained = effectiveTime; 
            if (skillType === SkillType.MAGIC) pointsGained *= 25; 
            
            const result = processSkillTraining(modifiedPlayer, skillType, pointsGained);
            modifiedPlayer = result.player;
            
            report.skillTrained = skillType;
            report.skillLevelsGained = modifiedPlayer.skills[skillType].level - startSkillLevel;
            report.skillFinalProgress = modifiedPlayer.skills[skillType].progress;
            
            if (effectiveTime >= MAX_TRAIN_OFFLINE_SEC) stopTrain = true;
        }

        if (diffSeconds > (modifiedPlayer.activeHuntId ? MAX_HUNT_OFFLINE_SEC : MAX_TRAIN_OFFLINE_SEC)) {
            if (modifiedPlayer.activeHuntId) stopHunt = true;
            if (modifiedPlayer.activeTrainingSkill) stopTrain = true;
        }

        modifiedPlayer.lastSaveTime = currentTime;
    }

    return { player: modifiedPlayer, report, stopHunt, stopTrain };
};
