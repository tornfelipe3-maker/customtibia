
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity, ImbuType, DeathReport } from '../types';
import { MONSTERS, BOSSES, SHOP_ITEMS, SPELLS, QUESTS, getXpForLevel, MAX_BACKPACK_SLOTS } from '../constants'; 
import { calculatePlayerDamage, calculateSpellDamage, calculateRuneDamage, calculatePlayerDefense } from './combat';
import { processSkillTraining, checkForLevelUp, getEffectiveSkill } from './progression';
import { getXpStageMultiplier, createInfluencedMonster, getAscensionBonusValue, getPlayerModifier, getEffectiveMaxHp, getEffectiveMaxMana } from './mechanics';
import { generateLootWithRarity, calculateLootValue } from './loot'; 

import { processRegeneration } from './tick/regeneration';
import { processAutomation } from './tick/automation';
import { processTraining } from './tick/training';

const MAX_HUNT_ONLINE_MS = 6 * 60 * 60 * 1000;
const MAX_TRAIN_ONLINE_MS = 4 * 60 * 60 * 1000;

export interface GameTickResult {
    player: Player;
    monsterHp: number;
    newLogs: LogEntry[];
    newHits: HitSplat[];
    stopHunt: boolean;
    stopTrain: boolean;
    leveledUp: boolean;      // Nova flag
    skillLeveledUp: boolean; // Nova flag
    bossDefeatedId?: string;
    activeMonster: Monster | undefined;
    killedMonsters: { name: string, count: number }[];
    triggers: {
        tutorial?: 'mob' | 'item' | 'ascension' | 'level12';
        oracle?: boolean;
        death?: DeathReport;
    };
    stats: {
        xpGained: number;
        goldGained: number;
        profitGained: number;
        waste: number;
    };
}

let currentMonsterInstance: Monster | undefined = undefined;
let respawnUnlockTime: number = 0;
let lastMonsterAttackTime: number = 0; 

export const resetCombatState = () => {
    currentMonsterInstance = undefined;
    respawnUnlockTime = 0;
    lastMonsterAttackTime = 0;
};

export const processGameTick = (
    player: Player,
    activeHuntId: string | null,
    activeTrainingSkill: SkillType | null,
    currentMonsterHp: number,
    now: number
): GameTickResult => {
    
    const logs: LogEntry[] = [];
    const hits: HitSplat[] = [];
    const killedMonsters: { name: string, count: number }[] = [];
    const triggers: GameTickResult['triggers'] = {};
    const stats = { xpGained: 0, goldGained: 0, profitGained: 0, waste: 0 };
    
    const log = (msg: string, type: LogEntry['type'] = 'info', rarity?: Rarity) => {
        logs.push({ id: Math.random().toString(36).substr(2, 9), message: msg, type, timestamp: now, rarity });
    };
    const hit = (val: number | string, type: HitSplat['type'], target: 'player'|'monster', source?: HitSplat['source']) => {
        hits.push({ id: now + Math.random(), value: val, type, target, source });
    };

    let p = { ...player };
    let stopHunt = false;
    let stopTrain = false;
    let leveledUp = false;
    let skillLeveledUp = false;
    let bossDefeatedId: string | undefined = undefined;
    let monsterHp = currentMonsterHp;

    const effMaxHp = getEffectiveMaxHp(p);
    const effMaxMana = getEffectiveMaxMana(p);

    // --- TURN DAMAGE ACCUMULATORS ---
    let totalHealValue = 0;
    let totalManaValue = 0;

    // --- IMBUEMENT TIMER TICK ---
    if (p.imbuActive && p.imbuements) {
        Object.keys(p.imbuements).forEach(key => {
            const imbu = p.imbuements[key as ImbuType];
            if (imbu && imbu.tier > 0 && imbu.timeRemaining > 0) {
                imbu.timeRemaining = Math.max(0, imbu.timeRemaining - 1);
                if (imbu.timeRemaining === 0) {
                    imbu.tier = 0;
                    log(`Your ${key.replace('_', ' ')} imbuement has expired!`, 'danger');
                }
            }
        });
    }

    // --- HELPER: APPLY IMBUEMENT LEECH ---
    const applyLeech = (dmg: number) => {
        if (!p.imbuActive || !p.imbuements || dmg <= 0) return;

        const ls = p.imbuements[ImbuType.LIFE_STEAL];
        if (ls && ls.tier > 0 && ls.timeRemaining > 0) {
            const heal = Math.ceil(dmg * (ls.tier * 0.05)); 
            if (heal > 0) {
                p.hp = Math.min(effMaxHp, p.hp + heal);
                totalHealValue += heal;
            }
        }

        const ml = p.imbuements[ImbuType.MANA_LEECH];
        if (ml && ml.tier > 0 && ml.timeRemaining > 0) {
            const manaGain = Math.ceil(dmg * (ml.tier * 0.05));
            if (manaGain > 0) {
                p.mana = Math.min(effMaxMana, p.mana + manaGain);
                totalManaValue += manaGain;
            }
        }
    };

    const huntId = activeHuntId;
    const settingsHuntCount = p.activeHuntCount || 1;
    
    // TUTORIAL TRIGGERS
    if (p.level >= 12 && !p.tutorials.seenLevel12) {
        p.tutorials.seenLevel12 = true; 
        triggers.tutorial = 'level12';
    }

    if (p.level >= 30 && !p.tutorials.seenAscension) {
        p.tutorials.seenAscension = true; 
        triggers.tutorial = 'ascension';
    }

    if (huntId && p.activeHuntStartTime > 0 && (now - p.activeHuntStartTime > MAX_HUNT_ONLINE_MS)) {
        stopHunt = true;
        log("Exhausted! You have stopped hunting after 6 hours online.", 'danger');
        return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, leveledUp, skillLeveledUp, activeMonster: currentMonsterInstance, killedMonsters, triggers, stats };
    }
    if (activeTrainingSkill && p.activeTrainingStartTime > 0 && (now - p.activeTrainingStartTime > MAX_TRAIN_ONLINE_MS)) {
        stopTrain = true;
        log("Exhausted! You have stopped training after 4 hours online.", 'danger');
        return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, leveledUp, skillLeveledUp, activeMonster: currentMonsterInstance, killedMonsters, triggers, stats };
    }

    p = processRegeneration(p, activeHuntId);
    
    const autoRes = processAutomation(p, now, log, hit);
    if (autoRes.player.skills[SkillType.MAGIC].level > p.skills[SkillType.MAGIC].level) skillLeveledUp = true;
    p = autoRes.player;
    stats.waste += autoRes.waste;
    totalHealValue += autoRes.totalHeal;
    totalManaValue += autoRes.totalMana;

    if (activeTrainingSkill) {
        const startSkillLvl = p.skills[activeTrainingSkill].level;
        const trainRes = processTraining(p, activeTrainingSkill, log, hit);
        if (trainRes.skills[activeTrainingSkill].level > startSkillLvl) skillLeveledUp = true;
        p = trainRes;
    }

    if (huntId) {
        const baseMonster = MONSTERS.find(m => m.id === huntId) || BOSSES.find(b => b.id === huntId);
        const canSpawn = now > respawnUnlockTime;
        const needsSpawn = !currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0;

        if (needsSpawn && canSpawn) {
            if (baseMonster) {
                const forcedType = p.gmExtra?.forceRarity;
                const instanceId = `${baseMonster.id}-${now}-${Math.random().toString(36).substr(2, 5)}`;
                const isBoss = !!(baseMonster as Boss).cooldownSeconds;

                if (!isBoss && (p.level >= 12) && (forcedType || Math.random() < 0.005)) {
                    currentMonsterInstance = createInfluencedMonster(baseMonster, forcedType);
                    currentMonsterInstance.guid = instanceId;
                    currentMonsterInstance.spawnTime = now;
                    log(`Warning! A ${currentMonsterInstance.name} appeared!`, 'danger');
                    monsterHp = currentMonsterInstance.maxHp;
                } else {
                    currentMonsterInstance = { ...baseMonster, guid: instanceId, spawnTime: now };
                    monsterHp = currentMonsterInstance.maxHp * settingsHuntCount;
                }
            }
        }

        const monster = (monsterHp > 0) ? currentMonsterInstance : undefined;
        const isSpawning = monster && monster.spawnTime && (now - monster.spawnTime < 600);

        if (monster && !isSpawning) {
            const effectiveHuntCount = monster.isInfluenced ? 1 : settingsHuntCount;

            // --- MONSTER ATTACK TURN ---
            if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
                lastMonsterAttackTime = now;
                const mitigation = calculatePlayerDefense(p);
                let rawDmg = Math.floor(Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin;
                let actualDmg = Math.max(0, Math.floor((rawDmg * effectiveHuntCount) - mitigation));

                const startShieldLvl = p.skills[SkillType.DEFENSE].level;
                const defRes = processSkillTraining(p, SkillType.DEFENSE, 1);
                if (defRes.player.skills[SkillType.DEFENSE].level > startShieldLvl) skillLeveledUp = true;
                p = defRes.player;

                if (actualDmg > 0) {
                    p.hp -= actualDmg;
                    hit(actualDmg, 'damage', 'player');
                    if (p.hp <= 0) {
                        let penaltyRate = 0.10; 
                        if (p.hasBlessing) { penaltyRate = 0.04; p.hasBlessing = false; }
                        const xpLoss = Math.floor(p.maxXp * penaltyRate);
                        const goldLoss = Math.floor(p.gold * penaltyRate);
                        p.currentXp = Math.max(0, p.currentXp - xpLoss);
                        p.gold = Math.max(0, p.gold - goldLoss);
                        p.hp = getEffectiveMaxHp(p); p.mana = getEffectiveMaxMana(p);
                        p.activeHuntId = null; stopHunt = true;
                        triggers.death = { xpLoss, goldLoss, levelDown: false, vocation: p.vocation, killerName: monster.name, hasBlessing: !p.hasBlessing };
                        return { player: p, monsterHp: 0, newLogs: logs, newHits: hits, stopHunt: true, stopTrain: false, leveledUp: false, skillLeveledUp: false, activeMonster: undefined, killedMonsters, triggers, stats };
                    }
                }
            }

            // --- PLAYER ATTACK TURN ---
            const autoAttackDamage = calculatePlayerDamage(p);
            const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
            const stat = weapon?.scalingStat || SkillType.FIST;
            
            const startAtkLvl = p.skills[stat].level;
            const atkRes = processSkillTraining(p, stat, 1);
            if (atkRes.player.skills[stat].level > startAtkLvl) skillLeveledUp = true;
            p = atkRes.player;

            if (autoAttackDamage > 0) {
                monsterHp -= autoAttackDamage;
                hit(autoAttackDamage, 'damage', 'monster', 'basic');
                applyLeech(autoAttackDamage);
            }

            if (monsterHp <= 0) {
                killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
                const goldDrop = Math.floor(Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold;
                const xpMultiplier = getXpStageMultiplier(p.level) * (p.stamina > 0 ? 1.5 : 1.0);
                const xpGained = Math.floor(monster.exp * effectiveHuntCount * xpMultiplier);
                
                p.currentXp += xpGained;
                p.gold += goldDrop * effectiveHuntCount;
                stats.xpGained += xpGained;
                stats.goldGained += goldDrop * effectiveHuntCount;

                const lvlRes = checkForLevelUp(p);
                if (lvlRes.leveledUp) leveledUp = true;
                p = lvlRes.player;
                
                monsterHp = 0; respawnUnlockTime = now + 500;
            }
        }
    }

    if (totalHealValue > 0) hit(`+${totalHealValue}`, 'heal', 'player');
    if (totalManaValue > 0) hit(`+${totalManaValue}`, 'mana', 'player');

    return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, leveledUp, skillLeveledUp, activeMonster: (monsterHp > 0) ? currentMonsterInstance : undefined, killedMonsters, triggers, stats };
};
