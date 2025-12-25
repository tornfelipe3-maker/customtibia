
import { EquipmentSlot, Vocation, SkillType, NpcType, DamageType, ImbuType } from './enums';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemModifiers {
    attack?: number;
    defense?: number;
    armor?: number;
    xpBoost?: number;
    lootBoost?: number;
    attackSpeed?: number;
    blessedChance?: number;
    critChance?: number;
    bossSlayer?: number;
    dodgeChance?: number;
    goldFind?: number;
    executioner?: number;
    reflection?: number;
    soulGain?: number; // Novo: Bônus de ganho de Soulpoints
    [key: string]: number | undefined;
}

export interface Skill {
  level: number;
  progress: number;
}

export interface Item {
  id: string;
  uniqueId?: string;
  name: string;
  type: 'equipment' | 'potion' | 'loot';
  rarity?: Rarity;
  modifiers?: ItemModifiers;
  potionType?: 'health' | 'mana' | 'spirit';
  ammoType?: 'arrow' | 'bolt';
  weaponType?: 'bow' | 'crossbow';
  slot?: EquipmentSlot;
  image?: string;
  attack?: number;
  defense?: number;
  armor?: number; 
  price: number;
  sellPrice: number;
  soldTo: NpcType[];
  description: string;
  requiredVocation?: Vocation[];
  requiredLevel?: number;
  reqMagicLevel?: number;
  scalingStat?: SkillType; 
  damageType?: DamageType;
  restoreAmount?: number;
  restoreAmountSecondary?: number;
  skillBonus?: {
    [key in SkillType]?: number;
  };
  isRune?: boolean;
  runeType?: 'single' | 'area';
  count?: number;
  manaCost?: number;
  isBag?: boolean; // Novo: Identifica se o item é uma bag de set
}

export interface LootDrop {
  itemId: string;
  chance: number;
  maxAmount: number;
}

export interface Monster {
  id: string;
  guid?: string;
  spawnTime?: number;
  name: string;
  level: number;
  image?: string;
  hp: number;
  maxHp: number;
  exp: number; 
  minGold: number;
  maxGold: number;
  damageMin: number;
  damageMax: number;
  attackSpeedMs: number; 
  lootTable?: LootDrop[];
  elements?: {
      [key in 'fire' | 'ice' | 'energy' | 'earth' | 'physical' | 'holy' | 'death']?: number;
  };
  isInfluenced?: boolean;
  influencedType?: 'corrupted' | 'blessed' | 'enraged';
}

export interface Boss extends Monster {
  cooldownSeconds: number;
  isDaily: boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  targetMonsterId?: string;
  requiredKills?: number;
  requiredLevel?: number;
  requiredItems?: { [itemId: string]: number };
  costGold?: number;
  rewardNpcAccess?: NpcType;
  rewardItems?: { itemId: string, count: number }[];
  rewardGold?: number;
  rewardExp?: number;
}

export type TaskStatus = 'available' | 'active';

export interface HuntingTask {
  uuid: string;
  type: 'kill' | 'collect';
  category: 'kill' | 'collect';
  status: TaskStatus;
  targetId: string;
  targetName: string;
  amountRequired: number;
  amountCurrent: number;
  rewardXp: number;
  rewardGold: number;
  monsterId?: string; 
  killsRequired?: number; 
  killsCurrent?: number; 
  isComplete?: boolean;
}

export interface PlayerSettings {
  autoHealthPotionThreshold: number;
  selectedHealthPotionId: string;
  autoManaPotionThreshold: number;
  selectedManaPotionId: string;
  autoHealSpellThreshold: number;
  selectedHealSpellId: string;
  autoAttackSpell: boolean;
  selectedAttackSpellId: string;
  attackSpellRotation: string[];
  autoAttackRune: boolean;
  selectedRuneId: string;
  autoMagicShield: boolean;
}

export type PreyBonusType = 'xp' | 'damage' | 'defense' | 'loot';

export interface PreySlot {
    monsterId: string | null;
    bonusType: PreyBonusType;
    bonusValue: number;
    active: boolean;
    startTime: number;
    duration: number;
}

export type AscensionPerk = 'gold_boost' | 'damage_boost' | 'loot_boost' | 'boss_cd' | 'soul_gain' | 'xp_boost' | 'hp_boost' | 'mana_boost' | 'potion_hp_boost' | 'potion_mana_boost';

export interface Relic {
    id: string;
    name: string;
    description: string;
    bonusType: 'gold' | 'xp' | 'damage';
    value: number;
    icon: string;
}

export interface GmFlags {
    forceRarity?: 'enraged' | 'blessed' | 'corrupted' | null;
}

export interface OfflineReport {
    secondsOffline: number;
    xpGained: number;
    goldGained: number;
    killedMonsters: { name: string, count: number }[];
    lootObtained: { [itemId: string]: number };
    leveledUp: number;
    skillTrained?: SkillType;
    skillGain?: number;
    waste: number;
    deathReport?: DeathReport;
}

export interface DeathReport {
    xpLoss: number;
    goldLoss: number;
    levelDown: boolean;
    vocation: Vocation;
    killerName: string;
    hasBlessing: boolean;
}

export interface PlayerImbuement {
    tier: number; // 0, 1, 2, 3
    timeRemaining: number; // seconds
}

export interface Player {
  name: string;
  isNameChosen?: boolean;
  isGm?: boolean;
  gmExtra?: GmFlags;
  level: number;
  vocation: Vocation;
  promoted: boolean;
  currentXp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  gold: number;
  bankGold: number;
  lastSaveTime: number;
  activeHuntId: string | null;
  activeHuntCount: number;
  activeHuntStartTime: number; 
  activeTrainingSkill: SkillType | null;
  activeTrainingStartTime: number;
  equipment: {
    [key in EquipmentSlot]?: Item;
  };
  inventory: {
    [itemId: string]: number;
  };
  uniqueInventory: Item[];
  relics: Relic[];
  depot: {
    [itemId: string]: number;
  };
  uniqueDepot: Item[];
  skills: {
    [key in SkillType]: Skill;
  };
  settings: PlayerSettings;
  quests: {
    [questId: string]: {
      kills: number;
      itemsHandedIn?: boolean;
      completed: boolean;
    }
  };
  bossCooldowns: {
    [bossId: string]: number;
  };
  spellCooldowns: {
    [spellId: string]: number;
  };
  healthPotionCooldown: number;
  manaPotionCooldown: number;
  magicShieldUntil: number;
  runeCooldown: number; 
  purchasedSpells: string[];
  globalCooldown: number;
  attackCooldown: number;
  healingCooldown: number;
  taskOptions: HuntingTask[];
  taskNextFreeReroll: number;
  skippedLoot: string[];
  hasBlessing: boolean;
  hazardLevel: number;
  activeHazardLevel: number;
  tibiaCoins: number;
  premiumUntil: number;
  xpBoostUntil: number;
  prey: {
      slots: PreySlot[];
      nextFreeReroll: number;
      rerollsAvailable: number;
  };
  soulPoints: number;
  ascension: {
      [key in AscensionPerk]: number;
  };
  imbuements: {
      [key in ImbuType]: PlayerImbuement;
  };
  imbuActive: boolean; // Global toggle to pause/resume all
  tibiaCoinsUsed?: number;
  tutorials: {
      introCompleted: boolean;
      seenRareMob: boolean;
      seenRareItem: boolean;
      seenAscension: boolean;
      seenLevel12: boolean;
      seenMenus: string[];
  };
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'combat' | 'loot' | 'danger' | 'gain' | 'skill' | 'magic';
  timestamp: number;
  rarity?: Rarity;
}

export interface HitSplat {
  id: number;
  value: number | string;
  type: 'damage' | 'heal' | 'mana' | 'miss' | 'speech';
  target: 'player' | 'monster';
  source?: 'basic' | 'spell' | 'rune' | 'reflect';
}

export interface Spell {
  id: string;
  name: string;
  manaCost: number;
  minLevel: number;
  reqMagicLevel?: number;
  price: number;
  type: 'attack' | 'heal' | 'support';
  vocations: Vocation[];
  damageType?: DamageType;
  cooldown: number;
  isAoe?: boolean; 
}
