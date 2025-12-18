
import { Player, Spell, Item, EquipmentSlot, SkillType, Vocation } from "../types";
import { getEffectiveSkill } from "./progression"; 
import { getAscensionBonusValue } from "./mechanics";

const isPremium = (player: Player) => player.premiumUntil > Date.now();

// --- BALANCE CONSTANTS ---

// Defense: How much of the Armor Value is effective per vocation
const ARMOR_EFFICIENCY = {
    [Vocation.KNIGHT]: 1.20,   // Buffed: 120% Armor Effectiveness (Tank Master)
    [Vocation.PALADIN]: 0.85, // Buffed: 85% Armor Effectiveness
    [Vocation.MONK]: 0.60,
    [Vocation.SORCERER]: 0.40, // 40% (Squishy)
    [Vocation.DRUID]: 0.40,
    [Vocation.NONE]: 0.50
};

// Shielding: Multiplier for Skill * Defense
const SHIELD_FACTOR = 0.05; 

// Damage Scaling Factors
const MELEE_FACTOR = {
    [Vocation.KNIGHT]: 0.16,  // Buffed from 0.12 -> High scaling with Weapon/Skill
    [Vocation.PALADIN]: 0.06,
    [Vocation.MONK]: 0.10,
    [Vocation.SORCERER]: 0.03,
    [Vocation.DRUID]: 0.03,
    [Vocation.NONE]: 0.04
};

const DIST_FACTOR = {
    [Vocation.PALADIN]: 0.17, // Buffed from 0.14 -> High scaling for Distance
    [Vocation.KNIGHT]: 0.04,
    [Vocation.SORCERER]: 0.04,
    [Vocation.DRUID]: 0.04,
    [Vocation.MONK]: 0.04,
    [Vocation.NONE]: 0.05
};

// HELPER: Checks if player meets requirement to use item stats
const canUseItem = (player: Player, item: Item): boolean => {
    if (item.requiredLevel && player.level < item.requiredLevel) return false;
    return true;
};

export const calculatePlayerDamage = (player: Player): number => {
  const equippedWeapon = player.equipment[EquipmentSlot.HAND_RIGHT]; 
  const weapon = (equippedWeapon && canUseItem(player, equippedWeapon)) ? equippedWeapon : undefined;
  
  let attackValue = weapon?.attack || 1;
  let skillLevel = 10;
  let factor = 0.05;
  let baseLevelDmg = player.level * 0.6; 
  let damage = 0;

  if (!weapon) {
    skillLevel = getEffectiveSkill(player, SkillType.FIST);
    factor = player.vocation === Vocation.MONK ? 0.18 : 0.12; 
    const baseDmg = baseLevelDmg + (skillLevel * 5 * factor); 
    const maxDmg = Math.floor(baseDmg);
    const minDmg = Math.floor(baseDmg * 0.6);
    damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
  } else {
    if (weapon.scalingStat === SkillType.MAGIC) {
        const avgDmg = (attackValue * 1.5) + (player.level * 0.5);
        const minDmg = Math.floor(avgDmg * 0.9);
        const maxDmg = Math.ceil(avgDmg * 1.1);
        damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
    } else if (weapon.scalingStat === SkillType.DISTANCE) {
        skillLevel = getEffectiveSkill(player, SkillType.DISTANCE);
        factor = DIST_FACTOR[player.vocation] || 0.04;
        let ammoAtk = 0;
        if (weapon.weaponType) {
            const ammo = player.equipment[EquipmentSlot.AMMO];
            if (ammo && ammo.attack && 
               ((weapon.weaponType === 'bow' && ammo.ammoType === 'arrow') ||
               (weapon.weaponType === 'crossbow' && ammo.ammoType === 'bolt'))) {
                 ammoAtk = ammo.attack || 0;
            } else {
                return 0;
            }
        } else {
            ammoAtk = attackValue; 
        }
        const totalWeaponAtk = ammoAtk + (weapon.attack || 0);
        const maxHit = baseLevelDmg + (skillLevel * totalWeaponAtk * factor);
        const minDmg = Math.floor(maxHit * 0.45);
        const maxDmg = Math.floor(maxHit);
        damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
    } else {
        const stat = weapon.scalingStat || SkillType.SWORD;
        skillLevel = getEffectiveSkill(player, stat);
        factor = MELEE_FACTOR[player.vocation] || 0.04;
        const maxHit = baseLevelDmg + (skillLevel * attackValue * factor);
        const minDmg = Math.floor(maxHit * 0.6);
        const maxDmg = Math.floor(maxHit);
        damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
    }
  }

  if (player.promoted) damage = Math.floor(damage * 1.10);
  if (isPremium(player)) damage = Math.floor(damage * 1.50);
  if (player.activeHuntId) {
      const prey = player.prey.slots.find(p => p.monsterId === player.activeHuntId && p.active);
      if (prey && prey.bonusType === 'damage') {
          damage = Math.floor(damage * (1 + (prey.bonusValue / 100)));
      }
  }
  const ascBonus = getAscensionBonusValue(player, 'damage_boost');
  if (ascBonus > 0) damage = Math.floor(damage * (1 + (ascBonus / 100)));
  return Math.max(1, damage);
};

export const calculateSpellDamage = (player: Player, spell: Spell): number => {
  const magicLevel = getEffectiveSkill(player, SkillType.MAGIC);
  let damage = 0;
  
  if (player.vocation === Vocation.KNIGHT && spell.type === 'attack') {
      const equippedWeapon = player.equipment[EquipmentSlot.HAND_RIGHT];
      const weapon = (equippedWeapon && canUseItem(player, equippedWeapon)) ? equippedWeapon : undefined;
      const weaponSkill = getEffectiveSkill(player, weapon?.scalingStat || SkillType.SWORD);
      const atk = weapon?.attack || 10;
      let mult = 1.0;
      if (spell.id === 'exori') mult = 1.2; 
      if (spell.id === 'exori_gran') mult = 2.2; 
      if (spell.id === 'exori_min') mult = 2.8; 
      if (spell.id === 'exori_mas') mult = 1.8;
      const dmg = (player.level * 0.5) + (weaponSkill * atk * 0.05 * mult);
      damage = Math.floor(dmg * (0.85 + Math.random() * 0.3)); 
  } else if (player.vocation === Vocation.PALADIN && spell.damageType === 'holy') {
      const dist = getEffectiveSkill(player, SkillType.DISTANCE);
      let mlMult = 4.0; 
      if (spell.id === 'exevo_mas_san') mlMult = 5.5; 
      const avg = (player.level * 0.5) + (dist * 0.5) + (magicLevel * mlMult);
      damage = Math.floor(avg * (0.8 + Math.random() * 0.4));
  } else {
      let minMult = 2.5;
      let maxMult = 3.5;
      let base = 40;
      if (spell.manaCost < 50) { 
          minMult = 2.5; maxMult = 3.5; base = 30;
      } else if (spell.manaCost < 250) {
          minMult = 4.5; maxMult = 6.0; base = 80;
      } else {
          minMult = 7.0; maxMult = 9.0; base = 200;
      }
      const minDmg = (player.level * 0.2) + (magicLevel * minMult) + base;
      const maxDmg = (player.level * 0.2) + (magicLevel * maxMult) + base;
      damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + Math.floor(minDmg);
  }

  if (player.promoted) damage = Math.floor(damage * 1.1);
  if (isPremium(player)) damage = Math.floor(damage * 1.50);
  if (player.activeHuntId) {
      const prey = player.prey.slots.find(p => p.monsterId === player.activeHuntId && p.active);
      if (prey && prey.bonusType === 'damage') {
          damage = Math.floor(damage * (1 + (prey.bonusValue / 100)));
      }
  }
  const ascBonus = getAscensionBonusValue(player, 'damage_boost');
  if (ascBonus > 0) damage = Math.floor(damage * (1 + (ascBonus / 100)));
  if (spell.isAoe) damage = Math.floor(damage * 1.20);
  return damage;
};

export const calculateRuneDamage = (player: Player, item: Item): number => {
  if (!item.isRune) return 0;
  const magicLevel = getEffectiveSkill(player, SkillType.MAGIC);
  let minMult = 1.2;
  let maxMult = 1.8;
  let base = 30;
  if (item.id === 'sd_rune') {
      minMult = 6.0;
      maxMult = 8.5; 
      base = 150;
  } else if (item.runeType === 'area') {
      minMult = 2.5;
      maxMult = 3.5;
      base = 60;
  }
  const minDmg = (player.level * 0.2) + (magicLevel * minMult) + base;
  const maxDmg = (player.level * 0.2) + (magicLevel * maxMult) + base;
  let damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + Math.floor(minDmg);
  if (player.promoted) damage = Math.floor(damage * 1.1);
  if (isPremium(player)) damage = Math.floor(damage * 1.50);
  const ascBonus = getAscensionBonusValue(player, 'damage_boost');
  if (ascBonus > 0) damage = Math.floor(damage * (1 + (ascBonus / 100)));
  if (item.runeType === 'area') damage = Math.floor(damage * 1.20);
  return damage;
};

export const calculateSpellHealing = (player: Player, spell: Spell): number => {
  const magicLevel = getEffectiveSkill(player, SkillType.MAGIC);
  
  if (player.vocation === Vocation.KNIGHT) {
      let multiplier = 4; 
      let base = 40;
      if (spell.id === 'exura_gran_ico') { multiplier = 10; base = 300; }
      const heal = (player.level * 0.5) + (magicLevel * multiplier) + base;
      return Math.floor(heal * (0.9 + Math.random() * 0.2));
  }

  if (player.vocation === Vocation.PALADIN) {
      let multiplier = 12;
      let base = 80;
      if (spell.id === 'exura_gran_san') { multiplier = 20; base = 250; }
      const heal = (player.level * 0.3) + (magicLevel * multiplier) + base;
      return Math.floor(heal * (0.9 + Math.random() * 0.2));
  }

  // --- MAGE HEALING BALANCING (REDUCED BY ~30%) ---
  // Old Multipliers: 8.0, 14.0, 22.0, 30.0
  // Old Bases: 50, 120, 250, 400
  let multiplier = 5.5; 
  let base = 35;
  if (spell.id === 'exura_gran') { multiplier = 9.8; base = 84; }
  if (spell.id === 'exura_vita') { multiplier = 15.4; base = 175; }
  if (spell.id === 'exura_gran_mas_res') { multiplier = 21.0; base = 280; }
  
  const minHeal = (player.level * 0.15) + (magicLevel * multiplier) + base;
  const maxHeal = (player.level * 0.15) + (magicLevel * (multiplier * 1.2)) + base;

  return Math.floor(Math.random() * (maxHeal - minHeal + 1)) + Math.floor(minHeal);
};

export const calculatePlayerDefense = (player: Player): number => {
  let totalArmor = 0;
  let shieldDef = 0;
  Object.values(player.equipment).forEach((item) => {
    if (item && canUseItem(player, item)) {
      if (item.armor) totalArmor += item.armor;
      if (item.slot === EquipmentSlot.HAND_LEFT) shieldDef = item.defense || 0;
      if (item.slot === EquipmentSlot.HAND_RIGHT && item.defense) shieldDef += item.defense * 0.3;
    }
  });
  const shieldingSkill = getEffectiveSkill(player, SkillType.DEFENSE);
  const vocation = player.vocation || Vocation.NONE;
  const armEfficiency = ARMOR_EFFICIENCY[vocation] || 0.5;
  const avgArmor = totalArmor * 0.75; 
  const armorReduction = avgArmor * armEfficiency;
  const shieldReduction = (shieldDef * shieldingSkill) * SHIELD_FACTOR;
  let finalDef = Math.floor(armorReduction + shieldReduction);
  if (player.activeHuntId) {
      const prey = player.prey.slots.find(p => p.monsterId === player.activeHuntId && p.active);
      if (prey && prey.bonusType === 'defense') {
          finalDef = Math.floor(finalDef * (1 + (prey.bonusValue / 100)));
      }
  }
  return Math.max(0, finalDef);
};
