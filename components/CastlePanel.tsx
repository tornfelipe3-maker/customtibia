
import React from 'react';
import { Player, Vocation } from '../types';
import { Crown, Sun, Shield, Award, Heart, Zap } from 'lucide-react';

interface CastlePanelProps {
  player: Player;
  onPromote: () => void;
  onBuyBlessing: () => void;
}

export const CastlePanel: React.FC<CastlePanelProps> = ({ player, onPromote, onBuyBlessing }) => {
  // Helper for Promotion Cost/Check
  const PROMOTION_COST = 40000;
  const PROMOTION_LEVEL = 20;
  
  const canBePromoted = player.level >= PROMOTION_LEVEL && player.vocation !== Vocation.NONE;
  const isPromoted = player.promoted;
  const totalFunds = player.gold + player.bankGold;

  // Blessing Logic
  const getBlessingCost = (level: number) => {
      if (level <= 30) return 2000;
      if (level >= 120) return 20000;
      return 2000 + (level - 30) * 200;
  };

  const getVocationName = () => {
      switch(player.vocation) {
          case Vocation.KNIGHT: return 'Elite Knight';
          case Vocation.PALADIN: return 'Royal Paladin';
          case Vocation.SORCERER: return 'Master Sorcerer';
          case Vocation.DRUID: return 'Elder Druid';
          case Vocation.MONK: return 'Master Monk';
          default: return 'Adventurer';
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#222] text-[#ccc]">
        
        {/* Header Title */}
        <div className="p-4 bg-[#282828] border-b border-[#444] text-center shadow-md">
            <h2 className="text-xl font-bold font-serif text-yellow-500 tracking-widest flex items-center justify-center gap-2">
                <Crown size={20}/> Royal Services
            </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto h-full items-start">
                
                {/* --- KING TIBIANUS --- */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg p-5 flex flex-col h-full">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-700/50 relative">
                            <Crown size={40} className="text-yellow-500" />
                            <div className="absolute -bottom-1 -right-1 bg-[#111] border border-yellow-700 rounded-full p-1">
                                <Shield size={12} className="text-yellow-200" />
                            </div>
                        </div>
                    </div>
                    
                    <h2 className="text-lg font-bold text-yellow-500 mb-1 font-serif text-center">King Tibianus</h2>
                    <p className="text-xs text-gray-400 mb-4 italic leading-relaxed text-center">
                        "I grant special promotions to those who have proven their worth."
                    </p>

                    {/* Promotion Benefits Card */}
                    <div className="bg-black/40 p-3 rounded border border-yellow-900/30 mb-4 text-left shadow-inner flex-1">
                        <div className="text-[10px] text-yellow-500 font-bold uppercase mb-2 flex items-center gap-1 border-b border-yellow-900/20 pb-1">
                            <Award size={12} /> Elite Benefits
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-900/20 p-1 rounded text-red-400"><Heart size={12}/></div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase leading-none">Regen</div>
                                    <div className="text-green-400 font-bold text-xs">+80% Faster</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-900/20 p-1 rounded text-orange-400"><Zap size={12}/></div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase leading-none">Damage</div>
                                    <div className="text-green-400 font-bold text-xs">+10% Power</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-[#333] text-[10px] text-gray-400">
                            Rank: <span className="text-white font-bold">{player.vocation !== Vocation.NONE ? getVocationName() : '???'}</span>
                        </div>
                    </div>

                    {/* Action */}
                    {isPromoted ? (
                        <div className="bg-green-900/20 border border-green-800 p-3 rounded text-green-400 font-bold flex items-center justify-center gap-2 text-xs">
                            <Award size={14}/> Promoted
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-[#111] p-2 rounded border border-[#333] text-xs">
                                <span className="text-gray-400">Cost</span>
                                <span className={`font-bold ${totalFunds >= PROMOTION_COST ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {PROMOTION_COST.toLocaleString()} gp
                                </span>
                            </div>
                            
                            <button 
                                onClick={onPromote}
                                disabled={!canBePromoted || totalFunds < PROMOTION_COST}
                                className={`
                                    w-full py-2.5 font-bold text-xs rounded shadow-md border transition-all flex items-center justify-center gap-2
                                    ${!canBePromoted || totalFunds < PROMOTION_COST
                                        ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-yellow-900/30 hover:bg-yellow-900/50 border-yellow-700 text-yellow-200 hover:shadow-yellow-900/20'
                                    }
                                `}
                            >
                                <Award size={14} /> Promote
                            </button>
                        </div>
                    )}
                </div>

                {/* --- HENRICUS (BLESSED) --- */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg p-5 flex flex-col h-full">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-700/50">
                            <Sun size={40} className="text-yellow-500 animate-[pulse_3s_infinite]" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-yellow-500 mb-1 font-serif text-center">Henricus</h2>
                    
                    <p className="text-xs text-gray-400 mb-4 italic leading-relaxed text-center">
                        "The Blessing of Henricus protects your soul and fortune."
                    </p>

                    <div className="bg-black/40 p-3 rounded border border-yellow-900/30 mb-4 text-left shadow-inner flex-1">
                        <div className="text-[10px] text-yellow-500 font-bold uppercase mb-2 flex items-center gap-1 border-b border-yellow-900/20 pb-1">
                            <Shield size={12} /> Divine Protection
                        </div>
                        <ul className="text-[11px] text-gray-400 list-disc list-inside space-y-1">
                            <li>Skill Loss: <span className="text-green-400 font-bold">-90%</span></li>
                            <li>Gold Loss: <span className="text-green-400 font-bold">-80%</span></li>
                            <li>XP Loss: <span className="text-green-400 font-bold">-60%</span></li>
                        </ul>
                        <p className="text-[9px] text-gray-500 italic mt-2">
                            * Automatically consumed on death.
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-[#111] p-2 rounded border border-[#333] text-xs">
                            <span className="text-gray-400">Cost (Lvl {player.level})</span>
                            <span className={`font-bold ${totalFunds >= getBlessingCost(player.level) ? 'text-yellow-500' : 'text-red-500'}`}>
                                {getBlessingCost(player.level).toLocaleString()} gp
                            </span>
                        </div>

                        <button 
                            onClick={onBuyBlessing}
                            disabled={player.hasBlessing || totalFunds < getBlessingCost(player.level)}
                            className={`
                                w-full py-2.5 font-bold text-xs rounded shadow-md border transition-all
                                ${player.hasBlessing 
                                    ? 'bg-green-900/20 border-green-800 text-green-700 cursor-not-allowed' 
                                    : totalFunds >= getBlessingCost(player.level)
                                        ? 'bg-yellow-900/30 hover:bg-yellow-900/50 border-yellow-700 text-yellow-200 hover:shadow-yellow-900/20'
                                        : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {player.hasBlessing ? 'You are Blessed' : 'Buy Blessing'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
