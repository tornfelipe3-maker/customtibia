
import { EquipmentSlot, Vocation, SkillType, NpcType, DamageType } from './enums';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// ... (Existing interfaces remain unchanged until LogEntry) ...

export interface ItemModifiers {
    attack?: number;
    defense?: number;
    armor?: number;
    // New Special Stats
    xpBoost?: number;       // Percent
    lootBoost?: number;     // Percent
    attackSpeed?: number;   // Percent (Chance to double hit)
    blessedChance?: number; // Percent (Spawn rate increase)
    critChance?: number;    // Percent
    
    // NEW ATTRIBUTES
    bossSlayer?: number;    // Percent damage vs Bosses
    dodgeChance?: number;   // Percent chance to ignore damage
    goldFind?: number;      // Percent gold increase
    executioner?: number;   // Percent chance to kill mob < 20% HP
    reflection?: number;    // Percent damage reflected to attacker
    
    [key: string]: number | undefined; // Allow dynamic skill bonuses
}

export interface Skill {
  level: number;
  progress: number; // 0 to 100
}

export interface Item {
  id: string;
  uniqueId?: string; // For unique instances (Rare+)
  name: string;
  type: 'equipment' | 'potion' | 'loot';
  rarity?: Rarity; // New Rarity System
  modifiers?: ItemModifiers; // Bonus stats
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
  // New property for stacking in equipment slots
  count?: number;
  // Mana Cost for Wands/Rods
  manaCost?: number;
}

export interface LootDrop {
  itemId: string;
  chance: number;
  maxAmount: number;
}

export interface Monster {
  id: string;
  guid?: string; // Unique Instance ID for React Keys/Animations
  spawnTime?: number; // NEW: Timestamp when monster spawned for combat delay
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
  // Influenced System
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
  
  // Requirement
  targetMonsterId?: string;
  requiredKills?: number;
  requiredLevel?: number;
  requiredItems?: { [itemId: string]: number }; // e.g. Gather 5 Wolf Paws

  // Reward
  rewardNpcAccess?: NpcType;
  rewardItems?: { itemId: string, count: number }[];
  rewardGold?: number;
  rewardExp?: number;
}

export type TaskStatus = 'available' | 'active';

export interface HuntingTask {
  uuid: string; // Unique ID for the specific instance of the task
  type: 'kill' | 'collect'; // Logic type
  category: 'kill' | 'collect'; // Display category (matches type usually)
  status: TaskStatus;
  
  targetId: string; // MonsterID for kill, ItemID for collect
  targetName: string; // Helper
  amountRequired: number; // Kills or Item Count
  amountCurrent: number; // Only used for 'kill' tracking. 'collect' checks inventory dynamically.
  
  rewardXp: number;
  rewardGold: number;
  
  // Legacy fields for migration (optional)
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
  selectedAttackSpellId: string; // Deprecated but kept for compatibility
  attackSpellRotation: string[]; // NEW: List of spell IDs in priority order
  
  autoAttackRune: boolean;
  selectedRuneId: string;
}

export type PreyBonusType = 'xp' | 'damage' | 'defense' | 'loot';

export interface PreySlot {
    monsterId: string | null;
    bonusType: PreyBonusType;
    bonusValue: number; // Percentage (e.g. 40 for 40%)
    active: boolean;    // Is currently running?
    startTime: number;  // When it was activated (0 if never activated)
    duration: number;   // How long it lasts (ms) - usually 2h
}

export type AscensionPerk = 'gold_boost' | 'damage_boost' | 'loot_boost' | 'boss_cd' | 'soul_gain' | 'xp_boost';

export interface Relic {
    id: string;
    name: string;
    description: string;
    bonusType: 'gold' | 'xp' | 'damage';
    value: number; // Percentage
    icon: string;
}

// Extra flags for GM debugging
export interface GmFlags {
    forceRarity?: 'enraged' | 'blessed' | 'corrupted' | null;
}

export interface OfflineReport {
    secondsOffline: number;
    xpGained: number;
    goldGained: number;
    killedMonsters: { name: string, count: number }[];
    lootObtained: { [itemId: string]: number };
    leveledUp: number; // How many levels
    skillTrained?: SkillType;
    skillGain?: number; // Percent or levels
    waste: number; // NEW: Total gold value of supplies used
}

export interface Player {
  name: string;
  isNameChosen?: boolean; // Flag to check if name was selected at level 2
  isGm?: boolean; // GM Flag
  gmExtra?: GmFlags; // New GM config container
  level: number;
  vocation: Vocation;
  promoted: boolean; // Promotion Flag
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
  activeHuntStartTime: number; // Tracks when the hunt started
  activeTrainingSkill: SkillType | null;
  activeTrainingStartTime: number; // New: Tracks when training started
  equipment: {
    [key in EquipmentSlot]?: Item;
  };
  inventory: {
    [itemId: string]: number;
  };
  uniqueInventory: Item[]; // NEW: Stores items with modifiers/rarity
  relics: Relic[]; // NEW: Permanent items
  depot: {
    [itemId: string]: number;
  };
  uniqueDepot: Item[]; // NEW: Stores unique items in Depot
  skills: {
    [key in SkillType]: Skill;
  };
  settings: PlayerSettings;
  quests: {
    [questId: string]: {
      kills: number; // Tracks kills for this quest
      itemsHandedIn?: boolean; // If item requirements met
      completed: boolean; // If reward claimed
    }
  };
  bossCooldowns: {
    [bossId: string]: number;
  };
  spellCooldowns: {
    [spellId: string]: number;
  };
  runeCooldown: number; // NEW: Independent cooldown for Runes
  purchasedSpells: string[];
  globalCooldown: number;
  
  // REMOVED: activeTask (Tasks now live in taskOptions with status='active')
  activeTask?: HuntingTask | null; // Kept optional just for migration logic safety, but unused
  
  taskOptions: HuntingTask[]; // Fixed size 8: 0-3 (Kill), 4-7 (Collect)
  taskNextFreeReroll: number; // Timestamp for next free task reroll
  skippedLoot: string[];
  hasBlessing: boolean;
  
  // HAZARD SYSTEM
  hazardLevel: number; // Max Unlocked Level (0 to 100)
  activeHazardLevel: number; // Currently Selected Level

  // STORE & CURRENCY
  tibiaCoins: number;
  premiumUntil: number; // Timestamp
  xpBoostUntil: number; // Timestamp

  // PREY SYSTEM
  prey: {
      slots: PreySlot[];
      nextFreeReroll: number; // Timestamp for Next Reset
      rerollsAvailable: number; // 0 to 3
  };

  // ASCENSION SYSTEM
  soulPoints: number;
  ascension: {
      [key in AscensionPerk]: number; // Level of the perk
  };

  // TUTORIALS
  tutorials: {
      introCompleted: boolean;
      seenRareMob: boolean;
      seenRareItem: boolean;
      seenAscension: boolean; // NEW: Flag for level 50 modal
      seenLevel12: boolean;   // NEW: Flag for Rare Mob Unlock
      seenMenus: string[]; // List of Menu IDs seen (e.g. ['hunt', 'shop'])
  };
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'combat' | 'loot' | 'danger' | 'gain' | 'skill' | 'magic';
  timestamp: number;
  rarity?: Rarity; // For colored logs
}

export interface HitSplat {
  id: number;
  value: number | string;
  type: 'damage' | 'heal' | 'miss' | 'speech';
  target: 'player' | 'monster';
}

export interface Spell {
  id: string;
  name: string;
  manaCost: number;
  minLevel: number;
  reqMagicLevel?: number;
  price: number;
  type: 'attack' | 'heal';
  vocations: Vocation[];
  damageType?: DamageType;
  cooldown: number;
  isAoe?: boolean; // NEW: Determines if spell hits all lured mobs or single target
}
