
import { Player, Monster, Boss, LogEntry, HitSplat, EquipmentSlot, SkillType, Vocation, Rarity } from '../../types';
import { MONSTERS, BOSSES, SHOP_ITEMS, SPELLS, QUESTS, getXpForLevel, MAX_BACKPACK_SLOTS } from '../../constants'; 
import { calculatePlayerDamage, calculateSpellDamage, calculateRuneDamage, calculatePlayerDefense } from '../combat';
import { processSkillTraining, checkForLevelUp, getEffectiveSkill } from '../progression';
import { getXpStageMultiplier, createInfluencedMonster, getAscensionBonusValue } from '../mechanics';
import { generateLootWithRarity, calculateLootValue } from '../loot';

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

export const resetHuntState = () => {
    currentMonsterInstance = undefined;
    respawnUnlockTime = 0;
    lastMonsterAttackTime = 0;
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

    const settingsHuntCount = p.activeHuntCount || 1;
    const potentialBoss = BOSSES.find(b => b.id === huntId);
    const isBossTarget = !!potentialBoss;

    const hazard = isBossTarget ? 0 : (p.activeHazardLevel || 0);
    const hazardDmgMult = 1 + (hazard * 0.01);
    const hazardXpBonus = 1 + (hazard * 0.02);
    const hazardLootBonus = hazard;

    // Spawn Logic
    const baseMonster = MONSTERS.find(m => m.id === huntId) || potentialBoss;
    const canSpawn = now > respawnUnlockTime;
    const needsSpawn = !currentMonsterInstance || currentMonsterInstance.id !== huntId || monsterHp <= 0;

    if (needsSpawn && canSpawn && baseMonster) {
        const forcedType = p.gmExtra?.forceRarity;
        const baseSpawnChance = 0.03;
        const totalChance = baseSpawnChance + (Math.min(0.04, (settingsHuntCount - 1) * 0.0057));

        if (!isBossTarget && (p.level >= 12) && (forcedType || Math.random() < totalChance)) {
            currentMonsterInstance = createInfluencedMonster(baseMonster, forcedType);
            currentMonsterInstance.spawnTime = now;
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
        const effectiveHuntCount = monster.isInfluenced ? 1 : settingsHuntCount;

        // Monster Attack
        if (now >= lastMonsterAttackTime + (monster.attackSpeedMs || 2000)) {
            lastMonsterAttackTime = now;
            const rawDmg = Math.floor((Math.random() * (monster.damageMax - monster.damageMin + 1)) + monster.damageMin);
            const totalIncoming = Math.floor(rawDmg * effectiveHuntCount * hazardDmgMult);
            const mitigation = calculatePlayerDefense(p);
            let actualDmg = Math.max(0, totalIncoming - mitigation);

            if (p.magicShieldUntil && p.magicShieldUntil > now) {
                const manaDmg = Math.floor(actualDmg * 0.7);
                const hpDmg = Math.floor(actualDmg * 0.3);
                if (p.mana >= manaDmg) { p.mana -= manaDmg; p.hp -= hpDmg; }
                else { p.hp -= (actualDmg - p.mana); p.mana = 0; }
            } else {
                p.hp -= actualDmg;
            }
            hit(actualDmg, 'damage', 'player');
            
            // LOG DE DANO RECEBIDO (Aba Damage)
            if (actualDmg > 0) {
                log(`You lose ${actualDmg} hitpoints due to an attack by a ${monster.name}.`, 'combat');
            } else {
                log(`A ${monster.name} attacks you but you block it.`, 'combat');
            }
            
            if (p.hp <= 0) {
                stopHunt = true;
            }
        }

        // Player Attack
        let playerDmg = calculatePlayerDamage(p);
        const weapon = p.equipment[EquipmentSlot.HAND_RIGHT];
        if (weapon?.manaCost && p.mana < weapon.manaCost) playerDmg = 0;
        else if (weapon?.manaCost) p.mana -= weapon.manaCost;

        if (playerDmg > 0) {
            monsterHp -= playerDmg;
            hit(playerDmg, 'damage', 'monster');
            
            // LOG DE DANO CAUSADO (Aba Damage)
            log(`A ${monster.name} loses ${playerDmg} hitpoints due to your attack.`, 'combat');

            const usedSkill = weapon?.scalingStat || SkillType.FIST;
            const res = processSkillTraining(p, usedSkill, 1);
            p = res.player;
        }

        // Kill Processing
        if (monsterHp <= 0) {
            killedMonsters.push({ name: monster.name, count: effectiveHuntCount });
            const stageMult = getXpStageMultiplier(p.level);
            const xpGained = Math.floor(monster.exp * stageMult * effectiveHuntCount * hazardXpBonus);
            p.currentXp += xpGained;
            stats.xpGained = xpGained;

            // LOG DE XP (Aba Server)
            log(`You gained ${xpGained} experience points.`, 'gain');

            // Level Up Check
            const lvlResult = checkForLevelUp(p);
            if (lvlResult.leveledUp) {
                p = lvlResult.player;
                log(`You advanced from Level ${p.level - 1} to Level ${p.level}.`, 'gain');
                hit('LEVEL UP!', 'heal', 'player');
                if (p.level >= 12 && !p.tutorials.seenLevel12) {
                    triggers.tutorial = 'level12';
                }
            }

            const goldDrop = Math.floor((Math.random() * (monster.maxGold - monster.minGold + 1)) + monster.minGold) * effectiveHuntCount;
            p.gold += goldDrop;
            stats.goldGained = goldDrop;

            const drop = generateLootWithRarity(monster, hazardLootBonus);
            drop.unique.forEach(u => p.uniqueInventory.push(u));
            Object.entries(drop.standard).forEach(([id, q]) => p.inventory[id] = (p.inventory[id] || 0) + q);

            // LOG DE LOOT (Aba Loot)
            const lootParts: string[] = [];
            if (goldDrop > 0) lootParts.push(`${goldDrop} gold coins`);
            Object.entries(drop.standard).forEach(([id, q]) => {
                const item = SHOP_ITEMS.find(i => i.id === id);
                if (item) lootParts.push(`${q}x ${item.name}`);
            });
            drop.unique.forEach(u => lootParts.push(`a ${u.name}`));
            
            if (lootParts.length > 0) {
                log(`Loot of a ${monster.name}: ${lootParts.join(', ')}.`, 'loot');
            } else {
                log(`Loot of a ${monster.name}: nothing.`, 'loot');
            }

            if (isBossTarget) {
                bossDefeatedId = monster.id;
                stopHunt = true;
            }
            respawnUnlockTime = now + 500;
        }
    }

    return { player: p, monsterHp, newLogs: [], newHits: [], stopHunt, bossDefeatedId, activeMonster: monster, killedMonsters, triggers, stats };
};
