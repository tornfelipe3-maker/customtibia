
import { Player, Vocation, LogEntry, HitSplat, SkillType, Rarity } from '../../types';
import { SHOP_ITEMS, SPELLS } from '../../constants';
import { calculateSpellHealing } from '../combat';
import { processSkillTraining } from '../progression';

// Helper for log/hit callbacks
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

    const useSpecificPotion = (potionId: string, type: 'health' | 'mana' | 'spirit') => {
        if (!potionId || (p.inventory[potionId] || 0) <= 0) return false;
        const item = SHOP_ITEMS.find(i => i.id === potionId);
        if (!item || item.type !== 'potion') return false;
        if (item.requiredLevel && p.level < item.requiredLevel) return false;
        if (item.requiredVocation && p.vocation !== Vocation.NONE && !item.requiredVocation.includes(p.vocation)) return false;

        p.inventory[potionId]--;
        waste += item.price || 0;

        if (item.restoreAmount) {
           if (item.potionType === 'health' || item.potionType === 'spirit') {
              p.hp = Math.min(p.maxHp, p.hp + item.restoreAmount);
              hit(`+${item.restoreAmount}`, 'heal', 'player');
           }
           if (item.potionType === 'mana') p.mana = Math.min(p.maxMana, p.mana + item.restoreAmount);
        }
        if (item.restoreAmountSecondary && item.potionType === 'spirit') {
           p.mana = Math.min(p.maxMana, p.mana + item.restoreAmountSecondary);
        }
        log(`Usou ${item.name}.`, 'info');
        return true;
    };

    // Auto Health Potion
    if (p.settings.autoHealthPotionThreshold > 0 && (p.hp / p.maxHp) * 100 <= p.settings.autoHealthPotionThreshold) {
        useSpecificPotion(p.settings.selectedHealthPotionId, 'health');
    }

    // Auto Mana Potion
    if (p.settings.autoManaPotionThreshold > 0 && (p.mana / p.maxMana) * 100 <= p.settings.autoManaPotionThreshold) {
        useSpecificPotion(p.settings.selectedManaPotionId, 'mana');
    }

    // Auto Heal Spell
    if (p.settings.autoHealSpellThreshold > 0 && (p.hp / p.maxHp) * 100 <= p.settings.autoHealSpellThreshold) {
        if (p.settings.selectedHealSpellId) {
           const spell = SPELLS.find(s => s.id === p.settings.selectedHealSpellId);
           if (spell && p.purchasedSpells.includes(spell.id) && p.level >= spell.minLevel && (p.skills[SkillType.MAGIC].level >= (spell.reqMagicLevel || 0)) && p.mana >= spell.manaCost && (p.spellCooldowns[spell.id] || 0) <= now && p.globalCooldown <= now) {
              
              const healAmt = calculateSpellHealing(p, spell);
              p.mana -= spell.manaCost;
              p.hp = Math.min(p.maxHp, p.hp + healAmt);
              p.spellCooldowns[spell.id] = now + (spell.cooldown || 1000);
              p.globalCooldown = now + 1000;
              
              // Train Magic Level
              const magicRes = processSkillTraining(p, SkillType.MAGIC, spell.manaCost);
              p = magicRes.player;
              if (magicRes.leveledUp) log(`Magic Level up: ${p.skills[SkillType.MAGIC].level}!`, 'gain');
              
              const match = spell.name.match(/\((.*?)\)/);
              const incantation = match ? match[1] : spell.name;
              
              log(`Cast ${incantation}.`, 'magic');
              hit(`+${healAmt}`, 'heal', 'player');
              hit(incantation, 'speech', 'player'); 
           }
        }
    }

    return { player: p, waste };
};
