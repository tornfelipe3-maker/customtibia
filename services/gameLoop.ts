
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

    const effMaxHp = getEffectiveMaxHp(p);
    const effMaxMana = getEffectiveMaxMana(p);

    // --- TURN DAMAGE ACCUMULATORS ---
    let turnBasicDmg = 0;
    let turnSpellDmg = 0;
    let turnRuneDmg = 0;

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
    
    // TUTORIAL TRIGGERS (FIXED)
    if (p.level >= 12 && !p.tutorials.seenLevel12) {
        p.tutorials.seenLevel12 = true; // Marca como visto imediatamente
        triggers.tutorial = 'level12';
    }

    if (p.level >= 30 && !p.tutorials.seenAscension) {
        p.tutorials.seenAscension = true; // Marca como visto imediatamente
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
        if (p.prey.rerollsAvailable < 5) {
            p.prey.rerollsAvailable = 5;
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
                    // TRIGGER TUTORIAL MOB (FIXED)
                    if (!p.tutorials.seenRareMob) {
                        p.tutorials.seenRareMob = true;
                        triggers.tutorial = 'mob';
                    }
                    log(`Warning! A ${currentMonsterInstance.name} appeared!`, 'danger');
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

            // --- MONSTER ATTACK TURN ---
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

                p = processSkillTraining(p, SkillType.DEFENSE, 1).player;

                if (actualDmg > 0) {
                    if (p.magicShieldUntil && p.magicShieldUntil > now) {
                        const manaDmg = Math.floor(actualDmg * 0.70);
                        let hpDmg = Math.floor(actualDmg * 0.30);
                        if (p.mana >= manaDmg) { p.mana -= manaDmg; } else { const spillOver = manaDmg - p.mana; p.mana = 0; hpDmg += spillOver; }
                        p.hp -= hpDmg;
                    } else {
                        p.hp -= actualDmg;
                    }
                    log(`You lose ${actualDmg} hitpoints due to an attack by ${monster.name}.`, 'combat');
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
                        if (hadBlessing) { penaltyRate = 0.04; p.hasBlessing = false; log('The Blessing of Henricus reduced your death penalty!', 'magic'); }
                        const xpLossAmount = Math.floor(p.maxXp * penaltyRate);
                        const goldLoss = Math.floor(p.gold * penaltyRate); 

                        let levelWasReduced = false;
                        if (p.currentXp >= xpLossAmount) { p.currentXp -= xpLossAmount; } else {
                            if (p.level > 1) {
                                const remainingDebt = xpLossAmount - p.currentXp;
                                p.level--; levelWasReduced = true; p.maxXp = getXpForLevel(p.level + 1); p.currentXp = Math.max(0, p.maxXp - remainingDebt);
                                let hpLoss = 5; let manaLoss = 5;
                                if (p.vocation === Vocation.KNIGHT) { hpLoss = 15; manaLoss = 5; }
                                else if (p.vocation === Vocation.PALADIN) { hpLoss = 10; manaLoss = 15; }
                                else if (p.vocation === Vocation.SORCERER || p.vocation === Vocation.DRUID) { hpLoss = 5; manaLoss = 30; }
                                p.maxHp = Math.max(150, p.maxHp - hpLoss); p.maxMana = Math.max(35, p.maxMana - manaLoss);
                            } else { p.currentXp = 0; }
                        }
                        const deathReport: DeathReport = { xpLoss: xpLossAmount, goldLoss: goldLoss, levelDown: levelWasReduced, vocation: p.vocation, killerName: monster.name, hasBlessing: hadBlessing };
                        p.hp = getEffectiveMaxHp(p); 
                        p.mana = getEffectiveMaxMana(p); 
                        p.activeHuntId = null; p.magicShieldUntil = 0; stopHunt = true; p.gold = Math.max(0, p.gold - goldLoss);
                        Object.keys(p.skills).forEach(key => { const skill = p.skills[key as SkillType]; const loss = 100 * penaltyRate; skill.progress -= loss; if (skill.progress < 0) { if (skill.level > 10) { skill.level--; skill.progress += 100; } else { skill.progress = 0; } } });
                        log(`You are dead. Lost ${xpLossAmount.toLocaleString()} XP, ${goldLoss.toLocaleString()} Gold.`, 'danger');
                        triggers.death = deathReport;
                        return { player: p, monsterHp: 0, newLogs: logs, newHits: hits, stopHunt: true, stopTrain: false, activeMonster: undefined, killedMonsters, triggers, stats };
                    }
                } else {
                    if (actualDmg === 0 && dodgeChance <= 0) hit('Miss', 'miss', 'player');
                }
            }

            // --- PLAYER ATTACK TURN ---
            let autoAttackDamage = calculatePlayerDamage(p);
            let hasSufficientMana = true;
            const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
            
            if (weapon?.manaCost && weapon.manaCost > 0) {
                if (p.mana >= weapon.manaCost) { p.mana -= weapon.manaCost; } else { autoAttackDamage = 0; hasSufficientMana = false; hit('No Mana', 'miss', 'player'); }
            }
            
            if (hasSufficientMana) {
                if ((monster as Boss).cooldownSeconds) {
                    const bossBonus = getPlayerModifier(p, 'bossSlayer');
                    if (bossBonus > 0) autoAttackDamage = Math.floor(autoAttackDamage * (1 + (bossBonus / 100)));
                }

                let imbuCritChance = 0;
                if (p.imbuActive && p.imbuements) {
                    const strikeImbu = p.imbuements[ImbuType.STRIKE];
                    if (strikeImbu && strikeImbu.tier > 0 && strikeImbu.timeRemaining > 0) imbuCritChance = strikeImbu.tier * 5;
                }

                const critChance = getPlayerModifier(p, 'critChance') + imbuCritChance;
                if (autoAttackDamage > 0 && Math.random() < (critChance / 100)) { autoAttackDamage = Math.floor(autoAttackDamage * 1.5); hit('CRIT!', 'speech', 'player'); }
                const attackSpeed = getPlayerModifier(p, 'attackSpeed');
                if (autoAttackDamage > 0 && Math.random() < (attackSpeed / 100)) { autoAttackDamage += Math.floor(autoAttackDamage * 0.7); hit('Double Hit!', 'speech', 'player'); }

                const executionerChance = getPlayerModifier(p, 'executioner');
                const executionerThreshold = monster.maxHp * effectiveHuntCount * 0.20; 
                if (monsterHp < executionerThreshold && executionerChance > 0 && Math.random() < (executionerChance / 100)) { autoAttackDamage = monsterHp; hit('EXECUTED!', 'speech', 'player'); }

                if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) { autoAttackDamage = 0; hit('DODGED', 'speech', 'monster'); }

                p = processSkillTraining(p, weapon?.scalingStat || SkillType.FIST, 1).player;

                if (weapon?.scalingStat === SkillType.DISTANCE && weapon.weaponType) {
                    const ammo = p.equipment[EquipmentSlot.AMMO];
                    if (ammo) {
                        const currentQty = ammo.count || 1;
                        stats.waste += ammo.price || 0;
                        if (currentQty > 1) { p.equipment[EquipmentSlot.AMMO] = { ...ammo, count: currentQty - 1 }; } 
                        else { delete p.equipment[EquipmentSlot.AMMO]; autoAttackDamage = 0; }
                    }
                }
            }

            if (autoAttackDamage > 0) {
                monsterHp -= autoAttackDamage;
                turnBasicDmg += autoAttackDamage;
                hit(autoAttackDamage, 'damage', 'monster', 'basic');
                applyLeech(autoAttackDamage);
            }

            // Spells
            if (p.settings.autoAttackSpell && (p.attackCooldown || 0) <= now) {
                const rotation = p.settings.attackSpellRotation || [];
                if (rotation.length === 0 && p.settings.selectedAttackSpellId) rotation.push(p.settings.selectedAttackSpellId);

                for (const spellId of rotation) {
                    const spell = SPELLS.find(s => s.id === spellId);
                    if (spell && p.purchasedSpells.includes(spell.id) && p.level >= spell.minLevel && (p.skills[SkillType.MAGIC].level >= (spell.reqMagicLevel || 0)) && p.mana >= spell.manaCost && (p.spellCooldowns[spell.id] || 0) <= now) {
                        const spellName = spell.name.match(/\((.*?)\)/)?.[1] || spell.name;
                        let spellDmg = calculateSpellDamage(p, spell);
                        if ((monster as Boss).cooldownSeconds) { const bossBonus = getPlayerModifier(p, 'bossSlayer'); if (bossBonus > 0) spellDmg = Math.floor(spellDmg * (1 + (bossBonus / 100))); }
                        const finalSpellDmg = spell.isAoe ? spellDmg * effectiveHuntCount : spellDmg; 
                        
                        if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) { hit('DODGED', 'speech', 'monster'); } else {
                            monsterHp -= finalSpellDmg;
                            turnSpellDmg += finalSpellDmg;
                            hit(finalSpellDmg, 'damage', 'monster', 'spell');
                            hit(spellName, 'speech', 'player');
                            applyLeech(finalSpellDmg);
                        }
                        p.mana -= spell.manaCost;
                        p.spellCooldowns[spell.id] = now + (spell.cooldown || 2000);
                        p.attackCooldown = now + 2000; 
                        p = processSkillTraining(p, SkillType.MAGIC, spell.manaCost).player;
                        break; 
                    }
                }
            }

            // Runes
            if (p.settings.autoAttackRune && p.settings.selectedRuneId && (p.runeCooldown || 0) <= now) {
                const runeItem = SHOP_ITEMS.find(i => i.id === p.settings.selectedRuneId);
                if (runeItem && (p.inventory[runeItem.id] || 0) > 0) {
                    if (p.level >= (runeItem.requiredLevel || 0) && getEffectiveSkill(p, SkillType.MAGIC) >= (runeItem.reqMagicLevel || 0)) {
                        let runeDmg = calculateRuneDamage(p, runeItem);
                        if ((monster as Boss).cooldownSeconds) { const bb = getPlayerModifier(p, 'bossSlayer'); if (bb > 0) runeDmg = Math.floor(runeDmg * (1 + (bb / 100))); }
                        let finalRuneDmg = runeItem.runeType === 'area' ? runeDmg * effectiveHuntCount : runeDmg;
                        
                        if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) { hit('DODGED', 'speech', 'monster'); } else {
                            monsterHp -= finalRuneDmg;
                            turnRuneDmg += finalRuneDmg;
                            hit(finalRuneDmg, 'damage', 'monster', 'rune');
                            applyLeech(finalRuneDmg);
                        }
                        p.inventory[runeItem.id]--; stats.waste += runeItem.price || 0; p.runeCooldown = now + 1000; 
                        p = processSkillTraining(p, SkillType.MAGIC, 20).player;
                    }
                }
            }

            const totalTurnDmg = turnBasicDmg + turnSpellDmg + turnRuneDmg;
            if (totalTurnDmg > 0) {
                const breakdown = [];
                if (turnBasicDmg > 0) breakdown.push(`${turnBasicDmg} basic`);
                if (turnSpellDmg > 0) breakdown.push(`${turnSpellDmg} spell`);
                if (turnRuneDmg > 0) breakdown.push(`${turnRuneDmg} rune`);
                log(`You deal ${totalTurnDmg} damage to ${monster.name} (${breakdown.join(', ')}).`, 'combat');
            }

            if (monsterHp <= 0) {
                killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
                const goldDrop = (Math.floor(Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold) * effectiveHuntCount;
                let finalXpMultiplier = getXpStageMultiplier(p.level);
                if (p.stamina > 0) finalXpMultiplier *= 1.5;
                const activePreyXp = p.prey.slots.find(s => s.monsterId === monster.id && s.active && s.bonusType === 'xp');
                if (activePreyXp) finalXpMultiplier *= (1 + (activePreyXp.bonusValue / 100));
                finalXpMultiplier *= (1 + (getAscensionBonusValue(p, 'xp_boost') / 100));
                const eqXp = getPlayerModifier(p, 'xpBoost'); if (eqXp > 0) finalXpMultiplier *= (1 + (eqXp / 100));
                if (p.premiumUntil > now) finalXpMultiplier *= 2.0; if (p.xpBoostUntil > now) finalXpMultiplier *= 3.0; 
                finalXpMultiplier *= hazardXpBonus;

                const xpGained = Math.floor(monster.exp * effectiveHuntCount * finalXpMultiplier);
                p.currentXp += xpGained; stats.xpGained += xpGained;
                const levelResult = checkForLevelUp(p); p = levelResult.player;
                if (levelResult.leveledUp) { log(`Level Up! ${p.level}.`, 'gain'); hit('LEVEL UP!', 'heal', 'player'); }

                const finalGold = Math.floor(goldDrop * (1 + (getAscensionBonusValue(p, 'gold_boost') / 100)) * (1 + (getPlayerModifier(p, 'goldFind') / 100)));
                p.gold += finalGold; stats.goldGained += finalGold; stats.profitGained += finalGold;

                let lootBonus = getAscensionBonusValue(p, 'loot_boost') + getPlayerModifier(p, 'lootBoost') + hazardLootBonus;
                const activePreyLoot = p.prey.slots.find(s => s.monsterId === monster.id && s.active && s.bonusType === 'loot');
                if (activePreyLoot) lootBonus += activePreyLoot.bonusValue;
                if (p.premiumUntil > now) lootBonus += 20; 

                let combinedStandardLoot: {[key:string]: number} = {};
                if ((monster as Boss).cooldownSeconds) { const tr = Math.floor(Math.random() * 3); if (tr > 0) combinedStandardLoot['gold_token'] = tr; }
                if (monster.isInfluenced) { let minT = 1; let maxT = 2; if (monster.influencedType === 'enraged') { minT = 2; maxT = 4; } if (monster.influencedType === 'blessed') { minT = 5; maxT = 10; } combinedStandardLoot['forge_token'] = Math.floor(Math.random() * (maxT - minT + 1)) + minT; }

                let currentSlots = Object.keys(p.inventory).length + (p.uniqueInventory?.length || 0);
                let bpFull = false;

                for(let i=0; i<effectiveHuntCount; i++) {
                    const drop = generateLootWithRarity(monster, lootBonus);
                    drop.unique.forEach(u => { 
                        if (!p.skippedLoot.includes(u.id)) { 
                            if (currentSlots < MAX_BACKPACK_SLOTS) { 
                                if (!p.uniqueInventory) p.uniqueInventory = []; 
                                p.uniqueInventory.push(u); 
                                currentSlots++; 
                                log(`Rare Drop: ${u.name} (${u.rarity})!`, 'loot', u.rarity); 
                                // TRIGGER TUTORIAL ITEM (FIXED)
                                if (!p.tutorials.seenRareItem) {
                                    p.tutorials.seenRareItem = true;
                                    triggers.tutorial = 'item';
                                }
                            } else if (!bpFull) { 
                                log("Backpack full!", 'danger'); 
                                bpFull = true; 
                            } 
                        } 
                    });
                    Object.entries(drop.standard).forEach(([id, qty]) => { if (!p.skippedLoot.includes(id)) combinedStandardLoot[id] = (combinedStandardLoot[id] || 0) + qty; });
                }

                stats.profitGained += calculateLootValue(combinedStandardLoot);
                let lootMsg = "";
                Object.entries(combinedStandardLoot).forEach(([id, qty]) => {
                    const name = SHOP_ITEMS.find(i => i.id === id)?.name || id;
                    if (p.inventory[id]) { p.inventory[id] += qty; lootMsg += `, ${qty}x ${name}`; } 
                    else { if (currentSlots < MAX_BACKPACK_SLOTS) { p.inventory[id] = qty; currentSlots++; lootMsg += `, ${qty}x ${name}`; } else if (!bpFull) { log("Backpack full!", 'danger'); bpFull = true; } }
                });
                
                log(`Loot x${effectiveHuntCount} ${monster.name}: ${finalGold} gp${lootMsg}. (XP: ${xpGained.toLocaleString()})`, 'loot');

                p.taskOptions.forEach(task => { if (task.status === 'active' && !task.isComplete && task.type === 'kill' && task.monsterId === monster.id) { task.killsCurrent = (task.killsCurrent || 0) + effectiveHuntCount; if (task.killsCurrent >= (task.killsRequired || task.amountRequired)) task.isComplete = true; } });
                const relevantQuests = QUESTS.filter(q => q.targetMonsterId === monster.id || (q.targetMonsterId === 'ANY_RARE' && monster.isInfluenced));
                relevantQuests.forEach(q => { if (!p.quests[q.id]) p.quests[q.id] = { kills: 0, completed: false }; if (!p.quests[q.id].completed && q.requiredKills && p.quests[q.id].kills < q.requiredKills) { p.quests[q.id].kills += (q.targetMonsterId === 'ANY_RARE' ? 1 : effectiveHuntCount); if (p.quests[q.id].kills >= q.requiredKills) { p.quests[q.id].kills = q.requiredKills; log(`Quest Objective Complete: ${q.name}!`, 'gain'); } } });

                if ((monster as Boss).cooldownSeconds) { bossDefeatedId = monster.id; stopHunt = true; if (monster.id === 'primal_menace' && p.hazardLevel < 100) p.hazardLevel = Math.min(100, p.hazardLevel + 1); }
                monsterHp = 0; respawnUnlockTime = now + 500; 
            }
        }
    }

    if (totalHealValue > 0) hit(`+${totalHealValue}`, 'heal', 'player');
    if (totalManaValue > 0) hit(`+${totalManaValue}`, 'mana', 'player');

    return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, bossDefeatedId, activeMonster: (monsterHp > 0 || (currentMonsterInstance && now <= respawnUnlockTime)) ? currentMonsterInstance : undefined, killedMonsters, triggers, stats };
};
