
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity, ImbuType } from '../types';
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
    bossDefeatedId?: string;
    activeMonster: Monster | undefined;
    killedMonsters: { name: string, count: number }[];
    triggers: {
        tutorial?: 'mob' | 'item' | 'ascension' | 'level12';
        oracle?: boolean;
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
    const hit = (val: number | string, type: HitSplat['type'], target: 'player'|'monster') => {
        hits.push({ id: now + Math.random(), value: val, type, target });
    };

    let p = { ...player };
    let stopHunt = false;
    let stopTrain = false;
    let bossDefeatedId: string | undefined = undefined;
    let monsterHp = currentMonsterHp;

    const maxHp = getEffectiveMaxHp(p);
    const maxMana = getEffectiveMaxMana(p);

    // --- IMBUEMENT TIMER TICK ---
    if (p.imbuActive) {
        Object.keys(p.imbuements).forEach(key => {
            const imbu = p.imbuements[key as ImbuType];
            if (imbu.tier > 0 && imbu.timeRemaining > 0) {
                imbu.timeRemaining = Math.max(0, imbu.timeRemaining - 1);
                if (imbu.timeRemaining === 0) {
                    imbu.tier = 0;
                    log(`Your ${key.replace('_', ' ')} imbuement has expired!`, 'danger');
                }
            }
        });
    }

    const applyLeech = (dmg: number) => {
        if (!p.imbuActive || dmg <= 0) return;
        const ls = p.imbuements[ImbuType.LIFE_STEAL];
        if (ls.tier > 0 && ls.timeRemaining > 0) {
            const heal = Math.ceil(dmg * (ls.tier * 0.05)); 
            if (heal > 0) {
                p.hp = Math.min(maxHp, p.hp + heal);
                hit(heal, 'heal', 'player'); 
            }
        }
        const ml = p.imbuements[ImbuType.MANA_LEECH];
        if (ml.tier > 0 && ml.timeRemaining > 0) {
            const manaGain = Math.ceil(dmg * (ml.tier * 0.05));
            if (manaGain > 0) {
                p.mana = Math.min(maxMana, p.mana + manaGain);
                hit(manaGain, 'mana', 'player');
            }
        }
    };

    const huntId = activeHuntId;
    const settingsHuntCount = p.activeHuntCount || 1;
    
    p = processRegeneration(p, activeHuntId);
    const autoRes = processAutomation(p, now, log, hit);
    p = autoRes.player;
    stats.waste += autoRes.waste;

    if (activeTrainingSkill) {
        p = processTraining(p, activeTrainingSkill, log, hit);
    }

    if (huntId) {
        const baseMonster = MONSTERS.find(m => m.id === huntId) || BOSSES.find(b => b.id === huntId);
        const canSpawn = now > respawnUnlockTime;
        const needsSpawn = !currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0;

        if (needsSpawn && canSpawn && baseMonster) {
            const instanceId = `${baseMonster.id}-${now}-${Math.random().toString(36).substr(2, 5)}`;
            const isBoss = !!(baseMonster as Boss).cooldownSeconds;

            if (!isBoss && (p.level >= 12) && (p.gmExtra?.forceRarity || Math.random() < 0.04)) {
                currentMonsterInstance = createInfluencedMonster(baseMonster, p.gmExtra?.forceRarity);
                currentMonsterInstance.guid = instanceId;
                currentMonsterInstance.spawnTime = now;
                monsterHp = currentMonsterInstance.maxHp;
                if (!p.tutorials.seenRareMob) triggers.tutorial = 'mob';
            } else {
                currentMonsterInstance = { ...baseMonster, guid: instanceId, spawnTime: now };
                monsterHp = currentMonsterInstance.maxHp * settingsHuntCount;
            }
        }

        const monster = (monsterHp > 0) ? currentMonsterInstance : undefined;
        const SPAWN_DELAY_MS = 600;
        const isSpawning = monster && monster.spawnTime && (now - monster.spawnTime < SPAWN_DELAY_MS);

        if (monster && !isSpawning) {
            const effectiveHuntCount = monster.isInfluenced ? 1 : settingsHuntCount;
            const hazard = !!(monster as Boss).cooldownSeconds ? 0 : (p.activeHazardLevel || 0);

            if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
                lastMonsterAttackTime = now;
                const rawDmgBase = Math.floor(Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin;
                let difficultyMult = 1 + ((effectiveHuntCount - 1) * 0.015);
                let totalIncomingRaw = Math.floor((rawDmgBase * effectiveHuntCount) * difficultyMult * (1 + (hazard * 0.01)));
                
                const mitigation = calculatePlayerDefense(p);
                let actualDmg = Math.max(0, Math.floor(totalIncomingRaw - mitigation));
                
                const activePreyDef = p.prey.slots.find(s => s.monsterId === monster.id && s.active && s.bonusType === 'defense');
                if (activePreyDef && actualDmg > 0) actualDmg = Math.floor(actualDmg * (1 - (activePreyDef.bonusValue / 100)));

                if (actualDmg > 0) {
                    if (p.magicShieldUntil && p.magicShieldUntil > now) {
                        const manaDmg = Math.floor(actualDmg * 0.70);
                        let hpDmg = Math.floor(actualDmg * 0.30);
                        if (p.mana >= manaDmg) p.mana -= manaDmg; else { const spill = manaDmg - p.mana; p.mana = 0; hpDmg += spill; }
                        p.hp -= hpDmg;
                    } else p.hp -= actualDmg;
                    hit(actualDmg, 'damage', 'player');

                    if (p.hp <= 0) {
                        stopHunt = true;
                        p.hp = maxHp;
                        p.activeHuntId = null;
                        log('You died!', 'danger');
                        return { player: p, monsterHp: 0, newLogs: logs, newHits: hits, stopHunt: true, stopTrain: false, activeMonster: undefined, killedMonsters, triggers, stats };
                    }
                } else hit('Miss', 'miss', 'player');
            }

            let autoAttackDamage = calculatePlayerDamage(p);
            if (autoAttackDamage > 0) {
                monsterHp -= autoAttackDamage;
                hit(autoAttackDamage, 'damage', 'monster');
                applyLeech(autoAttackDamage);
                
                const usedSkill = p.equipment[EquipmentSlot.HAND_RIGHT]?.scalingStat || SkillType.FIST;
                const skillRes = processSkillTraining(p, usedSkill, 1);
                p = skillRes.player;
            }

            if (monsterHp <= 0) {
                killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
                const goldDrop = Math.floor((Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold) * effectiveHuntCount;
                const xpGained = Math.floor(monster.exp * effectiveHuntCount * getXpStageMultiplier(p.level));
                
                p.currentXp += xpGained;
                stats.xpGained += xpGained;
                const levelResult = checkForLevelUp(p); p = levelResult.player;
                p.gold += goldDrop;
                stats.goldGained += goldDrop;
                stats.profitGained += goldDrop;

                const drop = generateLootWithRarity(monster, getAscensionBonusValue(p, 'loot_boost'));
                Object.entries(drop.standard).forEach(([itemId, qty]) => {
                   p.inventory[itemId] = (p.inventory[itemId] || 0) + qty;
                });
                if (drop.unique.length > 0) p.uniqueInventory = [...(p.uniqueInventory || []), ...drop.unique];

                if ((monster as Boss).cooldownSeconds) {
                    bossDefeatedId = monster.id;
                    stopHunt = true; 
                }
                monsterHp = 0; 
                respawnUnlockTime = now + 500; 
            }
        }
    }

    const returnInstance = (monsterHp > 0 || (currentMonsterInstance && now <= respawnUnlockTime)) ? currentMonsterInstance : undefined;

    return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, bossDefeatedId, activeMonster: returnInstance, killedMonsters, triggers, stats };
};
