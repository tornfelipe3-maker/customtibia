
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
let lastPlayerAttackTime: number = 0; // Adicionado timer global para ataque básico

export const resetCombatState = () => {
    currentMonsterInstance = undefined;
    respawnUnlockTime = 0;
    lastMonsterAttackTime = 0;
    lastPlayerAttackTime = 0;
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

    // --- IMBUEMENT TICK ---
    if (p.imbuActive) {
        Object.keys(p.imbuements).forEach(key => {
            const imbu = p.imbuements[key as ImbuType];
            if (imbu.tier > 0 && imbu.timeRemaining > 0) {
                imbu.timeRemaining = Math.max(0, imbu.timeRemaining - 1);
            }
        });
    }

    const applyLeech = (dmg: number) => {
        if (!p.imbuActive || dmg <= 0) return;
        const ls = p.imbuements[ImbuType.LIFE_STEAL];
        if (ls.tier > 0 && ls.timeRemaining > 0) {
            const heal = Math.ceil(dmg * (ls.tier * 0.05)); 
            if (heal > 0) { p.hp = Math.min(maxHp, p.hp + heal); hit(heal, 'heal', 'player'); }
        }
        const ml = p.imbuements[ImbuType.MANA_LEECH];
        if (ml.tier > 0 && ml.timeRemaining > 0) {
            const manaGain = Math.ceil(dmg * (ml.tier * 0.05));
            if (manaGain > 0) { p.mana = Math.min(maxMana, p.mana + manaGain); hit(manaGain, 'mana', 'player'); }
        }
    };

    p = processRegeneration(p, activeHuntId);
    const autoRes = processAutomation(p, now, log, hit);
    p = autoRes.player;
    stats.waste += autoRes.waste;

    if (activeTrainingSkill) {
        p = processTraining(p, activeTrainingSkill, log, hit);
    }

    if (activeHuntId) {
        const baseMonster = MONSTERS.find(m => m.id === activeHuntId) || BOSSES.find(b => b.id === activeHuntId);
        const canSpawn = now > respawnUnlockTime;
        const needsSpawn = !currentMonsterInstance || currentMonsterInstance.id !== activeHuntId || monsterHp <= 0;

        if (needsSpawn && canSpawn && baseMonster) {
            currentMonsterInstance = { ...baseMonster, guid: `${baseMonster.id}-${now}`, spawnTime: now };
            monsterHp = currentMonsterInstance.maxHp * (p.activeHuntCount || 1);
        }

        const monster = (monsterHp > 0) ? currentMonsterInstance : undefined;

        if (monster && (!monster.spawnTime || now - monster.spawnTime > 600)) {
            const effectiveHuntCount = p.activeHuntCount || 1;

            // --- MONSTER ATTACK ---
            if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
                lastMonsterAttackTime = now;
                const rawDmg = Math.floor(Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin;
                const totalIncoming = Math.floor(rawDmg * effectiveHuntCount * (1 + ((p.activeHazardLevel || 0) * 0.01)));
                
                const mitigation = calculatePlayerDefense(p);
                let actualDmg = Math.max(0, totalIncoming - mitigation);
                
                if (actualDmg > 0) {
                    p.hp -= actualDmg;
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

            // --- PLAYER BASIC ATTACK (SWING TIMER 2s) ---
            if (now >= lastPlayerAttackTime + 2000) {
                lastPlayerAttackTime = now;
                let autoAttackDamage = calculatePlayerDamage(p);
                if (autoAttackDamage > 0) {
                    monsterHp -= autoAttackDamage;
                    hit(autoAttackDamage, 'damage', 'monster');
                    applyLeech(autoAttackDamage);
                    
                    const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
                    if (weapon?.manaCost && weapon.manaCost > 0) p.mana = Math.max(0, p.mana - weapon.manaCost);

                    const usedSkill = weapon?.scalingStat || SkillType.FIST;
                    p = processSkillTraining(p, usedSkill, 1).player;
                }
            }

            // --- AUTO SPELL ATTACK ---
            if (p.settings.autoAttackSpell && (p.attackCooldown || 0) <= now) {
                const rotation = p.settings.attackSpellRotation?.length ? p.settings.attackSpellRotation : [p.settings.selectedAttackSpellId];
                
                for (const spellId of rotation) {
                    if (!spellId) continue;
                    const spell = SPELLS.find(s => s.id === spellId);
                    if (spell && p.purchasedSpells.includes(spell.id) && p.mana >= spell.manaCost && (p.spellCooldowns[spell.id] || 0) <= now) {
                        const spellDmg = calculateSpellDamage(p, spell);
                        monsterHp -= spellDmg;
                        p.mana -= spell.manaCost;
                        p.spellCooldowns[spell.id] = now + (spell.cooldown || 2000);
                        p.attackCooldown = now + 2000;
                        
                        hit(spellDmg, 'damage', 'monster');
                        const incantation = spell.name.match(/\((.*?)\)/)?.[1] || spell.name;
                        hit(incantation, 'speech', 'player');
                        applyLeech(spellDmg);
                        p = processSkillTraining(p, SkillType.MAGIC, spell.manaCost).player;
                        break;
                    }
                }
            }

            // --- AUTO RUNE ATTACK ---
            if (p.settings.autoAttackRune && p.settings.selectedRuneId && (p.runeCooldown || 0) <= now) {
                const runeItem = SHOP_ITEMS.find(i => i.id === p.settings.selectedRuneId);
                if (runeItem && (p.inventory[runeItem.id] || 0) > 0) {
                    const runeDmg = calculateRuneDamage(p, runeItem);
                    monsterHp -= runeDmg;
                    p.inventory[runeItem.id]--;
                    p.runeCooldown = now + 1000;
                    
                    hit(runeDmg, 'damage', 'monster');
                    applyLeech(runeDmg);
                    p = processSkillTraining(p, SkillType.MAGIC, 10).player;
                }
            }

            if (monsterHp <= 0) {
                killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
                const xp = Math.floor(monster.exp * effectiveHuntCount * getXpStageMultiplier(p.level));
                p.currentXp += xp;
                stats.xpGained += xp;
                p = checkForLevelUp(p).player;
                
                const gold = Math.floor((Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold) * effectiveHuntCount;
                p.gold += gold;
                stats.goldGained += gold;
                stats.profitGained += gold;

                const drop = generateLootWithRarity(monster, getAscensionBonusValue(p, 'loot_boost'));
                Object.entries(drop.standard).forEach(([id, qty]) => p.inventory[id] = (p.inventory[id] || 0) + qty);
                if (drop.unique.length > 0) p.uniqueInventory = [...(p.uniqueInventory || []), ...drop.unique];

                if ((monster as Boss).cooldownSeconds) bossDefeatedId = monster.id;
                monsterHp = 0; 
                respawnUnlockTime = now + 500; 
            }
        }
    }

    return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, bossDefeatedId, activeMonster: monsterHp > 0 ? currentMonsterInstance : undefined, killedMonsters, triggers, stats };
};
