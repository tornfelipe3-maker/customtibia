
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity, DamageType } from '../../types';
import { MONSTERS, BOSSES, SHOP_ITEMS, SPELLS } from '../../constants'; 
import { calculatePlayerDamage, calculateSpellDamage, calculateRuneDamage, calculatePlayerDefense } from '../combat';
import { processSkillTraining, checkForLevelUp } from '../progression';
import { getXpStageMultiplier, createInfluencedMonster } from '../mechanics';
import { generateLootWithRarity } from '../loot';

export interface HuntTickResult {
    player: Player;
    monsterHp: number;
    newLogs: LogEntry[];
    newHits: HitSplat[];
    stopHunt: boolean;
    bossDefeatedId?: string;
    activeMonster: Monster | undefined;
    killedMonsters: { name: string, count: number }[];
    triggers: { tutorial?: 'mob' | 'item' | 'ascension' | 'level12'; oracle?: boolean; };
    stats: { xpGained: number; goldGained: number; profitGained: number; waste: number; };
}

let currentMonsterInstance: Monster | undefined = undefined;
let respawnUnlockTime: number = 0;
let lastMonsterAttackTime: number = 0;
let lastPlayerAttackTime: number = 0;

export const resetHuntState = () => {
    currentMonsterInstance = undefined;
    respawnUnlockTime = 0;
    lastMonsterAttackTime = 0;
    lastPlayerAttackTime = 0;
};

export const processHuntTick = (
    player: Player,
    huntId: string,
    currentMonsterHp: number,
    now: number,
    log: (msg: string, type?: LogEntry['type'], rarity?: Rarity) => void,
    hit: (val: number | string, type: HitSplat['type'], target: 'player'|'monster') => void
): HuntTickResult => {
    let p = { ...player };
    let monsterHp = currentMonsterHp;
    let stopHunt = false;
    let bossDefeatedId: string | undefined = undefined;
    const killedMonsters: { name: string, count: number }[] = [];
    const triggers: any = {};
    const stats = { xpGained: 0, goldGained: 0, profitGained: 0, waste: 0 };

    const potentialBoss = BOSSES.find(b => b.id === huntId);
    const isBossTarget = !!potentialBoss;
    const baseMonster = MONSTERS.find(m => m.id === huntId) || potentialBoss;

    // --- 0. PREY DURATION CONSUMPTION ---
    p.prey.slots.forEach(slot => {
        if (slot.active && slot.monsterId === huntId) {
            slot.duration = Math.max(0, slot.duration - 1000);
            if (slot.duration <= 0) {
                slot.active = false;
                log(`Your prey bonus for ${baseMonster?.name} has expired.`, 'info');
            }
        }
    });

    // --- 1. SPAWN LOGIC ---
    if ((!currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0) && now > respawnUnlockTime && baseMonster) {
        const settingsHuntCount = p.activeHuntCount || 1;
        const totalChance = 0.03 + (Math.min(0.04, (settingsHuntCount - 1) * 0.0057));

        if (!isBossTarget && p.level >= 12 && Math.random() < totalChance) {
            currentMonsterInstance = createInfluencedMonster(baseMonster, p.gmExtra?.forceRarity);
            if (!p.tutorials.seenRareMob) triggers.tutorial = 'mob';
            log(`Warning! A ${currentMonsterInstance.name} appeared!`, 'danger');
            monsterHp = currentMonsterInstance.maxHp;
        } else {
            currentMonsterInstance = { ...baseMonster, guid: `${baseMonster.id}-${now}`, spawnTime: now };
            monsterHp = currentMonsterInstance.maxHp * settingsHuntCount;
        }
    }

    const monster = (monsterHp > 0) ? currentMonsterInstance : undefined;
    if (monster && (!monster.spawnTime || now - monster.spawnTime >= 600)) {
        const effectiveHuntCount = monster.isInfluenced ? 1 : (p.activeHuntCount || 1);
        
        // Atributos de itens acumulados
        let totalDodge = 0;
        let totalReflect = 0;
        let totalCrit = 0;
        let totalExec = 0;
        Object.values(p.equipment).forEach(item => {
            if (item?.modifiers) {
                totalDodge += (item.modifiers.dodgeChance || 0);
                totalReflect += (item.modifiers.reflection || 0);
                totalCrit += (item.modifiers.critChance || 0);
                totalExec += (item.modifiers.executioner || 0);
            }
        });

        // --- 2. MONSTER ATTACK ---
        if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
            lastMonsterAttackTime = now;
            
            // DODGE CHECK
            if (Math.random() * 100 < totalDodge) {
                hit('DODGE', 'miss', 'player');
                log(`You dodged an attack by a ${monster.name}.`, 'combat');
            } else {
                const rawDmg = Math.floor((Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin);
                const hazardMult = 1 + ((p.activeHazardLevel || 0) * 0.01);
                // Lure Risk: +3% per extra mob
                const lureRisk = 1 + (Math.max(0, effectiveHuntCount - 1) * 0.03);
                const totalIncoming = Math.floor(rawDmg * effectiveHuntCount * hazardMult * lureRisk);
                const mitigation = calculatePlayerDefense(p);
                let actualDmg = Math.max(0, totalIncoming - mitigation);

                // REFLECTION CHECK
                if (totalReflect > 0 && actualDmg > 0) {
                    const reflected = Math.floor(actualDmg * (totalReflect / 100));
                    if (reflected > 0) {
                        monsterHp -= reflected;
                        hit(reflected, 'damage', 'monster');
                        log(`You reflected ${reflected} damage back to ${monster.name}.`, 'combat');
                    }
                }

                if (p.magicShieldUntil && p.magicShieldUntil > now) {
                    const manaDmg = Math.floor(actualDmg * 0.7);
                    const hpDmg = Math.floor(actualDmg * 0.3);
                    if (p.mana >= manaDmg) { p.mana -= manaDmg; p.hp -= hpDmg; }
                    else { p.hp -= (actualDmg - p.mana); p.mana = 0; }
                } else {
                    p.hp -= actualDmg;
                }
                hit(actualDmg, 'damage', 'player');
                log(`You lose ${actualDmg} hitpoints due to an attack by a ${monster.name}.`, 'combat');
            }
            
            if (p.hp <= 0) stopHunt = true;
        }

        // --- 3. AUTO OFFENSIVE AUTOMATION ---
        // Spell Rotation
        if (!stopHunt && p.settings.autoAttackSpell && p.settings.attackSpellRotation?.length > 0 && now > (p.attackCooldown || 0)) {
            for (const spellId of p.settings.attackSpellRotation) {
                const spell = SPELLS.find(s => s.id === spellId);
                if (spell && p.purchasedSpells.includes(spellId) && p.mana >= spell.manaCost && (p.spellCooldowns[spellId] || 0) <= now) {
                    let dmg = calculateSpellDamage(p, spell);
                    
                    // CRIT CHECK
                    if (Math.random() * 100 < totalCrit) {
                        dmg = Math.floor(dmg * 1.5);
                        hit('CRITICAL!', 'speech', 'player');
                    }

                    monsterHp -= dmg;
                    p.mana -= spell.manaCost;
                    p.spellCooldowns[spellId] = now + spell.cooldown;
                    p.attackCooldown = now + 2000;
                    
                    const match = spell.name.match(/\((.*?)\)/);
                    const inc = match ? match[1] : spell.name;
                    hit(inc, 'speech', 'player');
                    hit(dmg, 'damage', 'monster');
                    log(`A ${monster.name} loses ${dmg} hitpoints due to your spell (${inc}).`, 'combat');
                    
                    p = processSkillTraining(p, SkillType.MAGIC, spell.manaCost).player;
                    break; 
                }
            }
        }

        // Rune Usage
        if (!stopHunt && p.settings.autoAttackRune && p.settings.selectedRuneId && now > (p.runeCooldown || 0)) {
            const runeId = p.settings.selectedRuneId;
            if ((p.inventory[runeId] || 0) > 0) {
                const rune = SHOP_ITEMS.find(i => i.id === runeId);
                if (rune && rune.isRune && p.level >= (rune.requiredLevel || 0) && p.skills[SkillType.MAGIC].level >= (rune.reqMagicLevel || 0)) {
                    let dmg = calculateRuneDamage(p, rune);
                    monsterHp -= dmg;
                    p.inventory[runeId]--;
                    stats.waste += rune.price || 0;
                    p.runeCooldown = now + 2000;
                    hit(dmg, 'damage', 'monster');
                    log(`A ${monster.name} loses ${dmg} hitpoints due to your rune (${rune.name}).`, 'combat');
                }
            }
        }

        // Physical Attack
        if (!stopHunt && now >= lastPlayerAttackTime + 2000) {
            lastPlayerAttackTime = now;
            let playerDmg = calculatePlayerDamage(p);
            
            // CRIT CHECK
            if (Math.random() * 100 < totalCrit) {
                playerDmg = Math.floor(playerDmg * 1.5);
                hit('CRIT', 'speech', 'player');
            }

            const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
            if (weapon?.manaCost && p.mana < weapon.manaCost) playerDmg = 0;
            else if (weapon?.manaCost) p.mana -= weapon.manaCost;

            if (playerDmg > 0) {
                monsterHp -= playerDmg;
                hit(playerDmg, 'damage', 'monster');
                log(`A ${monster.name} loses ${playerDmg} hitpoints due to your attack.`, 'combat');
                const usedSkill = weapon?.scalingStat || SkillType.FIST;
                p = processSkillTraining(p, usedSkill, 1).player;
            } else if (weapon) {
                hit('MISS', 'miss', 'monster');
            }

            // EXECUTIONER CHECK
            if (totalExec > 0 && monsterHp > 0 && (monsterHp / (monster.maxHp * effectiveHuntCount)) < 0.1) {
                if (Math.random() * 100 < totalExec) {
                    monsterHp = 0;
                    hit('EXECUTE', 'speech', 'player');
                    log(`You executed ${monster.name}!`, 'combat');
                }
            }
        }

        // --- 4. KILL PROCESSING ---
        if (monsterHp <= 0) {
            killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
            
            // --- UPDATE TASKS ---
            p.taskOptions.forEach(task => {
                if (task.status === 'active' && task.type === 'kill') {
                    if (task.targetId === monster.id || (monster.isInfluenced && task.targetId === 'ANY_RARE')) {
                        task.killsCurrent = (task.killsCurrent || 0) + effectiveHuntCount;
                        if (task.killsCurrent >= task.amountRequired) task.isComplete = true;
                    }
                }
            });

            // --- UPDATE QUESTS (Rares for Djinns) ---
            if (monster.isInfluenced) {
                ['green_djinn_access', 'blue_djinn_access'].forEach(qId => {
                    if (p.quests[qId] && !p.quests[qId].completed) {
                        p.quests[qId].kills = (p.quests[qId].kills || 0) + 1;
                    }
                });
            }

            // XP Gain
            const stageMult = getXpStageMultiplier(p.level);
            const hazardXp = 1 + ((p.activeHazardLevel || 0) * 0.02);
            const xpGained = Math.floor(monster.exp * stageMult * effectiveHuntCount * hazardXp);
            p.currentXp += xpGained;
            stats.xpGained = xpGained;
            log(`You gained ${xpGained} experience points.`, 'gain');

            const lvlResult = checkForLevelUp(p);
            if (lvlResult.leveledUp) {
                p = lvlResult.player;
                log(`You advanced from Level ${p.level - 1} to Level ${p.level}.`, 'gain');
                hit('LEVEL UP!', 'heal', 'player');
            }

            // Gold Loot
            const goldDrop = Math.floor((Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold) * effectiveHuntCount;
            p.gold += goldDrop;
            stats.goldGained = goldDrop;

            // Item Loot
            const drop = generateLootWithRarity(monster, p.activeHazardLevel || 0);
            drop.unique.forEach(u => p.uniqueInventory.push(u));
            Object.entries(drop.standard).forEach(([id, q]) => p.inventory[id] = (p.inventory[id] || 0) + q);

            const lootParts: string[] = [];
            if (goldDrop > 0) lootParts.push(`${goldDrop} gold coins`);
            Object.entries(drop.standard).forEach(([id, q]) => {
                const item = SHOP_ITEMS.find(i => i.id === id);
                if (item) lootParts.push(`${q}x ${item.name}`);
            });
            drop.unique.forEach(u => lootParts.push(`a ${u.name}`));
            
            if (lootParts.length > 0) log(`Loot of a ${monster.name}: ${lootParts.join(', ')}.`, 'loot');
            else log(`Loot of a ${monster.name}: nothing.`, 'loot');

            if (isBossTarget) { bossDefeatedId = monster.id; stopHunt = true; }
            respawnUnlockTime = now + 1200;
        }
    }

    return { player: p, monsterHp, newLogs: [], newHits: [], stopHunt, bossDefeatedId, activeMonster: monster, killedMonsters, triggers, stats };
};
