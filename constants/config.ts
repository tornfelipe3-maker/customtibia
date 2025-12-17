
import { Player, EquipmentSlot, SkillType, Vocation } from '../types';

export const IMG_BASE = 'https://tibia.fandom.com/wiki/Special:FilePath/';
export const OUT_BASE = 'https://www.tibiawiki.com.br/wiki/Special:FilePath/';

export const MAX_STAMINA = 10800; // 3 hours in seconds
export const MAX_BACKPACK_SLOTS = 40;
export const MAX_DEPOT_SLOTS = 2000;

export const EMPTY_SLOT_IMAGES: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: `${IMG_BASE}Helmet_Slot.gif`,
  [EquipmentSlot.NECK]: `${IMG_BASE}Necklace_Slot.gif`,
  [EquipmentSlot.BODY]: `${IMG_BASE}Armor_Slot.gif`,
  [EquipmentSlot.HAND_LEFT]: `${IMG_BASE}Hand_Slot.gif`,
  [EquipmentSlot.HAND_RIGHT]: `${IMG_BASE}Hand_Slot.gif`,
  [EquipmentSlot.LEGS]: `${IMG_BASE}Legs_Slot.gif`,
  [EquipmentSlot.FEET]: `${IMG_BASE}Boots_Slot.gif`,
  [EquipmentSlot.RING]: `${IMG_BASE}Ring_Slot.gif`,
  [EquipmentSlot.AMMO]: `${IMG_BASE}Ammo_Slot.gif`,
};

export const VOCATION_SPRITES = {
  [Vocation.NONE]: `${OUT_BASE}Outfit_Citizen_Male.gif`,
  [Vocation.KNIGHT]: `${OUT_BASE}Outfit_Knight_Male.gif`,
  [Vocation.PALADIN]: `${OUT_BASE}Outfit_Hunter_Male.gif`,
  [Vocation.SORCERER]: `${OUT_BASE}Outfit_Mage_Male.gif`,
  [Vocation.DRUID]: `${OUT_BASE}Outfit_Druid_Male.gif`,
  [Vocation.MONK]: `${OUT_BASE}Outfit_Citizen_Male.gif`,
};

export const REGEN_RATES = {
  [Vocation.NONE]: { hp: 1, mana: 1 },
  [Vocation.KNIGHT]: { hp: 6, mana: 2 },
  [Vocation.PALADIN]: { hp: 3, mana: 4 },
  [Vocation.SORCERER]: { hp: 1, mana: 8 },
  [Vocation.DRUID]: { hp: 1, mana: 8 },
  [Vocation.MONK]: { hp: 4, mana: 4 },
};

const ML_MULTIPLIERS = {
    [Vocation.SORCERER]: 1.1,
    [Vocation.DRUID]: 1.1,
    [Vocation.PALADIN]: 1.4,
    [Vocation.KNIGHT]: 3.0,
    [Vocation.MONK]: 2.0,
    [Vocation.NONE]: 3.0
};

export const getXpForLevel = (level: number): number => {
  return Math.floor((50 * Math.pow(level, 3) / 3) - (100 * Math.pow(level, 2)) + (850 * level / 3) - 200);
};

export const getPointsForNextSkill = (skill: SkillType, currentLevel: number, vocation: Vocation): number => {
  if (skill === SkillType.MAGIC) {
      const multiplier = ML_MULTIPLIERS[vocation] || 3.0;
      return Math.floor(1200 * Math.pow(multiplier, currentLevel));
  }
  let constant = 50;
  let power = 1.1;
  return Math.floor(constant * Math.pow(power, currentLevel));
};

export const INITIAL_PLAYER_STATS: Player = {
    name: '',
    isNameChosen: false,
    level: 1,
    vocation: Vocation.NONE,
    promoted: false,
    currentXp: 0,
    maxXp: getXpForLevel(2),
    hp: 150,
    maxHp: 150,
    mana: 35,
    maxMana: 35,
    stamina: MAX_STAMINA,
    gold: 0,
    bankGold: 0,
    lastSaveTime: Date.now(),
    activeHuntId: null,
    activeHuntCount: 1,
    activeHuntStartTime: 0, 
    activeTrainingSkill: null,
    activeTrainingStartTime: 0,
    equipment: {},
    inventory: {},
    uniqueInventory: [],
    relics: [],
    depot: {},
    uniqueDepot: [],
    gmExtra: { forceRarity: null },
    skills: {
        [SkillType.FIST]: { level: 10, progress: 0 },
        [SkillType.CLUB]: { level: 10, progress: 0 },
        [SkillType.SWORD]: { level: 10, progress: 0 },
        [SkillType.AXE]: { level: 10, progress: 0 },
        [SkillType.DISTANCE]: { level: 10, progress: 0 },
        [SkillType.DEFENSE]: { level: 10, progress: 0 },
        [SkillType.MAGIC]: { level: 0, progress: 0 },
    },
    settings: {
        autoHealthPotionThreshold: 0,
        selectedHealthPotionId: '',
        autoManaPotionThreshold: 0,
        selectedManaPotionId: '',
        autoHealSpellThreshold: 0,
        selectedHealSpellId: '',
        autoAttackSpell: false,
        selectedAttackSpellId: '',
        attackSpellRotation: [],
        autoAttackRune: false,
        selectedRuneId: '',
        autoMagicShield: false,
    },
    quests: {},
    bossCooldowns: {},
    spellCooldowns: {},
    healthPotionCooldown: 0, // NEW
    manaPotionCooldown: 0,   // NEW
    magicShieldUntil: 0,
    runeCooldown: 0,
    purchasedSpells: [],
    globalCooldown: 0,
    // Fix: Removed non-existent 'activeTask' property from INITIAL_PLAYER_STATS to match Player interface.
    taskOptions: [],
    taskNextFreeReroll: 0,
    skippedLoot: [],
    hasBlessing: false,
    hazardLevel: 0,
    activeHazardLevel: 0,
    tibiaCoins: 0,
    premiumUntil: 0,
    xpBoostUntil: 0,
    prey: {
        slots: [
            { monsterId: null, bonusType: 'xp', bonusValue: 0, active: false, startTime: 0, duration: 0 },
            { monsterId: null, bonusType: 'loot', bonusValue: 0, active: false, startTime: 0, duration: 0 },
            { monsterId: null, bonusType: 'damage', bonusValue: 0, active: false, startTime: 0, duration: 0 }
        ],
        nextFreeReroll: 0,
        rerollsAvailable: 3
    },
    soulPoints: 0,
    ascension: {
        gold_boost: 0,
        damage_boost: 0,
        loot_boost: 0,
        boss_cd: 0,
        soul_gain: 0,
        xp_boost: 0
    },
    tutorials: {
        introCompleted: false,
        seenRareMob: false,
        seenRareItem: false,
        seenAscension: false,
        seenLevel12: false,
        seenMenus: []
    }
};
