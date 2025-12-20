
import { Item, NpcType } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const PRODUCTS_LIST: Item[] = [
  // SPECIAL
  { id: 'forge_token', name: 'Forge Token', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER], description: 'Used to reforge rare equipment attributes.', image: `${IMG_BASE}Gold_Nugget.gif` },
  { id: 'gold_token', name: 'Gold Token', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER], description: 'Used for powerful Imbuements at NPC Imbu.', image: `${IMG_BASE}Gold_Token.gif` },

  // BOSS LOOT SPECIALS
  { id: 'nose_ring', name: 'Nose Ring', type: 'loot', price: 0, sellPrice: 50000, soldTo: [NpcType.RASHID, NpcType.YASIR], description: 'A valuable ring from The Horned Fox.', image: `${IMG_BASE}Nose_Ring.gif` },
  { id: 'dragon_claw', name: 'Dragon Claw', type: 'loot', price: 0, sellPrice: 80000, soldTo: [NpcType.RASHID, NpcType.YASIR], description: 'The legendary claw of Demodras.', image: `${IMG_BASE}Dragon_Claw.gif` },
  { id: 'giant_cobra_scale', name: 'Giant Cobra Scale', type: 'loot', price: 0, sellPrice: 15000, soldTo: [NpcType.RASHID, NpcType.YASIR], description: 'From Scarlett Etzel.', image: `${IMG_BASE}Giant_Cobra_Scale.gif` },
  { id: 'cobra_tongue', name: 'Cobra Tongue', type: 'loot', price: 0, sellPrice: 10000, soldTo: [NpcType.YASIR], description: 'A preserved tongue.', image: `${IMG_BASE}Cobra_Tongue.gif` },
  { id: 'grant_of_arms', name: 'Grant of Arms', type: 'loot', price: 0, sellPrice: 25000, soldTo: [NpcType.RASHID], description: 'Oberon\'s official decree.', image: `${IMG_BASE}Grant_of_Arms.gif` },
  { id: 'moonlight_crystals', name: 'Moonlight Crystals', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.YASIR], description: 'Pulsing with lunar energy.', image: `${IMG_BASE}Moonlight_Crystals.gif` },

  // Creature Products - TIER 1 & 2 (Starters)
  { id: 'rat_tail', name: 'Rat Tail', type: 'loot', price: 0, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Tail of a rat.', image: `${OUT_BASE}Mutated_Rat_Tail.gif` },
  { id: 'troll_hair', name: 'Troll Hair', type: 'loot', price: 0, sellPrice: 10, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Greasy hair.', image: `${OUT_BASE}Bunch_of_Troll_Hair.gif` },
  { id: 'orc_tooth', name: 'Orc Tooth', type: 'loot', price: 0, sellPrice: 25, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A tooth from an orc.', image: `${IMG_BASE}Orc_Tooth.gif` },
  { id: 'rotten_piece_of_cloth', name: 'Rotten Piece of Cloth', type: 'loot', price: 0, sellPrice: 30, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'From a ghoul.', image: `${IMG_BASE}Rotten_Piece_of_Cloth.gif` },
  { id: 'bone', name: 'Bone', type: 'loot', price: 0, sellPrice: 5, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A regular bone.', image: `${IMG_BASE}Bone.gif` },
  
  // TIER 3 PRODUCTS
  { id: 'ghoul_snack', name: 'Ghoul Snack', type: 'loot', price: 0, sellPrice: 60, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A tasty snack for ghouls.', image: `${IMG_BASE}Ghoul_Snack.gif` },
  { id: 'orc_leather', name: 'Orc Leather', type: 'loot', price: 0, sellPrice: 80, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Leather from an orc.', image: `${IMG_BASE}Orc_Leather.gif` },
  { id: 'minotaur_leather', name: 'Minotaur Leather', type: 'loot', price: 0, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Thick leather.', image: `${IMG_BASE}Minotaur_Leather.gif` },

  // TIER 4 PRODUCTS
  { id: 'dragon_ham', name: 'Dragon Ham', type: 'loot', price: 0, sellPrice: 120, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Meat from a dragon.', image: `${IMG_BASE}Dragon_Ham.gif` },
  { id: 'eyedrops', name: 'Eyedrops', type: 'loot', price: 0, sellPrice: 150, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'For better vision.', image: `${OUT_BASE}Book_of_Necromantic_Rituals.gif` },
  { id: 'vampire_teeth', name: 'Vampire Teeth', type: 'loot', price: 0, sellPrice: 200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Sharp fangs.', image: `${IMG_BASE}Vampire_Teeth.gif` },

  // TIER 5 PRODUCTS
  { id: 'warrior_sweat', name: 'Warrior\'s Sweat', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Extracted from a Hero.', image: `${IMG_BASE}Flask_of_Warrior%27s_Sweat.gif` },
  { id: 'frosty_ear', name: 'Frosty Ear', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'From a cold dragon.', image: `${IMG_BASE}Frosty_Ear_of_a_Troll.gif` },
  { id: 'dragon_claw_common', name: 'Dragon Claw', type: 'loot', price: 0, sellPrice: 700, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A sharp claw from a Dragon Lord.', image: `${IMG_BASE}Dragon_Claw.gif` },
  { id: 'behemoth_claw', name: 'Behemoth Claw', type: 'loot', price: 0, sellPrice: 800, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A heavy claw.', image: `${IMG_BASE}Behemoth_Claw.gif` },

  // TIER 6 PRODUCTS
  { id: 'old_parchment', name: 'Old Parchment', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Ancient Warlock text.', image: `${IMG_BASE}Old_Parchment.gif` },
  { id: 'undead_heart', name: 'Undead Heart', type: 'loot', price: 0, sellPrice: 1200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Still beating.', image: `${IMG_BASE}Undead_Heart.gif` },
  { id: 'reaper_hood', name: 'Reaper Hood', type: 'loot', price: 0, sellPrice: 1400, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Ragged hood.', image: `${IMG_BASE}Ragged_Harpies_Cape.gif` },
  { id: 'piece_of_iron', name: 'Piece of Iron', type: 'loot', price: 0, sellPrice: 1500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'From a Juggernaut.', image: `${IMG_BASE}Piece_of_Iron.gif` },

  // TIER 7 PRODUCTS
  { id: 'hellhound_slobber', name: 'Hellhound Slobber', type: 'loot', price: 0, sellPrice: 1800, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Drool from a beast.', image: `${IMG_BASE}Hellhound_Slobber.gif` },
  { id: 'ectoplasm', name: 'Ectoplasm', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Ghostly goo.', image: `${IMG_BASE}Ectoplasm.gif` },
  { id: 'soul_shard', name: 'Soul Shard', type: 'loot', price: 0, sellPrice: 2200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A fragment of a soul.', image: `${IMG_BASE}Soul_Orb.gif` }, 
  { id: 'fiery_heart', name: 'Fiery Heart', type: 'loot', price: 0, sellPrice: 2500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Burning hot.', image: `${IMG_BASE}Fiery_Heart.gif` },
  { id: 'vial_of_poison', name: 'Vial of Poison', type: 'loot', price: 0, sellPrice: 2500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Deadly toxin.', image: `${OUT_BASE}Flask_with_Paint.gif` },

  // TIER 8 PRODUCTS
  { id: 'asura_hair', name: 'Asura Hair', type: 'loot', price: 0, sellPrice: 3000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Flaming hair.', image: `${OUT_BASE}Golden_Lotus_Brooch.gif` },
  { id: 'vexclaw_talon', name: 'Vexclaw Talon', type: 'loot', price: 0, sellPrice: 3500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Sharp demon claw.', image: `${IMG_BASE}Vexclaw_Talon.gif` },
  { id: 'midnight_essence', name: 'Midnight Essence', type: 'loot', price: 0, sellPrice: 3800, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Pure darkness.', image: `${IMG_BASE}Midnight_Essence.gif` },
  { id: 'torturer_tears', name: 'Torturer Tears', type: 'loot', price: 0, sellPrice: 4000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Tears of pain.', image: `${OUT_BASE}Flask_with_Paint.gif` },
  { id: 'demonic_blood', name: 'Demonic Blood', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Blood of Hellgorak.', image: `${OUT_BASE}Demonic_Essence.gif` },

  // FOOD & BASICS
  { id: 'meat', name: 'Meat', type: 'loot', price: 0, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Raw meat.', image: `${IMG_BASE}Meat.gif` },
  { id: 'ham', name: 'Ham', type: 'loot', price: 0, sellPrice: 5, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Huge chunk of meat.', image: `${IMG_BASE}Ham.gif` },
  { id: 'cheese', name: 'Cheese', type: 'loot', price: 0, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A piece of cheese.', image: `${IMG_BASE}Cheese.gif` },
  { id: 'wolf_paw', name: 'Wolf Paw', type: 'loot', price: 0, sellPrice: 40, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Paw of a wolf.', image: `${IMG_BASE}Wolf_Paw.gif` },
  { id: 'bear_paw', name: 'Bear Paw', type: 'loot', price: 0, sellPrice: 120, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Paw of a bear.', image: `${IMG_BASE}Bear_Paw.gif` },
  { id: 'honeycomb', name: 'Honeycomb', type: 'loot', price: 0, sellPrice: 50, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Sweet honey.', image: `${IMG_BASE}Honeycomb.gif` },
  { id: 'skull', name: 'Skull', type: 'loot', price: 0, sellPrice: 20, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Human skull.', image: `${IMG_BASE}Skull.gif` },
];
