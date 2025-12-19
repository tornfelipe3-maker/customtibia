
import { Player, SkillType, LogEntry, HitSplat, Rarity } from '../../types';
import { processSkillTraining } from '../progression';

// Helper for log/hit callbacks
type LogFunc = (msg: string, type: LogEntry['type'], rarity?: Rarity) => void;
type HitFunc = (val: number | string, type: HitSplat['type'], target: 'player'|'monster') => void;

export const processTraining = (
    player: Player, 
    activeSkill: SkillType | null, 
    log: LogFunc, 
    hit: HitFunc
): Player => {
    let p = { ...player };

    if (activeSkill) {
        let trainingAmount = 10;
        if (activeSkill === SkillType.MAGIC) {
            trainingAmount = 250;
        }

        const result = processSkillTraining(p, activeSkill, trainingAmount);
        p = result.player;
        
        if (result.leveledUp) {
          log(`Sua skill ${activeSkill} subiu para o nível ${p.skills[activeSkill].level}!`, 'gain');
          hit('Skill Up!', 'heal', 'player');
        }
        
        // Passive Shielding Training for Melee
        if ([SkillType.SWORD, SkillType.AXE, SkillType.CLUB].includes(activeSkill)) {
            const shieldRes = processSkillTraining(p, SkillType.DEFENSE, 10);
            p = shieldRes.player;
            if (shieldRes.leveledUp) {
              log(`Sua skill Shielding subiu para o nível ${p.skills[SkillType.DEFENSE].level}!`, 'gain');
              hit('Shield Up!', 'heal', 'player');
            }
        }
    }

    return p;
};
