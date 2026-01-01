
import { Player, SkillType, Vocation } from "../types";
import { getPointsForNextSkill, getXpForLevel } from "../constants";
import { getAscensionBonusValue } from "./mechanics";

/**
 * SANITY CHECK: Valida se o progresso de XP é fisicamente possível
 * no tempo decorrido desde o último save.
 */
export const validateProgressSanity = (player: Player, oldPlayer: Player, secondsElapsed: number): boolean => {
    if (player.isGm) return true; // GMs podem tudo

    // Calculamos o XP máximo teórico por hora (estimativa generosa de 15kk/h para high levels)
    const maxSafeXpPerSecond = (player.level * 1000) + 10000; 
    const xpGained = player.currentXp - oldPlayer.currentXp + (player.level > oldPlayer.level ? oldPlayer.maxXp : 0);
    
    if (xpGained > maxSafeXpPerSecond * secondsElapsed * 2) {
        console.warn("Cheat detectado: Ganho de XP impossível.");
        return false;
    }

    return true;
};

export const getEffectiveSkill = (player: Player, skillType: SkillType): number => {
  let baseLevel = player.skills[skillType].level;
  
  Object.values(player.equipment).forEach(item => {
    if (item && item.skillBonus && item.skillBonus[skillType]) {
      baseLevel += item.skillBonus[skillType]!;
    }
  });

  return baseLevel;
};

const PRIMARY_SKILLS: Record<Vocation, SkillType[]> = {
    [Vocation.KNIGHT]: [SkillType.AXE, SkillType.SWORD, SkillType.CLUB, SkillType.DEFENSE],
    [Vocation.PALADIN]: [SkillType.DISTANCE, SkillType.DEFENSE],
    [Vocation.SORCERER]: [SkillType.MAGIC],
    [Vocation.DRUID]: [SkillType.MAGIC],
    [Vocation.MONK]: [SkillType.FIST, SkillType.DEFENSE],
    [Vocation.NONE]: []
};

const getSkillStageMultiplier = (level: number, skillType: SkillType, vocation: Vocation): number => {
    if (vocation === Vocation.NONE) {
        if (level <= 10) return 5;  
        if (level <= 13) return 2;  
        return 0.5;                 
    }

    const isPrimary = PRIMARY_SKILLS[vocation]?.includes(skillType);
    if (!isPrimary) return 1; 

    let mult = 1;
    if (level <= 25) mult = 50; 
    else if (level <= 40) mult = 30; 
    else if (level <= 60) mult = 15; 
    else if (level <= 70) mult = 10; 
    else if (level <= 80) mult = 5;  
    else if (level <= 90) mult = 3;  
    else if (level <= 100) mult = 2; 
    else mult = 1;

    if (vocation === Vocation.PALADIN) {
        if (skillType === SkillType.DISTANCE) mult *= 1.3;
        if (skillType === SkillType.DEFENSE) mult *= 0.6;
    }
    
    return mult;
};

const isPremium = (player: Player) => player.premiumUntil > Date.now();

export const processSkillTraining = (player: Player, skillType: SkillType, valueOverride: number = 0): { player: Player, leveledUp: boolean } => {
  const p = { ...player };
  const skill = p.skills[skillType];
  let rawAmount = valueOverride > 0 ? valueOverride : 1;
  const stageMultiplier = getSkillStageMultiplier(skill.level, skillType, p.vocation);
  let finalAmount = rawAmount * stageMultiplier;

  if (isPremium(p)) finalAmount *= 2;

  let pointsNeeded = getPointsForNextSkill(skillType, skill.level, p.vocation);
  let currentPoints = (skill.progress / 100) * pointsNeeded;
  currentPoints += finalAmount;
  let leveledUp = false;
  
  while (currentPoints >= pointsNeeded) {
      currentPoints -= pointsNeeded;
      skill.level += 1;
      leveledUp = true;
      pointsNeeded = getPointsForNextSkill(skillType, skill.level, p.vocation);
  }
  
  skill.progress = (currentPoints / pointsNeeded) * 100;
  return { player: p, leveledUp };
};

export const checkForLevelUp = (player: Player): { player: Player, leveledUp: boolean, hpGain: number, manaGain: number, trigger?: 'level12' | 'ascension' } => {
    let p = { ...player };
    let leveledUp = false;
    let totalHpGain = 0;
    let totalManaGain = 0;
    let tutorialTrigger: any = undefined;

    while (p.currentXp >= p.maxXp) {
        p.currentXp -= p.maxXp;
        p.level += 1;
        p.maxXp = getXpForLevel(p.level);

        if (p.level === 12 && !p.tutorials.seenLevel12) {
            p.tutorials.seenLevel12 = true;
            tutorialTrigger = 'level12';
        }
        if (p.level === 30 && !p.tutorials.seenAscension) {
            p.tutorials.seenAscension = true;
            tutorialTrigger = 'ascension';
        }

        let hpGain = 5; let manaGain = 5;
        if (p.vocation === Vocation.KNIGHT) { hpGain = 15; manaGain = 5; }
        else if (p.vocation === Vocation.PALADIN) { hpGain = 10; manaGain = 15; }
        else if (p.vocation === Vocation.SORCERER || p.vocation === Vocation.DRUID) { hpGain = 5; manaGain = 30; }

        p.maxHp += hpGain; 
        p.hp = p.maxHp;
        p.maxMana += manaGain; 
        p.mana = p.maxMana;
        
        totalHpGain += hpGain;
        totalManaGain += manaGain;
        leveledUp = true;
    }
    
    return { player: p, leveledUp, hpGain: totalHpGain, manaGain: totalManaGain, trigger: tutorialTrigger };
};
