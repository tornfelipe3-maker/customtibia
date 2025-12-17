
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity } from '../types';
import { MONSTERS, BOSSES, SHOP_ITEMS, SPELLS, QUESTS, getXpForLevel, MAX_BACKPACK_SLOTS } from '../constants'; // Added getXpForLevel
import { calculatePlayerDamage, calculateSpellDamage, calculateRuneDamage, calculatePlayerDefense } from './combat';
import { processSkillTraining, checkForLevelUp, getEffectiveSkill } from './progression';
import { getXpStageMultiplier, createInfluencedMonster, getAscensionBonusValue } from './mechanics';
import { generateLootWithRarity, calculateLootValue } from './loot'; 

// Importing sub-modules
import { processRegeneration } from './tick/regeneration';
import { processAutomation } from './tick/automation';
import { processTraining } from './tick/training';

// Limits
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
        tutorial?: 'mob' | 'item' | 'ascension' | 'level12'; // Added level12 trigger
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
    
    // 1. Initialize Tick Data
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

    const huntId = activeHuntId;
    const settingsHuntCount = p.activeHuntCount || 1; // User configured count
    
    // --- CHECK LEVEL 12 WARNING TRIGGER ---
    if (p.level >= 12 && !p.tutorials.seenLevel12) {
        triggers.tutorial = 'level12';
    }

    // --- CHECK ASCENSION TRIGGER ---
    if (p.level >= 50 && !p.tutorials.seenAscension) {
        triggers.tutorial = 'ascension';
    }

    // --- HAZARD SYSTEM VALUES ---
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
    const hazardXpBonus = 1 + (hazard * 0.02);
    const hazardLootBonus = hazard; 

    // --- PREY RESET LOGIC ---
    if (p.prey.nextFreeReroll <= now) {
        if (p.prey.rerollsAvailable < 3) {
            p.prey.rerollsAvailable = 3;
            log("Daily Prey Rerolls replenished (3/3).", 'info');
        }
        p.prey.nextFreeReroll = now + (20 * 60 * 60 * 1000); 
    }

    // --- PREY EXPIRATION LOGIC ---
    p.prey.slots.forEach(slot => {
        if (slot.active && slot.startTime > 0 && now > (slot.startTime + slot.duration)) {
            slot.active = false;
            // The slot remains 'inactive' but keeps monsterId/values until rerolled
            log(`Your prey bonus against ${MONSTERS.find(m => m.id === slot.monsterId)?.name || 'target'} has expired.`, 'info');
        }
    });

    // 2. Check Time Limits
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

    // 3. Process Sub-Modules
    p = processRegeneration(p, activeHuntId);
    const autoRes = processAutomation(p, now, log, hit);
    p = autoRes.player;
    stats.waste += autoRes.waste;

    if (activeTrainingSkill) {
        p = processTraining(p, activeTrainingSkill, log, hit);
    }

    // 4. Combat Logic
    if (huntId) {
        const baseMonster = MONSTERS.find(m => m.id === huntId) || BOSSES.find(b => b.id === huntId);
        
        // SPAWN LOGIC
        const canSpawn = now > respawnUnlockTime;
        const needsSpawn = !currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0;

        if (needsSpawn && canSpawn) {
            if (baseMonster) {
                const forcedType = p.gmExtra?.forceRarity;
                const baseSpawnChance = 0.03;
                // Higher lure count increases rare spawn chance slightly
                const countBonus = Math.min(0.04, (settingsHuntCount - 1) * 0.0057);
                const getMod = (pl: Player, k: string) => {
                    let t = 0; Object.values(pl.equipment).forEach(i => { if(i?.modifiers?.[k]) t += i.modifiers[k]!; }); return t;
                };
                
                const blessedChanceBonus = getMod(p, 'blessedChance');
                const totalChance = baseSpawnChance + countBonus + (blessedChanceBonus / 100);

                const isBoss = !!(baseMonster as Boss).cooldownSeconds;
                const instanceId = `${baseMonster.id}-${now}-${Math.random().toString(36).substr(2, 5)}`;

                // RARITY SPAWN CHECK: Must be Level 12+ or Forced
                if (!isBoss && (p.level >= 12) && (forcedType || Math.random() < totalChance)) {
                    currentMonsterInstance = createInfluencedMonster(baseMonster, forcedType);
                    currentMonsterInstance.guid = instanceId;
                    currentMonsterInstance.spawnTime = now;
                    if (!p.tutorials.seenRareMob) triggers.tutorial = 'mob';
                    if (!forcedType) log(`Warning! A ${currentMonsterInstance.name} appeared!`, 'danger');
                    
                    // RARE MOBS SPAWN ALONE (1x)
                    monsterHp = currentMonsterInstance.maxHp * 1;
                } else {
                    currentMonsterInstance = { ...baseMonster, guid: instanceId, spawnTime: now };
                    // NORMAL MOBS SPAWN IN PACKS (Lure)
                    monsterHp = currentMonsterInstance.maxHp * settingsHuntCount;
                }
            }
        }

        const monster = (monsterHp > 0) ? currentMonsterInstance : undefined;
        
        const SPAWN_DELAY_MS = 600;
        const isSpawning = monster && monster.spawnTime && (now - monster.spawnTime < SPAWN_DELAY_MS);

        if (monster && !isSpawning) {
            // Determine effective hunt count for this specific fight
            // Rare/Influenced monsters are always fought 1v1 to prevent impossible difficulty
            const effectiveHuntCount = monster.isInfluenced ? 1 : settingsHuntCount;

            const getMod = (pl: Player, k: string) => {
                let t = 0; Object.values(pl.equipment).forEach(i => { if(i?.modifiers?.[k]) t += i.modifiers[k]!; }); return t;
            };

            // --- 1. MONSTER ATTACK PHASE (Throttled) ---
            if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
                lastMonsterAttackTime = now;

                const rawDmgBase = Math.floor(Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin;
                let difficultyMult = 1;
                // CHANGED: Reduced from 0.08 (8%) to 0.03 (3%) per extra mob
                if (effectiveHuntCount > 1) difficultyMult = 1 + ((effectiveHuntCount - 1) * 0.03);
                
                let totalIncomingRaw = Math.floor((rawDmgBase * effectiveHuntCount) * difficultyMult * hazardDmgMult);
                
                if (hazardCritChance > 0 && Math.random() < hazardCritChance) {
                    totalIncomingRaw = Math.floor(totalIncomingRaw * hazardCritDmg);
                    hit('CRIT', 'speech', 'monster');
                }

                const mitigation = calculatePlayerDefense(p);
                let actualDmg = Math.max(0, Math.floor(totalIncomingRaw - mitigation));
                
                const dodgeChance = getMod(p, 'dodgeChance');
                if (dodgeChance > 0 && Math.random() < (dodgeChance / 100)) {
                    actualDmg = 0;
                    hit('DODGED', 'speech', 'player');
                }

                const shieldRes = processSkillTraining(p, SkillType.DEFENSE, 1);
                p = shieldRes.player;
                if (shieldRes.leveledUp) log(`Shielding up: ${p.skills[SkillType.DEFENSE].level}!`, 'gain');

                if (actualDmg > 0) {
                    
                    // --- UTAMO VITA (MAGIC SHIELD) LOGIC ---
                    if (p.magicShieldUntil && p.magicShieldUntil > now) {
                        // 70% Damage to Mana, 30% to HP
                        const manaDmg = Math.floor(actualDmg * 0.70);
                        let hpDmg = Math.floor(actualDmg * 0.30);
                        
                        // Handle Mana Spillover
                        if (p.mana >= manaDmg) {
                            p.mana -= manaDmg;
                        } else {
                            // Mana broke, remaining damage adds to HP damage
                            const spillOver = manaDmg - p.mana;
                            p.mana = 0;
                            hpDmg += spillOver;
                            // Shield technically breaks if mana is gone, but the buff timer remains for simplicity 
                            // or until next automation tick recasts it.
                        }
                        
                        // Apply HP Damage
                        p.hp -= hpDmg;
                        
                        // Visual Feedback for Mana Shield usage
                        if (Math.random() > 0.8) hit('MANA SHIELD', 'speech', 'player');

                    } else {
                        // Normal Damage
                        p.hp -= actualDmg;
                    }

                    if (Math.random() > 0.8) log(`You lost ${actualDmg} hitpoints due to an attack by ${monster.name}.`, 'combat');
                    hit(actualDmg, 'damage', 'player');

                    const reflection = getMod(p, 'reflection');
                    if (reflection > 0) {
                        const reflectedDmg = Math.floor(actualDmg * (reflection / 100));
                        if (reflectedDmg > 0) {
                            monsterHp -= reflectedDmg;
                            hit(reflectedDmg, 'damage', 'monster');
                            // Visual feedback for Reflect
                            if(Math.random() > 0.8) log('Damage reflected!', 'magic');
                        }
                    }

                    // --- DEATH CHECK ---
                    if (p.hp <= 0) {
                        
                        let penaltyRate = 0.10; // Default 10%
                        if (p.hasBlessing) {
                            penaltyRate = 0.04; // Blessed 4%
                            p.hasBlessing = false;
                            log('The Blessing of Henricus reduced your death penalty!', 'magic');
                        }

                        // 1. Calculate XP Loss
                        const xpLossAmount = Math.floor(p.maxXp * penaltyRate);
                        const goldLoss = Math.floor(p.gold * penaltyRate); // Gold Loss (Inventory)

                        // 2. Apply XP Loss with De-leveling
                        if (p.currentXp >= xpLossAmount) {
                            p.currentXp -= xpLossAmount;
                        } else {
                            if (p.level > 1) {
                                const remainingDebt = xpLossAmount - p.currentXp;
                                p.level--; // Level Down
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
                                p.currentXp = 0; // Cap at Level 1, 0 XP
                            }
                        }

                        // Reset Vitals
                        p.hp = p.maxHp;
                        p.mana = p.maxMana;
                        p.activeHuntId = null;
                        p.magicShieldUntil = 0; // Clear Shield on Death
                        stopHunt = true;
                        
                        // Apply Gold Loss
                        p.gold = Math.max(0, p.gold - goldLoss);

                        // 3. SKILL LOSS
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

                        return {
                            player: p,
                            monsterHp: 0,
                            newLogs: logs,
                            newHits: hits,
                            stopHunt: true,
                            stopTrain: false,
                            bossDefeatedId,
                            activeMonster: undefined,
                            killedMonsters,
                            triggers,
                            stats
                        };
                    }
                } else {
                    if (actualDmg === 0 && dodgeChance <= 0) hit('Miss', 'miss', 'player');
                }
            }

            // --- 2. PLAYER ATTACK PHASE ---
            let autoAttackDamage = calculatePlayerDamage(p);
            let hasSufficientMana = true;

            // Check Mana Cost for Wand/Rod Attacks
            const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
            if (weapon?.manaCost && weapon.manaCost > 0) {
                if (p.mana >= weapon.manaCost) {
                    p.mana -= weapon.manaCost;
                } else {
                    autoAttackDamage = 0; // Cannot attack
                    hasSufficientMana = false;
                    hit('No Mana', 'miss', 'player');
                }
            }
            
            if (hasSufficientMana) {
                if ((monster as Boss).cooldownSeconds) {
                    const bossBonus = getMod(p, 'bossSlayer');
                    if (bossBonus > 0) autoAttackDamage = Math.floor(autoAttackDamage * (1 + (bossBonus / 100)));
                }

                const critChance = getMod(p, 'critChance');
                if (autoAttackDamage > 0 && Math.random() < (critChance / 100)) {
                    autoAttackDamage = Math.floor(autoAttackDamage * 1.5);
                    hit('CRIT!', 'speech', 'player');
                }

                const attackSpeed = getMod(p, 'attackSpeed');
                if (autoAttackDamage > 0 && Math.random() < (attackSpeed / 100)) {
                    const extraDmg = Math.floor(autoAttackDamage * 0.7); 
                    autoAttackDamage += extraDmg;
                    hit('Double Hit!', 'speech', 'player');
                }

                const executionerChance = getMod(p, 'executioner');
                const executionerThreshold = monster.maxHp * effectiveHuntCount * 0.20; 
                if (monsterHp < executionerThreshold && executionerChance > 0) {
                    if (Math.random() < (executionerChance / 100)) {
                        autoAttackDamage = monsterHp; // Instant Kill
                        hit('EXECUTED!', 'speech', 'player');
                        log('Executioner triggered! Instant kill.', 'danger');
                    }
                }

                if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) {
                    autoAttackDamage = 0;
                    hit('DODGED', 'speech', 'monster');
                }

                if (autoAttackDamage > 0) {
                    if (Math.random() > 0.7) log(`You hit ${monster.name} for ${autoAttackDamage} hitpoints.`, 'combat');
                    
                    // ICE RAPIER MECHANIC
                    if (p.equipment[EquipmentSlot.HAND_RIGHT]?.id === 'ice_rapier') {
                        delete p.equipment[EquipmentSlot.HAND_RIGHT];
                        log('Your Ice Rapier shattered!', 'danger');
                        hit('SHATTERED!', 'speech', 'player');
                    }
                }

                const usedSkill = weapon?.scalingStat || SkillType.FIST;
                const skillRes = processSkillTraining(p, usedSkill, 1);
                p = skillRes.player;
                if (skillRes.leveledUp) log(`Skill ${usedSkill} up: ${p.skills[usedSkill].level}!`, 'gain');

                if (weapon?.scalingStat === SkillType.DISTANCE && weapon.weaponType) {
                    const ammo = p.equipment[EquipmentSlot.AMMO];
                    if (ammo && autoAttackDamage > 0) {
                        if (ammo.count && ammo.count > 0) {
                            if (ammo.ammoType === 'arrow' || ammo.ammoType === 'bolt') {
                                stats.waste += ammo.price || 0;
                                ammo.count--;
                                if (ammo.count <= 0) {
                                    delete p.equipment[EquipmentSlot.AMMO];
                                    log(`You ran out of ${ammo.name}!`, 'danger');
                                }
                            }
                        } else if (!ammo.count && (ammo.ammoType === 'arrow' || ammo.ammoType === 'bolt')) {
                            delete p.equipment[EquipmentSlot.AMMO];
                        }
                    }
                }
            }

            // Apply Auto Attack Damage
            if (autoAttackDamage > 0) {
                monsterHp -= autoAttackDamage;
                hit(autoAttackDamage, 'damage', 'monster');
            }

            // --- SPELL/RUNE ATTACK PHASE (Independent) ---
            if (p.settings.autoAttackSpell && p.globalCooldown <= now) {
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
                        const spellDmg = calculateSpellDamage(p, spell);
                        
                        // --- AOE vs SINGLE TARGET LOGIC ---
                        const finalSpellDmg = spell.isAoe ? spellDmg * effectiveHuntCount : spellDmg; 
                        
                        if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) {
                             hit('DODGED', 'speech', 'monster');
                        } else {
                            // Apply Spell Damage separately
                            monsterHp -= finalSpellDmg;
                            hit(finalSpellDmg, 'damage', 'monster');
                            
                            hit(spellName, 'speech', 'player');
                            if (Math.random() > 0.7) {
                                log(`You hit ${monster.name} for ${finalSpellDmg} hitpoints. (Spell: ${spellName})`, 'combat');
                            }
                        }

                        p.mana -= spell.manaCost;
                        p.spellCooldowns[spell.id] = now + (spell.cooldown || 2000);
                        p.globalCooldown = now + 1000;
                        
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
                        const runeDmg = calculateRuneDamage(p, runeItem);
                        
                        // --- RUNE AOE LOGIC ---
                        let finalRuneDmg = runeDmg;
                        if (runeItem.runeType === 'area') {
                            finalRuneDmg = runeDmg * effectiveHuntCount;
                        }
                        
                        if (hazardDodgeChance > 0 && Math.random() < hazardDodgeChance) {
                             hit('DODGED', 'speech', 'monster');
                        } else {
                            // Apply Rune Damage separately
                            monsterHp -= finalRuneDmg;
                            hit(finalRuneDmg, 'damage', 'monster');

                            if (Math.random() > 0.7) {
                                log(`You hit ${monster.name} for ${finalRuneDmg} hitpoints. (Rune: ${runeItem.name})`, 'combat');
                            }
                        }

                        p.inventory[runeItem.id]--;
                        stats.waste += runeItem.price || 0;
                        p.runeCooldown = now + 1000; 
                        const magicRes = processSkillTraining(p, SkillType.MAGIC, 20); 
                        p = magicRes.player;
                    }
                }
            }

            // --- LOOT PHASE & KILL COUNT ---
            if (monsterHp <= 0) {
                // TRACK KILL
                killedMonsters.push({ name: monster.name, count: effectiveHuntCount });

                const goldDropBase = Math.floor(Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold;
                const goldDrop = goldDropBase * effectiveHuntCount;
                const staminaMultiplier = p.stamina > 0 ? 1.5 : 1.0;
                const stageMult = getXpStageMultiplier(p.level);
                
                let preyXpMult = 1;
                // Only count ACTIVE prey
                const activePrey = p.prey.slots.find(s => s.monsterId === monster.id && s.active);
                if (activePrey && activePrey.bonusType === 'xp') {
                    preyXpMult = 1 + (activePrey.bonusValue / 100);
                }
                
                const equipXpBonus = getMod(p, 'xpBoost');
                preyXpMult += (equipXpBonus / 100);

                if (p.premiumUntil > now) preyXpMult += 1.0; // +100% Premium
                if (p.xpBoostUntil > now) preyXpMult += 2.0; // +200% Boost
                
                const ascXpBonus = getAscensionBonusValue(p, 'xp_boost');
                preyXpMult += (ascXpBonus / 100);

                preyXpMult += (hazardXpBonus - 1); 

                const xpGained = Math.floor(monster.exp * stageMult * staminaMultiplier * effectiveHuntCount * preyXpMult);
                p.currentXp += xpGained;
                stats.xpGained += xpGained;

                const levelResult = checkForLevelUp(p);
                p = levelResult.player;
                if (levelResult.leveledUp) {
                    log(`Level Up! ${p.level}. HP+${levelResult.hpGain}, MP+${levelResult.manaGain}.`, 'gain');
                    hit('LEVEL UP!', 'heal', 'player');
                }

                const ascGoldBonus = 1 + (getAscensionBonusValue(p, 'gold_boost') / 100);
                const goldFindBonus = 1 + (getMod(p, 'goldFind') / 100); 
                const finalGold = Math.floor(goldDrop * ascGoldBonus * goldFindBonus);
                
                p.gold += finalGold;
                stats.goldGained += finalGold;
                stats.profitGained += finalGold;

                let lootBonus = 0;
                if (activePrey && activePrey.bonusType === 'loot') lootBonus += activePrey.bonusValue;
                lootBonus += getAscensionBonusValue(p, 'loot_boost');
                lootBonus += getMod(p, 'lootBoost');
                if (p.premiumUntil > now) lootBonus += 20; // +20% Loot
                
                lootBonus += hazardLootBonus;

                let combinedStandardLoot: {[key:string]: number} = {};
                
                if (monster.isInfluenced) {
                    let minTokens = 1;
                    let maxTokens = 2;
                    if (monster.influencedType === 'enraged') { minTokens = 2; maxTokens = 4; }
                    if (monster.influencedType === 'blessed') { minTokens = 5; maxTokens = 10; }
                    
                    const tokenQty = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;
                    combinedStandardLoot['forge_token'] = tokenQty;
                    log(`You found ${tokenQty} Forge Tokens!`, 'gain');
                }

                // Check CURRENT slots before processing multiple drops
                let currentSlots = Object.keys(p.inventory).length + (p.uniqueInventory?.length || 0);
                let bpFullMessageSent = false;

                // Loop for multiple loot rolls if lured
                for(let i=0; i<effectiveHuntCount; i++) {
                    const drop = generateLootWithRarity(monster, lootBonus);
                    
                    // Process Unique Items
                    drop.unique.forEach(uniqueItem => {
                        // CHECK SKIPPED LOOT FOR UNIQUE ITEMS
                        if (p.skippedLoot.includes(uniqueItem.id)) return;

                        // Check Slot Limit
                        if (currentSlots < MAX_BACKPACK_SLOTS) {
                            if (!p.uniqueInventory) p.uniqueInventory = [];
                            p.uniqueInventory.push(uniqueItem);
                            currentSlots++; // Increment usage
                            
                            log(`Rare Drop: ${uniqueItem.name} (${uniqueItem.rarity})!`, 'loot', uniqueItem.rarity);
                            hit("RARE DROP!", 'speech', 'player');
                            
                            if (!p.tutorials.seenRareItem) {
                                triggers.tutorial = 'item';
                            }
                        } else {
                            if (!bpFullMessageSent) {
                                log("Backpack full! Rare items discarded.", 'danger');
                                bpFullMessageSent = true;
                            }
                        }
                    });

                    // Aggregate Standard Loot for this iteration
                    Object.entries(drop.standard).forEach(([itemId, qty]) => { 
                        if (p.skippedLoot.includes(itemId)) return;
                        combinedStandardLoot[itemId] = (combinedStandardLoot[itemId] || 0) + qty; 
                    });
                }

                const lootValue = calculateLootValue(combinedStandardLoot);
                stats.profitGained += lootValue;

                let lootMsg = "";
                
                // Process Aggregated Standard Loot
                Object.entries(combinedStandardLoot).forEach(([itemId, qty]) => {
                    const itemName = SHOP_ITEMS.find(i => i.id === itemId)?.name || itemId;
                    
                    if (p.inventory[itemId]) {
                        // Item exists, just stack it (Unlimited stack size logic for now, or assumed safe)
                        p.inventory[itemId] += qty;
                        lootMsg += `, ${qty}x ${itemName}`;
                    } else {
                        // New item slot needed
                        if (currentSlots < MAX_BACKPACK_SLOTS) {
                            p.inventory[itemId] = qty;
                            currentSlots++;
                            lootMsg += `, ${qty}x ${itemName}`;
                        } else {
                            if (!bpFullMessageSent) {
                                log("Backpack full! Standard items discarded.", 'danger');
                                bpFullMessageSent = true;
                            }
                        }
                    }
                });

                if (lootMsg) log(`Loot x${effectiveHuntCount} ${monster.name}: ${finalGold} gp${lootMsg}. (${xpGained} xp)`, 'loot');

                p.taskOptions.forEach(task => {
                    if (task.status === 'active' && !task.isComplete) {
                        if (task.type === 'kill' && task.monsterId === monster.id) {
                            task.killsCurrent += effectiveHuntCount;
                            if (task.killsCurrent >= task.killsRequired) {
                                task.isComplete = true;
                                log('Task Complete! Return to Task Panel to claim reward.', 'gain');
                            }
                        }
                    }
                });

                // --- QUEST PROGRESSION (UPDATED) ---
                const relevantQuests = QUESTS.filter(q => 
                    // Matches specific monster ID
                    q.targetMonsterId === monster.id || 
                    // Matches ANY_RARE + monster is influenced
                    (q.targetMonsterId === 'ANY_RARE' && monster.isInfluenced)
                );

                relevantQuests.forEach(q => {
                    if (!p.quests[q.id]) p.quests[q.id] = { kills: 0, completed: false };
                    if (!p.quests[q.id].completed) {
                        if (q.requiredKills && p.quests[q.id].kills < q.requiredKills) {
                            // Rare Mobs are always 1x (no luring), but standard logic supports >1
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
                    log(`${monster.name} derrotado!`, 'gain');
                    
                    if (monster.id === 'primal_menace' && p.hazardLevel < 100) {
                        p.hazardLevel = Math.min(100, p.hazardLevel + 1);
                        log(`Hazard Level Increased to ${p.hazardLevel}!`, 'danger');
                    }
                }

                monsterHp = 0; 
                respawnUnlockTime = now + 500; 
            }
        }
    }

    const returnInstance = (monsterHp > 0 || (currentMonsterInstance && now <= respawnUnlockTime)) ? currentMonsterInstance : undefined;

    // Check Oracle Triggers (Level 2 Name / Level 8 Vocation)
    // Only trigger if not already handled
    if ((p.level >= 2 && !p.isNameChosen) || (p.level >= 8 && p.vocation === Vocation.NONE)) {
        triggers.oracle = true;
    }

    return {
        player: p,
        monsterHp,
        newLogs: logs,
        newHits: hits,
        stopHunt,
        stopTrain,
        bossDefeatedId,
        activeMonster: returnInstance,
        killedMonsters, // Return the list
        triggers,
        stats
    };
};
