
import { Player, Vocation, LogEntry, HitSplat, SkillType, Rarity } from '../../types';
import { SHOP_ITEMS, SPELLS } from '../../constants';
import { calculateSpellHealing } from '../combat';
import { processSkillTraining } from '../progression';

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

    // --- 1. AUTO HEALTH POTION ---
    if (p.settings.autoHealthPotionThreshold > 0 && 
        (p.hp / p.maxHp) * 100 <= p.settings.autoHealthPotionThreshold &&
        now > (p.healthPotionCooldown || 0)) {
        
        const potionId = p.settings.selectedHealthPotionId;
        if (potionId && (p.inventory[potionId] || 0) > 0) {
            const item = SHOP_ITEMS.find(i => i.id === potionId);
            if (item && item.type === 'potion' && (item.potionType === 'health' || item.potionType === 'spirit')) {
                const levelPass = !item.requiredLevel || p.level >= item.requiredLevel;
                const vocPass = !item.requiredVocation || item.requiredVocation.includes(p.vocation) || p.vocation === Vocation.NONE;

                if (levelPass && vocPass) {
                    p.inventory[potionId]--;
                    waste += item.price || 0;
                    
                    if (item.restoreAmount) {
                        p.hp = Math.min(p.maxHp, p.hp + item.restoreAmount);
                        hit(`+${item.restoreAmount}`, 'heal', 'player');
                    }
                    if (item.restoreAmountSecondary && item.potionType === 'spirit') {
                        p.mana = Math.min(p.maxMana, p.mana + item.restoreAmountSecondary);
                    }
                    
                    log(`Used ${item.name}.`, 'info');
                    p.healthPotionCooldown = now + 1000; 
                }
            }
        }
    }

    // --- 2. AUTO MANA POTION ---
    if (p.settings.autoManaPotionThreshold > 0 && 
        (p.mana / p.maxMana) * 100 <= p.settings.autoManaPotionThreshold &&
        now > (p.manaPotionCooldown || 0)) {

        const potionId = p.settings.selectedManaPotionId;
        if (potionId && (p.inventory[potionId] || 0) > 0) {
            const item = SHOP_ITEMS.find(i => i.id === potionId);
            if (item && item.type === 'potion' && (item.potionType === 'mana' || item.potionType === 'spirit')) {
                const levelPass = !item.requiredLevel || p.level >= item.requiredLevel;
                const vocPass = !item.requiredVocation || item.requiredVocation.includes(p.vocation) || p.vocation === Vocation.NONE;

                if (levelPass && vocPass) {
                    p.inventory[potionId]--;
                    waste += item.price || 0;
                    
                    if (item.restoreAmount) {
                        if (item.potionType === 'mana') {
                            p.mana = Math.min(p.maxMana, p.mana + item.restoreAmount);
                        } else if (item.potionType === 'spirit') {
                            const manaHeal = item.restoreAmountSecondary || item.restoreAmount;
                            p.mana = Math.min(p.maxMana, p.mana + manaHeal);
                        }
                    }
                    
                    log(`Used ${item.name}.`, 'info');
                    p.manaPotionCooldown = now + 1000;
                }
            }
        }
    }

    // --- 3. AUTO HEAL SPELL ---
    if (p.settings.autoHealSpellThreshold > 0 && (p.hp / p.maxHp) * 100 <= p.settings.autoHealSpellThreshold) {
        if (p.settings.selectedHealSpellId) {
           const spell = SPELLS.find(s => s.id === p.settings.selectedHealSpellId);
           if (spell && p.purchasedSpells.includes(spell.id) && 
               p.level >= spell.minLevel && 
               p.mana >= spell.manaCost && 
               (p.spellCooldowns[spell.id] || 0) <= now && 
               (p.healingCooldown || 0) <= now) {
              
              const healAmt = calculateSpellHealing(p, spell);
              p.mana -= spell.manaCost;
              p.hp = Math.min(p.maxHp, p.hp + healAmt);
              p.spellCooldowns[spell.id] = now + (spell.cooldown || 1000);
              p.healingCooldown = now + 1000; 
              
              const magicRes = processSkillTraining(p, SkillType.MAGIC, spell.manaCost);
              p = magicRes.player;
              
              const match = spell.name.match(/\((.*?)\)/);
              const incantation = match ? match[1] : spell.name;
              
              log(`Cast ${incantation}.`, 'magic');
              hit(`+${healAmt}`, 'heal', 'player');
              hit(incantation, 'speech', 'player'); 
           }
        }
    }

    // --- 4. AUTO MAGIC SHIELD ---
    if (p.settings.autoMagicShield && (p.vocation === Vocation.SORCERER || p.vocation === Vocation.DRUID)) {
        if (p.magicShieldUntil < now + 2000) { // Renovar se faltar menos de 2s
            const spell = SPELLS.find(s => s.id === 'utamo_vita');
            if (spell && p.purchasedSpells.includes('utamo_vita') && p.mana >= spell.manaCost && (p.spellCooldowns['utamo_vita'] || 0) <= now) {
                p.mana -= spell.manaCost;
                p.magicShieldUntil = now + 30000;
                p.spellCooldowns['utamo_vita'] = now + spell.cooldown;
                log('Cast Utamo Vita.', 'magic');
                hit('Utamo Vita', 'speech', 'player');
            }
        }
    }

    return { player: p, waste };
};
