
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity } from '../../types';
import { MONSTERS, BOSSES, SHOP_ITEMS, SPELLS } from '../../constants'; 
import { calculatePlayerDamage, calculateSpellDamage, calculateRuneDamage, calculatePlayerDefense } from '../combat';
import { processSkillTraining, checkForLevelUp } from '../progression';
import { getXpStageMultiplier, createInfluencedMonster, getAscensionBonusValue } from '../mechanics';
import { generateLootWithRarity } from '../loot';

export interface HuntTickResult {
    player: Player;
    monsterHp: number;
    newLogs: LogEntry[];
    newHits: HitSplat[];
    stopHunt: boolean;
    bossDefeatedId?: string;
    activeMonster: Monster | undefined;
    killedMonsters: { name: string, count: number }[] | any;
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
    const killedMonsters: any[] = [];
    const triggers: any = {};
    const stats = { xpGained: 0, goldGained: 0, profitGained: 0, waste: 0 };

    const potentialBoss = BOSSES.find(b => b.id === huntId);
    const isBossTarget = !!potentialBoss;
    const baseMonster = MONSTERS.find(m => m.id === huntId) || potentialBoss;

    if (!baseMonster) return { player: p, monsterHp, newLogs: [], newHits: [], stopHunt: true, activeMonster: undefined, killedMonsters, triggers, stats };

    // --- 0. PREY CONSUMPTION ---
    p.prey.slots.forEach(slot => {
        if (slot.active && slot.monsterId === huntId) {
            slot.duration = Math.max(0, slot.duration - 1000);
            if (slot.duration <= 0) {
                slot.active = false;
                log(`Your prey bonus for ${baseMonster.name} has expired.`, 'info');
            }
        }
    });

    // --- 1. SPAWN LOGIC ---
    if ((!currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0) && now > respawnUnlockTime) {
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
    
    // Pequeno delay de spawn para animação
    if (monster && (!monster.spawnTime || now - monster.spawnTime >= 600)) {
        const effectiveHuntCount = monster.isInfluenced ? 1 : (p.activeHuntCount || 1);
        
        // Atributos de itens
        let totalDodge = 0; let totalReflect = 0; let totalCrit = 0; let totalExec = 0;
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
            
            if (Math.random() * 100 < totalDodge) {
                hit('DODGE', 'miss', 'player');
            } else {
                const rawDmg = Math.floor((Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin);
                const hazardMult = 1 + ((p.activeHazardLevel || 0) * 0.01);
                const lureRisk = 1 + (Math.max(0, effectiveHuntCount - 1) * 0.03);
                const totalIncoming = Math.floor(rawDmg * effectiveHuntCount * hazardMult * lureRisk);
                const mitigation = calculatePlayerDefense(p);
                let actualDmg = Math.max(0, totalIncoming - mitigation);

                if (totalReflect > 0 && actualDmg > 0) {
                    const reflected = Math.floor(actualDmg * (totalReflect / 100));
                    monsterHp -= reflected;
                    hit(reflected, 'damage', 'monster');
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

        // --- 3. PLAYER OFFENSIVE ---
        // Spells
        if (!stopHunt && p.settings.autoAttackSpell && p.settings.attackSpellRotation?.length > 0 && now > (p.attackCooldown || 0)) {
            for (const spellId of p.settings.attackSpellRotation) {
                const spell = SPELLS.find(s => s.id === spellId);
                if (spell && p.purchasedSpells.includes(spellId) && p.mana >= spell.manaCost && (p.spellCooldowns[spellId] || 0) <= now) {
                    let dmg = calculateSpellDamage(p, spell);
                    if (Math.random() * 100 < totalCrit) { dmg = Math.floor(dmg * 1.5); hit('CRITICAL!', 'speech', 'player'); }
                    monsterHp -= dmg;
                    p.mana -= spell.manaCost;
                    p.spellCooldowns[spellId] = now + spell.cooldown;
                    p.attackCooldown = now + 2000;
                    const match = spell.name.match(/\((.*?)\)/);
                    const inc = match ? match[1] : spell.name;
                    hit(inc, 'speech', 'player'); hit(dmg, 'damage', 'monster');
                    log(`A ${monster.name} loses ${dmg} hitpoints due to your spell (${inc}).`, 'combat');
                    p = processSkillTraining(p, SkillType.MAGIC, spell.manaCost).player;
                    break; 
                }
            }
        }

        // Physical
        if (!stopHunt && now >= lastPlayerAttackTime + 2000) {
            lastPlayerAttackTime = now;
            let playerDmg = calculatePlayerDamage(p);
            if (Math.random() * 100 < totalCrit) { playerDmg = Math.floor(playerDmg * 1.5); hit('CRIT', 'speech', 'player'); }
            const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
            if (weapon?.manaCost && p.mana < weapon.manaCost) playerDmg = 0;
            else if (weapon?.manaCost) p.mana -= weapon.manaCost;

            if (playerDmg > 0) {
                monsterHp -= playerDmg;
                hit(playerDmg, 'damage', 'monster');
                log(`A ${monster.name} loses ${playerDmg} hitpoints due to your attack.`, 'combat');
                p = processSkillTraining(p, (weapon?.scalingStat || SkillType.FIST), 1).player;
            } else if (weapon) {
                hit('MISS', 'miss', 'monster');
            }

            if (totalExec > 0 && monsterHp > 0 && (monsterHp / (monster.maxHp * effectiveHuntCount)) < 0.1) {
                if (Math.random() * 100 < totalExec) { monsterHp = 0; hit('EXECUTE', 'speech', 'player'); }
            }
        }

        // --- 4. KILL PROCESSING ---
        if (monsterHp <= 0) {
            killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
            
            // Tasks/Quests Progress
            p.taskOptions.forEach(task => {
                if (task.status === 'active' && task.type === 'kill') {
                    if (task.targetId === monster.id || (monster.isInfluenced && task.targetId === 'ANY_RARE')) {
                        task.killsCurrent = (task.killsCurrent || 0) + effectiveHuntCount;
                        if (task.killsCurrent >= task.amountRequired) task.isComplete = true;
                    }
                }
            });
            if (monster.isInfluenced) {
                ['green_djinn_access', 'blue_djinn_access'].forEach(q => { if (p.quests[q] && !p.quests[q].completed) p.quests[q].kills++; });
            }

            // XP CALCULATION (FULL STACK)
            const stageMult = getXpStageMultiplier(p.level);
            const staminaMult = p.stamina > 0 ? 1.5 : 1.0;
            let xpMult = 1.0;
            
            // Add Premium (+100%)
            if (p.premiumUntil > now) xpMult += 1.0;
            // Add XP Boost (+200%)
            if (p.xpBoostUntil > now) xpMult += 2.0;
            // Add Prey XP
            const preyXP = p.prey.slots.find(s => s.monsterId === huntId && s.active && s.bonusType === 'xp');
            if (preyXP) xpMult += (preyXP.bonusValue / 100);
            // Add Ascension XP
            xpMult += (getAscensionBonusValue(p, 'xp_boost') / 100);
            // Add Hazard XP
            if (!isBossTarget) xpMult += ((p.activeHazardLevel || 0) * 0.02);

            const xpGained = Math.floor(monster.exp * stageMult * effectiveHuntCount * xpMult * staminaMult);
            p.currentXp += xpGained;
            stats.xpGained = xpGained;
            log(`You gained ${xpGained} experience points.`, 'gain');

            const lvlResult = checkForLevelUp(p);
            if (lvlResult.leveledUp) { p = lvlResult.player; log(`You advanced to level ${p.level}.`, 'gain'); hit('LEVEL UP!', 'heal', 'player'); }

            // GOLD & LOOT (FULL STACK)
            let goldMult = 1.0 + (getAscensionBonusValue(p, 'gold_boost') / 100);
            const goldDrop = Math.floor((Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold) * effectiveHuntCount * goldMult;
            p.gold += goldDrop;
            stats.goldGained = goldDrop;

            // Loot Multiplier
            let lootBonus = 0;
            const preyLoot = p.prey.slots.find(s => s.monsterId === huntId && s.active && s.bonusType === 'loot');
            if (preyLoot) lootBonus += preyLoot.bonusValue;
            if (!isBossTarget) lootBonus += (p.activeHazardLevel || 0);
            lootBonus += getAscensionBonusValue(p, 'loot_boost');

            const drop = generateLootWithRarity(monster, lootBonus);
            drop.unique.forEach(u => { p.uniqueInventory.push(u); if(!p.tutorials.seenRareItem) triggers.tutorial = 'item'; });
            Object.entries(drop.standard).forEach(([id, q]) => {
                if (!p.skippedLoot.includes(id)) p.inventory[id] = (p.inventory[id] || 0) + q;
            });

            // Log Loot
            const lootParts: string[] = [];
            if (goldDrop > 0) lootParts.push(`${goldDrop} gold coins`);
            Object.entries(drop.standard).forEach(([id, q]) => { if(!p.skippedLoot.includes(id)) lootParts.push(`${q}x ${SHOP_ITEMS.find(i=>i.id===id)?.name || id}`); });
            drop.unique.forEach(u => lootParts.push(`a ${u.name}`));
            log(`Loot of a ${monster.name}: ${lootParts.length ? lootParts.join(', ') : 'nothing'}.`, 'loot');

            if (isBossTarget) { bossDefeatedId = monster.id; stopHunt = true; }
            respawnUnlockTime = now + 1200;
        }
    }

    return { player: p, monsterHp, newLogs: [], newHits: [], stopHunt, bossDefeatedId, activeMonster: monster, killedMonsters, triggers, stats };
};
