
import { Item, NpcType } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const PRODUCTS_LIST: Item[] = [
  // SPECIAL
  { id: 'forge_token', name: 'Forge Token', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER], description: 'Used to reforge rare equipment attributes.', image: `${IMG_BASE}Gold_Nugget.gif` },

  // Creature Products - TIER 1 & 2 (Starters)
  // FIX: Using OUT_BASE (TibiaWiki BR) for these sprites as Fandom often breaks for small creature products
  { id: 'rat_tail', name: 'Rat Tail', type: 'loot', price: 0, sellPrice: 2, soldTo: [NpcType.TRADER], description: 'Tail of a rat.', image: `${OUT_BASE}Rat_Tail.gif` },
  { id: 'troll_hair', name: 'Troll Hair', type: 'loot', price: 0, sellPrice: 10, soldTo: [NpcType.TRADER], description: 'Greasy hair.', image: `${OUT_BASE}Troll_Hair.gif` },
  
  { id: 'orc_tooth', name: 'Orc Tooth', type: 'loot', price: 0, sellPrice: 25, soldTo: [NpcType.TRADER], description: 'A tooth from an orc.', image: `${IMG_BASE}Orc_Tooth.gif` },
  { id: 'rotten_piece_of_cloth', name: 'Rotten Piece of Cloth', type: 'loot', price: 0, sellPrice: 30, soldTo: [NpcType.TRADER], description: 'From a ghoul.', image: `${IMG_BASE}Rotten_Piece_of_Cloth.gif` },
  { id: 'bone', name: 'Bone', type: 'loot', price: 0, sellPrice: 5, soldTo: [NpcType.TRADER], description: 'A regular bone.', image: `${IMG_BASE}Bone.gif` },
  
  // TIER 3 PRODUCTS
  { id: 'ghoul_snack', name: 'Ghoul Snack', type: 'loot', price: 0, sellPrice: 60, soldTo: [NpcType.TRADER], description: 'A tasty snack for ghouls.', image: `${IMG_BASE}Ghoul_Snack.gif` },
  { id: 'orc_leather', name: 'Orc Leather', type: 'loot', price: 0, sellPrice: 80, soldTo: [NpcType.TRADER], description: 'Leather from an orc.', image: `${IMG_BASE}Orc_Leather.gif` },
  { id: 'minotaur_leather', name: 'Minotaur Leather', type: 'loot', price: 0, sellPrice: 100, soldTo: [NpcType.TRADER], description: 'Thick leather.', image: `${IMG_BASE}Minotaur_Leather.gif` },

  // TIER 4 PRODUCTS
  { id: 'dragon_ham', name: 'Dragon Ham', type: 'loot', price: 0, sellPrice: 120, soldTo: [NpcType.TRADER], description: 'Meat from a dragon.', image: `${IMG_BASE}Dragon_Ham.gif` },
  { id: 'eyedrops', name: 'Eyedrops', type: 'loot', price: 0, sellPrice: 150, soldTo: [NpcType.TRADER], description: 'For better vision.', image: `${IMG_BASE}Vial_of_Liquid.gif` },
  { id: 'vampire_teeth', name: 'Vampire Teeth', type: 'loot', price: 0, sellPrice: 200, soldTo: [NpcType.TRADER], description: 'Sharp fangs.', image: `${IMG_BASE}Vampire_Teeth.gif` },

  // TIER 5 PRODUCTS
  { id: 'warrior_sweat', name: 'Warrior\'s Sweat', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER], description: 'Extracted from a Hero.', image: `${IMG_BASE}Flask_of_Warrior%27s_Sweat.gif` },
  { id: 'frosty_ear', name: 'Frosty Ear', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER], description: 'From a cold dragon.', image: `${IMG_BASE}Frosty_Ear_of_a_Troll.gif` },
  { id: 'dragon_claw_common', name: 'Dragon Claw', type: 'loot', price: 0, sellPrice: 700, soldTo: [NpcType.TRADER], description: 'A sharp claw from a Dragon Lord.', image: `${IMG_BASE}Dragon_Claw.gif` },
  { id: 'behemoth_claw', name: 'Behemoth Claw', type: 'loot', price: 0, sellPrice: 800, soldTo: [NpcType.TRADER], description: 'A heavy claw.', image: `${IMG_BASE}Behemoth_Claw.gif` },

  // TIER 6 PRODUCTS
  { id: 'old_parchment', name: 'Old Parchment', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER], description: 'Ancient Warlock text.', image: `${IMG_BASE}Old_Parchment.gif` },
  { id: 'undead_heart', name: 'Undead Heart', type: 'loot', price: 0, sellPrice: 1200, soldTo: [NpcType.TRADER], description: 'Still beating.', image: `${IMG_BASE}Undead_Heart.gif` },
  { id: 'reaper_hood', name: 'Reaper Hood', type: 'loot', price: 0, sellPrice: 1400, soldTo: [NpcType.TRADER], description: 'Ragged hood.', image: `${IMG_BASE}Ragged_Harpies_Cape.gif` },
  { id: 'piece_of_iron', name: 'Piece of Iron', type: 'loot', price: 0, sellPrice: 1500, soldTo: [NpcType.TRADER], description: 'From a Juggernaut.', image: `${IMG_BASE}Piece_of_Iron.gif` },

  // TIER 7 PRODUCTS
  { id: 'hellhound_slobber', name: 'Hellhound Slobber', type: 'loot', price: 0, sellPrice: 1800, soldTo: [NpcType.TRADER], description: 'Drool from a beast.', image: `${IMG_BASE}Hellhound_Slobber.gif` },
  { id: 'ectoplasm', name: 'Ectoplasm', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER], description: 'Ghostly goo.', image: `${IMG_BASE}Ectoplasm.gif` },
  { id: 'soul_shard', name: 'Soul Shard', type: 'loot', price: 0, sellPrice: 2200, soldTo: [NpcType.TRADER], description: 'A fragment of a soul.', image: `${IMG_BASE}Soul_Orb.gif` }, 
  { id: 'fiery_heart', name: 'Fiery Heart', type: 'loot', price: 0, sellPrice: 2500, soldTo: [NpcType.TRADER], description: 'Burning hot.', image: `${IMG_BASE}Fiery_Heart.gif` },
  { id: 'vial_of_poison', name: 'Vial of Poison', type: 'loot', price: 0, sellPrice: 2500, soldTo: [NpcType.TRADER], description: 'Deadly toxin.', image: `${IMG_BASE}Vial_of_Liquid.gif` },

  // TIER 8 PRODUCTS
  { id: 'asura_hair', name: 'Asura Hair', type: 'loot', price: 0, sellPrice: 3000, soldTo: [NpcType.TRADER], description: 'Flaming hair.', image: `${IMG_BASE}Asura_Hair.gif` },
  { id: 'vexclaw_talon', name: 'Vexclaw Talon', type: 'loot', price: 0, sellPrice: 3500, soldTo: [NpcType.TRADER], description: 'Sharp demon claw.', image: `${IMG_BASE}Vexclaw_Talon.gif` },
  { id: 'midnight_essence', name: 'Midnight Essence', type: 'loot', price: 0, sellPrice: 3800, soldTo: [NpcType.TRADER], description: 'Pure darkness.', image: `${IMG_BASE}Midnight_Essence.gif` },
  { id: 'torturer_tears', name: 'Torturer Tears', type: 'loot', price: 0, sellPrice: 4000, soldTo: [NpcType.TRADER], description: 'Tears of pain.', image: `${IMG_BASE}Vial_of_Liquid.gif` },
  { id: 'demonic_blood', name: 'Demonic Blood', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER], description: 'Blood of Hellgorak.', image: `${IMG_BASE}Demonic_Blood.gif` },

  // FOOD & BASICS
  { id: 'meat', name: 'Meat', type: 'loot', price: 0, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Raw meat.', image: `${IMG_BASE}Meat.gif` },
  { id: 'ham', name: 'Ham', type: 'loot', price: 0, sellPrice: 5, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Huge chunk of meat.', image: `${IMG_BASE}Ham.gif` },
  { id: 'cheese', name: 'Cheese', type: 'loot', price: 0, sellPrice: 2, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A piece of cheese.', image: `${IMG_BASE}Cheese.gif` },
  { id: 'wolf_paw', name: 'Wolf Paw', type: 'loot', price: 0, sellPrice: 40, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Paw of a wolf.', image: `${IMG_BASE}Wolf_Paw.gif` },
  { id: 'bear_paw', name: 'Bear Paw', type: 'loot', price: 0, sellPrice: 120, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Paw of a bear.', image: `${IMG_BASE}Bear_Paw.gif` },
  { id: 'honeycomb', name: 'Honeycomb', type: 'loot', price: 0, sellPrice: 50, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Sweet honey.', image: `${IMG_BASE}Honeycomb.gif` },
  { id: 'skull', name: 'Skull', type: 'loot', price: 0, sellPrice: 20, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Human skull.', image: `${IMG_BASE}Skull.gif` },
  
  // TIER 3 & 4 (Mid)
  { id: 'cyclops_toe', name: 'Cyclops Toe', type: 'loot', price: 0, sellPrice: 50, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Valuable toe.', image: `${IMG_BASE}Cyclops_Toe.gif` },
  { id: 'vampire_dust', name: 'Vampire Dust', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Dust from a vampire.', image: `${IMG_BASE}Vampire_Dust.gif` },
  { id: 'spider_silk', name: 'Spider Silk', type: 'loot', price: 0, sellPrice: 6000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Strong silk.', image: `${IMG_BASE}Spider_Silk.gif` },
  { id: 'iron_ore', name: 'Iron Ore', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Heavy ore.', image: `${IMG_BASE}Iron_Ore.gif` },
  { id: 'green_dragon_leather', name: 'Green Dragon Leather', type: 'loot', price: 0, sellPrice: 150, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Skin of a dragon.', image: `${IMG_BASE}Green_Dragon_Leather.gif` },
  { id: 'red_dragon_leather', name: 'Red Dragon Leather', type: 'loot', price: 0, sellPrice: 300, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Skin of a DL.', image: `${IMG_BASE}Red_Dragon_Leather.gif` },
  { id: 'hardened_bone', name: 'Hardened Bone', type: 'loot', price: 0, sellPrice: 800, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Very hard bone.', image: `${IMG_BASE}Hardened_Bone.gif` },
  { id: 'dragon_scale', name: 'Green Dragon Scale', type: 'loot', price: 0, sellPrice: 200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Scale of a dragon.', image: `${IMG_BASE}Green_Dragon_Scale.gif` },
  { id: 'red_piece_of_cloth', name: 'Red Piece of Cloth', type: 'loot', price: 0, sellPrice: 400, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Silky red cloth.', image: `${IMG_BASE}Red_Piece_of_Cloth.gif` },

  // TIER 5 & 6 (High)
  { id: 'demon_dust', name: 'Demon Dust', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Remains of a demon.', image: `${IMG_BASE}Demon_Dust.gif` },
  { id: 'demon_horn', name: 'Demon Horn', type: 'loot', price: 0, sellPrice: 1200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Horn of a demon.', image: `${IMG_BASE}Demon_Horn.gif` },
  { id: 'demonic_essence', name: 'Demonic Essence', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Essence of evil.', image: `${IMG_BASE}Demonic_Essence.gif` },
  { id: 'soul_orb', name: 'Soul Orb', type: 'loot', price: 0, sellPrice: 150, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Used for mana.', image: `${IMG_BASE}Soul_Orb.gif` },
  { id: 'demonic_skeletal_hand', name: 'Demonic Skeletal Hand', type: 'loot', price: 0, sellPrice: 100, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Creepy.', image: `${IMG_BASE}Demonic_Skeletal_Hand.gif` },

  // GEMS & PEARLS (Crucial for profit hunts)
  { id: 'small_diamond', name: 'Small Diamond', type: 'loot', price: 0, sellPrice: 300, soldTo: [NpcType.TRADER], description: 'A small diamond.', image: `${IMG_BASE}Small_Diamond.gif` },
  { id: 'small_ruby', name: 'Small Ruby', type: 'loot', price: 0, sellPrice: 250, soldTo: [NpcType.TRADER], description: 'Small ruby.', image: `${IMG_BASE}Small_Ruby.gif` },
  { id: 'small_emerald', name: 'Small Emerald', type: 'loot', price: 0, sellPrice: 250, soldTo: [NpcType.TRADER], description: 'Small emerald.', image: `${IMG_BASE}Small_Emerald.gif` },
  { id: 'small_amethyst', name: 'Small Amethyst', type: 'loot', price: 0, sellPrice: 80, soldTo: [NpcType.TRADER], description: 'A small amethyst.', image: `${IMG_BASE}Small_Amethyst.gif` },
  { id: 'small_sapphire', name: 'Small Sapphire', type: 'loot', price: 0, sellPrice: 150, soldTo: [NpcType.TRADER], description: 'Small sapphire.', image: `${IMG_BASE}Small_Sapphire.gif` },
  { id: 'small_topaz', name: 'Small Topaz', type: 'loot', price: 0, sellPrice: 200, soldTo: [NpcType.TRADER], description: 'A small topaz.', image: `${IMG_BASE}Small_Topaz.gif` },

  { id: 'diamond', name: 'Diamond', type: 'loot', price: 0, sellPrice: 8000, soldTo: [NpcType.TRADER], description: 'A valuable diamond.', image: `${IMG_BASE}Diamond.gif` },
  { id: 'opal', name: 'Opal', type: 'loot', price: 0, sellPrice: 4000, soldTo: [NpcType.TRADER], description: 'A valuable opal.', image: `${IMG_BASE}Opal.gif` },
  { id: 'ruby', name: 'Ruby', type: 'loot', price: 0, sellPrice: 2500, soldTo: [NpcType.TRADER], description: 'A valuable ruby.', image: `${IMG_BASE}Ruby.gif` },
  { id: 'sapphire', name: 'Sapphire', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER], description: 'A valuable sapphire.', image: `${IMG_BASE}Sapphire.gif` },
  { id: 'emerald', name: 'Emerald', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER], description: 'A valuable emerald.', image: `${IMG_BASE}Emerald.gif` },
  { id: 'amethyst', name: 'Amethyst', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER], description: 'A valuable amethyst.', image: `${IMG_BASE}Amethyst.gif` },
  { id: 'blue_gem', name: 'Blue Gem', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER], description: 'A precious blue gem.', image: `${IMG_BASE}Blue_Gem.gif` },
  { id: 'green_gem', name: 'Green Gem', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER], description: 'A precious green gem.', image: `${IMG_BASE}Green_Gem.gif` },
  { id: 'violet_gem', name: 'Violet Gem', type: 'loot', price: 0, sellPrice: 12000, soldTo: [NpcType.TRADER], description: 'A highly valuable violet gem.', image: `${IMG_BASE}Violet_Gem.gif` },
  { id: 'red_gem', name: 'Red Gem', type: 'loot', price: 0, sellPrice: 1200, soldTo: [NpcType.TRADER], description: 'A valuable red gem.', image: `${IMG_BASE}Red_Gem.gif` },
  
  { id: 'white_pearl', name: 'White Pearl', type: 'loot', price: 0, sellPrice: 200, soldTo: [NpcType.TRADER], description: 'A pretty pearl.', image: `${IMG_BASE}White_Pearl.gif` },
  { id: 'black_pearl', name: 'Black Pearl', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER], description: 'A rare black pearl.', image: `${IMG_BASE}Black_Pearl.gif` },
  { id: 'giant_shimmering_pearl', name: 'Giant Shimmering Pearl', type: 'loot', price: 0, sellPrice: 4000, soldTo: [NpcType.TRADER], description: 'A giant pearl.', image: `${IMG_BASE}Giant_Shimmering_Pearl.gif` },
  { id: 'talon', name: 'Talon', type: 'loot', price: 0, sellPrice: 350, soldTo: [NpcType.TRADER, NpcType.RASHID], description: 'A dragon talon.', image: `${IMG_BASE}Talon.gif` },

  // VALUABLES (Rashid / Djinns)
  { id: 'gold_ingot', name: 'Gold Ingot', type: 'loot', price: 0, sellPrice: 7500, soldTo: [NpcType.RASHID], description: 'Solid gold.', image: `${IMG_BASE}Gold_Ingot.gif` },
  { id: 'draconian_steel', name: 'Piece of Draconian Steel', type: 'loot', price: 0, sellPrice: 3500, soldTo: [NpcType.RASHID], description: 'Valuable steel.', image: `${IMG_BASE}Piece_of_Draconian_Steel.gif` },
  { id: 'hell_steel', name: 'Piece of Hell Steel', type: 'loot', price: 0, sellPrice: 3500, soldTo: [NpcType.RASHID], description: 'Infernal steel.', image: `${IMG_BASE}Piece_of_Hell_Steel.gif` },
  { id: 'spatial_warp_almanac', name: 'Spatial Warp Almanac', type: 'loot', price: 0, sellPrice: 10000, soldTo: [NpcType.RASHID], description: 'A rare book from Oberon.', image: `${IMG_BASE}Spatial_Warp_Almanac.gif` },
];
