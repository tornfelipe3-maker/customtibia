
import { Quest, NpcType } from '../types';

export const QUESTS: Quest[] = [
    // --- NPC ACCESS QUESTS ---
    
    // Green Djinn (Alesar) - Kill 15 Rare Mobs
    { 
        id: 'green_djinn_access', 
        name: 'Aliança Efreet (Green Djinn)', 
        description: 'Alesar exige poder. Mate 15 Monstros Influenciados (Raros) de qualquer tipo para ganhar seu respeito.', 
        targetMonsterId: 'ANY_RARE', 
        requiredKills: 15, 
        rewardNpcAccess: NpcType.GREEN_DJINN,
        rewardGold: 10000,
        rewardExp: 50000
    },

    // Blue Djinn (Nahari) - Kill 15 Rare Mobs
    { 
        id: 'blue_djinn_access', 
        name: 'Aliança Marid (Blue Djinn)', 
        description: 'Nahari testa sua bravura contra o caos. Elimine 15 Monstros Influenciados (Raros) de qualquer tipo.', 
        targetMonsterId: 'ANY_RARE', 
        requiredKills: 15, 
        rewardNpcAccess: NpcType.BLUE_DJINN,
        rewardGold: 10000,
        rewardExp: 50000
    },

    // Rashid - Level 30 Requirement (No kills)
    { 
        id: 'rashid_access', 
        name: 'Missão do Rashid', 
        description: 'Rashid só negocia com aventureiros experientes. Alcance o Level 30 para liberar o comércio de itens de alto nível.', 
        requiredLevel: 30,
        rewardNpcAccess: NpcType.RASHID,
        rewardGold: 50000,
        rewardExp: 200000
    },

    // Yasir - Pay 20k Gold
    {
        id: 'yasir_access',
        name: 'Rota Comercial Oriental',
        description: 'Yasir precisa de investimento para sua caravana. Pague 20.000 de Ouro para abrir negociações de Creature Products.',
        costGold: 20000,
        rewardNpcAccess: NpcType.YASIR,
        rewardExp: 10000
    }
];
