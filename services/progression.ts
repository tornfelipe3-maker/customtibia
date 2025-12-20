
import { Player, SkillType, Vocation } from "../types";
import { getPointsForNextSkill, getXpForLevel } from "../constants";
import { getAscensionBonusValue } from "./mechanics";

export const getEffectiveSkill = (player: Player, skillType: SkillType): number => {
  let baseLevel = player.skills[skillType].level;
  
  Object.values(player.equipment).forEach(item => {
    if (item && item.skillBonus && item.skillBonus[skillType]) {
      baseLevel += item.skillBonus[skillType]!;
    }
  });

  return baseLevel;
};

// Define Primary Skills for each vocation (The ones that get the Boost Stages)
const PRIMARY_SKILLS: Record<Vocation, SkillType[]> = {
    [Vocation.KNIGHT]: [SkillType.AXE, SkillType.SWORD, SkillType.CLUB, SkillType.DEFENSE],
    [Vocation.PALADIN]: [SkillType.DISTANCE, SkillType.DEFENSE],
    [Vocation.SORCERER]: [SkillType.MAGIC],
    [Vocation.DRUID]: [SkillType.MAGIC],
    [Vocation.MONK]: [SkillType.FIST, SkillType.DEFENSE],
    [Vocation.NONE]: [] // Rookgaard/None gets no bonuses or generic ones
};

// Skill Stages: Multipliers based on current skill level AND if it is a primary skill
const getSkillStageMultiplier = (level: number, skillType: SkillType, vocation: Vocation): number => {
    
    // NO VOCATION BALANCING (Rookgaard Style)
    if (vocation === Vocation.NONE) {
        if (level <= 10) return 5;  
        if (level <= 13) return 2;  
        return 0.5;                 
    }

    // Check if this skill is primary for the vocation
    const isPrimary = PRIMARY_SKILLS[vocation]?.includes(skillType);

    // If it is NOT a primary skill, return base rate (1x)
    if (!isPrimary) {
        return 1; 
    }

    // Base Multiplier based on Skill Level
    let mult = 1;
    if (level <= 25) mult = 50; // Super Fast
    else if (level <= 40) mult = 30; // Very Fast
    else if (level <= 60) mult = 15; // Fast
    else if (level <= 70) mult = 10; // Medium
    else if (level <= 80) mult = 5;  // Slowing down
    else if (level <= 90) mult = 3;  // Hard
    else if (level <= 100) mult = 2; // Very Hard
    else mult = 1;

    // VOCATION SPECIFIC WEIGHTING
    if (vocation === Vocation.PALADIN) {
        // Paladins gain Distance 30% faster than the standard primary rate
        if (skillType === SkillType.DISTANCE) mult *= 1.3;
        // Paladins gain Shielding slower than Knights (0.6x effectiveness)
        if (skillType === SkillType.DEFENSE) mult *= 0.6;
    }

    if (vocation === Vocation.KNIGHT) {
        // Knights gain Shielding at full primary rate (1.0x)
        // Weapon skills are already handled by the primary 'mult'
    }
    
    return mult;
};

const isPremium = (player: Player) => player.premiumUntil > Date.now();

/**
 * Processes skill progression with Stages logic per Vocation.
 * Supports multiple level-ups per tick if gain is massive.
 */
export const processSkillTraining = (player: Player, skillType: SkillType, valueOverride: number = 0): { player: Player, leveledUp: boolean } => {
  const p = { ...player };
  const skill = p.skills[skillType];
  
  // Base amount (1 for hit, or specific value like mana spent)
  let rawAmount = valueOverride > 0 ? valueOverride : 1;
  
  // Apply Stage Multiplier based on Level AND Vocation logic
  const stageMultiplier = getSkillStageMultiplier(skill.level, skillType, p.vocation);
  
  let finalAmount = rawAmount * stageMultiplier;

  // --- PREMIUM BONUS (2x SKILL) ---
  if (isPremium(p)) {
      finalAmount *= 2;
  }

  // Calculate points needed for current level
  let pointsNeeded = getPointsForNextSkill(skillType, skill.level, p.vocation);
  
  // Convert current percentage progress to raw points
  let currentPoints = (skill.progress / 100) * pointsNeeded;
  
  // Add new points
  currentPoints += finalAmount;
  
  let leveledUp = false;
  
  // Handle leveling up (potentially multiple times)
  while (currentPoints >= pointsNeeded) {
      currentPoints -= pointsNeeded;
      skill.level += 1;
      leveledUp = true;
      
      // Update points needed for the new level
      pointsNeeded = getPointsForNextSkill(skillType, skill.level, p.vocation);
  }
  
  // Convert remaining points back to percentage
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

        // Gatilhos de Tutoriais por Level
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
