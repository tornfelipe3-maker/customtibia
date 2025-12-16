
import { Quest, NpcType } from '../types';

export const QUESTS: Quest[] = [
    // --- NPC ACCESS QUESTS ---
    
    // Green Djinn (Alesar) - Buy/Sell Mid-Tier Weapons & Armor
    { 
        id: 'green_djinn_access', 
        name: 'Aliança Efreet (Green Djinn)', 
        description: 'Alesar não negocia com estranhos. Prove sua força contra seus rivais matando 500 Blue Djinns para ganhar acesso à loja.', 
        targetMonsterId: 'blue_djinn', 
        requiredKills: 500, 
        rewardNpcAccess: NpcType.GREEN_DJINN,
        rewardGold: 10000,
        rewardExp: 50000
    },

    // Blue Djinn (Nahari) - Buy/Sell Mid-Tier Mage Gear & Amulets
    { 
        id: 'blue_djinn_access', 
        name: 'Aliança Marid (Blue Djinn)', 
        description: 'Nahari exige uma prova de lealdade. Elimine 500 Green Djinns para ganhar acesso aos seus equipamentos mágicos.', 
        targetMonsterId: 'green_djinn', 
        requiredKills: 500, 
        rewardNpcAccess: NpcType.BLUE_DJINN,
        rewardGold: 10000,
        rewardExp: 50000
    },

    // Rashid - Sell High Tier Items
    { 
        id: 'rashid_access', 
        name: 'Missão do Rashid', 
        description: 'O mercador viajante precisa que as rotas sejam seguras. Mate 1000 Dragons para provar que você pode proteger a caravana e liberar o comércio de itens de alto nível.', 
        targetMonsterId: 'dragon', 
        requiredKills: 1000, 
        rewardNpcAccess: NpcType.RASHID,
        rewardGold: 50000,
        rewardExp: 200000
    },
];
