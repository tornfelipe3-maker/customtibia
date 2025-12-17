
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
    // Limits progression significantly to prevent high skills before vocation.
    if (vocation === Vocation.NONE) {
        if (level <= 10) return 5;  // Moderate start (vs 50x for main)
        if (level <= 13) return 2;  // Slows down significantly
        return 0.5;                 // Very slow ("Soft Cap" at 13)
    }

    // Check if this skill is primary for the vocation
    const isPrimary = PRIMARY_SKILLS[vocation]?.includes(skillType);

    // If it is NOT a primary skill (e.g. Knight training Magic Level), return base rate (1x)
    // This respects the "proportion" - harder skills remain hard.
    if (!isPrimary) {
        // Special case: Mages training shielding is slightly faster than weapon skills but still secondary
        if ((vocation === Vocation.SORCERER || vocation === Vocation.DRUID) && skillType === SkillType.DEFENSE) {
            return 1;
        }
        return 1; 
    }

    // PRIMARY SKILL STAGES (The user's requested curve for Main Characters)
    if (level <= 25) return 50; // Super Fast
    if (level <= 40) return 30; // Very Fast
    if (level <= 60) return 15; // Fast
    if (level <= 70) return 10; // Medium
    if (level <= 80) return 5;  // Slowing down
    if (level <= 90) return 3;  // Hard
    if (level <= 100) return 2; // Very Hard
    
    return 1;                   // Real Tibia (Level 100+)
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

export const checkForLevelUp = (player: Player): { player: Player, leveledUp: boolean, hpGain: number, manaGain: number } => {
    let p = { ...player };
    let leveledUp = false;
    let totalHpGain = 0;
    let totalManaGain = 0;

    while (p.currentXp >= p.maxXp) {
        p.currentXp -= p.maxXp;
        p.level += 1;
        p.maxXp = getXpForLevel(p.level);

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
    
    return { player: p, leveledUp, hpGain: totalHpGain, manaGain: totalManaGain };
};
