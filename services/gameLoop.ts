
import { Player, Monster, LogEntry, HitSplat, SkillType, Rarity } from '../types';
import { processRegeneration } from './tick/regeneration';
import { processAutomation } from './tick/automation';
import { processTraining } from './tick/training';
import { processHuntTick, resetHuntState } from './tick/hunt';

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
    triggers: { tutorial?: 'mob' | 'item' | 'ascension' | 'level12'; oracle?: boolean; };
    stats: { xpGained: number; goldGained: number; profitGained: number; waste: number; };
}

export const resetCombatState = () => {
    resetHuntState();
};

export const processGameTick = (
    player: Player,
    activeHuntId: string | null,
    activeTrainingSkill: SkillType | null,
    currentMonsterHp: number,
    now: number
): GameTickResult => {
    
    let p = { ...player };
    const logs: LogEntry[] = [];
    const hits: HitSplat[] = [];
    let stopHunt = false;
    let stopTrain = false;
    let monsterHp = currentMonsterHp;
    let activeMonster: Monster | undefined = undefined;
    let killedMonsters: { name: string, count: number }[] = [];
    const triggers: any = {};
    const stats = { xpGained: 0, goldGained: 0, profitGained: 0, waste: 0 };

    // Callbacks de suporte para os sub-ticks
    const log = (msg: string, type: LogEntry['type'] = 'info', rarity?: Rarity) => {
        logs.push({ id: Math.random().toString(36).substr(2, 9), message: msg, type, timestamp: now, rarity });
    };
    const hit = (val: number | string, type: HitSplat['type'], target: 'player'|'monster') => {
        hits.push({ id: now + Math.random(), value: val, type, target });
    };

    // 1. Core Systems (Regen e Automação Passiva/Cura)
    p = processRegeneration(p, activeHuntId);
    const auto = processAutomation(p, now, log, hit);
    p = auto.player;
    stats.waste += auto.waste;

    // 2. Treino (Se não estiver caçando)
    if (activeTrainingSkill && !activeHuntId) {
        p = processTraining(p, activeTrainingSkill, log, hit);
    }

    // 3. Hunt (Contém Automação Ofensiva)
    if (activeHuntId) {
        const huntResult = processHuntTick(p, activeHuntId, monsterHp, now, log, hit);
        p = huntResult.player;
        monsterHp = huntResult.monsterHp;
        stopHunt = huntResult.stopHunt;
        activeMonster = huntResult.activeMonster;
        killedMonsters = huntResult.killedMonsters;
        
        stats.xpGained += huntResult.stats.xpGained;
        stats.goldGained += huntResult.stats.goldGained;
        stats.profitGained += huntResult.stats.goldGained; // Simplificado
        stats.waste += huntResult.stats.waste;
        
        if (huntResult.triggers.tutorial) triggers.tutorial = huntResult.triggers.tutorial;
        if (huntResult.bossDefeatedId) log(`You defeated ${activeMonster?.name}!`, 'gain');
    }

    // 4. Oracle Trigger
    if ((p.level >= 2 && !p.isNameChosen) || (p.level >= 8 && p.vocation === 'None')) {
        triggers.oracle = true;
    }

    return { player: p, monsterHp, newLogs: logs, newHits: hits, stopHunt, stopTrain, activeMonster, killedMonsters, triggers, stats };
};
