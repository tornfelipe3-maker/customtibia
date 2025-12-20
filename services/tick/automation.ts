
import { Player, Vocation, LogEntry, HitSplat, SkillType, Rarity } from '../../types';
import { SHOP_ITEMS, SPELLS } from '../../constants';
import { calculateSpellHealing } from '../combat';
import { processSkillTraining } from '../progression';
import { getAscensionBonusValue, getEffectiveMaxHp, getEffectiveMaxMana } from '../mechanics';

type LogFunc = (msg: string, type: LogEntry['type'], rarity?: Rarity) => void;
type HitFunc = (val: number | string, type: HitSplat['type'], target: 'player'|'monster') => void;

interface AutomationResult {
    player: Player;
    waste: number;
}

export const processAutomation = (
    player: Player, 
    now: number, 
    log: LogFunc, 
    hit: HitFunc
): AutomationResult => {
    let p = { ...player };
    let waste = 0;

    const maxHp = getEffectiveMaxHp(p);
    const maxMana = getEffectiveMaxMana(p);

    // --- 1. AUTO HEALTH POTION ---
    if (p.settings.autoHealthPotionThreshold > 0 && (p.hp / maxHp) * 100 <= p.settings.autoHealthPotionThreshold && now > (p.healthPotionCooldown || 0)) {
        const potionId = p.settings.selectedHealthPotionId;
        if (potionId && (p.inventory[potionId] || 0) > 0) {
            const item = SHOP_ITEMS.find(i => i.id === potionId);
            if (item && item.type === 'potion' && (item.potionType === 'health' || item.potionType === 'spirit')) {
                p.inventory[potionId]--;
                waste += item.price || 0;
                const effBonus = getAscensionBonusValue(p, 'potion_hp_boost');
                const finalHeal = Math.floor((item.restoreAmount || 0) * (1 + (effBonus / 100)));
                p.hp = Math.min(maxHp, p.hp + finalHeal);
                hit(`+${finalHeal}`, 'heal', 'player');
                p.healthPotionCooldown = now + 1000; 
                if (p.inventory[potionId] === 0) delete p.inventory[potionId];
            }
        }
    }

    // --- 2. AUTO MANA POTION ---
    if (p.settings.autoManaPotionThreshold > 0 && (p.mana / maxMana) * 100 <= p.settings.autoManaPotionThreshold && now > (p.manaPotionCooldown || 0)) {
        const potionId = p.settings.selectedManaPotionId;
        if (potionId && (p.inventory[potionId] || 0) > 0) {
            const item = SHOP_ITEMS.find(i => i.id === potionId);
            if (item && item.type === 'potion' && (item.potionType === 'mana' || item.potionType === 'spirit')) {
                p.inventory[potionId]--;
                waste += item.price || 0;
                const effBonus = getAscensionBonusValue(p, 'potion_mana_boost');
                const restore = item.restoreAmountSecondary && item.potionType === 'spirit' ? item.restoreAmountSecondary : (item.restoreAmount || 0);
                const finalRestore = Math.floor(restore * (1 + (effBonus / 100)));
                p.mana = Math.min(maxMana, p.mana + finalRestore);
                hit(`+${finalRestore}`, 'mana', 'player');
                p.manaPotionCooldown = now + 1000;
                if (p.inventory[potionId] === 0) delete p.inventory[potionId];
            }
        }
    }

    // --- 3. AUTO HEAL SPELL ---
    if (p.settings.autoHealSpellThreshold > 0 && (p.hp / maxHp) * 100 <= p.settings.autoHealSpellThreshold && (p.healingCooldown || 0) <= now) {
        if (p.settings.selectedHealSpellId) {
           const spell = SPELLS.find(s => s.id === p.settings.selectedHealSpellId);
           if (spell && p.purchasedSpells.includes(spell.id) && p.mana >= spell.manaCost) {
              const healAmt = calculateSpellHealing(p, spell);
              p.mana -= spell.manaCost;
              p.hp = Math.min(maxHp, p.hp + healAmt);
              p.healingCooldown = now + 1000; 
              hit(`+${healAmt}`, 'heal', 'player');
              const incantation = spell.name.match(/\((.*?)\)/)?.[1] || spell.name;
              hit(incantation, 'speech', 'player');
              p = processSkillTraining(p, SkillType.MAGIC, spell.manaCost).player;
           }
        }
    }

    return { player: p, waste };
};
