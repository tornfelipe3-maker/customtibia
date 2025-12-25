
import { Item, NpcType } from '../../types';
import { IMG_BASE, OUT_BASE } from '../config';

export const PRODUCTS_LIST: Item[] = [
  // SPECIAL
  { id: 'forge_token', name: 'Forge Token', type: 'loot', price: 0, sellPrice: 500, soldTo: [NpcType.TRADER], description: 'Used to reforge rare equipment attributes.', image: `${IMG_BASE}Gold_Nugget.gif` },
  { id: 'gold_token', name: 'Gold Token', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER], description: 'Used for powerful Imbuements at NPC Imbu.', image: `${IMG_BASE}Gold_Token.gif` },

  // BAGS (NEW)
  { id: 'bag_desire', name: 'Bag You Desire', type: 'loot', isBag: true, price: 0, sellPrice: 100000, soldTo: [NpcType.RASHID], description: 'A shadowy bag dropped by Goshnar. Contains a piece of Soulwar Set.', image: `${OUT_BASE}Bag_You_Desire.gif` },
  { id: 'bag_covet', name: 'Bag You Covet', type: 'loot', isBag: true, price: 0, sellPrice: 200000, soldTo: [NpcType.RASHID], description: 'A blood-pulsing bag dropped by Bakragore. Contains a piece of Sanguine Set.', image: `${OUT_BASE}Bag_You_Covet.gif` },

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
  { id: 'dragon_claw', name: 'Dragon Claw', type: 'loot', price: 0, sellPrice: 8000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A rare claw from Demodras.', image: `${OUT_BASE}Dragon_Claw.gif` },
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
  
  // TIER 3 & 4 (Mid)
  { id: 'cyclops_toe', name: 'Cyclops Toe', type: 'loot', price: 0, sellPrice: 50, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Valuable toe.', image: `${IMG_BASE}Cyclops_Toe.gif` },
  { id: 'vampire_dust', name: 'Vampire Dust', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Dust from a vampire.', image: `${IMG_BASE}Vampire_Dust.gif` },
  { id: 'spider_silk', name: 'Spider Silk', type: 'loot', price: 0, sellPrice: 6000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Strong silk.', image: `${IMG_BASE}Spider_Silk.gif` },
  { id: 'iron_order', name: 'Iron Ore', type: 'loot', price: 0, sellPrice: 1000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Heavy ore.', image: `${IMG_BASE}Iron_Ore.gif` },
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
  { id: 'small_diamond', name: 'Small Diamond', type: 'loot', price: 0, sellPrice: 300, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A small diamond.', image: `${IMG_BASE}Small_Diamond.gif` },
  { id: 'small_ruby', name: 'Small Ruby', type: 'loot', price: 0, sellPrice: 250, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Small ruby.', image: `${IMG_BASE}Small_Ruby.gif` },
  { id: 'small_emerald', name: 'Small Emerald', type: 'loot', price: 0, sellPrice: 250, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Small emerald.', image: `${IMG_BASE}Small_Emerald.gif` },
  { id: 'small_amethyst', name: 'Small Amethyst', type: 'loot', price: 0, sellPrice: 80, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A small amethyst.', image: `${IMG_BASE}Small_Amethyst.gif` },
  { id: 'small_sapphire', name: 'Small Sapphire', type: 'loot', price: 0, sellPrice: 150, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'Small sapphire.', image: `${IMG_BASE}Small_Sapphire.gif` },
  { id: 'small_topaz', name: 'Small Topaz', type: 'loot', price: 0, sellPrice: 200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A small topaz.', image: `${IMG_BASE}Small_Topaz.gif` },

  { id: 'diamond', name: 'Diamond', type: 'loot', price: 0, sellPrice: 8000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable diamond.', image: `${IMG_BASE}Diamond.gif` },
  { id: 'opal', name: 'Opal', type: 'loot', price: 0, sellPrice: 4000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable opal.', image: `${IMG_BASE}Opal.gif` },
  { id: 'ruby', name: 'Ruby', type: 'loot', price: 0, sellPrice: 2500, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable ruby.', image: `${IMG_BASE}Ruby.gif` },
  { id: 'sapphire', name: 'Sapphire', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable sapphire.', image: `${IMG_BASE}Sapphire.gif` },
  { id: 'emerald', name: 'Emerald', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable emerald.', image: `${IMG_BASE}Emerald.gif` },
  { id: 'amethyst', name: 'Amethyst', type: 'loot', price: 0, sellPrice: 2000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable amethyst.', image: `${IMG_BASE}Amethyst.gif` },
  { id: 'blue_gem', name: 'Blue Gem', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A precious blue gem.', image: `${IMG_BASE}Blue_Gem.gif` },
  { id: 'green_gem', name: 'Green Gem', type: 'loot', price: 0, sellPrice: 5000, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A precious green gem.', image: `${IMG_BASE}Green_Gem.gif` },
  { id: 'red_gem', name: 'Red Gem', type: 'loot', price: 0, sellPrice: 1200, soldTo: [NpcType.TRADER, NpcType.YASIR], description: 'A valuable red gem.', image: `${IMG_BASE}Red_Gem.gif` },
  { id: 'talon', name: 'Talon', type: 'loot', price: 0, sellPrice: 350, soldTo: [NpcType.TRADER, NpcType.YASIR, NpcType.RASHID], description: 'A dragon talon.', image: `${IMG_BASE}Talon.gif` },

  // VALUABLES (Rashid / Djinns)
  { id: 'draconian_steel', name: 'Piece of Draconian Steel', type: 'loot', price: 0, sellPrice: 3500, soldTo: [NpcType.RASHID, NpcType.YASIR], description: 'Valuable steel.', image: `${IMG_BASE}Piece_of_Draconian_Steel.gif` },
  { id: 'hell_steel', name: 'Piece of Hell Steel', type: 'loot', price: 0, sellPrice: 3500, soldTo: [NpcType.RASHID, NpcType.YASIR], description: 'Infernal steel.', image: `${IMG_BASE}Piece_of_Hell_Steel.gif` },
];
