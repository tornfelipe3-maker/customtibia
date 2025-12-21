
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity, ImbuType, DeathReport } from '../types';
import { MONSTERS, BOSSES, SHOP_ITEMS, SPELLS, QUESTS, getXpForLevel, MAX_BACKPACK_SLOTS } from '../constants'; 
import { calculatePlayerDamage, calculateSpellDamage, calculateRuneDamage, calculatePlayerDefense } from './combat';
import { processSkillTraining, checkForLevelUp, getEffectiveSkill } from './progression';
import { getXpStageMultiplier, createInfluencedMonster, getAscensionBonusValue, getPlayerModifier } from './mechanics';
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
    let bossDefeatedId: string | undefined = undefined;
    let monsterHp = currentMonsterHp;

    // --- ACCUMULATORS FOR CONSOLIDATED VISUALS ---
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

    // --- HELPER: APPLY IMBUEMENT LEECH (Accumulate values) ---
    const applyLeech = (dmg: number) => {
        if (!p.imbuActive || !p.imbuements || dmg <= 0) return;

        const ls = p.imbuements[ImbuType.LIFE_STEAL];
        if (ls && ls.tier > 0 && ls.timeRemaining > 0) {
            const heal = Math.ceil(dmg * (ls.tier * 0.05)); 
            if (heal > 0) {
                p.hp = Math.min(p.maxHp, p.hp + heal);
                totalHealValue += heal; // Accumulate instead of hit()
            }
        }

        const ml = p.imbuements[ImbuType.MANA_LEECH];
        if (ml && ml.tier > 0 && ml.timeRemaining > 0) {
            const manaGain = Math.ceil(dmg * (ml.tier * 0.05));
            if (manaGain > 0) {
                p.mana = Math.min(p.maxMana, p.mana + manaGain);
                totalManaValue += manaGain; // Accumulate instead of hit()
            }
        }
    };

    const huntId = activeHuntId;
    const settingsHuntCount = p.activeHuntCount || 1;
    
    if (p.level >= 12 && !p.tutorials.seenLevel12) {
        triggers.tutorial = 'level12';
    }

    if (p.level >= 30 && !p.tutorials.seenAscension) {
        triggers.tutorial = 'ascension';
    }

    let isBossTarget = false;
    if (huntId) {
        const potentialBoss = BOSSES.find(b => b.id === huntId);
        if (potentialBoss) isBossTarget = true;
    }

    const hazard = isBossTarget ? 0 : (p.activeHazardLevel || 0);
    const hazardDmgMult = 1 + (hazard * 0.01);
    const hazardCritChance = Math.min(0.5, hazard * 0.005); 
    const hazardCritDmg = 1.5 + (hazard * 0.01);
    const hazardDodgeChance = Math.min(0.25, hazard * 0.0025); 
    
    const hazardXpBonus = 1 + (hazard * 0.10);
    const hazardLootBonus = hazard * 5; 

    if (p.prey.nextFreeReroll <= now) {
        if (p.prey.rerollsAvailable < 3) {
            p.prey.rerollsAvailable = 3;
            log("Daily Prey Rerolls replenished (3/3).", 'info');
        }
        p.prey.nextFreeReroll = now + (20 * 60 * 60 * 1000); 
    }

    p.prey.slots.forEach(slot => {
        if (slot.active && slot.startTime > 0 && now > (slot.startTime + slot.duration)) {
            slot.active = false;
            log(`Your prey bonus against ${MONSTERS.find(m => m.id === slot.monsterId)?.name || 'target'} has expired.`, 'info');
        }
    });

    if (huntId && p.activeHuntStartTime > 0 && (now - p.activeHuntStartTime > MAX_HUNT_ONLINE_MS)) {
        stopHunt = true;
        log("Exhausted! You have stopped hunting after 6 hours online.", 'danger');
        return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, activeMonster: currentMonsterInstance, killedMonsters, triggers, stats };
    }
    if (activeTrainingSkill && p.activeTrainingStartTime > 0 && (now - p.activeTrainingStartTime > MAX_TRAIN_ONLINE_MS)) {
        stopTrain = true;
        log("Exhausted! You have stopped training after 4 hours online.", 'danger');
        return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, activeMonster: currentMonsterInstance, killedMonsters, triggers, stats };
    }

    p = processRegeneration(p, activeHuntId);
    const autoRes = processAutomation(p, now, log, hit);
    p = autoRes.player;
    stats.waste += autoRes.waste;
    
    // Consolidate automation healing
    totalHealValue += autoRes.totalHeal;
    totalManaValue += autoRes.totalMana;

    if (activeTrainingSkill) {
        p = processTraining(p, activeTrainingSkill, log, hit);
    }

    if (huntId) {
        const baseMonster = MONSTERS.find(m => m.id === huntId) || BOSSES.find(b => b.id === huntId);
        const canSpawn = now > respawnUnlockTime;
        const needsSpawn = !currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0;

        if (needsSpawn && canSpawn) {
            if (baseMonster) {
                const forcedType = p.gmExtra?.forceRarity;
                const baseSpawnChance = 0.03;
                const countBonus = Math.min(0.04, (settingsHuntCount - 1) * 0.0057);
                
                const blessedChanceBonus = getPlayerModifier(p, 'blessedChance');
                const totalChance = baseSpawnChance + countBonus + (blessedChanceBonus / 100);

                const isBoss = !!(baseMonster as Boss).cooldownSeconds;
                const instanceId = `${baseMonster.id}-${now}-${Math.random().toString(36).substr(2, 5)}`;

                if (!isBoss && (p.level >= 12) && (forcedType || Math.random() < totalChance)) {
                    currentMonsterInstance = createInfluencedMonster(baseMonster, forcedType);
                    currentMonsterInstance.guid = instanceId;
                    currentMonsterInstance.spawnTime = now;
                    if (!p.tutorials.seenRareMob) triggers.tutorial = 'mob';
                    if (!forcedType) log(`Warning! A ${currentMonsterInstance.name} appeared!`, 'danger');
                    monsterHp = currentMonsterInstance.maxHp * 1;
                } else {
                    currentMonsterInstance = { ...baseMonster, guid: instanceId, spawnTime: now };
                    monsterHp = currentMonsterInstance.maxHp * settingsHuntCount;
                }
            }
        }

        const monster = (monsterHp > 0) ? currentMonsterInstance : undefined;
        const SPAWN_DELAY_MS = 600;
        const isSpawning = monster && monster.spawnTime && (now - monster.spawnTime < SPAWN_DELAY_MS);

        if (monster && !isSpawning) {
            const effectiveHuntCount = monster.isInfluenced ? 1 : settingsHuntCount;

            if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
                lastMonsterAttackTime = now;
                const rawDmgBase = Math.floor(Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin;
                let difficultyMult = 1;
                if (effectiveHuntCount > 1) difficultyMult = 1 + ((effectiveHuntCount - 1) * 0.015);
                
                let totalIncomingRaw = Math.floor((rawDmgBase * effectiveHuntCount) * difficultyMult * hazardDmgMult);
                
                if (hazardCritChance > 0 && Math.random() < hazardCritChance) {
                    totalIncomingRaw = Math.floor(totalIncomingRaw * hazardCritDmg);
                    hit('CRIT', 'speech', 'monster');
                }

                const mitigation = calculatePlayerDefense(p);
                let actualDmg = Math.max(0, Math.floor(totalIncomingRaw - mitigation));
                
                const activePreyDef = p.prey.slots.find(s => s.monsterId === monster.id && s.active && s.bonusType === 'defense');
                if (activePreyDef && actualDmg > 0) {
                    actualDmg = Math.floor(actualDmg * (1 - (activePreyDef.bonusValue / 100)));
                }

                const dodgeChance = getPlayerModifier(p, 'dodgeChance');
                if (dodgeChance > 0 && Math.random() < (dodgeChance / 100)) {
                    actualDmg = 0;
                    hit('DODGED', 'speech', 'player');
                }

                const shieldRes = processSkillTraining(p, SkillType.DEFENSE, 1);
                p = shieldRes.player;
                if (shieldRes.leveledUp) log(`Shielding up: ${p.skills[SkillType.DEFENSE].level}!`, 'gain');

                if (actualDmg > 0) {
                    if (p.magicShieldUntil && p.magicShieldUntil > now) {
                        const manaDmg = Math.floor(actualDmg * 0.70);
                        let hpDmg = Math.floor(actualDmg * 0.30);
                        
                        if (p.mana >= manaDmg) {
                            p.mana -= manaDmg;
                        } else {
                            const spillOver = manaDmg - p.mana;
                            p.mana = 0;
                            hpDmg += spillOver;
                        }
                        p.hp -= hpDmg;
                        if (Math.random() > 0.8) hit('MANA SHIELD', 'speech', 'player');
                    } else {
                        p.hp -= actualDmg;
                    }

                    if (Math.random() > 0.8) log(`You lost ${actualDmg} hitpoints due to an attack by ${monster.name}.`, 'combat');
                    hit(actualDmg, 'damage', 'player');

                    const reflection = getPlayerModifier(p, 'reflection');
                    if (reflection > 0) {
                        const reflectedDmg = Math.floor(actualDmg * (reflection / 100));
                        if (reflectedDmg > 0) {
                            monsterHp -= reflectedDmg;
                            hit(reflectedDmg, 'damage', 'monster', 'reflect');
                        }
                    }

                    if (p.hp <= 0) {
                        let penaltyRate = 0.10; 
                        const hadBlessing = p.hasBlessing;
                        if (hadBlessing) {
                            penaltyRate = 0.04; 
                            p.hasBlessing = false;
                            log('The Blessing of Henricus reduced your death penalty!', 'magic');
                        }

                        const xpLossAmount = Math.floor(p.maxXp * penaltyRate);
                        const goldLoss = Math.floor(p.gold * penaltyRate); 

                        let levelWasReduced = false;
                        if (p.currentXp >= xpLossAmount) {
                            p.currentXp -= xpLossAmount;
                        } else {
                            if (p.level > 1) {
                                const remainingDebt = xpLossAmount - p.currentXp;
                                p.level--; 
                                levelWasReduced = true;
                                p.maxXp = getXpForLevel(p.level + 1); 
                                p.currentXp = Math.max(0, p.maxXp - remainingDebt);

                                let hpLoss = 5; let manaLoss = 5;
                                if (p.vocation === Vocation.KNIGHT) { hpLoss = 15; manaLoss = 5; }
                                else if (p.vocation === Vocation.PALADIN) { hpLoss = 10; manaLoss = 15; }
                                else if (p.vocation === Vocation.SORCERER || p.vocation === Vocation.DRUID) { hpLoss = 5; manaLoss = 30; }
                                else if (p.vocation === Vocation.MONK) { hpLoss = 10; manaLoss = 10; }

                                p.maxHp = Math.max(150, p.maxHp - hpLoss);
                                p.maxMana = Math.max(35, p.maxMana - manaLoss);
                                log(`You were downgraded to Level ${p.level}!`, 'danger');
                            } else {
                                p.currentXp = 0; 
                            }
                        }

                        const deathReport: DeathReport = {
                            xpLoss: xpLossAmount,
                            goldLoss: goldLoss,
                            levelDown: levelWasReduced,
                            vocation: p.vocation,
                            killerName: monster.name,
                            hasBlessing: hadBlessing
                        };

                        p.hp = p.maxHp;
                        p.mana = p.maxMana;
                        p.activeHuntId = null;
                        p.magicShieldUntil = 0; 
                        stopHunt = true;
                        p.gold = Math.max(0, p.gold - goldLoss);

                        Object.keys(p.skills).forEach(key => {
                            const skillKey = key as SkillType;
                            const skill = p.skills[skillKey];
                            const skillLoss = 100 * penaltyRate;
                            skill.progress -= skillLoss;
                            if (skill.progress < 0) {
                                if (skill.level > 10) {
                                    skill.level--;
                                    skill.progress += 100;
                                } else {
                                    skill.progress = 0;
                                }
                            }
                        });

                        log(`You are dead. Lost ${xpLossAmount.toLocaleString()} XP, ${goldLoss.toLocaleString()} Gold, and Skills.`, 'danger');
                        hit('DEAD', 'damage', 'player');

                        triggers.death = deathReport;

                        return { player: p, monsterHp: 0, newLogs: logs, newHits: hits, stopHunt: true, stopTrain: false, activeMonster: undefined, killedMonsters, triggers, stats };
                    }
                } else {
                    if (actualDmg === 0 && dodgeChance <= 0) hit('Miss', 'miss', 'player');
                }
            }

            let autoAttackDamage = calculatePlayerDamage(p);
            let hasSufficientMana = true;

            const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
            if (weapon?.manaCost && weapon.manaCost > 0) {
                if (p.mana >= weapon.manaCost) {
                    p.mana -= weapon.manaCost;
                } else {
                    autoAttackDamage = 0; 
                    hasSufficientMana = false;
                    hit('No Mana', 'miss', 'player');
                }
            }
            
            if (hasSufficientMana) {
                if ((monster as Boss).cooldownSeconds) {
                    const bossBonus = getPlayerModifier(p, 'bossSlayer');
                    if (bossBonus > 0) autoAttackDamage = Math.floor(autoAttackDamage * (1 + (bossBonus / 100)));
                }

                let imbuCritChance = 0;
                if (p.imbuActive && p.imbuements) {
                    const strikeImbu = p.imbuements[ImbuType.STRIKE];
                    if (strikeImbu && strikeImbu.tier > 0 && strikeImbu.timeRemaining > 0) {
                        imbuCritChance = strikeImbu.tier * 5; 
                    }
                }

                const critChance = getPlayerModifier(p, 'critChance') + imbuCritChance;
                if (autoAttackDamage > 0 && Math.random() < (critChance / 100)) {
                    autoAttackDamage = Math.floor(autoAttackDamage * 1.5);
                    hit('CRIT!', 'speech', 'player');
                }

                const attackSpeed = getPlayerModifier(p, 'attackSpeed');
                if (autoAttackDamage > 0 && Math.random() < (attackSpeed / 100)) {
                    const extraDmg = Math.floor(autoAttackDamage * 0.7); 
                    autoAttackDamage += extraDmg;
                    hit('Double Hit!', 'speech', 'player');
                }

                const executionerChance = getPlayerModifier(p, 'executioner');
                const executionerThreshold = monster.maxHp * effectiveHuntCount * 0.20; 
                if (monsterHp < executionerThreshold && executionerChance > 0) {
                    if (Math.random() < (executionerChance / 100)) {
                        autoAttackDamage = monsterHp; 
                        hit('EXECUTED!', 'speech', 'player');
                    }
                }

                if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) {
                    autoAttackDamage = 0;
                    hit('DODGED', 'speech', 'monster');
                }

                const usedSkill = weapon?.scalingStat || SkillType.FIST;
                const skillRes = processSkillTraining(p, usedSkill, 1);
                p = skillRes.player;
                if (skillRes.leveledUp) log(`Skill ${usedSkill} up: ${p.skills[usedSkill].level}!`, 'gain');

                if (weapon?.scalingStat === SkillType.DISTANCE && weapon.weaponType) {
                    const ammo = p.equipment[EquipmentSlot.AMMO];
                    if (ammo) {
                        const currentQty = ammo.count || 1;
                        stats.waste += ammo.price || 0;
                        if (currentQty > 1) {
                            p.equipment[EquipmentSlot.AMMO] = { ...ammo, count: currentQty - 1 };
                        } else {
                            delete p.equipment[EquipmentSlot.AMMO];
                            log(`You ran out of ${ammo.name}!`, 'danger');
                            autoAttackDamage = 0; 
                        }
                    }
                }
            }

            if (autoAttackDamage > 0) {
                monsterHp -= autoAttackDamage;
                hit(autoAttackDamage, 'damage', 'monster', 'basic');
                applyLeech(autoAttackDamage);
            }

            if (p.settings.autoAttackSpell && (p.attackCooldown || 0) <= now) {
                const rotation = p.settings.attackSpellRotation || [];
                if (rotation.length === 0 && p.settings.selectedAttackSpellId) {
                    rotation.push(p.settings.selectedAttackSpellId);
                }

                for (const spellId of rotation) {
                    const spell = SPELLS.find(s => s.id === spellId);
                    if (spell && p.purchasedSpells.includes(spell.id) && 
                        p.level >= spell.minLevel && 
                        (p.skills[SkillType.MAGIC].level >= (spell.reqMagicLevel || 0)) && 
                        p.mana >= spell.manaCost && 
                        (p.spellCooldowns[spell.id] || 0) <= now) {
                        
                        const spellName = spell.name.match(/\((.*?)\)/)?.[1] || spell.name;
                        let spellDmg = calculateSpellDamage(p, spell);
                        
                        if ((monster as Boss).cooldownSeconds) {
                            const bossBonus = getPlayerModifier(p, 'bossSlayer');
                            if (bossBonus > 0) spellDmg = Math.floor(spellDmg * (1 + (bossBonus / 100)));
                        }

                        const finalSpellDmg = spell.isAoe ? spellDmg * effectiveHuntCount : spellDmg; 
                        
                        if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) {
                             hit('DODGED', 'speech', 'monster');
                        } else {
                            monsterHp -= finalSpellDmg;
                            hit(finalSpellDmg, 'damage', 'monster', 'spell');
                            hit(spellName, 'speech', 'player');
                            applyLeech(finalSpellDmg);
                        }

                        p.mana -= spell.manaCost;
                        p.spellCooldowns[spell.id] = now + (spell.cooldown || 2000);
                        p.attackCooldown = now + 2000; 
                        
                        const magicRes = processSkillTraining(p, SkillType.MAGIC, spell.manaCost);
                        p = magicRes.player;
                        if (magicRes.leveledUp) log(`Magic Level up: ${p.skills[SkillType.MAGIC].level}!`, 'gain');
                        break; 
                    }
                }
            }

            if (!p.runeCooldown) p.runeCooldown = 0;
            if (p.settings.autoAttackRune && p.settings.selectedRuneId && p.runeCooldown <= now) {
                const runeItem = SHOP_ITEMS.find(i => i.id === p.settings.selectedRuneId);
                if (runeItem && (p.inventory[runeItem.id] || 0) > 0) {
                    if (p.level >= (runeItem.requiredLevel || 0) && getEffectiveSkill(p, SkillType.MAGIC) >= (runeItem.reqMagicLevel || 0)) {
                        let runeDmg = calculateRuneDamage(p, runeItem);
                        
                        if ((monster as Boss).cooldownSeconds) {
                            const bossBonus = getPlayerModifier(p, 'bossSlayer');
                            if (bossBonus > 0) runeDmg = Math.floor(runeDmg * (1 + (bossBonus / 100)));
                        }

                        let finalRuneDmg = runeDmg;
                        if (runeItem.runeType === 'area') finalRuneDmg = runeDmg * effectiveHuntCount;
                        
                        if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) {
                             hit('DODGED', 'speech', 'monster');
                        } else {
                            monsterHp -= finalRuneDmg;
                            hit(finalRuneDmg, 'damage', 'monster', 'rune');
                            applyLeech(finalRuneDmg);
                        }

                        p.inventory[runeItem.id]--;
                        stats.waste += runeItem.price || 0;
                        p.runeCooldown = now + 1000; 
                        const magicRes = processSkillTraining(p, SkillType.MAGIC, 20); 
                        p = magicRes.player;
                    }
                }
            }

            if (monsterHp <= 0) {
                killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
                const goldDropBase = Math.floor(Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold;
                const goldDrop = goldDropBase * effectiveHuntCount;
                
                let finalXpMultiplier = 1.0;
                finalXpMultiplier *= getXpStageMultiplier(p.level);
                if (p.stamina > 0) finalXpMultiplier *= 1.5;
                const activePreyXp = p.prey.slots.find(s => s.monsterId === monster.id && s.active && s.bonusType === 'xp');
                if (activePreyXp) finalXpMultiplier *= (1 + (activePreyXp.bonusValue / 100));
                finalXpMultiplier *= (1 + (getAscensionBonusValue(p, 'xp_boost') / 100));
                const equipXpBonus = getPlayerModifier(p, 'xpBoost');
                if (equipXpBonus > 0) finalXpMultiplier *= (1 + (equipXpBonus / 100));
                if (p.premiumUntil > now) finalXpMultiplier *= 2.0; 
                if (p.xpBoostUntil > now) finalXpMultiplier *= 3.0; 
                
                finalXpMultiplier *= hazardXpBonus;

                const xpGained = Math.floor(monster.exp * effectiveHuntCount * finalXpMultiplier);
                p.currentXp += xpGained;
                stats.xpGained += xpGained;

                const levelResult = checkForLevelUp(p);
                p = levelResult.player;
                if (levelResult.leveledUp) {
                    log(`Level Up! ${p.level}. HP+${levelResult.hpGain}, MP+${levelResult.manaGain}.`, 'gain');
                    hit('LEVEL UP!', 'heal', 'player');
                }

                const ascGoldBonus = 1 + (getAscensionBonusValue(p, 'gold_boost') / 100);
                const goldFindBonus = 1 + (getPlayerModifier(p, 'goldFind') / 100); 
                const finalGold = Math.floor(goldDrop * ascGoldBonus * goldFindBonus);
                p.gold += finalGold;
                stats.goldGained += finalGold;
                stats.profitGained += finalGold;

                let lootBonus = 0;
                const activePreyLoot = p.prey.slots.find(s => s.monsterId === monster.id && s.active && s.bonusType === 'loot');
                if (activePreyLoot) lootBonus += activePreyLoot.bonusValue;
                
                lootBonus += getAscensionBonusValue(p, 'loot_boost');
                lootBonus += getPlayerModifier(p, 'lootBoost');
                if (p.premiumUntil > now) lootBonus += 20; 
                
                lootBonus += hazardLootBonus;

                let combinedStandardLoot: {[key:string]: number} = {};
                
                if ((monster as Boss).cooldownSeconds) {
                    const tokenRoll = Math.floor(Math.random() * 3); 
                    if (tokenRoll > 0) {
                        combinedStandardLoot['gold_token'] = tokenRoll;
                    }
                }

                if (monster.isInfluenced) {
                    let minTokens = 1; let maxTokens = 2;
                    if (monster.influencedType === 'enraged') { minTokens = 2; maxTokens = 4; }
                    if (monster.influencedType === 'blessed') { minTokens = 5; maxTokens = 10; }
                    const tokenQty = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;
                    combinedStandardLoot['forge_token'] = tokenQty;
                }

                let currentSlots = Object.keys(p.inventory).length + (p.uniqueInventory?.length || 0);
                let bpFullMessageSent = false;

                for(let i=0; i<effectiveHuntCount; i++) {
                    const drop = generateLootWithRarity(monster, lootBonus);
                    drop.unique.forEach(uniqueItem => {
                        if (p.skippedLoot.includes(uniqueItem.id)) return;
                        if (currentSlots < MAX_BACKPACK_SLOTS) {
                            if (!p.uniqueInventory) p.uniqueInventory = [];
                            p.uniqueInventory.push(uniqueItem);
                            currentSlots++; 
                            log(`Rare Drop: ${uniqueItem.name} (${uniqueItem.rarity})!`, 'loot', uniqueItem.rarity);
                            if (!p.tutorials.seenRareItem) triggers.tutorial = 'item';
                        } else {
                            if (!bpFullMessageSent) { log("Backpack full!", 'danger'); bpFullMessageSent = true; }
                        }
                    });

                    Object.entries(drop.standard).forEach(([itemId, qty]) => { 
                        if (p.skippedLoot.includes(itemId)) return;
                        combinedStandardLoot[itemId] = (combinedStandardLoot[itemId] || 0) + qty; 
                    });
                }

                const lootValue = calculateLootValue(combinedStandardLoot);
                stats.profitGained += lootValue;

                let lootMsg = "";
                Object.entries(combinedStandardLoot).forEach(([itemId, qty]) => {
                    const itemName = SHOP_ITEMS.find(i => i.id === itemId)?.name || itemId;
                    if (p.inventory[itemId]) {
                        p.inventory[itemId] += qty;
                        lootMsg += `, ${qty}x ${itemName}`;
                    } else {
                        if (currentSlots < MAX_BACKPACK_SLOTS) {
                            p.inventory[itemId] = qty;
                            currentSlots++;
                            lootMsg += `, ${qty}x ${itemName}`;
                        } else {
                            if (!bpFullMessageSent) { log("Backpack full!", 'danger'); bpFullMessageSent = true; }
                        }
                    }
                });

                const preyFlag = (activePreyXp || activePreyLoot) ? "[PREY] " : "";
                if (lootMsg) log(`${preyFlag}Loot x${effectiveHuntCount} ${monster.name}: ${finalGold} gp${lootMsg}. (${xpGained} xp)`, 'loot');

                p.taskOptions.forEach(task => {
                    if (task.status === 'active' && !task.isComplete) {
                        if (task.type === 'kill' && task.monsterId === monster.id) {
                            task.killsCurrent = (task.killsCurrent || 0) + effectiveHuntCount;
                            if (task.killsCurrent >= (task.killsRequired || task.amountRequired)) { task.isComplete = true; }
                        }
                    }
                });

                const relevantQuests = QUESTS.filter(q => q.targetMonsterId === monster.id || (q.targetMonsterId === 'ANY_RARE' && monster.isInfluenced));
                relevantQuests.forEach(q => {
                    if (!p.quests[q.id]) p.quests[q.id] = { kills: 0, completed: false };
                    if (!p.quests[q.id].completed) {
                        if (q.requiredKills && p.quests[q.id].kills < q.requiredKills) {
                            const killsToAdd = (q.targetMonsterId === 'ANY_RARE') ? 1 : effectiveHuntCount;
                            p.quests[q.id].kills += killsToAdd;
                            if (p.quests[q.id].kills >= q.requiredKills) {
                                p.quests[q.id].kills = q.requiredKills;
                                log(`Quest Objective Complete: ${q.name}!`, 'gain');
                            }
                        }
                    }
                });

                if ((monster as Boss).cooldownSeconds) {
                    bossDefeatedId = monster.id;
                    stopHunt = true; 
                    if (monster.id === 'primal_menace' && p.hazardLevel < 100) {
                        p.hazardLevel = Math.min(100, p.hazardLevel + 1);
                    }
                }
                monsterHp = 0; 
                respawnUnlockTime = now + 500; 
            }
        }
    }

    // --- EMIT CONSOLIDATED HITS AT THE END OF THE TICK ---
    if (totalHealValue > 0) {
        hit(`+${totalHealValue}`, 'heal', 'player');
    }
    if (totalManaValue > 0) {
        hit(`+${totalManaValue}`, 'mana', 'player');
    }

    const returnInstance = (monsterHp > 0 || (currentMonsterInstance && now <= respawnUnlockTime)) ? currentMonsterInstance : undefined;

    if ((p.level >= 2 && !p.isNameChosen) || (p.level >= 8 && p.vocation === Vocation.NONE)) {
        triggers.oracle = true;
    }

    return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, bossDefeatedId, activeMonster: returnInstance, killedMonsters, triggers, stats };
};
