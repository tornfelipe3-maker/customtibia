
import React from 'react';
import { Player, Spell, Vocation, SkillType } from '../types';
import { SPELLS } from '../constants';
import { getEffectiveSkill } from '../services';
import { Sparkles, Lock, Coins, Check, AlertCircle } from 'lucide-react';

interface SpellPanelProps {
  player: Player;
  onBuySpell: (spell: Spell) => void;
}

export const SpellPanel: React.FC<SpellPanelProps> = ({ player, onBuySpell }) => {
  const playerMagicLevel = getEffectiveSkill(player, SkillType.MAGIC);

  // Filter spells for player vocation
  const relevantSpells = SPELLS.filter(spell => 
     player.vocation === Vocation.NONE || spell.vocations.includes(player.vocation)
  );

  return (
    <div className="bg-[#222] h-full flex flex-col text-[#ccc]">
        {/* Header */}
        <div className="p-4 bg-[#282828] border-b border-[#444] flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                <h2 className="text-lg font-bold font-serif text-[#eee]">Spellbook</h2>
            </div>
            <div className="bg-[#111] px-3 py-1 border border-[#333] rounded text-yellow-500 font-bold text-sm flex items-center gap-2">
                <Coins size={14} /> {player.gold.toLocaleString()} gp
            </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
            {player.vocation === Vocation.NONE ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
                    <AlertCircle size={48} className="mb-4 opacity-50" />
                    <p className="font-bold mb-2">You have no vocation.</p>
                    <p className="text-xs">Reach Level 8 and choose a vocation to learn spells.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {relevantSpells.map(spell => {
                        const isPurchased = player.purchasedSpells.includes(spell.id);
                        const canAfford = player.gold >= spell.price;
                        const levelReqMet = player.level >= spell.minLevel;
                        const mlReqMet = playerMagicLevel >= (spell.reqMagicLevel || 0);
                        const isLocked = !levelReqMet || !mlReqMet;

                        return (
                            <div 
                                key={spell.id}
                                className={`
                                    flex items-center justify-between p-3 border rounded-sm relative overflow-hidden group transition-colors
                                    ${isPurchased 
                                        ? 'bg-[#2a2a2a] border-green-900/50' 
                                        : isLocked 
                                            ? 'bg-[#1a1a1a] border-[#333] opacity-70' 
                                            : 'bg-[#252525] border-[#444] hover:bg-[#2d2d2d]'
                                    }
                                `}
                            >
                                {/* Spell Info */}
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={`
                                        w-10 h-10 flex items-center justify-center border rounded-sm shadow-inner
                                        ${isPurchased ? 'bg-purple-900/20 border-purple-500/50 text-purple-300' : 'bg-[#111] border-[#333] text-gray-600'}
                                    `}>
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${isPurchased ? 'text-green-400' : 'text-gray-200'}`}>
                                            {spell.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 flex gap-2">
                                            <span>Mana: {spell.manaCost}</span>
                                            <span>Cooldown: {spell.cooldown / 1000}s</span>
                                        </div>
                                        <div className="text-[10px] mt-0.5 flex gap-2">
                                            <span className={levelReqMet ? 'text-gray-400' : 'text-red-500'}>Lvl {spell.minLevel}</span>
                                            <span className={mlReqMet ? 'text-gray-400' : 'text-red-500'}>ML {spell.reqMagicLevel || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="relative z-10">
                                    {isPurchased ? (
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-900/20 px-3 py-1.5 rounded border border-green-900/50">
                                            <Check size={12} /> LEARNED
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => !isLocked && canAfford && onBuySpell(spell)}
                                            disabled={isLocked || !canAfford}
                                            className={`
                                                flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-sm transition-all
                                                ${isLocked 
                                                    ? 'bg-transparent text-gray-600 border-transparent cursor-not-allowed' 
                                                    : canAfford 
                                                        ? 'bg-[#222] hover:bg-[#333] text-yellow-500 border-yellow-700 shadow-sm' 
                                                        : 'bg-[#222] text-red-500 border-red-900 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            {isLocked ? <Lock size={12}/> : <Coins size={12}/>}
                                            {spell.price} gp
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};
