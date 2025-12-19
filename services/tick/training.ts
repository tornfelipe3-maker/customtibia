
import { Player, SkillType, LogEntry, HitSplat, Rarity } from '../../types';
import { processSkillTraining } from '../progression';

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
          log(`You advanced to ${activeSkill} level ${p.skills[activeSkill].level}!`, 'gain');
          hit('SKILL UP!', 'heal', 'player');
        }
        
        // Treino passivo de shielding para armas melee
        if ([SkillType.SWORD, SkillType.AXE, SkillType.CLUB].includes(activeSkill)) {
            const shieldRes = processSkillTraining(p, SkillType.DEFENSE, 10);
            p = shieldRes.player;
            if (shieldRes.leveledUp) {
              log(`You advanced to shielding level ${p.skills[SkillType.DEFENSE].level}!`, 'gain');
              hit('SHIELD UP!', 'heal', 'player');
            }
        }
    }

    return p;
};
