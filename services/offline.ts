
import { Player, SkillType, Vocation, OfflineReport, ImbuType, DeathReport } from '../types';
import { MONSTERS, SHOP_ITEMS, getXpForLevel, REGEN_RATES } from '../constants';
import { estimateHuntStats, getAscensionBonusValue, getEffectiveMaxHp, getEffectiveMaxMana } from './mechanics';
import { processSkillTraining, checkForLevelUp } from './progression';

const MAX_OFFLINE_SEC = 24 * 3600; // Aumentado para 24 Horas no modelo Server-Authoritative

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

    // Apenas processa se passou mais de 10 segundos para evitar micro-updates
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
                        hpsPotion = (potion.restoreAmount * boost) / 1.5; // Consumo conservador offline
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
                    if (!itemId || usagePerHour <= 0) return MAX_OFFLINE_SEC * 2;
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

                // Processa Morte se necessário
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

                // Aplica Ganhos
                const hoursPassed = effectiveTime / 3600;
                const xpGained = Math.floor(stats.xpPerHour * hoursPassed);
                const goldGained = Math.floor(stats.rawGoldPerHour * hoursPassed);
                
                modifiedPlayer.currentXp += xpGained;
                modifiedPlayer.gold += goldGained;
                report.xpGained = xpGained;
                report.goldGained = goldGained;
                report.killedMonsters.push({ name: monster.name, count: Math.floor(stats.cyclesPerHour * hoursPassed * huntCount) });

                // Sobe de nível se necessário
                const startLevel = modifiedPlayer.level;
                const lvlResult = checkForLevelUp(modifiedPlayer);
                modifiedPlayer = lvlResult.player;
                report.leveledUp = modifiedPlayer.level - startLevel;
            }
        } else if (modifiedPlayer.activeTrainingSkill) {
            const skill = modifiedPlayer.activeTrainingSkill;
            let pointsGained = effectiveTime; 
            if (skill === SkillType.MAGIC) pointsGained *= 25; 
            const result = processSkillTraining(modifiedPlayer, skill, pointsGained);
            modifiedPlayer = result.player;
            report.skillTrained = skill;
            report.skillGain = (effectiveTime / 3600) * 100; // Representação visual
        }

        // Atualiza o timestamp para o tempo atual do servidor
        modifiedPlayer.lastSaveTime = currentTime;
    }

    return { player: modifiedPlayer, report, stopHunt, stopTrain };
};
