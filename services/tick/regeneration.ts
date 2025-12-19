
import { Player, Vocation } from '../../types';
import { REGEN_RATES, MAX_STAMINA } from '../../constants';

export const processRegeneration = (player: Player, activeHuntId: string | null): Player => {
    let p = { ...player };
    const now = Date.now();
    
    const baseRegen = REGEN_RATES[p.vocation] || REGEN_RATES[Vocation.NONE];
    let regenMultiplier = p.promoted ? 1.8 : 1.0;
    
    // Se o jogador estiver com Stamina Premium (nas primeiras 2 horas, embora aqui seja simplificado),
    // poderíamos dar um bônus extra. Por enquanto, mantemos Promotion.
    
    const regen = { 
        hp: baseRegen.hp * regenMultiplier, 
        mana: baseRegen.mana * regenMultiplier 
    };

    // Stamina Logic (1 segundo por tick)
    if (activeHuntId) {
        if (p.stamina > 0) p.stamina = Math.max(0, p.stamina - 1);
    } else {
        // Recupera stamina 0.5x mais lento do que gasta
        if (p.stamina < MAX_STAMINA) p.stamina = Math.min(MAX_STAMINA, p.stamina + 0.5);
    }

    // Apply Regen
    if (p.hp < p.maxHp) p.hp = Math.min(p.maxHp, Math.floor(p.hp + regen.hp));
    if (p.mana < p.maxMana) p.mana = Math.min(p.maxMana, Math.floor(p.mana + regen.mana));

    return p;
};
