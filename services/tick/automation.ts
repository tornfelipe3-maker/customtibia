
import { Player, Vocation, LogEntry, HitSplat, SkillType, Rarity } from '../../types';
import { SHOP_ITEMS, SPELLS } from '../../constants';
import { calculateSpellHealing } from '../combat';
import { processSkillTraining } from '../progression';
import { getAscensionBonusValue } from '../mechanics';

type LogFunc = (msg: string, type: LogEntry['type'], rarity?: Rarity) => void;
type HitFunc = (val: number | string, type: HitSplat['type'], target: 'player'|'monster') => void;

interface AutomationResult {
    player: Player;
    waste: number;
    totalHeal: number;
    totalMana: number;
}

export const processAutomation = (
    player: Player, 
    now: number, 
    log: LogFunc, 
    hit: HitFunc
): AutomationResult => {
    let p = { ...player };
    let waste = 0;
    let totalHeal = 0;
    let totalMana = 0;

    // --- 1. AUTO HEALTH POTION (Individual CD) ---
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
                        const boost = 1 + (getAscensionBonusValue(p, 'potion_hp_boost') / 100);
                        const finalHeal = Math.floor(item.restoreAmount * boost);
                        p.hp = Math.min(p.maxHp, p.hp + finalHeal);
                        totalHeal += finalHeal;
                    }
                    if (item.restoreAmountSecondary && item.potionType === 'spirit') {
                        const boost = 1 + (getAscensionBonusValue(p, 'potion_mana_boost') / 100);
                        const finalMana = Math.floor(item.restoreAmountSecondary * boost);
                        p.mana = Math.min(p.maxMana, p.mana + finalMana);
                        totalMana += finalMana;
                    }
                    
                    log(`Usou ${item.name}.`, 'info');
                    p.healthPotionCooldown = now + 1000; 
                }
            }
        }
    }

    // --- 2. AUTO MANA POTION (Individual CD) ---
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
                        const boost = 1 + (getAscensionBonusValue(p, 'potion_mana_boost') / 100);
                        if (item.potionType === 'mana') {
                            const finalMana = Math.floor(item.restoreAmount * boost);
                            p.mana = Math.min(p.maxMana, p.mana + finalMana);
                            totalMana += finalMana;
                        } else if (item.potionType === 'spirit') {
                            const manaHeal = item.restoreAmountSecondary || item.restoreAmount;
                            const finalMana = Math.floor(manaHeal * boost);
                            p.mana = Math.min(p.maxMana, p.mana + finalMana);
                            totalMana += finalMana;
                        }
                    }
                    
                    log(`Usou ${item.name}.`, 'info');
                    p.manaPotionCooldown = now + 1000;
                }
            }
        }
    }

    // --- 3. AUTO HEAL SPELL (Independent Healing Cooldown) ---
    if (p.settings.autoHealSpellThreshold > 0 && (p.hp / p.maxHp) * 100 <= p.settings.autoHealSpellThreshold) {
        if (p.settings.selectedHealSpellId) {
           const spell = SPELLS.find(s => s.id === p.settings.selectedHealSpellId);
           if (spell && p.purchasedSpells.includes(spell.id) && 
               p.level >= spell.minLevel && 
               (p.skills[SkillType.MAGIC].level >= (spell.reqMagicLevel || 0)) && 
               p.mana >= spell.manaCost && 
               (p.spellCooldowns[spell.id] || 0) <= now && 
               (p.healingCooldown || 0) <= now) {
              
              const healAmt = calculateSpellHealing(p, spell);
              p.mana -= spell.manaCost;
              p.hp = Math.min(p.maxHp, p.hp + healAmt);
              totalHeal += healAmt;
              p.spellCooldowns[spell.id] = now + (spell.cooldown || 1000);
              p.healingCooldown = now + 1000; 
              
              const magicRes = processSkillTraining(p, SkillType.MAGIC, spell.manaCost);
              p = magicRes.player;
              if (magicRes.leveledUp) log(`Magic Level up: ${p.skills[SkillType.MAGIC].level}!`, 'gain');
              
              const match = spell.name.match(/\((.*?)\)/);
              const incantation = match ? match[1] : spell.name;
              
              log(`Cast ${incantation}.`, 'magic');
              // Mantemos o texto da magia mas não o +Valor aqui, pois será somado
              hit(incantation, 'speech', 'player'); 
           }
        }
    }

    // --- 4. AUTO MAGIC SHIELD (Support/Attack Cooldown) ---
    if (p.settings.autoMagicShield) {
        if (p.vocation === Vocation.SORCERER || p.vocation === Vocation.DRUID) {
            const spellId = 'utamo_vita';
            const spell = SPELLS.find(s => s.id === spellId);
            
            if (spell && p.purchasedSpells.includes(spellId) && 
                p.level >= spell.minLevel && 
                p.mana >= spell.manaCost && 
                (p.spellCooldowns[spellId] || 0) <= now && 
                (p.attackCooldown || 0) <= now) {
                
                p.mana -= spell.manaCost;
                p.magicShieldUntil = now + 30000;
                p.spellCooldowns[spellId] = now + spell.cooldown;
                p.attackCooldown = now + 2000; 

                const magicRes = processSkillTraining(p, SkillType.MAGIC, spell.manaCost);
                p = magicRes.player;
                if (magicRes.leveledUp) log(`Magic Level up: ${p.skills[SkillType.MAGIC].level}!`, 'gain');

                log('Cast Utamo Vita.', 'magic');
                hit('Utamo Vita', 'speech', 'player');
            }
        }
    }

    return { player: p, waste, totalHeal, totalMana };
};
