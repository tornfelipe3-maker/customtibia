
import { Player, Vocation } from '../../types';
import { REGEN_RATES, MAX_STAMINA } from '../../constants';
import { getEffectiveMaxHp, getEffectiveMaxMana } from '../mechanics';

export const processRegeneration = (player: Player, activeHuntId: string | null): Player => {
    let p = { ...player };
    const baseRegen = REGEN_RATES[p.vocation] || REGEN_RATES[Vocation.NONE];
    const regenMultiplier = p.promoted ? 1.8 : 1.0;
    const regen = { hp: baseRegen.hp * regenMultiplier, mana: baseRegen.mana * regenMultiplier };

    // Stamina Logic
    if (activeHuntId) {
        if (p.stamina > 0) p.stamina = Math.max(0, p.stamina - 1);
    } else {
        if (p.stamina < MAX_STAMINA) p.stamina = Math.min(MAX_STAMINA, p.stamina + 0.5);
    }

    // Apply Regen respeitando o bônus de Ascensão
    const effMaxHp = getEffectiveMaxHp(p);
    const effMaxMana = getEffectiveMaxMana(p);

    if (p.hp < effMaxHp) p.hp = Math.min(effMaxHp, Math.floor(p.hp + regen.hp));
    if (p.mana < effMaxMana) p.mana = Math.min(effMaxMana, Math.floor(p.mana + regen.mana));

    return p;
};
